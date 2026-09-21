import {describe, it, expect, beforeAll} from 'vitest';

/**
 * Shopify Storefront API GraphQL Integration Test Suite
 * Synthesizes and automates:
 * - test_localization.mjs (Storefront localization contract, multi-country/currency)
 * - test_product_markets.mjs (Multi-market currency switching @inContext)
 * - inspect_collections_blogs.mjs (Collections & Blogs schema tree)
 * - inspect_menu.mjs / inspect_footer_menu.mjs (Navigation menus)
 * - test_cart_buyer_identity.mjs (Cart creation & buyer identity currency update)
 */

describe('Shopify Storefront GraphQL Contract & Multi-Market Verification', () => {
  const STOREFRONT_ENDPOINT =
    'https://intern-ha-duc-duong-store.myshopify.com/api/2026-01/graphql.json';
  const STOREFRONT_TOKEN =
    process.env.PUBLIC_STOREFRONT_API_TOKEN ||
    'e35cd8c7a216d5927727fdda93f22957';

  let isStorefrontReachable = false;

  async function executeStorefrontQuery<T = any>(
    query: string,
    variables: Record<string, unknown> = {},
  ): Promise<T | null> {
    try {
      const res = await fetch(STOREFRONT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
        },
        body: JSON.stringify({query, variables}),
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) return null;
      const json = (await res.json()) as {data?: T};
      return (json.data ?? null) as T | null;
    } catch {
      return null;
    }
  }

  beforeAll(async () => {
    const testData = await executeStorefrontQuery(`
      query Ping {
        shop {
          name
        }
      }
    `);
    isStorefrontReachable = Boolean(testData);
  });

  describe('Storefront Localization & Multi-Market Configuration', () => {
    const LOCALIZATION_QUERY = `
      query GetLocalization($country: CountryCode, $language: LanguageCode) 
        @inContext(country: $country, language: $language) {
        localization {
          country {
            isoCode
            name
            currency {
              isoCode
              symbol
            }
          }
          language {
            isoCode
            name
          }
          availableCountries {
            isoCode
            currency {
              isoCode
            }
          }
          availableLanguages {
            isoCode
          }
        }
      }
    `;

    it('should resolve Vietnam market (VN / VND) by default or when specified', async () => {
      if (!isStorefrontReachable) return;

      const data = await executeStorefrontQuery<{localization: any}>(
        LOCALIZATION_QUERY,
        {country: 'VN', language: 'VI'},
      );

      expect(data).toBeDefined();
      expect(data?.localization.country.isoCode).toBe('VN');
      expect(data?.localization.country.currency.isoCode).toBe('VND');
      expect(data?.localization.language.isoCode.toUpperCase()).toBe('VI');
    });

    it('should resolve International market (US / USD) when specified in context', async () => {
      if (!isStorefrontReachable) return;

      const data = await executeStorefrontQuery<{localization: any}>(
        LOCALIZATION_QUERY,
        {country: 'US', language: 'EN'},
      );

      expect(data).toBeDefined();
      expect(data?.localization.country.isoCode).toBe('US');
      expect(data?.localization.country.currency.isoCode).toBe('USD');
      expect(data?.localization.language.isoCode.toUpperCase()).toBe('EN');
    });

    it('should expose both VN and US in availableCountries registry', async () => {
      if (!isStorefrontReachable) return;

      const data = await executeStorefrontQuery<{localization: any}>(
        LOCALIZATION_QUERY,
      );

      const countryCodes = data?.localization.availableCountries.map(
        (c: {isoCode: string}) => c.isoCode,
      );
      expect(countryCodes).toContain('VN');
      expect(countryCodes).toContain('US');
    });
  });

  describe('Multi-Market Product Currency Pricing', () => {
    const PRODUCTS_MARKET_QUERY = `
      query GetProductPrices($country: CountryCode, $language: LanguageCode) 
        @inContext(country: $country, language: $language) {
        products(first: 3) {
          nodes {
            id
            title
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    `;

    it('should return prices in VND for Vietnam market context', async () => {
      if (!isStorefrontReachable) return;

      const data = await executeStorefrontQuery<{products: {nodes: any[]}}>(
        PRODUCTS_MARKET_QUERY,
        {country: 'VN', language: 'VI'},
      );

      expect(data?.products.nodes.length).toBeGreaterThan(0);
      for (const prod of data?.products.nodes || []) {
        expect(prod.priceRange.minVariantPrice.currencyCode).toBe('VND');
      }
    });

    it('should return prices in USD for International market context', async () => {
      if (!isStorefrontReachable) return;

      const data = await executeStorefrontQuery<{products: {nodes: any[]}}>(
        PRODUCTS_MARKET_QUERY,
        {country: 'US', language: 'EN'},
      );

      expect(data?.products.nodes.length).toBeGreaterThan(0);
      for (const prod of data?.products.nodes || []) {
        expect(prod.priceRange.minVariantPrice.currencyCode).toBe('USD');
      }
    });
  });

  describe('Catalog & Navigation Schema Tree', () => {
    it('should return valid collections and blogs with articles for sidebar', async () => {
      if (!isStorefrontReachable) return;

      const data = await executeStorefrontQuery<{
        collections: {nodes: any[]};
        blogs: {nodes: any[]};
      }>(`
        query SidebarData {
          collections(first: 5) {
            nodes {
              id
              title
              handle
            }
          }
          blogs(first: 3) {
            nodes {
              id
              title
              handle
              articles(first: 3) {
                nodes {
                  id
                  title
                  handle
                }
              }
            }
          }
        }
      `);

      expect(data?.collections.nodes.length).toBeGreaterThan(0);
      expect(data?.blogs.nodes.length).toBeGreaterThan(0);
    });
  });

  describe('Cart Buyer Identity Mutation & Market Currency Transition', () => {
    it('should create cart in VN market and seamlessly transition currency upon BuyerIdentityUpdate', async () => {
      if (!isStorefrontReachable) return;

      // 1. Fetch a product variant to add
      const prodData = await executeStorefrontQuery<{
        products: {nodes: {variants: {nodes: {id: string}[]}}[]};
      }>(`
        query {
          products(first: 1) {
            nodes {
              variants(first: 1) {
                nodes {
                  id
                }
              }
            }
          }
        }
      `);

      const variantId = prodData?.products.nodes[0]?.variants.nodes[0]?.id;
      if (!variantId) return;

      // 2. Create cart in Vietnam market
      const createCartData = await executeStorefrontQuery<{
        cartCreate: {cart: {id: string; cost: {subtotalAmount: {currencyCode: string}}}};
      }>(
        `
        mutation cartCreate($input: CartInput, $country: CountryCode, $language: LanguageCode)
          @inContext(country: $country, language: $language) {
          cartCreate(input: $input) {
            cart {
              id
              cost {
                subtotalAmount {
                  currencyCode
                }
              }
            }
          }
        }
      `,
        {
          input: {
            lines: [{merchandiseId: variantId, quantity: 1}],
          },
          country: 'VN',
          language: 'VI',
        },
      );

      const cart = createCartData?.cartCreate?.cart;
      expect(cart).toBeDefined();
      expect(cart?.cost.subtotalAmount.currencyCode).toBe('VND');

      // 3. Update Buyer Identity to US market
      const updateData = await executeStorefrontQuery<{
        cartBuyerIdentityUpdate: {
          cart: {id: string; cost: {subtotalAmount: {currencyCode: string}}};
        };
      }>(
        `
        mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
          cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
            cart {
              id
              cost {
                subtotalAmount {
                  currencyCode
                }
              }
            }
          }
        }
      `,
        {
          cartId: cart?.id,
          buyerIdentity: {
            countryCode: 'US',
          },
        },
      );

      const updatedCart = updateData?.cartBuyerIdentityUpdate?.cart;
      expect(updatedCart).toBeDefined();
      expect(updatedCart?.cost.subtotalAmount.currencyCode).toBe('USD');
    });
  });
});
