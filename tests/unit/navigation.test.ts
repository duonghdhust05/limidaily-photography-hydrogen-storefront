import {describe, it, expect} from 'vitest';
import {normalizeMenuUrl, getLocalizedMenuTitle} from '~/lib/navigation';
import {viDictionary} from '~/locales/vi';
import {enDictionary} from '~/locales/en';
import type {TranslationKey} from '~/locales/schema';

describe('Navigation & Menu Utilities', () => {
  describe('normalizeMenuUrl', () => {
    it('should return fallback root for null or empty URLs', () => {
      expect(normalizeMenuUrl(null)).toEqual({url: '/', isExternal: false});
      expect(normalizeMenuUrl(undefined)).toEqual({url: '/', isExternal: false});
      expect(normalizeMenuUrl('')).toEqual({url: '/', isExternal: false});
    });

    it('should identify external URLs and preserve them', () => {
      expect(normalizeMenuUrl('https://instagram.com/limi_photo')).toEqual({
        url: 'https://instagram.com/limi_photo',
        isExternal: true,
      });
      expect(normalizeMenuUrl('http://external-partner.com')).toEqual({
        url: 'http://external-partner.com',
        isExternal: true,
      });
    });

    it('should strip store domain and extract relative canonical path', () => {
      const result1 = normalizeMenuUrl(
        'https://limiphotography.myshopify.com/collections/cameras-optics',
      );
      expect(result1).toEqual({
        url: '/collections/cameras-optics',
        isExternal: false,
      });

      const result2 = normalizeMenuUrl(
        'https://custom-domain.com/blogs/news',
        {
          publicStoreDomain: 'custom-domain.com',
        },
      );
      expect(result2).toEqual({
        url: '/blogs/news',
        isExternal: false,
      });
    });

    it('should strip /vi alias from store URLs to prevent 404', () => {
      const result = normalizeMenuUrl(
        'https://limiphotography.myshopify.com/vi/policies/privacy-policy',
      );
      expect(result).toEqual({
        url: '/policies/privacy-policy',
        isExternal: false,
      });
    });

    it('should strip /en prefix from relative URLs to prevent double-prefixing in Link/NavLink', () => {
      const result = normalizeMenuUrl('/en/collections/all');
      expect(result).toEqual({
        url: '/collections/all',
        isExternal: false,
      });
    });

    it('should preserve query parameters and hash fragments', () => {
      const result = normalizeMenuUrl('/en/collections/all?sort=price-asc#filter-grid');
      expect(result).toEqual({
        url: '/collections/all?sort=price-asc#filter-grid',
        isExternal: false,
      });
    });

    it('should resolve footer URLs and store domains seamlessly (from scratch test)', () => {
      const publicStoreDomain = 'intern-ha-duc-duong-store.myshopify.com';
      const primaryDomainUrl = 'https://intern-ha-duc-duong-store.myshopify.com';

      const cases = [
        {input: 'https://intern-ha-duc-duong-store.myshopify.com/vi/search', expected: '/search'},
        {input: 'https://intern-ha-duc-duong-store.myshopify.com/vi/pages/data-sharing-opt-out', expected: '/pages/data-sharing-opt-out'},
        {input: 'https://limidaily-pho-tography-989124630e34eee9c258.o2.myshopify.dev/search', expected: '/search'},
        {input: '/vi/search', expected: '/search'},
        {input: '/vi/pages/data-sharing-opt-out', expected: '/pages/data-sharing-opt-out'},
        {input: '/en/search', expected: '/search'},
        {input: '/search', expected: '/search'},
      ];

      for (const tc of cases) {
        expect(normalizeMenuUrl(tc.input, {publicStoreDomain, primaryDomainUrl})).toEqual({
          url: tc.expected,
          isExternal: false,
        });
      }
    });
  });

  describe('getLocalizedMenuTitle', () => {
    const mockTVi = (key: TranslationKey) => viDictionary[key];
    const mockTEn = (key: TranslationKey) => enDictionary[key];

    it('should translate standard collection titles in Vietnamese', () => {
      expect(getLocalizedMenuTitle('Cameras & Optics', mockTVi)).toBe(viDictionary.cat_optics);
      expect(getLocalizedMenuTitle('Lighting & Audio', mockTVi)).toBe(viDictionary.cat_lighting);
      expect(getLocalizedMenuTitle('Rigging & Accessories', mockTVi)).toBe(viDictionary.cat_rigging);
      expect(getLocalizedMenuTitle('All Hardware', mockTVi)).toBe(viDictionary.nav_all_hardware);
      expect(getLocalizedMenuTitle('Journal', mockTVi)).toBe(viDictionary.nav_journal);
    });

    it('should translate standard collection titles in English', () => {
      expect(getLocalizedMenuTitle('Cameras & Optics', mockTEn)).toBe(enDictionary.cat_optics);
      expect(getLocalizedMenuTitle('Lighting & Audio', mockTEn)).toBe(enDictionary.cat_lighting);
      expect(getLocalizedMenuTitle('Rigging & Accessories', mockTEn)).toBe(enDictionary.cat_rigging);
      expect(getLocalizedMenuTitle('All Hardware', mockTEn)).toBe(enDictionary.nav_all_hardware);
      expect(getLocalizedMenuTitle('Journal', mockTEn)).toBe(enDictionary.nav_journal);
    });

    it('should translate policy titles dynamically', () => {
      expect(getLocalizedMenuTitle('Privacy Policy', mockTVi)).toBe(viDictionary.footer_privacy);
      expect(getLocalizedMenuTitle('Privacy Policy', mockTEn)).toBe(enDictionary.footer_privacy);
      expect(getLocalizedMenuTitle('Terms of Service', mockTVi)).toBe(viDictionary.footer_terms);
      expect(getLocalizedMenuTitle('Terms of Service', mockTEn)).toBe(enDictionary.footer_terms);
      expect(getLocalizedMenuTitle('Refund Policy', mockTVi)).toBe(viDictionary.footer_refund);
      expect(getLocalizedMenuTitle('Shipping Policy', mockTVi)).toBe(viDictionary.footer_shipping);
    });

    it('should be case-insensitive and handle whitespace', () => {
      expect(getLocalizedMenuTitle('  cameras & optics  ', mockTVi)).toBe(viDictionary.cat_optics);
      expect(getLocalizedMenuTitle('LIGHTING & AUDIO', mockTVi)).toBe(viDictionary.cat_lighting);
      expect(getLocalizedMenuTitle('all hardware', mockTVi)).toBe(viDictionary.nav_all_hardware);
    });

    it('should preserve custom merchant titles unchanged', () => {
      expect(getLocalizedMenuTitle('Sony Cinema Masterclass', mockTVi)).toBe('Sony Cinema Masterclass');
      expect(getLocalizedMenuTitle('Special Exhibition 2026', mockTEn)).toBe('Special Exhibition 2026');
    });

    it('should handle null, undefined, or empty string gracefully', () => {
      expect(getLocalizedMenuTitle(null, mockTVi)).toBe('');
      expect(getLocalizedMenuTitle(undefined, mockTVi)).toBe('');
      expect(getLocalizedMenuTitle('', mockTVi)).toBe('');
    });
  });
});
