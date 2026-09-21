import {useSelectedLocale} from '~/lib/i18n';
import {vi} from '~/locales/vi';
import {en} from '~/locales/en';
import type {TranslationSchema, TranslationKey} from '~/locales/schema';

export * from '~/locales/schema';

/**
 * Strategy Registry mapping Storefront language codes to modular dictionaries.
 * Fully extensible for N languages (e.g. JA: ja, FR: fr).
 */
export const TRANSLATION_STRATEGIES: Record<string, TranslationSchema> = {
  VI: vi,
  EN: en,
};

/**
 * Strategy selector for UI translations
 */
export function getTranslationDictionary(language: string): TranslationSchema {
  const upperLang = (language || 'VI').toUpperCase();
  return TRANSLATION_STRATEGIES[upperLang] ?? TRANSLATION_STRATEGIES.EN ?? vi;
}

/**
 * Hook to retrieve UI translation strings based on the active market locale.
 * Components use `const { t } = useTranslation();` with zero if-else checks!
 */
export function useTranslation() {
  const locale = useSelectedLocale();
  const dict = getTranslationDictionary(locale.language);

  return {
    t: (key: TranslationKey): string => {
      return dict[key] ?? en[key] ?? key;
    },
    locale,
    isVietnamese: locale.language === 'VI',
  };
}
