import {Await, useLocation} from 'react-router';
import {Link} from '~/components/Link';
import {Suspense, useId} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
  SidebarQuery,
} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {NavSidebar} from '~/components/NavSidebar';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {SearchFormPredictive} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';

import featureCollectionBg from '~/assets/feature-collection.webp';
import {getPathWithoutLocale} from '~/lib/i18n';
import {useTranslation} from '~/lib/translations';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  sidebar?: Promise<SidebarQuery | null>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  sidebar,
  publicStoreDomain,
}: PageLayoutProps) {
  const location = useLocation();
  const rawPath = getPathWithoutLocale(location.pathname);
  const isHomepage = rawPath === '/' || rawPath === '';

  return (
    <Aside.Provider>
      <NavSidebar cart={cart} isLoggedIn={isLoggedIn} sidebar={sidebar} />
      <CartAside cart={cart} />
      <SearchAside />
      <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} />
      {header && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
      )}
      {isHomepage ? (
        <main
          id="homepage-scroll-container"
          className="md:h-[calc(100dvh-4rem)] md:overflow-y-auto md:snap-y md:snap-mandatory md:scroll-smooth"
        >
          {children}
          <div
            id="stage-footer"
            className="md:snap-start md:snap-always md:min-h-[calc(100dvh-4rem)] flex flex-col justify-end bg-surface"
          >
            <Footer
              footer={footer}
              header={header}
              publicStoreDomain={publicStoreDomain}
            />
          </div>
        </main>
      ) : (
        <div className="non-home-page-container relative min-h-[calc(100dvh-4rem)] bg-canvas">
          {/* Feature Collection Background Image Layer for all non-home pages */}
          <div
            className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden"
            aria-hidden="true"
          >
            <img
              src={featureCollectionBg}
              alt=""
              className="w-full h-full object-cover object-center opacity-95 scale-105 transition-transform duration-1000"
              loading="eager"
            />
            {/* Studio Vignette & Contrast Overlays */}
            <div className="absolute inset-0 bg-linear-to-t from-canvas via-canvas/70 to-canvas/40" />
            <div className="absolute inset-0 bg-radial from-transparent via-canvas/90 to-canvas/85" />
          </div>

          <div className="relative z-10 flex min-h-[calc(100dvh-4rem)] flex-col justify-between">
            <div>{children}</div>
            <Footer
              footer={footer}
              header={header}
              publicStoreDomain={publicStoreDomain}
            />
          </div>
        </div>
      )}
    </Aside.Provider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  const {t} = useTranslation();
  return (
    <Aside type="cart" heading={t('nav_cart')}>
      <Suspense fallback={<p>{t('cart_loading')}</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  const queriesDatalistId = useId();
  const {t} = useTranslation();

  return (
    <Aside type="search" heading={t('nav_search')}>
      <div className="predictive-search p-4">
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <input
                  name="q"
                  onChange={fetchResults}
                  onFocus={fetchResults}
                  placeholder={t('nav_search_placeholder')}
                  ref={inputRef}
                  type="search"
                  list={queriesDatalistId}
                  className="w-full rounded-xs border border-border bg-canvas px-3 py-2 text-xs font-body text-text-main placeholder-text-subtle focus:border-shutter focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={goToSearch}
                className="rounded-xs bg-shutter border border-shutter-hover px-4 py-2 text-xs font-display font-bold uppercase tracking-wider text-white hover:bg-shutter-hover active:translate-x-px active:translate-y-px transition-all cursor-pointer tactile-btn shrink-0"
              >
                {t('search_cta')}
              </button>
            </div>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;

            if (state === 'loading' && term.current) {
              return (
                <div className="py-8 text-center text-xs font-display text-text-muted">
                  {t('search_scanning')}
                </div>
              );
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <div className="flex flex-col gap-4">
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <div className="pt-2 border-t border-border">
                    <Link
                      onClick={closeSearch}
                      to={`/search?q=${term.current}`}
                      className="block text-center rounded-xs border border-border bg-plate/40 hover:bg-surface px-4 py-2.5 text-xs font-display font-bold text-text-main hover:text-shutter transition-colors uppercase tracking-wider"
                    >
                      {t('search_view_all')} &ldquo;{term.current}&rdquo; &rarr;
                    </Link>
                  </div>
                ) : null}
              </div>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

function MobileMenuAside({
  header,
  publicStoreDomain,
}: {
  header: PageLayoutProps['header'];
  publicStoreDomain: PageLayoutProps['publicStoreDomain'];
}) {
  const {t} = useTranslation();
  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading={t('nav_menu')}>
        <HeaderMenu
          menu={header.menu}
          viewport="mobile"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
      </Aside>
    )
  );
}
