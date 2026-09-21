import {describe, it, expect} from 'vitest';

describe('Server-level 301 Canonical Alias Redirection', () => {
  function computeCanonicalRedirect(requestUrl: string): { status: number; location: string } | null {
    const url = new URL(requestUrl);
    if (url.pathname === '/vi' || url.pathname.startsWith('/vi/')) {
      const canonicalPath = url.pathname.replace(/^\/vi(\/|$)/, '/') || '/';
      const targetUrl = new URL(
        `${canonicalPath}${url.search}${url.hash}`,
        requestUrl,
      );
      return {
        status: 301,
        location: targetUrl.toString(),
      };
    }
    return null;
  }

  it('should redirect /vi directly to root / with HTTP 301', () => {
    const redirect = computeCanonicalRedirect('http://localhost:3000/vi');
    expect(redirect).not.toBeNull();
    expect(redirect?.status).toBe(301);
    expect(redirect?.location).toBe('http://localhost:3000/');
  });

  it('should redirect /vi/ to root / with HTTP 301', () => {
    const redirect = computeCanonicalRedirect('http://localhost:3000/vi/');
    expect(redirect).not.toBeNull();
    expect(redirect?.status).toBe(301);
    expect(redirect?.location).toBe('http://localhost:3000/');
  });

  it('should redirect /vi/products/godox-v1 to /products/godox-v1', () => {
    const redirect = computeCanonicalRedirect('http://localhost:3000/vi/products/godox-v1');
    expect(redirect).not.toBeNull();
    expect(redirect?.status).toBe(301);
    expect(redirect?.location).toBe('http://localhost:3000/products/godox-v1');
  });

  it('should preserve search parameters during 301 redirect', () => {
    const redirect = computeCanonicalRedirect('http://localhost:3000/vi/search?q=sony+fx3#results');
    expect(redirect).not.toBeNull();
    expect(redirect?.status).toBe(301);
    expect(redirect?.location).toBe('http://localhost:3000/search?q=sony+fx3#results');
  });

  it('should redirect /vi/order/confirmation to /order/confirmation', () => {
    const redirect = computeCanonicalRedirect('http://localhost:3000/vi/order/confirmation?order_number=1084');
    expect(redirect).not.toBeNull();
    expect(redirect?.status).toBe(301);
    expect(redirect?.location).toBe('http://localhost:3000/order/confirmation?order_number=1084');
  });

  it('should not redirect non-alias paths (such as /en or canonical /)', () => {
    expect(computeCanonicalRedirect('http://localhost:3000/')).toBeNull();
    expect(computeCanonicalRedirect('http://localhost:3000/en')).toBeNull();
    expect(computeCanonicalRedirect('http://localhost:3000/en/products')).toBeNull();
    expect(computeCanonicalRedirect('http://localhost:3000/collections/all')).toBeNull();
    expect(computeCanonicalRedirect('http://localhost:3000/order/confirmation')).toBeNull();
    expect(computeCanonicalRedirect('http://localhost:3000/en/order/confirmation')).toBeNull();
  });
});
