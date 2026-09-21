import {getPathWithoutLocale} from '~/lib/i18n';
import type {TranslationKey} from '~/locales/schema';

/**
 * Centralized Navigation Utilities
 * Normalizes menu URLs and handles routing contracts across Header, Footer, and Navbars.
 */

export interface NormalizedMenuUrl {
  url: string;
  isExternal: boolean;
}

/**
 * Normalizes navigation URLs received from Shopify Storefront API menus or raw inputs.
 * 
 * Behavior:
 * 1. Strips Shopify internal domains (myshopify.com, publicStoreDomain, primaryDomainUrl)
 *    so internal links use client-side routing without triggering full browser reloads.
 * 2. Strips market prefixes/aliases (/vi, /en) to obtain canonical relative routes,
 *    allowing Link/NavLink to cleanly format localized URLs without duplication.
 * 3. Identifies external URLs (e.g. social channels, external partner sites).
 * 4. Preserves search parameters and hash fragments.
 */
export function normalizeMenuUrl(
  rawUrl: string | null | undefined,
  options?: {
    publicStoreDomain?: string;
    primaryDomainUrl?: string;
  },
): NormalizedMenuUrl {
  if (!rawUrl) {
    return {url: '/', isExternal: false};
  }

  const {publicStoreDomain, primaryDomainUrl} = options || {};

  // Check if URL belongs to one of our store domains
  const isStoreDomain =
    rawUrl.includes('myshopify.com') ||
    rawUrl.includes('myshopify.dev') ||
    rawUrl.includes('tryhydrogen.dev') ||
    Boolean(publicStoreDomain && rawUrl.includes(publicStoreDomain)) ||
    Boolean(primaryDomainUrl && rawUrl.includes(primaryDomainUrl));

  if (isStoreDomain) {
    try {
      const parsed = new URL(rawUrl);
      const cleanPath = getPathWithoutLocale(parsed.pathname);
      return {
        url: `${cleanPath}${parsed.search}${parsed.hash}`,
        isExternal: false,
      };
    } catch {
      const cleanPath = getPathWithoutLocale(rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`);
      return {
        url: cleanPath,
        isExternal: false,
      };
    }
  }

  // Already a relative path
  if (rawUrl.startsWith('/')) {
    const [pathAndSearch, hash] = rawUrl.split('#');
    const [path, search] = pathAndSearch.split('?');
    const cleanPath = getPathWithoutLocale(path);
    let finalUrl = cleanPath;
    if (search !== undefined) finalUrl += `?${search}`;
    if (hash !== undefined) finalUrl += `#${hash}`;
    return {
      url: finalUrl,
      isExternal: false,
    };
  }

  // External web address
  if (/^https?:\/\//i.test(rawUrl)) {
    return {
      url: rawUrl,
      isExternal: true,
    };
  }

  // Other relative references
  return {
    url: getPathWithoutLocale(`/${rawUrl}`),
    isExternal: false,
  };
}

/**
 * Maps known standard menu item titles to dynamic localization keys.
 * This guarantees that fallback menus and mock/English storefront menus
 * render cleanly in Vietnamese or English according to the active locale,
 * while leaving custom merchant menu titles untouched.
 */
export function getLocalizedMenuTitle(
  rawTitle: string | null | undefined,
  t: (key: TranslationKey) => string,
): string {
  if (!rawTitle) return '';
  const trimmed = rawTitle.trim().toLowerCase();

  switch (trimmed) {
    case 'cameras & optics':
    case 'cameras and optics':
    case 'cameras':
    case 'optics':
      return t('cat_optics');
    case 'lighting & audio':
    case 'lighting and audio':
    case 'lighting':
    case 'audio':
      return t('cat_lighting');
    case 'rigging & accessories':
    case 'rigging and accessories':
    case 'rigging':
    case 'accessories':
      return t('cat_rigging');
    case 'all hardware':
    case 'hardware':
    case 'catalog':
    case 'all products':
      return t('nav_all_hardware');
    case 'journal':
    case 'news':
    case 'blogs':
    case 'blog':
      return t('nav_journal');
    case 'privacy policy':
      return t('footer_privacy');
    case 'refund policy':
    case 'return policy':
      return t('footer_refund');
    case 'shipping policy':
    case 'delivery policy':
      return t('footer_shipping');
    case 'terms of service':
    case 'terms of use':
    case 'terms & conditions':
      return t('footer_terms');
    case 'home':
      return t('nav_home');
    default:
      return rawTitle;
  }
}

