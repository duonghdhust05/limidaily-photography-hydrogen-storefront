import { redirect, useLoaderData } from 'react-router';
import { Link } from '~/components/Link';
import type { Route } from './+types/collections.$handle';
import { getPaginationVariables, Analytics, Image } from '@shopify/hydrogen';
import { PaginatedResourceSection } from '~/components/PaginatedResourceSection';
import { redirectIfHandleIsLocalized } from '~/lib/redirect';
import { ProductItem } from '~/components/ProductItem';
import type { ProductItemFragment } from 'storefrontapi.generated';
import { useTranslation } from '~/lib/translations';

export const meta: Route.MetaFunction = ({ data }) => {
  return [
    {
      title: `${data?.collection.title ?? 'Collection'} | LimiPhotography`,
    },
    {
      name: 'description',
      content:
        data?.collection.description ||
        'Browse professional cameras, optical lenses, lighting, and rigging accessories at LimiPhotography.',
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return { ...deferredData, ...criticalData };
}

/**
 * Load data necessary for rendering content above the fold.
 */
async function loadCriticalData({ context, params, request }: Route.LoaderArgs) {
  const { handle } = params;
  const { storefront } = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 6,
  });

  if (handle === 'frontpage') {
    throw redirect('/', { status: 301 });
  }

  if (!handle) {
    throw redirect('/collections');
  }

  const [{ collection }] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {
        handle,
        country: storefront.i18n?.country,
        language: storefront.i18n?.language,
        ...paginationVariables,
      },
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, { handle, data: collection });

  return {
    collection,
  };
}

/**
 * Load data for rendering content below the fold.
 */
function loadDeferredData({ context }: Route.LoaderArgs) {
  return {};
}

export default function Collection() {
  const { collection } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <main
      className="min-h-screen bg-canvas text-text-main pb-24"
      aria-labelledby="collection-title"
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
          <Link
            to="/collections/all"
            className="hover:text-text-main transition-colors"
          >
            {t('nav_collections')}
          </Link>
          <span>/</span>
          <span className="text-shutter font-bold uppercase">
            {collection.title}
          </span>
        </nav>

        {/* Collection Banner Header */}
        <header className="relative mb-12 overflow-hidden rounded-sm border border-border bg-surface shadow-xs">
          {collection.image && (
            <div className="relative h-64 md:h-100 w-full overflow-hidden">
              <Image
                data={collection.image}
                sizes="100vw"
                loading="eager"
                className="h-full w-full object-cover"
                alt={collection.image.altText || collection.title}
              />
              <div className="absolute inset-0 bg-linear-to-t from-gray-950/85 via-gray-900/40 to-transparent" />
            </div>
          )}

          <div
            className={`relative z-10 p-6 md:p-10 flex flex-col items-start gap-7 sm:gap-6 ${collection.image ? '-mt-30 md:-mt-36' : ''
              }`}
          >
            <div className="inline-flex items-center gap-2 rounded-xs border border-border bg-surface/95 px-3 py-1 text-[10px] font-display font-semibold tracking-widest text-shutter uppercase shadow-2xs">
              {t('nav_disciplines')}
            </div>
            <h1
              id="collection-title"
              className={`text-2xl md:text-4xl font-display font-bold tracking-tight ${collection.image ? 'text-white' : 'text-text-main'
                }`}
            >
              {collection.title}
            </h1>
            {collection.description && (
              <p
                className={`max-w text-xs md:text-sm leading-relaxed font-body ${collection.image ? 'text-black-200' : 'text-text-muted'
                  }`}
              >
                {collection.description}
              </p>
            )}
          </div>
        </header>

        {/* Products Grid */}
        <section
          className="collection-products"
          aria-label="Products in this collection"
        >
          <PaginatedResourceSection<ProductItemFragment>
            connection={collection.products}
            resourcesClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {({ node: product, index }) => (
              <ProductItem
                key={product.id}
                product={product}
                loading={index < 6 ? 'eager' : undefined}
              />
            )}
          </PaginatedResourceSection>
        </section>
      </div>

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </main>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
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
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
` as const;

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        id
        url
        altText
        width
        height
      }
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
