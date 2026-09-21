import type {Route} from './+types/collections.all';
import {useLoaderData} from 'react-router';
import {Link} from '~/components/Link';
import {getPaginationVariables, Image, Money} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import type {CollectionItemFragment} from 'storefrontapi.generated';
import {useTranslation} from '~/lib/translations';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'All Cinema & Studio Equipment | LimiPhotography'},
    {
      name: 'description',
      content:
        'Browse our complete catalog of cinema cameras, lenses, lighting, and rigging accessories at LimiPhotography.',
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 9,
  });

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {
        ...paginationVariables,
        country: storefront.i18n?.country,
        language: storefront.i18n?.language,
      },
    }),
  ]);
  return {products};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collection() {
  const {products} = useLoaderData<typeof loader>();
  const {t} = useTranslation();

  return (
    <main
      className="min-h-screen bg-canvas text-text-main pb-24"
      aria-labelledby="catalog-title"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8 pt-8">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-display text-text-muted mb-8"
        >
          <Link to="/" className="hover:text-text-main transition-colors">
            {t('nav_home')}
          </Link>
          <span>/</span>
          <span className="text-shutter font-bold uppercase">
            {t('pdp_breadcrumb_catalog')}
          </span>
        </nav>

        {/* Catalog Banner Header */}
        <header className="relative mb-10 md:mb-12 overflow-hidden rounded-sm border border-border bg-surface p-6 md:p-10 shadow-xs">
          <div className="relative z-10 flex flex-col items-start gap-3 sm:gap-4">
            <div className="inline-flex items-center gap-2 rounded-xs border border-border bg-plate/60 px-3 py-1 text-[10px] font-display font-semibold tracking-widest text-shutter uppercase shadow-2xs">
              {t('cat_all_hardware_badge')}
            </div>
            <h1
              id="catalog-title"
              className="text-2xl md:text-4xl font-display font-bold tracking-tight text-text-main"
            >
              {t('cat_all_hardware_title')}
            </h1>
            <p className="max-w-3xl text-xs md:text-sm text-text-muted leading-relaxed font-body">
              {t('cat_all_hardware_desc')}
            </p>
          </div>
        </header>

        {/* Products Grid */}
        <section
          className="catalog-products"
          aria-label="All products in catalog"
        >
          <PaginatedResourceSection<CollectionItemFragment>
            connection={products}
            resourcesClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {({node: product, index}) => (
              <ProductItem
                key={product.id}
                product={product}
                loading={index < 9 ? 'eager' : undefined}
              />
            )}
          </PaginatedResourceSection>
        </section>
      </div>
    </main>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
` as const;
