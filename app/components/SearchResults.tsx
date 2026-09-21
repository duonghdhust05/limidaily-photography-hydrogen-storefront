import {Link} from '~/components/Link';
import {Image, Money, Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';
import {useTranslation} from '~/lib/translations';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  const {t} = useTranslation();
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3 mb-10" aria-label="Journal Articles">
      <div className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-plate/60 px-2.5 py-1 text-[10px] font-display font-semibold tracking-wider text-text-muted uppercase">
        <span className="h-1.5 w-1.5 rounded-xs bg-optical-teal"></span>
        {t('search_articles_heading')} ({articles.nodes.length})
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.nodes.map((article) => {
          const blogHandle = (article as {blog?: {handle: string}}).blog?.handle;
          const articleUrl = urlWithTrackingParams({
            baseUrl: blogHandle ? `/blogs/${blogHandle}/${article.handle}` : `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <Link
              key={article.id}
              prefetch="intent"
              to={articleUrl}
              className="group rounded-sm border border-border bg-surface p-4 transition-all duration-150 hover:border-border-strong hover:shadow-[3px_3px_0px_#CBD5E1] text-inherit no-underline"
            >
              <h3 className="text-sm font-display font-semibold text-text-main group-hover:text-shutter transition-colors line-clamp-2">
                {article.title}
              </h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  const {t} = useTranslation();
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3 mb-10" aria-label="Documentation Pages">
      <div className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-plate/60 px-2.5 py-1 text-[10px] font-display font-semibold tracking-wider text-text-muted uppercase">
        <span className="h-1.5 w-1.5 rounded-xs bg-text-subtle"></span>
        {t('search_pages_heading')} ({pages.nodes.length})
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pages.nodes.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <Link
              key={page.id}
              prefetch="intent"
              to={pageUrl}
              className="group rounded-sm border border-border bg-surface p-4 transition-all duration-150 hover:border-border-strong hover:shadow-[3px_3px_0px_#CBD5E1] text-inherit no-underline"
            >
              <h3 className="text-sm font-display font-semibold text-text-main group-hover:text-shutter transition-colors line-clamp-2">
                {page.title}
              </h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  const {t} = useTranslation();
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4 mb-12" aria-label="Matched Hardware Products">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-plate/60 px-2.5 py-1 text-[10px] font-display font-semibold tracking-wider text-text-muted uppercase">
          <span className="h-1.5 w-1.5 rounded-xs bg-signal-green"></span>
          {t('search_products_heading')} ({products.nodes.length})
        </div>
      </div>

      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => {
          return (
            <div>
              {PreviousLink && (
                <div className="mb-6 text-center">
                  <PreviousLink className="inline-flex items-center gap-2 rounded-xs border border-border bg-surface px-6 py-2.5 text-xs font-display font-bold uppercase tracking-wider text-text-main shadow-2xs hover:border-shutter hover:text-shutter active:translate-x-px active:translate-y-px transition-all cursor-pointer tactile-btn">
                    {isLoading ? t('search_scanning') : `↑ ${t('pagination_previous')}`}
                  </PreviousLink>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {nodes.map((product) => {
                  const productUrl = urlWithTrackingParams({
                    baseUrl: `/products/${product.handle}`,
                    trackingParams: product.trackingParameters,
                    term,
                  });

                  const price = product?.selectedOrFirstAvailableVariant?.price;
                  const compareAtPrice =
                    product?.selectedOrFirstAvailableVariant?.compareAtPrice;
                  const image = product?.selectedOrFirstAvailableVariant?.image;
                  const vendor = product.vendor;

                  return (
                    <Link
                      key={product.id}
                      prefetch="intent"
                      to={productUrl}
                      className="group relative flex flex-col justify-between rounded-sm border border-border bg-surface p-4 transition-all duration-150 hover:border-border-strong hover:shadow-[3px_3px_0px_#CBD5E1] text-inherit no-underline"
                    >
                      <div>
                        {/* Image Container 1:1 */}
                        <div className="relative aspect-square w-full overflow-hidden rounded-xs bg-canvas flex items-center justify-center border border-border/70">
                          {image ? (
                            <Image
                              data={image}
                              sizes="(min-width: 45em) 300px, 100vw"
                              className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="text-[10px] font-display text-text-subtle uppercase">
                              {t('search_no_preview')}
                            </div>
                          )}

                          {/* In stock badge */}
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-xs bg-surface px-2 py-0.5 border border-border shadow-xs">
                            <span className="h-1.5 w-1.5 rounded-xs bg-signal-green"></span>
                            <span className="text-[10px] font-display font-medium tracking-wider text-text-main">
                              {t('status_in_stock')}
                            </span>
                          </div>

                          {vendor && (
                            <div className="absolute top-2.5 right-2.5 rounded-xs bg-plate/90 px-2 py-0.5 border border-border text-[9px] font-display font-bold uppercase tracking-wider text-text-muted">
                              {vendor}
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <div className="mt-3.5">
                          <h3 className="text-sm font-display font-semibold text-text-main line-clamp-2 min-h-10 leading-snug group-hover:text-shutter transition-colors">
                            {product.title}
                          </h3>
                        </div>
                      </div>

                      {/* Pricing & CTA footer */}
                      <div className="mt-4 pt-3 border-t border-border flex items-end justify-between">
                        <div>
                          <span className="block text-[10px] font-display tracking-widest text-text-subtle uppercase">
                            {t('card_unit_price')}
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-bold tabular-nums text-text-main tracking-tight font-display">
                              {price && <Money data={price} />}
                            </span>
                            {compareAtPrice && (
                              <span className="text-xs line-through tabular-nums text-text-subtle">
                                <Money data={compareAtPrice} />
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="flex items-center gap-1 text-xs font-display font-semibold text-shutter group-hover:translate-x-1 transition-transform">
                          {t('search_inspect')} &rarr;
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {NextLink && (
                <div className="mt-8 text-center">
                  <NextLink className="inline-flex items-center gap-2 rounded-xs border border-border bg-surface px-6 py-2.5 text-xs font-display font-bold uppercase tracking-wider text-text-main shadow-2xs hover:border-shutter hover:text-shutter active:translate-x-px active:translate-y-px transition-all cursor-pointer tactile-btn">
                    {isLoading ? t('search_scanning') : `${t('pagination_next')} ↓`}
                  </NextLink>
                </div>
              )}
            </div>
          );
        }}
      </Pagination>
    </section>
  );
}

function SearchResultsEmpty() {
  const {t} = useTranslation();
  return (
    <div className="rounded-sm border border-border bg-surface p-12 text-center shadow-xs my-8">
      <div className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-plate/60 px-3 py-1 text-[10px] font-display font-semibold tracking-widest text-text-muted uppercase mb-3">
        {t('search_empty_badge')}
      </div>
      <h3 className="text-lg font-display font-bold text-text-main mb-2">
        {t('search_no_results')}
      </h3>
      <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed font-body mb-6">
        {t('search_empty_desc')}
      </p>
      <Link
        to="/collections/all"
        className="inline-flex items-center gap-2 rounded-xs border border-border bg-surface px-6 py-2.5 text-xs font-display font-bold uppercase tracking-wider text-text-main shadow-2xs hover:border-shutter hover:text-shutter active:translate-x-px active:translate-y-px transition-all cursor-pointer tactile-btn"
      >
        {t('curated_browse_all')}
      </Link>
    </div>
  );
}
