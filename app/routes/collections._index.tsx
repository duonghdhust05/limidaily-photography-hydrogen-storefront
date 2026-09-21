import {useLoaderData} from 'react-router';
import {Link} from '~/components/Link';
import type {Route} from './+types/collections._index';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import type {CollectionFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {useTranslation} from '~/lib/translations';

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
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 4,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: {
        ...paginationVariables,
        country: context.storefront.i18n?.country,
        language: context.storefront.i18n?.language,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {collections};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();
  const {t} = useTranslation();

  return (
    <main
      className="min-h-screen bg-canvas text-text-main pb-24"
      aria-labelledby="collections-page-title"
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
            {t('nav_collections')}
          </span>
        </nav>

        {/* Header Banner */}
        <header className="relative mb-12 overflow-hidden rounded-sm border border-border bg-surface p-6 md:p-10 shadow-xs">
          <div className="relative z-10 flex flex-col items-start gap-3 sm:gap-4">
            <div className="inline-flex items-center gap-2 rounded-xs border border-border bg-plate/60 px-3 py-1 text-[10px] font-display font-semibold tracking-widest text-shutter uppercase shadow-2xs">
              {t('collections_dir_badge')}
            </div>
            <h1
              id="collections-page-title"
              className="text-2xl md:text-4xl font-display font-bold tracking-tight text-text-main"
            >
              {t('nav_collections')}
            </h1>
            <p className="max-w-3xl text-xs md:text-sm text-text-muted leading-relaxed font-body">
              {t('collections_dir_desc')}
            </p>
          </div>
        </header>

        {/* Collections Grid */}
        <section
          className="collections-list"
          aria-label="All equipment collections"
        >
          <PaginatedResourceSection<CollectionFragment>
            connection={collections}
            resourcesClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {({node: collection, index}) => (
              <CollectionItem
                key={collection.id}
                collection={collection}
                index={index}
              />
            )}
          </PaginatedResourceSection>
        </section>
      </div>
    </main>
  );
}

function CollectionItem({
  collection,
  index,
}: {
  collection: CollectionFragment;
  index: number;
}) {
  const {t} = useTranslation();
  return (
    <Link
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
      className="group relative flex flex-col overflow-hidden rounded-sm border border-border bg-surface shadow-xs transition-all duration-200 hover:border-border-strong hover:shadow-[3px_3px_0px_#CBD5E1]"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-plate">
        {collection?.image ? (
          <Image
            alt={collection.image.altText || collection.title}
            aspectRatio="16/9"
            data={collection.image}
            loading={index < 3 ? 'eager' : undefined}
            sizes="(min-width: 45em) 400px, 100vw"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-text-subtle text-xs font-display">
            {t('status_no_media')}
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-gray-950/85 via-gray-900/40 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="text-[10px] font-display font-semibold tracking-widest text-shutter uppercase mb-1">
            {`MOD-0${index + 1} • MODULE`}
          </div>
          <h2 className="text-lg font-display font-bold text-text-main group-hover:text-shutter transition-colors">
            {collection.title}
          </h2>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs font-display font-semibold text-text-muted group-hover:text-shutter transition-colors">
          <span>{t('mod_enter')}</span>
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;
