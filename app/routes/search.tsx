import {useLoaderData, data} from 'react-router';
import {Link} from '~/components/Link';
import type {Route} from './+types/search';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {SearchForm} from '~/components/SearchForm';
import {SearchResults} from '~/components/SearchResults';
import {
  type RegularSearchReturn,
  type PredictiveSearchReturn,
  getEmptyPredictiveSearchResult,
  getEmptyRegularSearchResult,
} from '~/lib/search';
import type {
  RegularSearchQuery,
  PredictiveSearchQuery,
} from 'storefrontapi.generated';
import {getLocaleFromRequest} from '~/lib/i18n';
import {useTranslation, getTranslationDictionary} from '~/lib/translations';
import {
  getClientIp,
  checkRateLimit,
  createRateLimitHeaders,
} from '~/lib/rateLimiter';

export const meta: Route.MetaFunction = () => {
  return [{title: `Hardware Catalog Search | LimiPhotography`}];
};

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const isPredictive = url.searchParams.has('predictive');
  const term = String(url.searchParams.get('q') || '');

  // Rate Limiting: Max 20 search requests per 10 seconds per IP
  const clientIp = getClientIp(request);
  const rateLimitResult = checkRateLimit(`search:${clientIp}`, {
    maxRequests: 20,
    windowMs: 10_000,
  });

  if (!rateLimitResult.allowed) {
    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
    const selectedLocale = getLocaleFromRequest(request);
    const dict = getTranslationDictionary(selectedLocale.language);
    const errorMessage = `${dict.search_rate_limited} (${rateLimitResult.retryAfterSeconds}S)`;

    if (isPredictive) {
      return data(
        {
          type: 'predictive' as const,
          term,
          error: errorMessage,
          result: getEmptyPredictiveSearchResult(),
        },
        {status: 429, headers: rateLimitHeaders},
      );
    }

    return data(
      {
        type: 'regular' as const,
        term,
        error: errorMessage,
        result: getEmptyRegularSearchResult(),
      },
      {status: 429, headers: rateLimitHeaders},
    );
  }

  const searchPromise: Promise<PredictiveSearchReturn | RegularSearchReturn> =
    isPredictive
      ? predictiveSearch({request, context})
      : regularSearch({request, context});

  searchPromise.catch((error: Error) => {
    console.error(error);
    return {term: '', result: null, error: error.message};
  });

  return await searchPromise;
}

/**
 * Renders the /search route
 */
export default function SearchPage() {
  const {type, term, result, error} = useLoaderData<typeof loader>();
  const {t} = useTranslation();
  if (type === 'predictive') return null;

  return (
    <main
      className="min-h-screen bg-canvas text-text-main pb-24"
      aria-labelledby="search-page-title"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8 pt-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-display text-text-muted mb-8"
        >
          <Link to="/" className="hover:text-text-main transition-colors">
            {t('nav_home')}
          </Link>
          <span>/</span>
          <span className="text-shutter font-bold uppercase">{t('nav_search')}</span>
        </nav>

        {/* Header Console */}
        <header className="relative mb-10 overflow-hidden rounded-sm border border-border bg-surface p-6 md:p-10 shadow-xs">
          <div className="relative z-10 flex flex-col items-start gap-3 sm:gap-4">
            <div className="inline-flex items-center gap-2 rounded-xs border border-border bg-plate/60 px-3 py-1 text-[10px] font-display font-semibold tracking-widest text-shutter uppercase shadow-2xs">
              {t('search_banner_badge')}
            </div>
            <h1
              id="search-page-title"
              className="text-2xl md:text-4xl font-display font-bold tracking-tight text-text-main"
            >
              {t('nav_search')}
            </h1>
            <p className="max-w-2xl text-xs md:text-sm text-text-muted leading-relaxed font-body mb-2">
              {t('search_banner_desc')}
            </p>

            <SearchForm>
              {({inputRef}) => (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl">
                  <div className="relative flex-1">
                    <input
                      defaultValue={term}
                      name="q"
                      placeholder={t('search_placeholder')}
                      ref={inputRef}
                      type="search"
                      className="w-full rounded-xs border border-border bg-canvas px-4 py-3 text-xs font-body text-text-main placeholder-text-subtle focus:border-shutter focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xs bg-shutter border border-shutter-hover px-8 py-3 text-xs font-display font-bold uppercase tracking-wider text-white shadow-[2px_2px_0px_#9CA3AF] transition-all duration-120 hover:bg-shutter-hover active:translate-x-px active:translate-y-px active:shadow-none cursor-pointer tactile-btn shrink-0 text-center"
                  >
                    {t('search_submit_cta')}
                  </button>
                </div>
              )}
            </SearchForm>
          </div>
        </header>

        {error && (
          <div className="rounded-xs border border-red-300 bg-red-50 p-4 mb-8 text-xs text-red-800">
            {t('search_query_error')} {error}
          </div>
        )}

        {!term || !result?.total ? (
          <SearchResults.Empty />
        ) : (
          <SearchResults result={result} term={term}>
            {({articles, pages, products, term}) => (
              <div>
                <SearchResults.Products products={products} term={term} />
                <SearchResults.Pages pages={pages} term={term} />
                <SearchResults.Articles articles={articles} term={term} />
              </div>
            )}
          </SearchResults>
        )}

        <Analytics.SearchView data={{searchTerm: term, searchResults: result}} />
      </div>
    </main>
  );
}

/**
 * Regular search query and fragments
 * (adjust as needed)
 */
const SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment SearchProduct on Product {
    __typename
    handle
    id
    publishedAt
    title
    trackingParameters
    vendor
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      selectedOptions {
        name
        value
      }
      product {
        handle
        title
      }
    }
  }
` as const;

const SEARCH_PAGE_FRAGMENT = `#graphql
  fragment SearchPage on Page {
     __typename
     handle
    id
    title
    trackingParameters
  }
` as const;

const SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment SearchArticle on Article {
    __typename
    handle
    id
    title
    trackingParameters
    blog {
      handle
    }
  }
` as const;

const PAGE_INFO_FRAGMENT = `#graphql
  fragment PageInfoFragment on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/search
export const SEARCH_QUERY = `#graphql
  query RegularSearch(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $term: String!
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    articles: search(
      query: $term,
      types: [ARTICLE],
      first: $first,
    ) {
      nodes {
        ...on Article {
          ...SearchArticle
        }
      }
    }
    pages: search(
      query: $term,
      types: [PAGE],
      first: $first,
    ) {
      nodes {
        ...on Page {
          ...SearchPage
        }
      }
    }
    products: search(
      after: $endCursor,
      before: $startCursor,
      first: $first,
      last: $last,
      query: $term,
      sortKey: RELEVANCE,
      types: [PRODUCT],
      unavailableProducts: HIDE,
    ) {
      nodes {
        ...on Product {
          ...SearchProduct
        }
      }
      pageInfo {
        ...PageInfoFragment
      }
    }
  }
  ${SEARCH_PRODUCT_FRAGMENT}
  ${SEARCH_PAGE_FRAGMENT}
  ${SEARCH_ARTICLE_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
` as const;

/**
 * Regular search fetcher
 */
async function regularSearch({
  request,
  context,
}: Pick<
  Route.LoaderArgs,
  'request' | 'context'
>): Promise<RegularSearchReturn> {
  const {storefront} = context;
  const url = new URL(request.url);
  const variables = getPaginationVariables(request, {pageBy: 8});
  const term = String(url.searchParams.get('q') || '');

  // Search articles, pages, and products for the `q` term
  const {
    errors,
    ...items
  }: {errors?: Array<{message: string}>} & RegularSearchQuery =
    await storefront.query(SEARCH_QUERY, {
      variables: {
        ...variables,
        term,
        country: storefront.i18n?.country,
        language: storefront.i18n?.language,
      },
    });

  if (!items) {
    throw new Error('No search data returned from Shopify API');
  }

  const total = Object.values(items).reduce(
    (acc: number, {nodes}: {nodes: Array<unknown>}) => acc + nodes.length,
    0,
  );

  const error = errors
    ? errors.map(({message}: {message: string}) => message).join(', ')
    : undefined;

  return {type: 'regular', term, error, result: {total, items}};
}

/**
 * Predictive search query and fragments
 * (adjust as needed)
 */
const PREDICTIVE_SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment PredictiveArticle on Article {
    __typename
    id
    title
    handle
    blog {
      handle
    }
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
` as const;

const PREDICTIVE_SEARCH_COLLECTION_FRAGMENT = `#graphql
  fragment PredictiveCollection on Collection {
    __typename
    id
    title
    handle
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
` as const;

const PREDICTIVE_SEARCH_PAGE_FRAGMENT = `#graphql
  fragment PredictivePage on Page {
    __typename
    id
    title
    handle
    trackingParameters
  }
` as const;

const PREDICTIVE_SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment PredictiveProduct on Product {
    __typename
    id
    title
    handle
    trackingParameters
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
    }
  }
` as const;

const PREDICTIVE_SEARCH_QUERY_FRAGMENT = `#graphql
  fragment PredictiveQuery on SearchQuerySuggestion {
    __typename
    text
    styledText
    trackingParameters
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/predictiveSearch
const PREDICTIVE_SEARCH_QUERY = `#graphql
  query PredictiveSearch(
    $country: CountryCode
    $language: LanguageCode
    $limit: Int!
    $limitScope: PredictiveSearchLimitScope!
    $term: String!
    $types: [PredictiveSearchType!]
  ) @inContext(country: $country, language: $language) {
    predictiveSearch(
      limit: $limit,
      limitScope: $limitScope,
      query: $term,
      types: $types,
    ) {
      articles {
        ...PredictiveArticle
      }
      collections {
        ...PredictiveCollection
      }
      pages {
        ...PredictivePage
      }
      products {
        ...PredictiveProduct
      }
      queries {
        ...PredictiveQuery
      }
    }
  }
  ${PREDICTIVE_SEARCH_ARTICLE_FRAGMENT}
  ${PREDICTIVE_SEARCH_COLLECTION_FRAGMENT}
  ${PREDICTIVE_SEARCH_PAGE_FRAGMENT}
  ${PREDICTIVE_SEARCH_PRODUCT_FRAGMENT}
  ${PREDICTIVE_SEARCH_QUERY_FRAGMENT}
` as const;

/**
 * Predictive search fetcher
 */
async function predictiveSearch({
  request,
  context,
}: Pick<
  Route.ActionArgs,
  'request' | 'context'
>): Promise<PredictiveSearchReturn> {
  const {storefront} = context;
  const url = new URL(request.url);
  const term = String(url.searchParams.get('q') || '').trim();
  const limit = Number(url.searchParams.get('limit') || 10);
  const type = 'predictive';

  if (!term) return {type, term, result: getEmptyPredictiveSearchResult()};

  // Predictively search articles, collections, pages, products, and queries (suggestions)
  const {
    predictiveSearch: items,
    errors,
  }: PredictiveSearchQuery & {errors?: Array<{message: string}>} =
    await storefront.query(PREDICTIVE_SEARCH_QUERY, {
      variables: {
        // customize search options as needed
        limit,
        limitScope: 'EACH',
        term,
        country: storefront.i18n?.country,
        language: storefront.i18n?.language,
      },
    });

  if (errors) {
    throw new Error(
      `Shopify API errors: ${errors.map(({message}: {message: string}) => message).join(', ')}`,
    );
  }

  if (!items) {
    throw new Error('No predictive search data returned from Shopify API');
  }

  const total = Object.values(items).reduce(
    (acc: number, item: Array<unknown>) => acc + item.length,
    0,
  );

  return {type, term, result: {items, total}};
}
