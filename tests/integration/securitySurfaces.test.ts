import {describe, it, expect, beforeEach, vi} from 'vitest';
import {resetRateLimiter} from '~/lib/rateLimiter';
import {resetIdempotencyStore} from '~/lib/idempotency';
import {loader as cartLinesLoader} from '~/routes/cart.$lines';
import {loader as discountLoader} from '~/routes/discount.$code';
import {action as addressAction} from '~/routes/account.addresses';
import {action as profileAction} from '~/routes/account.profile';
import {action as contactAction} from '~/routes/pages.$handle';

describe('Security Hardening: Rate Limiting & Idempotency Surfaces', () => {
  beforeEach(() => {
    resetRateLimiter();
    resetIdempotencyStore();
    vi.clearAllMocks();
  });

  describe('1. Direct Cart Creation Permalink (/cart/:lines)', () => {
    it('should throttle and return 429 after 10 requests within 60 seconds', async () => {
      const mockCart = {
        create: vi.fn().mockResolvedValue({
          cart: {id: 'cart-1', checkoutUrl: 'https://checkout.shopify.com/123'},
        }),
        setCartId: vi.fn().mockReturnValue(new Headers()),
      };

      const makeRequest = (ip: string) => {
        const req = new Request('http://localhost:3000/cart/41007289663544:1', {
          headers: {'x-forwarded-for': ip},
        });
        return cartLinesLoader({
          request: req,
          context: {cart: mockCart},
          params: {lines: '41007289663544:1'},
        } as any);
      };

      const testIp = '203.0.113.10';

      // 10 requests should succeed (redirecting to checkout)
      for (let i = 0; i < 10; i++) {
        const res = (await makeRequest(testIp)) as Response;
        expect(res.status).toBe(302);
      }
      expect(mockCart.create).toHaveBeenCalledTimes(10);

      // 11th request must be rejected with 429 without calling cart.create
      const blockedRes = (await makeRequest(testIp)) as Response;
      expect(blockedRes.status).toBe(429);
      expect(blockedRes.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(blockedRes.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(blockedRes.headers.get('Retry-After')).toBeDefined();
      expect(mockCart.create).toHaveBeenCalledTimes(10); // Still 10, not 11
    });

    it('should reject invalid or malicious variant IDs without calling cart.create', async () => {
      const mockCart = {
        create: vi.fn(),
        setCartId: vi.fn(),
      };

      const req = new Request('http://localhost:3000/cart/malicious_sku:1', {
        headers: {'x-forwarded-for': '203.0.113.11'},
      });

      const res = (await cartLinesLoader({
        request: req,
        context: {cart: mockCart},
        params: {lines: 'malicious_sku:1'},
      } as any)) as Response;

      expect(res.status).toBe(302);
      expect(res.headers.get('Location')).toBe('/cart');
      expect(mockCart.create).not.toHaveBeenCalled();
    });
  });

  describe('2. URL Discount Auto-Apply (/discount/:code)', () => {
    it('should throttle after 5 discount code checks within 60 seconds', async () => {
      const mockCart = {
        updateDiscountCodes: vi.fn().mockResolvedValue({
          cart: {id: 'cart-123'},
        }),
        setCartId: vi.fn().mockReturnValue(new Headers()),
      };

      const testIp = '198.51.100.22';

      const makeRequest = (acceptHeader = 'text/html') => {
        const req = new Request('http://localhost:3000/discount/PROPHOTO?redirect=/products', {
          headers: {
            'x-forwarded-for': testIp,
            accept: acceptHeader,
          },
        });
        return discountLoader({
          request: req,
          context: {cart: mockCart},
          params: {code: 'PROPHOTO'},
        } as any);
      };

      // 5 requests allowed
      for (let i = 0; i < 5; i++) {
        const res = (await makeRequest()) as Response;
        expect(res.status).toBe(303);
      }
      expect(mockCart.updateDiscountCodes).toHaveBeenCalledTimes(5);

      // 6th request with JSON accept should get HTTP 429
      const blockedJson = (await makeRequest('application/json')) as Response;
      expect(blockedJson.status).toBe(429);
      expect(mockCart.updateDiscountCodes).toHaveBeenCalledTimes(5);

      // 7th request with HTML accept should redirect with discount_warning
      const blockedHtml = (await makeRequest('text/html')) as Response;
      expect(blockedHtml.status).toBe(303);
      expect(blockedHtml.headers.get('Location')).toContain('discount_warning=rate_limited');
      expect(blockedHtml.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(mockCart.updateDiscountCodes).toHaveBeenCalledTimes(5);
    });
  });

  describe('3. Customer Address Creation & Idempotency (/account/addresses)', () => {
    it('should replay identical createdAddress on duplicate submission with same idempotencyKey', async () => {
      const mockCustomerAccount = {
        isLoggedIn: vi.fn().mockResolvedValue(true),
        mutate: vi.fn().mockResolvedValue({
          data: {
            customerAddressCreate: {
              customerAddress: {id: 'gid://shopify/CustomerAddress/999'},
              userErrors: [],
            },
          },
        }),
        i18n: {language: 'EN'},
      };

      const makeSubmit = (key: string) => {
        const formData = new FormData();
        formData.set('addressId', 'NEW_ADDRESS_ID');
        formData.set('idempotencyKey', key);
        formData.set('firstName', 'Duong');
        formData.set('lastName', 'Ha');
        formData.set('address1', '123 Film Studio St');
        formData.set('city', 'Hanoi');
        formData.set('territoryCode', 'VN');
        formData.set('zoneCode', 'HN');
        formData.set('zip', '100000');

        const req = new Request('http://localhost:3000/account/addresses', {
          method: 'POST',
          body: formData,
          headers: {'x-forwarded-for': '192.0.2.33'},
        });

        return addressAction({
          request: req,
          context: {customerAccount: mockCustomerAccount},
          params: {},
        } as any);
      };

      const idempotencyKey = 'idem-addr-test-123';

      // First submission calls mutate
      const res1 = (await makeSubmit(idempotencyKey)) as any;
      expect(res1).toHaveProperty('createdAddress');
      expect(mockCustomerAccount.mutate).toHaveBeenCalledTimes(1);

      // Second submission with identical key returns cached result without mutating again
      const res2 = (await makeSubmit(idempotencyKey)) as any;
      expect(res2).toEqual(res1);
      expect(mockCustomerAccount.mutate).toHaveBeenCalledTimes(1);
    });

    it('should return 429 when address operations exceed 10 per minute', async () => {
      const mockCustomerAccount = {
        isLoggedIn: vi.fn().mockResolvedValue(true),
        mutate: vi.fn().mockResolvedValue({
          data: {
            customerAddressCreate: {
              customerAddress: {id: 'gid://shopify/CustomerAddress/1'},
              userErrors: [],
            },
          },
        }),
        i18n: {language: 'EN'},
      };

      const testIp = '192.0.2.44';

      for (let i = 0; i < 10; i++) {
        const formData = new FormData();
        formData.set('addressId', `addr-${i}`);
        formData.set('idempotencyKey', `key-${i}`);
        const req = new Request('http://localhost:3000/account/addresses', {
          method: 'POST',
          body: formData,
          headers: {'x-forwarded-for': testIp},
        });
        await addressAction({
          request: req,
          context: {customerAccount: mockCustomerAccount},
          params: {},
        } as any);
      }

      // 11th request must be rate limited
      const formData = new FormData();
      formData.set('addressId', 'addr-11');
      const req = new Request('http://localhost:3000/account/addresses', {
        method: 'POST',
        body: formData,
        headers: {'x-forwarded-for': testIp},
      });
      const blocked = (await addressAction({
        request: req,
        context: {customerAccount: mockCustomerAccount},
        params: {},
      } as any)) as any;

      expect(blocked.init.status).toBe(429);
      expect(blocked.init.headers['X-RateLimit-Limit']).toBe('10');
    });
  });

  describe('4. Customer Profile Update Rate Limiting (/account/profile)', () => {
    it('should throttle profile updates exceeding 5 requests in 5 minutes', async () => {
      const mockCustomerAccount = {
        mutate: vi.fn().mockResolvedValue({
          data: {
            customerUpdate: {
              customer: {id: 'cust-1', firstName: 'Updated'},
            },
          },
        }),
        i18n: {language: 'EN'},
      };

      const testIp = '198.51.100.99';

      const makeUpdate = () => {
        const formData = new FormData();
        formData.set('firstName', 'Cinephile');
        formData.set('lastName', 'Director');

        const req = new Request('http://localhost:3000/account/profile', {
          method: 'PUT',
          body: formData,
          headers: {'x-forwarded-for': testIp},
        });

        return profileAction({
          request: req,
          context: {customerAccount: mockCustomerAccount},
          params: {},
        } as any);
      };

      for (let i = 0; i < 5; i++) {
        const res = (await makeUpdate()) as any;
        expect(res.error).toBeNull();
      }
      expect(mockCustomerAccount.mutate).toHaveBeenCalledTimes(5);

      // 6th update attempt must be 429 throttled
      const blocked = (await makeUpdate()) as any;
      expect(blocked.init.status).toBe(429);
      expect(blocked.init.headers['X-RateLimit-Limit']).toBe('5');
      expect(mockCustomerAccount.mutate).toHaveBeenCalledTimes(5);
    });
  });

  describe('5. Contact & RMA Warranty Claim (/pages/contact)', () => {
    it('should rate limit contact form to 3 submissions per 5 minutes and handle idempotency', async () => {
      const testIp = '203.0.113.88';

      const makeSubmit = (key?: string) => {
        const formData = new FormData();
        formData.set('name', 'Director John');
        formData.set('email', 'john@cinema.studio');
        formData.set('serial', 'SN-ARRI-9988');
        formData.set('message', 'Sensor collimation needed.');
        if (key) formData.set('idempotencyKey', key);

        const req = new Request('http://localhost:3000/pages/contact', {
          method: 'POST',
          body: formData,
          headers: {'x-forwarded-for': testIp},
        });

        return contactAction({
          request: req,
          context: {},
          params: {handle: 'contact'},
        } as any);
      };

      // 1. First submission succeeds and returns dispatch code
      const res1 = (await makeSubmit('rma-key-1')) as any;
      expect(res1.init.status).toBe(200);
      const data1 = res1.data;
      expect(data1.success).toBe(true);
      expect(data1.dispatchCode).toMatch(/^LIMI-\d{4}$/);

      // 2. Duplicate submission with same key returns identical dispatch code (idempotent)
      const resDuplicate = (await makeSubmit('rma-key-1')) as any;
      expect(resDuplicate.init.status).toBe(200);
      expect(resDuplicate.data.dispatchCode).toBe(data1.dispatchCode);

      // 3. Submit 2nd and 3rd unique claims
      await makeSubmit('rma-key-2');
      await makeSubmit('rma-key-3');

      // 4. 4th submission must be rejected with 429
      const blocked = (await makeSubmit('rma-key-4')) as any;
      expect(blocked.init.status).toBe(429);
      expect(blocked.init.headers['X-RateLimit-Limit']).toBe('3');
      expect(blocked.data.error).toBeDefined();
    });
  });
});
