import {Suspense, useState} from 'react';
import {Await} from 'react-router';
import {Link, NavLink} from '~/components/Link';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {MarketSelector} from '~/components/MarketSelector';
import {useTranslation} from '~/lib/translations';
import {normalizeMenuUrl, getLocalizedMenuTitle} from '~/lib/navigation';
import type {TranslationKey} from '~/locales/schema';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const {t} = useTranslation();

  return (
    <footer className="border-t border-border bg-surface text-text-muted pt-16 pb-12 px-4 md:px-8 mt-20">
      <div className="mx-auto max-w-7xl">
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Column 1: Brand & Slogan */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-shutter shadow-[1px_1px_0px_#C2410C]" />
              <span className="font-display font-bold text-base tracking-wider text-text-main uppercase">
                {header.shop.name}
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed font-body">
              {t('footer_slogan')}
            </p>
            <div className="pt-2 text-[11px] font-display text-text-subtle">
              {t('footer_showroom_specs')}
            </div>
          </div>

          {/* Column 2: Equipment Collections */}
          <div>
            <h4 className="text-xs font-display font-semibold uppercase tracking-widest text-text-main mb-4">
              {t('footer_catalog_heading')}
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs font-display">
              <li>
                <Link
                  to="/collections/cameras-optics"
                  className="hover:text-shutter transition-colors"
                >
                  {t('cat_optics')}
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/lighting-audio"
                  className="hover:text-shutter transition-colors"
                >
                  {t('cat_lighting')}
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/rigging-accessories"
                  className="hover:text-shutter transition-colors"
                >
                  {t('cat_rigging')}
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/all"
                  className="hover:text-shutter transition-colors"
                >
                  {t('nav_all_hardware')}
                </Link>
              </li>
              <li>
                <Link
                  to="/blogs"
                  className="hover:text-shutter transition-colors"
                >
                  {t('nav_journal')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Policies & Warranties */}
          <div>
            <h4 className="text-xs font-display font-semibold uppercase tracking-widest text-text-main mb-4">
              {t('footer_compliance_heading')}
            </h4>
            <Suspense fallback={<div className="text-xs">{t('pagination_loading')}</div>}>
              <Await resolve={footerPromise}>
                {(footer) => (
                  <FooterMenu
                    menu={footer?.menu}
                    primaryDomainUrl={header.shop.primaryDomain?.url}
                    publicStoreDomain={publicStoreDomain}
                  />
                )}
              </Await>
            </Suspense>
          </div>

          {/* Column 4: Hardware Journal */}
          <div>
            <h4 className="text-xs font-display font-semibold uppercase tracking-widest text-text-main mb-4">
              {t('nav_journal')}
            </h4>
            <p className="text-xs text-text-muted mb-3 font-body">
              {t('footer_newsletter_desc')}
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-display text-text-subtle">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div>
              &copy; {currentYear} {header.shop.name}. {t('footer_rights')}
            </div>
  
          </div>
          <div className="flex items-center gap-4">
            <span>{t('footer_tech_stack_hydrogen')}</span>
            <span>&bull;</span>
            <span>{t('footer_tech_stack_shopify')}</span>
            <span>&bull;</span>
            <span className="text-signal-green font-medium">{t('footer_system_operational')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: FooterQuery['menu'] | null | undefined;
  primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
  publicStoreDomain: string;
}) {
  const {t} = useTranslation();
  const items = menu?.items?.length ? menu.items : getFallbackFooterMenu(t).items;

  return (
    <nav className="flex flex-col gap-2.5 text-xs font-display" role="navigation">
      {items.map((item) => {
        if (!item.url) return null;
        const {url, isExternal} = normalizeMenuUrl(item.url, {
          publicStoreDomain,
          primaryDomainUrl,
        });

        const displayTitle = getLocalizedMenuTitle(item.title, t);

        return isExternal ? (
          <a
            href={url}
            key={item.id}
            rel="noopener noreferrer"
            target="_blank"
            className="block text-text-muted hover:text-shutter transition-colors"
          >
            {displayTitle}
          </a>
        ) : (
          <NavLink
            end
            key={item.id}
            prefetch="intent"
            to={url}
            className={({isActive}) =>
              `block transition-colors ${
                isActive ? 'text-shutter font-semibold' : 'text-text-muted hover:text-shutter'
              }`
            }
          >
            {displayTitle}
          </NavLink>
        );
      })}
    </nav>
  );
}

function getFallbackFooterMenu(t: (key: TranslationKey) => string) {
  return {
    id: 'gid://shopify/Menu/199655620664',
    items: [
      {
        id: 'gid://shopify/MenuItem/461609664568',
        resourceId: null,
        tags: [],
        title: t('footer_privacy'),
        type: 'HTTP',
        url: '/policies/privacy-policy',
        items: [],
      },
      {
        id: 'gid://shopify/MenuItem/461609697336',
        resourceId: null,
        tags: [],
        title: t('footer_refund'),
        type: 'HTTP',
        url: '/policies/refund-policy',
        items: [],
      },
      {
        id: 'gid://shopify/MenuItem/461609730104',
        resourceId: null,
        tags: [],
        title: t('footer_shipping'),
        type: 'HTTP',
        url: '/policies/shipping-policy',
        items: [],
      },
      {
        id: 'gid://shopify/MenuItem/461609762872',
        resourceId: null,
        tags: [],
        title: t('footer_terms'),
        type: 'HTTP',
        url: '/policies/terms-of-service',
        items: [],
      },
    ],
  };
}

function NewsletterForm() {
  const {t} = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    // Rate Limiting: Max 3 signups per 10 minutes
    const now = Date.now();
    const storageKey = 'limi_newsletter_history';
    let history: number[] = [];
    try {
      const stored = typeof window !== 'undefined' ? window.sessionStorage.getItem(storageKey) : null;
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          history = parsed.filter((ts): ts is number => typeof ts === 'number' && now - ts < 600_000);
        }
      }
    } catch {
      history = [];
    }

    if (history.length >= 3) {
      setRateLimitError(t('newsletter_rate_limited'));
      return;
    }

    setIsSubmitting(true);
    setRateLimitError(null);

    try {
      history.push(now);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(storageKey, JSON.stringify(history));
      }
    } catch {
      // storage quota or disabled
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      setEmail('');
    }, 500);
  };

  if (isSubscribed) {
    return (
      <div className="rounded-xs border border-signal-green/40 bg-signal-green/10 p-3 text-xs">
        <div className="flex items-center gap-1.5 font-display font-bold text-signal-green text-[10px] uppercase tracking-wider mb-1">
          <span className="h-1.5 w-1.5 rounded-full bg-signal-green animate-pulse" />
          [{t('footer_newsletter_connected')}]
        </div>
        <p className="text-[11px] text-text-main font-body leading-relaxed">
          {t('footer_newsletter_success')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (rateLimitError) setRateLimitError(null);
          }}
          placeholder={t('footer_newsletter_placeholder')}
          disabled={isSubmitting}
          className="w-full rounded-xs border border-border bg-canvas px-3 py-2 text-xs font-body text-text-main placeholder:text-text-subtle focus:border-shutter focus:outline-none transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xs bg-shutter border border-shutter-hover px-4 py-2 text-xs font-display font-bold text-white hover:bg-shutter-hover transition-colors shrink-0 cursor-pointer tactile-btn disabled:opacity-50"
        >
          {isSubmitting ? t('footer_newsletter_transmitting') : t('footer_newsletter_cta')}
        </button>
      </form>
      {rateLimitError && (
        <p className="text-[10px] font-display text-red-400 font-semibold tracking-wide">
          {rateLimitError}
        </p>
      )}
    </div>
  );
}
