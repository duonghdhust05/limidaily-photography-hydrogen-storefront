import {describe, it, expect, beforeEach} from 'vitest';
import {checkRateLimit, resetRateLimiter, createRateLimitHeaders} from '~/lib/rateLimiter';
import {getEmptyPredictiveSearchResult, getEmptyRegularSearchResult} from '~/lib/search';

describe('Search Rate Limiting & Over-quota Protection', () => {
  beforeEach(() => {
    resetRateLimiter();
  });

  it('should allow up to 20 search requests in 10 seconds and block request 21', () => {
    const ip = '198.51.100.77';
    const rateLimitKey = `search:${ip}`;
    const options = {maxRequests: 20, windowMs: 10_000};

    // 20 requests within window must be allowed
    for (let i = 1; i <= 20; i++) {
      const result = checkRateLimit(rateLimitKey, options);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(20 - i);
    }

    // 21st request must be rejected with 429 semantics
    const blocked = checkRateLimit(rateLimitKey, options);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(10);

    const headers = createRateLimitHeaders(blocked);
    expect(headers['X-RateLimit-Limit']).toBe('20');
    expect(headers['X-RateLimit-Remaining']).toBe('0');
    expect(headers['Retry-After']).toBeDefined();
  });

  it('should provide complete empty fallback structure for predictive search on 429', () => {
    const emptyPredictive = getEmptyPredictiveSearchResult();
    expect(emptyPredictive.total).toBe(0);
    expect(emptyPredictive.items.products).toEqual([]);
    expect(emptyPredictive.items.articles).toEqual([]);
    expect(emptyPredictive.items.queries).toEqual([]);
  });

  it('should provide complete empty fallback structure for regular search on 429', () => {
    const emptyRegular = getEmptyRegularSearchResult();
    expect(emptyRegular.total).toBe(0);
    expect(emptyRegular.items.products.nodes).toEqual([]);
    expect(emptyRegular.items.products.pageInfo.hasNextPage).toBe(false);
    expect(emptyRegular.items.articles.nodes).toEqual([]);
  });
});
