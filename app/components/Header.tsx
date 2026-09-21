import {Suspense} from 'react';
import {Await, useAsyncValue} from 'react-router';
import {Link, NavLink} from '~/components/Link';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {MarketSelector} from '~/components/MarketSelector';
import {useTranslation} from '~/lib/translations';
import {normalizeMenuUrl, getLocalizedMenuTitle} from '~/lib/navigation';
import type {TranslationKey} from '~/locales/schema';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-surface px-4 md:px-8 shadow-xs">
        <NavLink  
          prefetch="intent"
          to="/"
          className="flex items-center gap-2 group shrink-0 z-10"
          end
        >
          <span
            className="h-2.5 w-2.5 rounded-xs bg-shutter shadow-[1px_1px_0px_#C2410C]"
            aria-hidden="true"
          />
          <span className="font-display font-bold text-sm sm:text-base md:text-lg tracking-wider text-text-main group-hover:text-shutter transition-colors uppercase">
            {shop.name}
          </span>
        </NavLink>


      {/* Desktop Navigation Links (Centered) */}
      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />

      {/* Right Controls (Search, Account, Cart) */}
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const {close} = useAside();
  const {t} = useTranslation();
  const isMobile = viewport === 'mobile';

  return (
    <nav
      className={
        isMobile
          ? 'flex flex-col gap-4 p-6'
          : 'hidden lg:flex items-center gap-6 xl:gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
      }
      role="navigation"
    >
      {isMobile && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          to="/"
          className={({isActive}) =>
            `text-sm font-display tracking-wider uppercase transition-colors ${
              isActive ? 'text-shutter font-bold' : 'text-text-muted hover:text-text-main'
            }`
          }
        >
          {t('nav_home')}
        </NavLink>
      )}
      {(menu?.items?.length ? menu.items : getFallbackHeaderMenu(t).items).map((item) => {
        if (!item.url) return null;

        const {url, isExternal} = normalizeMenuUrl(item.url, {
          publicStoreDomain,
          primaryDomainUrl,
        });

        const displayTitle = getLocalizedMenuTitle(item.title, t);

        if (isExternal) {
          return (
            <a
              href={url}
              key={item.id}
              rel="noopener noreferrer"
              target="_blank"
              className="text-xs font-display tracking-wider uppercase transition-colors text-text-muted hover:text-text-main"
            >
              {displayTitle}
            </a>
          );
        }

        return (
          <NavLink
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            to={url}
            className={({isActive}) =>
              `text-xs font-display tracking-wider uppercase transition-colors ${
                isActive
                  ? 'text-shutter font-bold'
                  : 'text-text-muted hover:text-text-main'
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

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  const {t} = useTranslation();

  return (
    <nav className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0 z-10 ml-auto" role="navigation">
      {/* Desktop Market Selector Popover */}
      <div className="hidden sm:block">
        <MarketSelector />
      </div>

      <SearchToggle />
      <NavLink
        prefetch="intent"
        to="/account"
        className={({isActive}) =>
          `hidden sm:block text-xs font-display tracking-wider uppercase transition-colors ${
            isActive ? 'text-shutter font-bold' : 'text-text-muted hover:text-text-main'
          }`
        }
      >
        <Suspense fallback={t('nav_signin')}>
          <Await resolve={isLoggedIn} errorElement={t('nav_signin')}>
            {(isLoggedIn) => (isLoggedIn ? t('nav_account') : t('nav_signin'))}
          </Await>
        </Suspense>
      </NavLink>
      <CartToggle cart={cart} />
      <SidebarToggle />
    </nav>
  );
}

function SidebarToggle() {
  const {type, toggle} = useAside();
  const {t} = useTranslation();
  const isOpen = type === 'navigation';
  return (
    <button
      type="button"
      className={`flex items-center gap-1.5 rounded-xs border px-2.5 sm:px-3 py-1.5 text-xs font-display transition-all tactile-btn cursor-pointer ${
        isOpen
          ? 'border-shutter bg-shutter-light text-shutter font-semibold shadow-xs'
          : 'border-border bg-plate/60 text-text-muted hover:text-text-main hover:border-shutter hover:bg-surface'
      }`}
      onClick={() => toggle('navigation')}
      aria-label={isOpen ? 'Close hardware navigation sidebar' : 'Open hardware navigation sidebar'}
      aria-expanded={isOpen}
    >
      {isOpen ? (
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ) : (
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      )}
      <span className="hidden sm:inline lg:hidden xl:inline">{isOpen ? t('nav_close') : t('nav_menu')}</span>
    </button>
  );
}

function SearchToggle() {
  const {type, toggle} = useAside();
  const {t} = useTranslation();
  const isOpen = type === 'search';
  return (
    <button
      type="button"
      className={`flex items-center gap-1.5 rounded-xs border px-3 py-1.5 text-xs font-display transition-all tactile-btn cursor-pointer ${
        isOpen
          ? 'border-shutter bg-shutter-light text-shutter font-semibold shadow-xs'
          : 'border-border bg-plate/60 text-text-muted hover:text-text-main hover:border-border-strong hover:bg-surface'
      }`}
      onClick={() => toggle('search')}
      aria-label={isOpen ? 'Close search console' : 'Search hardware catalog'}
      aria-expanded={isOpen}
    >
      {isOpen ? (
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ) : (
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      )}
      <span className="hidden sm:inline lg:hidden xl:inline">{isOpen ? t('nav_close') : t('nav_search')}</span>
    </button>
  );
}

function CartBadge({count}: {count: number}) {
  const {type, toggle} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  const {t} = useTranslation();
  const isOpen = type === 'cart';

  return (
    <button
      type="button"
      className={`flex items-center gap-2 rounded-xs border px-3 py-1.5 text-xs font-display transition-all cursor-pointer tactile-btn ${
        isOpen
          ? 'border-shutter bg-shutter-light text-shutter font-semibold shadow-xs'
          : 'border-border bg-plate/60 text-text-main hover:border-shutter'
      }`}
      onClick={(e) => {
        e.preventDefault();
        toggle('cart');
        if (!isOpen) {
          publish('cart_viewed', {
            cart,
            prevCart,
            shop,
            url: window.location.href || '',
          } as CartViewPayload);
        }
      }}
      aria-label={isOpen ? 'Close cart drawer' : `Open hardware cart with ${count} items`}
      aria-expanded={isOpen}
    >
      {isOpen ? (
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ) : (
        <svg
          className="w-3.5 h-3.5 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      )}
      <span className="hidden sm:inline lg:hidden xl:inline">{isOpen ? t('nav_close') : t('nav_cart')}</span>
      <span className="flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-xs bg-shutter text-[10px] font-bold text-white shadow-[1px_1px_0px_#C2410C]">
        {count}
      </span>
    </button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

function getFallbackHeaderMenu(t: (key: TranslationKey) => string) {
  return {
    id: 'gid://shopify/Menu/199655587896',
    items: [
      {
        id: 'gid://shopify/MenuItem/461609500728',
        resourceId: null,
        tags: [],
        title: t('cat_optics'),
        type: 'HTTP',
        url: '/collections/cameras-optics',
        items: [],
      },
      {
        id: 'gid://shopify/MenuItem/461609533496',
        resourceId: null,
        tags: [],
        title: t('cat_lighting'),
        type: 'HTTP',
        url: '/collections/lighting-audio',
        items: [],
      },
      {
        id: 'gid://shopify/MenuItem/461609566264',
        resourceId: null,
        tags: [],
        title: t('cat_rigging'),
        type: 'HTTP',
        url: '/collections/rigging-accessories',
        items: [],
      },
      {
        id: 'gid://shopify/MenuItem/461609599032',
        resourceId: null,
        tags: [],
        title: t('nav_all_hardware'),
        type: 'HTTP',
        url: '/collections/all',
        items: [],
      },
      {
        id: 'gid://shopify/MenuItem/461609631800',
        resourceId: null,
        tags: [],
        title: t('nav_journal'),
        type: 'HTTP',
        url: '/blogs/news',
        items: [],
      },
    ],
  };
}
