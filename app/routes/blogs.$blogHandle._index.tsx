import {useLoaderData} from 'react-router';
import {Link} from '~/components/Link';
import type {Route} from './+types/blogs.$blogHandle._index';
import {useTranslation} from '~/lib/translations';
import {useSelectedLocale} from '~/lib/i18n';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import type {ArticleItemFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `${data?.blog.title ?? 'Journal'} | LimiPhotography`}];
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
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 6,
  });

  if (!params.blogHandle) {
    throw new Response(`blog not found`, {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        blogHandle: params.blogHandle,
        country: context.storefront.i18n?.country,
        language: context.storefront.i18n?.language,
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.blogHandle, data: blog});

  return {blog};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Blog() {
  const {blog} = useLoaderData<typeof loader>();
  const {articles} = blog;
  const {t} = useTranslation();

  return (
    <main className="min-h-screen bg-canvas text-text-main pb-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8 pt-8">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-display text-text-muted mb-8"
        >
          <Link to="/" className="hover:text-text-main transition-colors">
            {t('nav_home')}
          </Link>
          <span>/</span>
          <Link to="/blogs" className="hover:text-text-main transition-colors">
            {t('nav_blogs')}
          </Link>
          <span>/</span>
          <span className="text-shutter font-bold uppercase truncate">
            {blog.title}
          </span>
        </nav>

        <header className="relative mb-10 overflow-hidden rounded-sm border border-border bg-surface p-6 md:p-10 shadow-xs flex flex-col items-start gap-3 sm:gap-4">
          <div className="inline-flex items-center gap-2 rounded-xs border border-border bg-plate/60 px-3 py-1 text-[10px] font-display font-semibold tracking-widest text-shutter uppercase shadow-2xs">
            {t('blog_archive_badge')}
          </div>
          <h1 className="text-2xl md:text-4xl font-display font-bold tracking-tight text-text-main">
            {blog.title}
          </h1>
          <p className="max-w-2xl text-xs md:text-sm text-text-muted leading-relaxed font-body">
            {t('blog_archive_desc')}
          </p>
        </header>

        <section className="articles-list" aria-label="Blog Articles">
          <PaginatedResourceSection<ArticleItemFragment>
            connection={articles}
            resourcesClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {({node: article, index}) => (
              <ArticleItem
                article={article}
                key={article.id}
                loading={index < 2 ? 'eager' : 'lazy'}
              />
            )}
          </PaginatedResourceSection>
        </section>
      </div>
    </main>
  );
}

function ArticleItem({
  article,
  loading,
}: {
  article: ArticleItemFragment;
  loading?: HTMLImageElement['loading'];
}) {
  const {t} = useTranslation();
  const selectedLocale = useSelectedLocale();
  const localeTag = selectedLocale.language === 'VI' ? 'vi-VN' : 'en-US';

  const publishedAt = new Intl.DateTimeFormat(localeTag, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(article.publishedAt!));

  return (
    <Link
      to={`/blogs/${article.blog.handle}/${article.handle}`}
      className="group flex flex-col justify-between rounded-sm border border-border bg-surface p-4 transition-all duration-150 hover:border-border-strong hover:shadow-[3px_3px_0px_#CBD5E1] text-inherit no-underline"
      key={article.id}
    >
      <div>
        {article.image ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-xs border border-border bg-canvas mb-3.5">
            <Image
              alt={article.image.altText || article.title}
              aspectRatio="16/9"
              data={article.image}
              loading={loading}
              sizes="(min-width: 768px) 33vw, 100vw"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="relative aspect-video w-full overflow-hidden rounded-xs border border-border bg-plate/40 flex items-center justify-center mb-3.5 text-[10px] font-display text-text-subtle uppercase">
            {t('blog_technical_article')}
          </div>
        )}

        <div className="inline-flex items-center gap-1.5 rounded-xs bg-plate/60 px-2 py-0.5 text-[9px] font-display font-semibold tracking-wider text-text-muted uppercase mb-2 border border-border">
          {publishedAt}
        </div>

        <h3 className="text-sm font-display font-semibold text-text-main line-clamp-2 leading-snug group-hover:text-shutter transition-colors">
          {article.title}
        </h3>
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-display font-bold text-shutter">
        <span>{t('blog_read_article')}</span>
      </div>
    </Link>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blog(
    $country: CountryCode
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      seo {
        title
        description
      }
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          hasNextPage
          endCursor
          startCursor
        }

      }
    }
  }
  fragment ArticleItem on Article {
    author: authorV2 {
      name
    }
    contentHtml
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
    blog {
      handle
    }
  }
` as const;
