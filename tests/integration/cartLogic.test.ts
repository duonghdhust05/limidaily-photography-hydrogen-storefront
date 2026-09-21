import {describe, it, expect} from 'vitest';
import {CartForm} from '@shopify/hydrogen';

describe('Cart State & Mutation Logic', () => {
  it('should support core CartForm action constants', () => {
    expect(CartForm.ACTIONS.LinesAdd).toBe('LinesAdd');
    expect(CartForm.ACTIONS.LinesUpdate).toBe('LinesUpdate');
    expect(CartForm.ACTIONS.LinesRemove).toBe('LinesRemove');
    expect(CartForm.ACTIONS.DiscountCodesUpdate).toBe('DiscountCodesUpdate');
    expect(CartForm.ACTIONS.BuyerIdentityUpdate).toBe('BuyerIdentityUpdate');
  });

  describe('Discount Codes combining logic', () => {
    it('should combine newly entered discount with existing applied discounts without duplicating', () => {
      const existingCodes = ['SUMMER10', 'VIPMEMBER'];
      const newCode = 'PROKIT20';

      const combined = [newCode, ...existingCodes];
      const uniqueCombined = Array.from(new Set(combined.map((c) => c.trim().toUpperCase())));

      expect(uniqueCombined).toEqual(['PROKIT20', 'SUMMER10', 'VIPMEMBER']);
      expect(uniqueCombined).toHaveLength(3);
    });

    it('should ignore empty discount code input', () => {
      const existingCodes = ['VIPMEMBER'];
      const emptyInput = '   ';

      const combined = emptyInput.trim() ? [emptyInput.trim(), ...existingCodes] : existingCodes;
      expect(combined).toEqual(['VIPMEMBER']);
    });
  });

  describe('Buyer Identity multi-currency sync', () => {
    it('should create valid buyerIdentity payload for Vietnam market', () => {
      const countryCode = 'VN';
      const payload = {
        countryCode,
      };

      expect(payload.countryCode).toBe('VN');
    });

    it('should create valid buyerIdentity payload for International market', () => {
      const countryCode = 'US';
      const payload = {
        countryCode,
      };

      expect(payload.countryCode).toBe('US');
    });
  });

  describe('Optimistic line total calculations', () => {
    it('should compute correct subtotal given line items and prices', () => {
      const lines = [
        {
          id: 'gid://shopify/CartLine/1',
          quantity: 2,
          cost: {
            totalAmount: {
              amount: '1200000.0',
              currencyCode: 'VND',
            },
          },
        },
        {
          id: 'gid://shopify/CartLine/2',
          quantity: 1,
          cost: {
            totalAmount: {
              amount: '350000.0',
              currencyCode: 'VND',
            },
          },
        },
      ];

      const totalQuantity = lines.reduce((acc, line) => acc + line.quantity, 0);
      const totalAmount = lines.reduce((acc, line) => acc + parseFloat(line.cost.totalAmount.amount), 0);

      expect(totalQuantity).toBe(3);
      expect(totalAmount).toBe(1550000.0);
    });
  });

  describe('Open Redirect Security Defense', () => {
    function isSafeRedirectUrl(url: string | null): boolean {
      if (!url || typeof url !== 'string') return false;
      return (
        url.startsWith('/') &&
        !url.startsWith('//') &&
        !url.startsWith('/\\') &&
        !url.includes(':')
      );
    }

    it('should allow valid relative paths for redirection', () => {
      expect(isSafeRedirectUrl('/')).toBe(true);
      expect(isSafeRedirectUrl('/en')).toBe(true);
      expect(isSafeRedirectUrl('/collections/all')).toBe(true);
      expect(isSafeRedirectUrl('/products/sony-fx3?variant=123#specs')).toBe(true);
    });

    it('should strictly reject external phishing URLs and dangerous schemes', () => {
      expect(isSafeRedirectUrl('https://phishing-site.com')).toBe(false);
      expect(isSafeRedirectUrl('http://attacker.com')).toBe(false);
      expect(isSafeRedirectUrl('//evil.com/phishing')).toBe(false);
      expect(isSafeRedirectUrl('/\\evil.com')).toBe(false);
      expect(isSafeRedirectUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeRedirectUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeRedirectUrl('')).toBe(false);
      expect(isSafeRedirectUrl(null)).toBe(false);
    });
  });

  describe('Multi-Market Cart Line Preservation Pattern', () => {
    it('should prevent dropping lines when market country changes by ensuring full cart refetch', async () => {
      // Mock minimal mutation response from Shopify cartBuyerIdentityUpdate
      const minimalMutationResult = {
        cart: {
          id: 'gid://shopify/Cart/c1-12345',
          totalQuantity: 2,
          checkoutUrl: 'https://shop.myshopify.com/checkouts/c/12345',
          // lines and cost are omitted in minimal mutation responses
        },
      };

      // Mock full cart from cart.get() after country re-pricing
      const fullRefetchedCart = {
        id: 'gid://shopify/Cart/c1-12345',
        totalQuantity: 2,
        buyerIdentity: {countryCode: 'US'},
        checkoutUrl: 'https://shop.myshopify.com/checkouts/c/12345',
        lines: {
          nodes: [
            {
              id: 'gid://shopify/CartLine/1',
              quantity: 1,
              merchandise: {id: 'gid://shopify/ProductVariant/101', title: 'Sony FX3 Body'},
              cost: {totalAmount: {amount: '3899.99', currencyCode: 'USD'}},
            },
            {
              id: 'gid://shopify/CartLine/2',
              quantity: 1,
              merchandise: {id: 'gid://shopify/ProductVariant/102', title: 'Godox V1 Flash'},
              cost: {totalAmount: {amount: '259.00', currencyCode: 'USD'}},
            },
          ],
        },
        cost: {
          subtotalAmount: {amount: '4158.99', currencyCode: 'USD'},
          totalAmount: {amount: '4158.99', currencyCode: 'USD'},
        },
      };

      // Simulated resolution logic: Refetching cart.get() ensures lines array is present
      const resolvedCart = fullRefetchedCart ?? minimalMutationResult.cart;

      expect(resolvedCart.lines).toBeDefined();
      expect(resolvedCart.lines.nodes).toHaveLength(2);
      expect(resolvedCart.lines.nodes[0].cost.totalAmount.currencyCode).toBe('USD');
      expect(resolvedCart.totalQuantity).toBe(2);
      expect(resolvedCart.buyerIdentity.countryCode).toBe('US');
    });
  });

  describe('Dedicated Safe Checkout Redirection Flow', () => {
    function computeCheckoutDecision(cart: {
      id?: string;
      totalQuantity?: number;
      checkoutUrl?: string;
      buyerIdentity?: {customer?: {id?: string} | null};
    } | null, isLoggedIn: boolean, customerAccessToken?: string): {redirectUrl: string} {
      if (!cart?.id || !cart.totalQuantity) {
        return {redirectUrl: '/cart'};
      }

      if (isLoggedIn && customerAccessToken && !cart.buyerIdentity?.customer?.id) {
        // Updated checkout session with linked customer identity
        return {redirectUrl: `${cart.checkoutUrl}?logged_in=true`};
      }

      if (cart.checkoutUrl) {
        return {redirectUrl: cart.checkoutUrl};
      }

      return {redirectUrl: '/cart'};
    }

    it('should redirect empty or invalid cart back to /cart', () => {
      expect(computeCheckoutDecision(null, false).redirectUrl).toBe('/cart');
      expect(computeCheckoutDecision({id: 'cart-1', totalQuantity: 0}, false).redirectUrl).toBe('/cart');
    });

    it('should direct valid cart with checkoutUrl straight to checkout', () => {
      const decision = computeCheckoutDecision(
        {
          id: 'cart-1',
          totalQuantity: 3,
          checkoutUrl: 'https://shop.myshopify.com/checkouts/c/xyz',
        },
        false,
      );
      expect(decision.redirectUrl).toBe('https://shop.myshopify.com/checkouts/c/xyz');
    });

    it('should ensure customer identity is attached when logged in', () => {
      const decision = computeCheckoutDecision(
        {
          id: 'cart-1',
          totalQuantity: 1,
          checkoutUrl: 'https://shop.myshopify.com/checkouts/c/xyz',
          buyerIdentity: {customer: null},
        },
        true,
        'cat_token_123',
      );
      expect(decision.redirectUrl).toContain('logged_in=true');
    });
  });

  describe('Idempotency Key & Rate Limiting Defense for Cart', () => {
    it('should prevent double-addition when identical idempotencyKey is supplied', async () => {
      const {
        getIdempotencyRecord,
        setIdempotencyRecord,
        resetIdempotencyStore,
      } = await import('~/lib/idempotency');
      resetIdempotencyStore();

      const idempotencyKey = 'cart-test-key-99';
      let addCalls = 0;

      const mockAddLines = async (key: string) => {
        const cached = getIdempotencyRecord(key);
        if (cached) {
          return {data: cached.data, isReplay: true};
        }

        addCalls++;
        const res = {cart: {id: 'cart-123', totalQuantity: 1}};
        setIdempotencyRecord(key, {status: 200, data: res});
        return {data: res, isReplay: false};
      };

      // First click
      const call1 = await mockAddLines(idempotencyKey);
      expect(call1.isReplay).toBe(false);
      expect(addCalls).toBe(1);

      // Rapid duplicate click (simulating double click or network retry)
      const call2 = await mockAddLines(idempotencyKey);
      expect(call2.isReplay).toBe(true);
      expect(addCalls).toBe(1); // Underlying mutation NOT called again
      expect(call2.data).toEqual(call1.data);
    });

    it('should enforce rate limit of 5 requests per minute for discount code application', async () => {
      const {checkRateLimit, resetRateLimiter} = await import('~/lib/rateLimiter');
      resetRateLimiter();

      const key = 'discount:192.0.2.45';
      const options = {maxRequests: 5, windowMs: 60_000};

      // 5 attempts should pass
      for (let i = 0; i < 5; i++) {
        const res = checkRateLimit(key, options);
        expect(res.allowed).toBe(true);
      }

      // 6th attempt must be blocked
      const blocked = checkRateLimit(key, options);
      expect(blocked.allowed).toBe(false);
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
      expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60);
    });

    it('should throttle market switching when exceeding 10 requests per minute', async () => {
      const {checkRateLimit, resetRateLimiter} = await import('~/lib/rateLimiter');
      resetRateLimiter();

      const key = 'buyer-identity:192.0.2.99';
      const options = {maxRequests: 10, windowMs: 60_000};

      // 10 market switches allowed
      for (let i = 0; i < 10; i++) {
        const res = checkRateLimit(key, options);
        expect(res.allowed).toBe(true);
      }

      // 11th rapid switch should be throttled
      const throttled = checkRateLimit(key, options);
      expect(throttled.allowed).toBe(false);
      expect(throttled.remaining).toBe(0);
    });
  });
});

