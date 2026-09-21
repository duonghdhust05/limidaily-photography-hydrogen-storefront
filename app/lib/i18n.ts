import { useMatches, useLocation } from 'react-router';
import type {
  CountryCode as StorefrontCountryCode,
  LanguageCode as StorefrontLanguageCode,
} from '@shopify/hydrogen/storefront-api-types';

export type Locale = {
  language: StorefrontLanguageCode;
  country: StorefrontCountryCode;
  label: string;
  marketName: string;
  currency: string;
  currencySymbol: string;
  pathPrefix: string;
  flag: string;
  isPrimary?: boolean;
  aliases?: string[];
};

export const DEFAULT_LOCALE: Locale = {
  language: 'VI',
  country: 'VN',
  label: 'Việt Nam',
  marketName: 'Primary Market',
  currency: 'VND',
  currencySymbol: '₫',
  pathPrefix: '',
  aliases: ['/vi'],
  flag: '🇻🇳',
  isPrimary: true,
};

export const INTERNATIONAL_LOCALE: Locale = {
  language: 'EN',
  country: 'US',
  label: 'International',
  marketName: 'Global Market',
  currency: 'USD',
  currencySymbol: '$',
  pathPrefix: '/en',
  flag: '🌐',
  isPrimary: false,
};

/**
 * SSOT List of all supported markets & locales in the platform.
 * Adding a new market here automatically provisions routing, Storefront API @inContext,
 * MarketSelector switches, and localized links.
 */
export const SUPPORTED_LOCALES: Locale[] = [
  DEFAULT_LOCALE,
  INTERNATIONAL_LOCALE,
];

/**
 * Resolves the matching Locale from any raw or normalized pathname string.
 * Supports N markets dynamically based on SUPPORTED_LOCALES registry and market aliases (e.g. /vi).
 */
export function getLocaleFromPathname(pathname: string): Locale {
  const cleanPath = (pathname || '').toLowerCase().replace(/\.data$/, '').split('?')[0];

  for (const locale of SUPPORTED_LOCALES) {
    const prefixesToCheck = [
      ...(locale.pathPrefix ? [locale.pathPrefix] : []),
      ...(locale.aliases || []),
    ];

    for (const rawPrefix of prefixesToCheck) {
      if (!rawPrefix) continue;
      const prefix = rawPrefix.toLowerCase().replace(/\/+/g, '/');
      const cleanPrefix = prefix.startsWith('/') ? prefix : `/${prefix}`;
      if (cleanPath === cleanPrefix || cleanPath.startsWith(`${cleanPrefix}/`)) {
        return locale;
      }
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Extracts the active market locale from incoming request URL.
 * Handles document requests and React Router v7 Single Fetch (.data) requests.
 */
export function getLocaleFromRequest(request: Request): Locale {
  try {
    const url = new URL(request.url);
    return getLocaleFromPathname(url.pathname);
  } catch {
    return DEFAULT_LOCALE;
  }
}

export interface RootLoaderDataWithLocale {
  selectedLocale?: Locale;
}

/**
 * Hook to retrieve the currently active locale.
 * Prioritizes the active URL pathname for instantaneous 0ms synchronization,
 * falling back to Root loader data if available.
 */
export function useSelectedLocale(): Locale {
  const location = useLocation();
  const matches = useMatches();
  const pathname = location?.pathname ?? '';

  if (pathname) {
    return getLocaleFromPathname(pathname);
  }

  const root = matches?.[0];
  const data = (root?.loaderData ?? {}) as RootLoaderDataWithLocale;
  return data.selectedLocale ?? DEFAULT_LOCALE;
}

/**
 * Strips locale prefix or market alias (e.g. /en, /vi) from a pathname to yield the raw root-relative path.
 * Robust & Idempotent: Normalizes consecutive slashes (e.g. //en -> /en)
 * and strips any stacked locale prefixes.
 */
export function getPathWithoutLocale(pathname: string): string {
  if (!pathname) return '/';

  const [pathAndSearch, hash] = pathname.split('#');
  const [rawPath, search] = pathAndSearch.split('?');

  let cleanPath = (rawPath || '')
    .replace(/\/+/g, '/')
    .replace(/\.data$/, '');

  let stripped = true;
  while (stripped) {
    stripped = false;
    const normalized = cleanPath.toLowerCase();

    for (const locale of SUPPORTED_LOCALES) {
      const prefixesToCheck = [
        ...(locale.pathPrefix ? [locale.pathPrefix] : []),
        ...(locale.aliases || []),
      ];

      for (const rawPfx of prefixesToCheck) {
        if (!rawPfx) continue;
        const prefix = rawPfx.toLowerCase().replace(/\/+/g, '/');
        const cleanPrefix = prefix.startsWith('/') ? prefix : `/${prefix}`;
        if (normalized === cleanPrefix) {
          cleanPath = '/';
          stripped = false;
          break;
        }
        if (normalized.startsWith(`${cleanPrefix}/`)) {
          cleanPath = cleanPath.slice(cleanPrefix.length);
          cleanPath = cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;
          stripped = true;
          break;
        }
      }
      if (stripped) break;
    }
  }

  let result = cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;
  if (search !== undefined) result += `?${search}`;
  if (hash !== undefined) result += `#${hash}`;

  return result;
}

/**
 * Transforms any relative path to include the appropriate market prefix.
 * Robust & Idempotent: Preserves query parameters and hash fragments while
 * guaranteeing no duplicate locale prefixes (e.g. /en/en/...).
 */
export function useLocalizedPath(
  to: string,
  targetLocale?: Locale,
  preservePath = false,
): string {
  const currentLocale = useSelectedLocale();
  const { pathname } = useLocation();

  if (
    !to ||
    to.startsWith('http://') ||
    to.startsWith('https://') ||
    to.startsWith('#') ||
    to.startsWith('mailto:')
  ) {
    return to;
  }

  const activeLocale = targetLocale ?? currentLocale;
  const [pathAndSearch, hash] = to.split('#');
  const [rawPath, search] = pathAndSearch.split('?');

  const basePath = preservePath
    ? getPathWithoutLocale(pathname)
    : getPathWithoutLocale(rawPath);
  const prefix = activeLocale.pathPrefix.replace(/\/+$/, '');

  let localized = prefix
    ? `${prefix}${basePath === '/' ? '' : basePath}`
    : basePath;

  if (!localized) localized = '/';
  if (search !== undefined) localized += `?${search}`;
  if (hash !== undefined) localized += `#${hash}`;

  return localized;
}
