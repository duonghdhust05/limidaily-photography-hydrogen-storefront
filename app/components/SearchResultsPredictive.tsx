import {useFetcher, type Fetcher} from 'react-router';
import {Link} from '~/components/Link';
import {Image, Money} from '@shopify/hydrogen';
import React, {useRef, useEffect} from 'react';
import {
  getEmptyPredictiveSearchResult,
  urlWithTrackingParams,
  type PredictiveSearchReturn,
} from '~/lib/search';
import {useAside} from './Aside';
import {useTranslation} from '~/lib/translations';

type PredictiveSearchItems = PredictiveSearchReturn['result']['items'];

type UsePredictiveSearchReturn = {
  term: React.MutableRefObject<string>;
  total: number;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  items: PredictiveSearchItems;
  fetcher: Fetcher<PredictiveSearchReturn>;
};

type SearchResultsPredictiveArgs = Pick<
  UsePredictiveSearchReturn,
  'term' | 'total' | 'inputRef' | 'items'
> & {
  state: Fetcher['state'];
  closeSearch: () => void;
};

type PartialPredictiveSearchResult<
  ItemType extends keyof PredictiveSearchItems,
  ExtraProps extends keyof SearchResultsPredictiveArgs = 'term' | 'closeSearch',
> = Pick<PredictiveSearchItems, ItemType> &
  Pick<SearchResultsPredictiveArgs, ExtraProps>;

type SearchResultsPredictiveProps = {
  children: (args: SearchResultsPredictiveArgs) => React.ReactNode;
};

/**
 * Component that renders predictive search results
 */
export function SearchResultsPredictive({
  children,
}: SearchResultsPredictiveProps) {
  const aside = useAside();
  const {term, inputRef, fetcher, total, items} = usePredictiveSearch();

  /*
   * Utility that resets the search input
   */
  function resetInput() {
    if (inputRef.current) {
      inputRef.current.blur();
      inputRef.current.value = '';
    }
  }

  /**
   * Utility that resets the search input and closes the search aside
   */
  function closeSearch() {
    resetInput();
    aside.close();
  }

  return children({
    items,
    closeSearch,
    inputRef,
    state: fetcher.state,
    term,
    total,
  });
}

SearchResultsPredictive.Articles = SearchResultsPredictiveArticles;
SearchResultsPredictive.Collections = SearchResultsPredictiveCollections;
SearchResultsPredictive.Pages = SearchResultsPredictivePages;
SearchResultsPredictive.Products = SearchResultsPredictiveProducts;
SearchResultsPredictive.Queries = SearchResultsPredictiveQueries;
SearchResultsPredictive.Empty = SearchResultsPredictiveEmpty;

function SearchResultsPredictiveArticles({
  term,
  articles,
  closeSearch,
}: PartialPredictiveSearchResult<'articles'>) {
  const {t} = useTranslation();
  if (!articles.length) return null;

  return (
    <div className="flex flex-col gap-2" key="articles">
      <div className="flex items-center gap-1.5 text-[10px] font-display font-semibold tracking-wider text-text-muted uppercase">
        <span className="h-1.5 w-1.5 rounded-xs bg-optical-teal"></span>
        {t('nav_blogs')}
      </div>
      <ul className="divide-y divide-border rounded-xs border border-border bg-surface">
        {articles.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.blog.handle}/${article.handle}`,
            trackingParams: article.trackingParameters,
            term: term.current ?? '',
          });

          return (
            <li key={article.id} className="p-2.5 transition-colors hover:bg-plate/40">
              <Link
                onClick={closeSearch}
                to={articleUrl}
                className="flex items-center gap-3 text-xs font-display text-text-main hover:text-shutter"
              >
                {article.image?.url && (
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xs border border-border bg-plate/50">
                    <Image
                      alt={article.image.altText ?? ''}
                      src={article.image.url}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <span className="line-clamp-2 leading-snug">{article.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveCollections({
  term,
  collections,
  closeSearch,
}: PartialPredictiveSearchResult<'collections'>) {
  const {t} = useTranslation();
  if (!collections.length) return null;

  return (
    <div className="flex flex-col gap-2" key="collections">
      <div className="flex items-center gap-1.5 text-[10px] font-display font-semibold tracking-wider text-text-muted uppercase">
        <span className="h-1.5 w-1.5 rounded-xs bg-shutter"></span>
        {t('search_divisions')}
      </div>
      <ul className="divide-y divide-border rounded-xs border border-border bg-surface">
        {collections.map((collection) => {
          const collectionUrl = urlWithTrackingParams({
            baseUrl: `/collections/${collection.handle}`,
            trackingParams: collection.trackingParameters,
            term: term.current,
          });

          return (
            <li key={collection.id} className="p-2.5 transition-colors hover:bg-plate/40">
              <Link
                onClick={closeSearch}
                to={collectionUrl}
                className="flex items-center justify-between text-xs font-display font-medium text-text-main hover:text-shutter"
              >
                <span>{collection.title}</span>
                <span className="text-[10px] font-bold text-shutter tracking-wider">{t('mod_enter')} &rarr;</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictivePages({
  term,
  pages,
  closeSearch,
}: PartialPredictiveSearchResult<'pages'>) {
  if (!pages.length) return null;

  return (
    <div className="flex flex-col gap-2" key="pages">
      <div className="flex items-center gap-1.5 text-[10px] font-display font-semibold tracking-wider text-text-muted uppercase">
        <span className="h-1.5 w-1.5 rounded-xs bg-text-subtle"></span>
        SPECIFICATIONS & PAGES
      </div>
      <ul className="divide-y divide-border rounded-xs border border-border bg-surface">
        {pages.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term: term.current,
          });

          return (
            <li key={page.id} className="p-2.5 transition-colors hover:bg-plate/40">
              <Link
                onClick={closeSearch}
                to={pageUrl}
                className="block text-xs font-display text-text-main hover:text-shutter"
              >
                {page.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveProducts({
  term,
  products,
  closeSearch,
}: PartialPredictiveSearchResult<'products'>) {
  const {t} = useTranslation();
  if (!products.length) return null;

  return (
    <div className="flex flex-col gap-2" key="products">
      <div className="flex items-center gap-1.5 text-[10px] font-display font-semibold tracking-wider text-text-muted uppercase">
        <span className="h-1.5 w-1.5 rounded-xs bg-signal-green"></span>
        {t('search_hardware_matches')}
      </div>
      <ul className="divide-y divide-border rounded-xs border border-border bg-surface">
        {products.map((product) => {
          const productUrl = urlWithTrackingParams({
            baseUrl: `/products/${product.handle}`,
            trackingParams: product.trackingParameters,
            term: term.current,
          });

          const price = product?.selectedOrFirstAvailableVariant?.price;
          const image = product?.selectedOrFirstAvailableVariant?.image;
          return (
            <li key={product.id} className="p-2.5 transition-colors hover:bg-plate/40">
              <Link
                to={productUrl}
                onClick={closeSearch}
                className="flex items-center gap-3 text-inherit no-underline"
              >
                {image && (
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xs border border-border bg-plate/50 p-1">
                    <Image
                      alt={image.altText ?? ''}
                      src={image.url}
                      width={48}
                      height={48}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-display font-semibold text-text-main hover:text-shutter transition-colors">
                    {product.title}
                  </p>
                  <div className="mt-0.5 text-xs font-bold tabular-nums text-text-muted">
                    {price && <Money data={price} />}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveQueries({
  queries,
  queriesDatalistId,
}: PartialPredictiveSearchResult<'queries', never> & {
  queriesDatalistId: string;
}) {
  if (!queries.length) return null;

  return (
    <datalist id={queriesDatalistId}>
      {queries.map((suggestion) => {
        if (!suggestion) return null;

        return <option key={suggestion.text} value={suggestion.text} />;
      })}
    </datalist>
  );
}

function SearchResultsPredictiveEmpty({
  term,
}: {
  term: React.MutableRefObject<string>;
}) {
  const {t} = useTranslation();
  if (!term.current) {
    return null;
  }

  return (
    <div className="rounded-xs border border-border bg-surface p-6 text-center shadow-2xs">
      <div className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-plate/60 px-2 py-0.5 text-[9px] font-display font-semibold tracking-widest text-text-muted uppercase mb-2">
        {t('search_no_results')}
      </div>
      <p className="text-xs text-text-muted font-body">
        {t('search_no_results')} ({term.current}).
      </p>
    </div>
  );
}

/**
 * Hook that returns the predictive search results and fetcher and input ref.
 **/
function usePredictiveSearch(): UsePredictiveSearchReturn {
  const fetcher = useFetcher<PredictiveSearchReturn>({key: 'search'});
  const term = useRef<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (fetcher?.state === 'loading') {
    term.current = String(fetcher.formData?.get('q') || '');
  }

  // capture the search input element as a ref
  useEffect(() => {
    if (!inputRef.current) {
      inputRef.current = document.querySelector('input[type="search"]');
    }
  }, []);

  const {items, total} =
    fetcher?.data?.result ?? getEmptyPredictiveSearchResult();

  return {items, total, inputRef, term, fetcher};
}
