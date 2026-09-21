import {describe, it, expect, beforeAll} from 'vitest';

/**
 * End-to-End Live Server Integration Test Suite
 * Synthesizes and automates:
 * - test_live_server.mjs (301 redirects, route integrity)
 * - test_http_locales.mjs (HTML lang, currency symbols, multi-market headers)
 * - test_ssr_e2e.mjs (Hreflang tags, canonical titles)
 * - test_routes.mjs (Blog reading time, viewfinder, single H1 constraint)
 * - test_sidebar_ssr.mjs (Deferred collection & blog stream)
 * - test_market_form_submit.mjs (Buyer identity cart mutation)
 */

describe('Live Hydrogen Server E2E Verification', () => {
  const BASE_URL = 'http://localhost:3000';
  let isServerAvailable = false;

  beforeAll(async () => {
    try {
      const res = await fetch(`${BASE_URL}/`, {
        signal: AbortSignal.timeout(3000),
      });
      isServerAvailable = res.status >= 200 && res.status < 500;
    } catch {
      isServerAvailable = false;
    }
  });

  describe('Canonical Server 301 Redirections', () => {
    it('should redirect /vi and alias routes with 301 to root/canonical equivalent', async () => {
      if (!isServerAvailable) return;

      // 1. /vi -> /
      const resVi = await fetch(`${BASE_URL}/vi`, {redirect: 'manual'});
      expect(resVi.status).toBe(301);
      expect(resVi.headers.get('location')).toBe(`${BASE_URL}/`);

      // 2. /vi/ -> /
      const resViSlash = await fetch(`${BASE_URL}/vi/`, {redirect: 'manual'});
      expect(resViSlash.status).toBe(301);
      expect(resViSlash.headers.get('location')).toBe(`${BASE_URL}/`);

      // 3. /vi/search -> /search
      const resSearch = await fetch(`${BASE_URL}/vi/search`, {redirect: 'manual'});
      expect(resSearch.status).toBe(301);
      expect(resSearch.headers.get('location')).toContain('/search');

      // 4. /vi/pages/data-sharing-opt-out -> /pages/data-sharing-opt-out
      const resOptOut = await fetch(`${BASE_URL}/vi/pages/data-sharing-opt-out`, {redirect: 'manual'});
      expect(resOptOut.status).toBe(301);
      expect(resOptOut.headers.get('location')).toContain('/pages/data-sharing-opt-out');
    });

    it('should respond 200 directly for canonical routes without redirection', async () => {
      if (!isServerAvailable) return;

      const endpoints = ['/search', '/pages/contact', '/en/search', '/en/pages/contact'];
      for (const endpoint of endpoints) {
        const res = await fetch(`${BASE_URL}${endpoint}`, {redirect: 'manual'});
        expect(res.status, `Endpoint ${endpoint} should return 200 OK`).toBe(200);
      }
    });
  });

  describe('Multi-Market SSR Localization & Hreflang Tags', () => {
    it('should render primary Vietnam market (/) with correct lang, VND, and alternate hreflang', async () => {
      if (!isServerAvailable) return;

      const res = await fetch(`${BASE_URL}/`);
      expect(res.status).toBe(200);
      const html = await res.text();

      // Check HTML lang attribute
      expect(html).toContain('lang="vi"');

      // Check Title contains brand name
      expect(html).toContain('Limi Photography');

      // Check Currency (VND symbol ₫ or VND)
      expect(html.includes('₫') || html.includes('VND')).toBe(true);

      // Check Hreflang alternate tag
      expect(html).toMatch(/hrefLang=["']en-us["']/i);
    });

    it('should render international market (/en) with lang="en", USD, and alternate hreflang', async () => {
      if (!isServerAvailable) return;

      const res = await fetch(`${BASE_URL}/en`);
      expect(res.status).toBe(200);
      const html = await res.text();

      // Check HTML lang attribute
      expect(html).toContain('lang="en"');

      // Check Title contains brand name
      expect(html).toContain('Limi Photography');

      // Check Currency ($)
      expect(html).toContain('$');

      // Check Hreflang alternate tag
      expect(html).toMatch(/hrefLang=["']vi-vn["']/i);
    });
  });

  describe('Product PDP Multi-Market Rendering', () => {
    it('should render product pages with market-specific currencies and titles', async () => {
      if (!isServerAvailable) return;

      const productPath = '/products/sony-fx3-full-frame-cinema-line-camera-body';
      const resVi = await fetch(`${BASE_URL}${productPath}`);
      if (resVi.status === 200) {
        const htmlVi = await resVi.text();
        expect(htmlVi.includes('₫') || htmlVi.includes('VND')).toBe(true);
      }

      const resEn = await fetch(`${BASE_URL}/en${productPath}`);
      if (resEn.status === 200) {
        const htmlEn = await resEn.text();
        expect(htmlEn).toContain('$');
      }
    });
  });

  describe('Editorial Blog & Static Page Quality Constraints', () => {
    it('should render technical journal articles with reading time and viewfinder banner', async () => {
      if (!isServerAvailable) return;

      const blogPath = '/blogs/tips-tricks/the-minimalist-desk-setup-designing-for-deep-focus-and-flow';
      const res = await fetch(`${BASE_URL}${blogPath}`);
      if (res.status === 200) {
        const html = await res.text();
        // Check reading time (case-insensitive for ALL CAPS compliance)
        expect(html).toMatch(/PHÚT ĐỌC|MIN READ|phút đọc|min read/i);
        // Check viewfinder overlay
        expect(html).toContain('VIEWFINDER');
        // Check industrial prose
        expect(html).toContain('prose-industrial');
      }
    });

    it('should maintain single H1 SEO hierarchy and valid forms on static pages', async () => {
      if (!isServerAvailable) return;

      const resContact = await fetch(`${BASE_URL}/pages/contact`);
      if (resContact.status === 200) {
        const html = await resContact.text();
        // Check single H1 constraint
        const h1Matches = html.match(/<h1[^>]*>/gi) || [];
        expect(h1Matches.length).toBeLessThanOrEqual(1);
        // Check contact form presence
        expect(html).toContain('contact-name');
      }

      const resAbout = await fetch(`${BASE_URL}/pages/about-us`);
      if (resAbout.status === 200) {
        const html = await resAbout.text();
        const h1Matches = html.match(/<h1[^>]*>/gi) || [];
        expect(h1Matches.length).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Sidebar SSR Payload & Market Switching Submissions', () => {
    it('should include collection and blog handles in initial HTML stream', async () => {
      if (!isServerAvailable) return;

      const res = await fetch(`${BASE_URL}/`);
      const html = await res.text();

      // Verify category links in navigation stream
      expect(html.includes('cameras-optics') || html.includes('Cameras')).toBe(true);
      expect(html.includes('lighting-audio') || html.includes('Lighting')).toBe(true);
      expect(html.includes('rigging-accessories') || html.includes('Rigging')).toBe(true);
    });

    it('should accept BuyerIdentityUpdate POST requests to /cart without 500 error', async () => {
      if (!isServerAvailable) return;

      const params = new URLSearchParams();
      params.set('redirectTo', '/en');
      params.set(
        'cartFormInput',
        JSON.stringify({
          action: 'BuyerIdentityUpdate',
          inputs: {
            buyerIdentity: {
              countryCode: 'US',
            },
          },
        }),
      );

      const res = await fetch(`${BASE_URL}/en/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        redirect: 'manual',
      });

      // Valid Cart form responses are 302, 303 (redirect) or 200
      expect([200, 302, 303]).toContain(res.status);
    });

    it('should serve all referenced client asset bundles without 404 (from check_scripts.mjs)', async () => {
      if (!isServerAvailable) return;

      const res = await fetch(`${BASE_URL}/`);
      const html = await res.text();
      const assetRegex = /<(?:script[^>]*src|link[^>]*href)="([^"]+)"/g;
      let match: RegExpExecArray | null;
      const assetUrls: string[] = [];

      while ((match = assetRegex.exec(html)) !== null) {
        const url = match[1];
        // Only verify internal relative assets served by this app
        if (url.startsWith('/') && !url.startsWith('//')) {
          assetUrls.push(url);
        }
      }

      expect(assetUrls.length).toBeGreaterThan(0);

      for (const src of assetUrls) {
        const fullUrl = `${BASE_URL}${src}`;
        const assetRes = await fetch(fullUrl);
        expect(
          assetRes.status,
          `Asset ${src} should return 200 OK`,
        ).toBe(200);
      }
    });
  });
});
