import {describe, it, expect, beforeEach, vi} from 'vitest';
import {
  getClientIp,
  checkRateLimit,
  createRateLimitHeaders,
  pruneExpiredBuckets,
  resetRateLimiter,
} from '~/lib/rateLimiter';

describe('Rate Limiter Utility', () => {
  beforeEach(() => {
    resetRateLimiter();
  });

  describe('getClientIp', () => {
    it('should prioritize cf-connecting-ip', () => {
      const req = new Request('http://localhost', {
        headers: {
          'cf-connecting-ip': '203.0.113.195',
          'x-forwarded-for': '198.51.100.1, 192.0.2.1',
          'x-real-ip': '198.51.100.2',
        },
      });
      expect(getClientIp(req)).toBe('203.0.113.195');
    });

    it('should fallback to first IP in x-forwarded-for', () => {
      const req = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '198.51.100.1, 192.0.2.1',
          'x-real-ip': '198.51.100.2',
        },
      });
      expect(getClientIp(req)).toBe('198.51.100.1');
    });

    it('should fallback to x-real-ip', () => {
      const req = new Request('http://localhost', {
        headers: {
          'x-real-ip': '198.51.100.2',
        },
      });
      expect(getClientIp(req)).toBe('198.51.100.2');
    });

    it('should fallback to 127.0.0.1 if no headers present', () => {
      const req = new Request('http://localhost');
      expect(getClientIp(req)).toBe('127.0.0.1');
    });
  });

  describe('Sliding Window Rate Limiting', () => {
    it('should allow requests within limit', () => {
      const key = 'test-ip-1';
      const options = {maxRequests: 3, windowMs: 10_000};

      const res1 = checkRateLimit(key, options);
      expect(res1.allowed).toBe(true);
      expect(res1.remaining).toBe(2);

      const res2 = checkRateLimit(key, options);
      expect(res2.allowed).toBe(true);
      expect(res2.remaining).toBe(1);

      const res3 = checkRateLimit(key, options);
      expect(res3.allowed).toBe(true);
      expect(res3.remaining).toBe(0);
    });

    it('should reject request exceeding limit with retryAfterSeconds', () => {
      const key = 'test-ip-2';
      const options = {maxRequests: 2, windowMs: 5_000};

      checkRateLimit(key, options);
      checkRateLimit(key, options);

      const blocked = checkRateLimit(key, options);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
      expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(5);
    });

    it('should reset quota after window expires', () => {
      const key = 'test-ip-3';
      const options = {maxRequests: 1, windowMs: 1_000};

      const res1 = checkRateLimit(key, options);
      expect(res1.allowed).toBe(true);

      const blocked = checkRateLimit(key, options);
      expect(blocked.allowed).toBe(false);

      // Fast forward past window
      vi.setSystemTime(Date.now() + 1_500);

      const allowedAgain = checkRateLimit(key, options);
      expect(allowedAgain.allowed).toBe(true);

      vi.useRealTimers();
    });

    it('should isolate limits by key', () => {
      const options = {maxRequests: 1, windowMs: 10_000};

      const userA = checkRateLimit('userA', options);
      expect(userA.allowed).toBe(true);

      const userABlocked = checkRateLimit('userA', options);
      expect(userABlocked.allowed).toBe(false);

      const userB = checkRateLimit('userB', options);
      expect(userB.allowed).toBe(true);
    });
  });

  describe('createRateLimitHeaders', () => {
    it('should generate valid standard rate limit headers when allowed', () => {
      const result = {
        allowed: true,
        remaining: 4,
        limit: 5,
        resetInSeconds: 60,
        retryAfterSeconds: 0,
      };

      const headers = createRateLimitHeaders(result);
      expect(headers['X-RateLimit-Limit']).toBe('5');
      expect(headers['X-RateLimit-Remaining']).toBe('4');
      expect(headers['X-RateLimit-Reset']).toBe('60');
      expect(headers['Retry-After']).toBeUndefined();
    });

    it('should include Retry-After header when rate limited', () => {
      const result = {
        allowed: false,
        remaining: 0,
        limit: 5,
        resetInSeconds: 42,
        retryAfterSeconds: 42,
      };

      const headers = createRateLimitHeaders(result);
      expect(headers['X-RateLimit-Remaining']).toBe('0');
      expect(headers['Retry-After']).toBe('42');
    });
  });
});
