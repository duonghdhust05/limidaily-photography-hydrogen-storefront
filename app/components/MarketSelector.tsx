import {Link, useLocation, useNavigation} from 'react-router';
import {
  SUPPORTED_LOCALES,
  useSelectedLocale,
  getPathWithoutLocale,
  type Locale,
} from '~/lib/i18n';
import {useRef, useState, useEffect} from 'react';
import {useTranslation} from '~/lib/translations';

export function MarketSelector({className = ''}: {className?: string}) {
  const selectedLocale = useSelectedLocale();
  const {t} = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigation = useNavigation();
  const isTransitioning = navigation.state !== 'idle';

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block text-left ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTransitioning}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t('market_select_aria')}
        className={`inline-flex items-center gap-1.5 rounded-xs border border-border bg-surface px-2.5 py-1.5 text-xs font-display font-semibold text-text-main hover:border-shutter hover:text-shutter active:translate-x-px active:translate-y-px transition-all cursor-pointer tactile-btn shadow-2xs ${
          isTransitioning ? 'opacity-60 cursor-wait pointer-events-none' : ''
        }`}
      >
        <span className="text-sm leading-none" aria-hidden="true">
          {selectedLocale.flag}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wider font-bold">
          {selectedLocale.country}
        </span>
        <span className="text-border" aria-hidden="true">
          ·
        </span>
        <span className="font-mono text-[11px] text-text-muted font-bold">
          {selectedLocale.currencySymbol}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-150 text-text-muted ${
            isOpen ? 'rotate-180 text-shutter' : ''
          }`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xs border border-border bg-surface p-2 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="border-b border-border/80 pb-2 mb-2 px-2 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted">
              {t('market_select_heading')}
            </span>
            <span className="text-[10px] font-mono text-shutter font-bold">
              {SUPPORTED_LOCALES.length} {SUPPORTED_LOCALES.length > 1 ? t('market_markets_plural') : t('market_markets_singular')}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {SUPPORTED_LOCALES.map((locale) => (
              <MarketOptionItem
                key={`market-${locale.language}-${locale.country}`}
                locale={locale}
                isActive={
                  selectedLocale.language === locale.language &&
                  selectedLocale.country === locale.country
                }
                isTransitioning={isTransitioning}
                onSelect={() => setIsOpen(false)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MarketOptionItem({
  locale,
  isActive,
  isTransitioning,
  onSelect,
}: {
  locale: Locale;
  isActive: boolean;
  isTransitioning?: boolean;
  onSelect: () => void;
}) {
  const {t} = useTranslation();
  const {pathname, search} = useLocation();

  // Strip locale prefix from current URL path and calculate the new target path
  const rawPath = getPathWithoutLocale(pathname);
  const targetPrefix = locale.pathPrefix.replace(/\/+$/, '');
  const newPath = `${targetPrefix}${rawPath === '/' ? '' : rawPath}${search}` || '/';

  return (
    <Link
      to={newPath}
      onClick={onSelect}
      prefetch="intent"
      className={`w-full flex items-center justify-between p-2 rounded-2xs border text-left transition-all cursor-pointer ${
        isActive || isTransitioning
          ? 'border-shutter bg-shutter/5 text-text-main shadow-2xs pointer-events-none'
          : 'border-transparent hover:border-border hover:bg-plate/40 text-text-muted hover:text-text-main'
      } ${isTransitioning ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-base leading-none" aria-hidden="true">
          {locale.flag}
        </span>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-display font-bold text-text-main">
              {locale.label}
            </span>
            {locale.isPrimary && (
              <span className="text-[9px] font-mono uppercase bg-shutter-light text-shutter border border-orange-300 px-1 rounded-3xs font-semibold">
                {t('market_primary_badge')}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-text-subtle">
            {locale.language === 'VI' ? 'Tiếng Việt' : 'English'} ·{' '}
            {locale.currency} ({locale.currencySymbol})
          </span>
        </div>
      </div>

      {isActive && (
        <span className="h-2 w-2 rounded-full bg-shutter shrink-0 shadow-xs" />
      )}
    </Link>
  );
}

/**
 * Clean 1-touch mobile quick-switch buttons for drawer integration
 */
export function MobileMarketSwitcher({onSelect}: {onSelect?: () => void}) {
  const selectedLocale = useSelectedLocale();
  const {t} = useTranslation();
  const navigation = useNavigation();
  const isTransitioning = navigation.state !== 'idle';

  return (
    <div className="w-full flex flex-col gap-2 pt-4 border-t border-border/70">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-mono font-bold tracking-widest text-text-muted uppercase">
          {t('market_drawer_heading')}
        </span>
        <span className="text-[10px] font-mono text-shutter uppercase">
          {selectedLocale.marketName}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {SUPPORTED_LOCALES.map((locale) => {
          const isActive =
            selectedLocale.language === locale.language &&
            selectedLocale.country === locale.country;
          return (
            <MobileMarketButton
              key={`mobile-market-${locale.language}-${locale.country}`}
              locale={locale}
              isActive={isActive}
              isTransitioning={isTransitioning}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </div>
  );
}

function MobileMarketButton({
  locale,
  isActive,
  isTransitioning,
  onSelect,
}: {
  locale: Locale;
  isActive: boolean;
  isTransitioning?: boolean;
  onSelect?: () => void;
}) {
  const {pathname, search} = useLocation();
  const rawPath = getPathWithoutLocale(pathname);
  const targetPrefix = locale.pathPrefix.replace(/\/+$/, '');
  const newPath = `${targetPrefix}${rawPath === '/' ? '' : rawPath}${search}` || '/';

  return (
    <Link
      to={newPath}
      onClick={onSelect}
      prefetch="intent"
      className={`w-full flex items-center justify-center gap-2 py-2 px-2.5 rounded-xs border text-xs font-display font-bold transition-all cursor-pointer tactile-btn ${
        isActive || isTransitioning
          ? 'border-shutter bg-shutter-light text-shutter shadow-2xs pointer-events-none'
          : 'border-border bg-surface text-text-main hover:border-shutter hover:text-shutter'
      } ${isTransitioning ? 'opacity-60 cursor-wait' : ''}`}
    >
      <span aria-hidden="true">{locale.flag}</span>
      <span>{locale.label}</span>
      <span className="font-mono text-[10px] opacity-75">
        ({locale.currencySymbol})
      </span>
    </Link>
  );
}
