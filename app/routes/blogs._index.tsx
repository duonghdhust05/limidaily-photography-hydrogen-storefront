import {useLoaderData} from 'react-router';
import {Link} from '~/components/Link';
import type {Route} from './+types/blogs._index';
import {useTranslation} from '~/lib/translations';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import type {BlogsQuery} from 'storefrontapi.generated';

type BlogNode = BlogsQuery['blogs']['nodes'][0];

export const meta: Route.MetaFunction = () => {
  return [{title: `Engineering Journal | LimiPhotography`}];
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
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 10,
  });

  const [{blogs}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        ...paginationVariables,
        country: context.storefront.i18n?.country,
        language: context.storefront.i18n?.language,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {blogs};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Blogs() {
  const {blogs} = useLoaderData<typeof loader>();
  const {t} = useTranslation();

  return (
    <main className="min-h-screen bg-canvas text-text-main pb-24">
      <div className="mx-auto max-w-5xl px-4 md:px-8 pt-8">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-display text-text-muted mb-8"
        >
          <Link to="/" className="hover:text-text-main transition-colors">
            {t('nav_home')}
          </Link>
          <span>/</span>
          <span className="text-shutter font-bold uppercase">{t('nav_blogs')}</span>
        </nav>

        <header className="relative mb-10 overflow-hidden rounded-sm border border-border bg-surface p-6 md:p-10 shadow-xs flex flex-col items-start gap-3 sm:gap-4">
          <div className="inline-flex items-center gap-2 rounded-xs border border-border bg-plate/60 px-3 py-1 text-[10px] font-display font-semibold tracking-widest text-shutter uppercase shadow-2xs">
            {t('blog_directory_badge')}
          </div>
          <h1 className="text-2xl md:text-4xl font-display font-bold tracking-tight text-text-main">
            {t('blog_directory_title')}
          </h1>
          <p className="max-w-2xl text-xs md:text-sm text-text-muted leading-relaxed font-body">
            {t('blog_directory_desc')}
          </p>
        </header>

        <section className="blogs-list" aria-label="Journal Publications">
          <PaginatedResourceSection<BlogNode>
            connection={blogs}
            resourcesClassName="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {({node: blog}) => (
              <Link
                className="group rounded-sm border border-border bg-surface p-6 transition-all duration-150 hover:border-border-strong hover:shadow-[3px_3px_0px_#CBD5E1] text-inherit no-underline flex flex-col justify-between"
                key={blog.handle}
                prefetch="intent"
                to={`/blogs/${blog.handle}`}
              >
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-plate/60 px-2 py-0.5 text-[9px] font-display font-semibold tracking-wider text-text-muted uppercase mb-3">
                    {t('blog_division_badge')}
                  </div>
                  <h2 className="text-lg font-display font-bold text-text-main group-hover:text-shutter transition-colors">
                    {blog.title}
                  </h2>
                </div>
                <span className="mt-4 text-xs font-display font-bold text-shutter flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  {t('blog_explore_articles')}
                </span>
              </Link>
            )}
          </PaginatedResourceSection>
        </section>
      </div>
    </main>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
      }
    }
  }
` as const;
