import { Suspense } from 'react';
import { Await } from 'react-router';
import { NavLink } from '~/components/Link';
import type { CartApiQueryFragment, SidebarQuery } from 'storefrontapi.generated';
import { Aside, useAside } from '~/components/Aside';
import { MobileMarketSwitcher } from '~/components/MarketSelector';
import { useTranslation } from '~/lib/translations';

interface NavSidebarProps {
  cart?: Promise<CartApiQueryFragment | null>;
  isLoggedIn?: Promise<boolean>;
  sidebar?: Promise<SidebarQuery | null>;
}

export function NavSidebar({ cart, isLoggedIn, sidebar }: NavSidebarProps) {
  const { open, close } = useAside();
  const { t } = useTranslation();

  return (
    <Aside type="navigation" heading={t('nav_menu')} position="right">
      <div className="flex flex-col gap-6 py-2 pb-16 text-text-main">
        {/* Quick Search Trigger Bar */}
        <div className="px-1">
          <button
            type="button"
            onClick={() => open('search')}
            className="flex w-full items-center justify-between rounded-xs border border-border bg-plate/60 px-3 py-2 text-xs font-display text-text-muted hover:border-shutter hover:text-text-main hover:bg-surface transition-all cursor-pointer tactile-btn"
            aria-label="Search hardware catalog"
          >
            <span className="flex items-center gap-2">
              <svg
                className="w-3.5 h-3.5 text-shutter"
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
              <span>{t('nav_search_placeholder')}</span>
            </span>
            <kbd className="hidden sm:inline-block rounded-xs bg-surface px-1.5 py-0.5 text-[10px] font-mono border border-border text-text-subtle">
              {t('nav_quick_find')}
            </kbd>
          </button>
        </div>

        {/* Section 1: Hardware Collections */}
        <section aria-labelledby="sidebar-collections-heading" className="flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-border/80 pb-1.5 px-1">
            <h4
              id="sidebar-collections-heading"
              className="text-[11px] font-display font-bold tracking-wider text-text-subtle uppercase"
            >
              {t('nav_collections')}
            </h4>
            <span className="text-[10px] font-mono text-shutter uppercase">
              {t('nav_disciplines_count')}
            </span>
          </div>

          <Suspense fallback={<SidebarCollectionsSkeleton />}>
            <Await resolve={sidebar}>
              {(data) => {
                const collections = data?.collections?.nodes || [];
                return (
                  <nav aria-label="Collections Navigation" className="flex flex-col gap-1">
                    {collections.map((collection) => {
                      const itemCount = collection.products?.nodes?.length ?? 0;
                      return (
                        <NavLink
                          key={collection.id}
                          to={`/collections/${collection.handle}`}
                          prefetch="intent"
                          onClick={close}
                          className={({ isActive }) =>
                            `group flex items-center justify-between rounded-xs border p-2.5 transition-all tactile-btn ${isActive
                              ? 'border-shutter bg-shutter-light text-shutter font-semibold shadow-xs'
                              : 'border-border/60 bg-surface hover:border-border-strong hover:bg-plate/40 text-text-main'
                            }`
                          }
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            {collection.image?.url ? (
                              <span className="flex h-7 w-7 overflow-hidden rounded-xs bg-plate border border-border/50 shrink-0 items-center justify-center">
                                <img
                                  src={collection.image.url}
                                  alt={collection.image.altText || collection.title}
                                  className="h-full w-full object-cover"
                                />
                              </span>
                            ) : (
                              <span className="flex h-7 w-7 items-center justify-center rounded-xs bg-plate text-text-muted group-hover:text-shutter group-hover:bg-white transition-colors shrink-0">
                                <CollectionIcon handle={collection.handle} />
                              </span>
                            )}
                            <div className="min-w-0">
                              <div className="text-xs font-display font-medium tracking-wide uppercase truncate">
                                {collection.title}
                              </div>
                              {collection.description && (
                                <div className="text-[11px] text-text-muted line-clamp-1">
                                  {collection.description}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="rounded-xs bg-plate px-1.5 py-0.5 text-[10px] font-mono text-text-subtle group-hover:text-text-main shrink-0">
                            {itemCount} {t('sidebar_items_unit')}
                          </span>
                        </NavLink>
                      );
                    })}

                    <NavLink
                      to="/collections/all"
                      prefetch="intent"
                      onClick={close}
                      className={({ isActive }) =>
                        `group flex items-center justify-between rounded-xs border border-dashed p-2 transition-all tactile-btn mt-1 ${isActive
                          ? 'border-shutter bg-shutter-light text-shutter font-semibold'
                          : 'border-border hover:border-shutter hover:bg-plate/30 text-text-main'
                        }`
                      }
                    >
                      <span className="text-xs font-display tracking-wider uppercase pl-1 text-text-muted group-hover:text-shutter font-medium">
                        &rarr; {t('cat_all_hardware_title')}
                      </span>
                      <span className="text-[10px] font-mono text-text-subtle">
                        {t('pdp_breadcrumb_catalog')}
                      </span>
                    </NavLink>
                  </nav>
                );
              }}
            </Await>
          </Suspense>
        </section>

        {/* Section 2: Limi Journal & Technical Guides */}
        <section aria-labelledby="sidebar-blog-heading" className="flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-border/80 pb-1.5 px-1">
            <h4
              id="sidebar-blog-heading"
              className="text-[11px] font-display font-bold tracking-wider text-text-subtle uppercase"
            >
              {t('nav_blogs')}
            </h4>
            <NavLink
              to="/blogs"
              prefetch="intent"
              onClick={close}
              className="text-[10px] font-mono text-shutter hover:underline uppercase"
            >
              {t('nav_all_articles')}
            </NavLink>
          </div>

          <Suspense fallback={<SidebarArticlesSkeleton />}>
            <Await resolve={sidebar}>
              {(data) => {
                const articles =
                  data?.blogs?.nodes?.flatMap((blog) =>
                    blog.articles.nodes.map((article) => ({
                      ...article,
                      blogHandle: article.blog?.handle || blog.handle,
                      blogTitle: article.blog?.title || blog.title,
                    }))
                  ) || [];

                if (!articles.length) {
                  return (
                    <div className="rounded-xs border border-border/60 bg-surface p-3 text-center text-xs font-display text-text-muted">
                      {t('pagination_empty_desc')}
                    </div>
                  );
                }

                return (
                  <nav aria-label="Blogs" className="flex flex-col gap-1.5">
                    {articles.slice(0, 4).map((article) => {
                      const articleUrl = `/blogs/${article.blogHandle}/${article.handle}`;
                      const primaryTag = article.tags?.[0] || article.blogTitle;
                      return (
                        <NavLink
                          key={article.id}
                          to={articleUrl}
                          prefetch="intent"
                          onClick={close}
                          className="group flex flex-col gap-0.5 rounded-xs border border-border/60 bg-surface p-2 hover:border-shutter hover:bg-plate/30 transition-all tactile-btn"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-display font-medium text-text-main group-hover:text-shutter line-clamp-1">
                              {article.title}
                            </span>
                            {primaryTag && (
                              <span className="text-[9px] font-mono uppercase px-1 rounded-xs bg-plate border border-border text-text-muted shrink-0">
                                {primaryTag}
                              </span>
                            )}
                          </div>
                          {article.excerpt && (
                            <p className="text-[11px] text-text-muted line-clamp-1">
                              {article.excerpt}
                            </p>
                          )}
                        </NavLink>
                      );
                    })}
                  </nav>
                );
              }}
            </Await>
          </Suspense>
        </section>

        {/* Section 3: Services, Showroom & Policies */}
        <section aria-labelledby="sidebar-services-heading" className="flex flex-col gap-2">
          <div className="border-b border-border/80 pb-1.5 px-1">
            <h4
              id="sidebar-services-heading"
              className="text-[11px] font-display font-bold tracking-wider text-text-subtle uppercase"
            >
              {t('sidebar_operations_heading')}
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs font-display">
            <NavLink
              to="/policies/privacy-policy"
              prefetch="intent"
              onClick={close}
              className="rounded-xs border border-border/60 bg-surface p-2 text-text-muted hover:text-shutter hover:border-border-strong hover:bg-plate/30 transition-all"
            >
              <div className="text-[11px] font-bold text-text-main">{t('sidebar_privacy_title')}</div>
              <div className="text-[10px] text-text-subtle">{t('sidebar_privacy_desc')}</div>
            </NavLink>

            <NavLink
              to="/policies/shipping-policy"
              prefetch="intent"
              onClick={close}
              className="rounded-xs border border-border/60 bg-surface p-2 text-text-muted hover:text-shutter hover:border-border-strong hover:bg-plate/30 transition-all"
            >
              <div className="text-[11px] font-bold text-text-main">{t('sidebar_shipping_title')}</div>
              <div className="text-[10px] text-text-subtle">{t('sidebar_shipping_desc')}</div>
            </NavLink>

            <NavLink
              to="/pages/contact"
              prefetch="intent"
              onClick={close}
              className="rounded-xs border border-border/60 bg-surface p-2 text-text-muted hover:text-shutter hover:border-border-strong hover:bg-plate/30 transition-all"
            >
              <div className="text-[11px] font-bold text-text-main">{t('sidebar_showroom_title')}</div>
              <div className="text-[10px] text-text-subtle">{t('sidebar_showroom_desc')}</div>
            </NavLink>

            <NavLink
              to="/pages/about-us"
              prefetch="intent"
              onClick={close}
              className="rounded-xs border border-border/60 bg-surface p-2 text-text-muted hover:text-shutter hover:border-border-strong hover:bg-plate/30 transition-all"
            >
              <div className="text-[11px] font-bold text-text-main">{t('sidebar_about_title')}</div>
              <div className="text-[10px] text-text-subtle">{t('sidebar_about_desc')}</div>
            </NavLink>
          </div>
        </section>

        {/* Section 4: Utilities Dock (Account & Cart) */}
        <section aria-label="Account and Cart Actions" className="pt-2">
          <div className="flex items-center gap-2">
            <NavLink
              to="/account"
              prefetch="intent"
              onClick={close}
              className="flex-1 flex items-center justify-center gap-2 rounded-xs border border-border bg-plate/80 py-2.5 text-xs font-display font-medium text-text-main hover:border-shutter hover:text-shutter transition-all tactile-btn"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>
                {isLoggedIn ? (
                  <Suspense fallback={t('nav_account')}>
                    <Await resolve={isLoggedIn} errorElement={t('nav_account')}>
                      {(loggedIn) => (loggedIn ? t('nav_client_console') : t('nav_signin'))}
                    </Await>
                  </Suspense>
                ) : (
                  t('nav_account')
                )}
              </span>
            </NavLink>

            <button
              type="button"
              onClick={() => {
                close();
                open('cart');
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xs border border-border bg-plate/80 py-2.5 text-xs font-display font-medium text-text-main hover:border-shutter hover:text-shutter transition-all tactile-btn cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>{t('nav_cart')}</span>
              {cart ? (
                <Suspense fallback={null}>
                  <Await resolve={cart}>
                    {(cartData) =>
                      cartData?.totalQuantity ? (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-xs bg-shutter px-1 text-[9px] font-bold text-white">
                          {cartData.totalQuantity}
                        </span>
                      ) : null
                    }
                  </Await>
                </Suspense>
              ) : null}
            </button>
          </div>
        </section>

        {/* Section 5: Market & Currency Selector */}
        <section aria-label="Market and Currency" className="pt-1">
          <MobileMarketSwitcher onSelect={close} />
        </section>

        {/* Footer Hardware Spec Badge */}
        <div className="flex items-center justify-between border-t border-border pt-4 text-[10px] font-mono text-text-subtle">
          <span>{t('sidebar_precision_optics')}</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal-green animate-pulse" />
            {t('sidebar_store_online')}
          </span>
        </div>
      </div>
    </Aside>
  );
}

function CollectionIcon({ handle }: { handle: string }) {
  if (handle.includes('camera') || handle.includes('optics')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }
  if (handle.includes('light') || handle.includes('audio')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    );
  }
  if (handle.includes('rig') || handle.includes('access') || handle.includes('phu-kien')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function SidebarCollectionsSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-xs border border-border/40 bg-surface/50 p-2.5 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-xs bg-plate" />
            <div className="flex flex-col gap-1.5">
              <div className="h-3 w-28 rounded-xs bg-plate" />
              <div className="h-2.5 w-40 rounded-xs bg-plate/60" />
            </div>
          </div>
          <div className="h-4 w-10 rounded-xs bg-plate" />
        </div>
      ))}
    </div>
  );
}

function SidebarArticlesSkeleton() {
  return (
    <div className="flex flex-col gap-1.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex flex-col gap-1 rounded-xs border border-border/40 bg-surface/50 p-2 animate-pulse"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="h-3 w-3/4 rounded-xs bg-plate" />
            <div className="h-3 w-12 rounded-xs bg-plate" />
          </div>
          <div className="h-2.5 w-full rounded-xs bg-plate/60" />
        </div>
      ))}
    </div>
  );
}
