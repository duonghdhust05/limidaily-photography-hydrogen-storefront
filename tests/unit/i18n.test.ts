import {describe, it, expect} from 'vitest';
import {
  DEFAULT_LOCALE,
  INTERNATIONAL_LOCALE,
  SUPPORTED_LOCALES,
  getLocaleFromPathname,
  getLocaleFromRequest,
  getPathWithoutLocale,
} from '~/lib/i18n';

describe('i18n Core Service', () => {
  describe('SUPPORTED_LOCALES Registry', () => {
    it('should include DEFAULT_LOCALE as the primary market', () => {
      expect(DEFAULT_LOCALE.language).toBe('VI');
      expect(DEFAULT_LOCALE.country).toBe('VN');
      expect(DEFAULT_LOCALE.currency).toBe('VND');
      expect(DEFAULT_LOCALE.pathPrefix).toBe('');
      expect(DEFAULT_LOCALE.aliases).toContain('/vi');
      expect(DEFAULT_LOCALE.isPrimary).toBe(true);
    });

    it('should include INTERNATIONAL_LOCALE as the global market', () => {
      expect(INTERNATIONAL_LOCALE.language).toBe('EN');
      expect(INTERNATIONAL_LOCALE.country).toBe('US');
      expect(INTERNATIONAL_LOCALE.currency).toBe('USD');
      expect(INTERNATIONAL_LOCALE.pathPrefix).toBe('/en');
      expect(INTERNATIONAL_LOCALE.isPrimary).toBe(false);
    });

    it('should have exactly 2 registered markets', () => {
      expect(SUPPORTED_LOCALES).toHaveLength(2);
      expect(SUPPORTED_LOCALES).toContain(DEFAULT_LOCALE);
      expect(SUPPORTED_LOCALES).toContain(INTERNATIONAL_LOCALE);
    });
  });

  describe('getLocaleFromPathname', () => {
    it('should resolve default locale for root and canonical paths without prefix', () => {
      expect(getLocaleFromPathname('/')).toBe(DEFAULT_LOCALE);
      expect(getLocaleFromPathname('/products')).toBe(DEFAULT_LOCALE);
      expect(getLocaleFromPathname('/collections/all')).toBe(DEFAULT_LOCALE);
      expect(getLocaleFromPathname('/blogs/news')).toBe(DEFAULT_LOCALE);
    });

    it('should resolve international locale for /en paths', () => {
      expect(getLocaleFromPathname('/en')).toBe(INTERNATIONAL_LOCALE);
      expect(getLocaleFromPathname('/en/')).toBe(INTERNATIONAL_LOCALE);
      expect(getLocaleFromPathname('/en/products')).toBe(INTERNATIONAL_LOCALE);
      expect(getLocaleFromPathname('/en/collections/cameras-optics')).toBe(INTERNATIONAL_LOCALE);
    });

    it('should resolve default locale for /vi alias paths', () => {
      expect(getLocaleFromPathname('/vi')).toBe(DEFAULT_LOCALE);
      expect(getLocaleFromPathname('/vi/')).toBe(DEFAULT_LOCALE);
      expect(getLocaleFromPathname('/vi/products')).toBe(DEFAULT_LOCALE);
      expect(getLocaleFromPathname('/vi/pages/contact')).toBe(DEFAULT_LOCALE);
    });

    it('should handle uppercase, trailing slashes, and query params', () => {
      expect(getLocaleFromPathname('/EN/products')).toBe(INTERNATIONAL_LOCALE);
      expect(getLocaleFromPathname('/VI/products')).toBe(DEFAULT_LOCALE);
      expect(getLocaleFromPathname('/en?country=US')).toBe(INTERNATIONAL_LOCALE);
    });

    it('should handle React Router v7 Single Fetch .data requests', () => {
      expect(getLocaleFromPathname('/en/products.data')).toBe(INTERNATIONAL_LOCALE);
      expect(getLocaleFromPathname('/vi/search.data')).toBe(DEFAULT_LOCALE);
      expect(getLocaleFromPathname('/collections/all.data')).toBe(DEFAULT_LOCALE);
    });
  });

  describe('getLocaleFromRequest', () => {
    it('should parse locale from valid incoming Request object', () => {
      const req1 = new Request('http://localhost:3000/en/products');
      expect(getLocaleFromRequest(req1)).toBe(INTERNATIONAL_LOCALE);

      const req2 = new Request('http://localhost:3000/vi/collections');
      expect(getLocaleFromRequest(req2)).toBe(DEFAULT_LOCALE);

      const req3 = new Request('http://localhost:3000/');
      expect(getLocaleFromRequest(req3)).toBe(DEFAULT_LOCALE);
    });

    it('should fallback gracefully to DEFAULT_LOCALE for malformed requests', () => {
      const dummyReq = { url: 'invalid-url' } as unknown as Request;
      expect(getLocaleFromRequest(dummyReq)).toBe(DEFAULT_LOCALE);
    });
  });

  describe('getPathWithoutLocale', () => {
    it('should strip /en prefix from paths', () => {
      expect(getPathWithoutLocale('/en')).toBe('/');
      expect(getPathWithoutLocale('/en/')).toBe('/');
      expect(getPathWithoutLocale('/en/products')).toBe('/products');
      expect(getPathWithoutLocale('/en/collections/cameras-optics')).toBe('/collections/cameras-optics');
    });

    it('should strip /vi alias prefix from paths', () => {
      expect(getPathWithoutLocale('/vi')).toBe('/');
      expect(getPathWithoutLocale('/vi/')).toBe('/');
      expect(getPathWithoutLocale('/vi/search')).toBe('/search');
      expect(getPathWithoutLocale('/vi/pages/data-sharing-opt-out')).toBe('/pages/data-sharing-opt-out');
      expect(getPathWithoutLocale('/vi/pages/contact')).toBe('/pages/contact');
      expect(getPathWithoutLocale('/vi/policies/terms-of-service')).toBe('/policies/terms-of-service');
    });

    it('should strip stacked duplicate prefixes (anti-looping & anti-duplicate)', () => {
      expect(getPathWithoutLocale('/en/en/products/godox')).toBe('/products/godox');
      expect(getPathWithoutLocale('/en/vi/products/godox')).toBe('/products/godox');
      expect(getPathWithoutLocale('/vi/vi/search')).toBe('/search');
    });

    it('should preserve query parameters and hash fragments', () => {
      expect(getPathWithoutLocale('/en/collections/all?page=2#grid')).toBe('/collections/all?page=2#grid');
      expect(getPathWithoutLocale('/vi/products?variant=123')).toBe('/products?variant=123');
    });

    it('should leave paths without locale untouched', () => {
      expect(getPathWithoutLocale('/')).toBe('/');
      expect(getPathWithoutLocale('/products/sony-fx3')).toBe('/products/sony-fx3');
      expect(getPathWithoutLocale('/cart')).toBe('/cart');
    });
  });
});
