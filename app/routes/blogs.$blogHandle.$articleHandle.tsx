import {useState} from 'react';
import {useLoaderData} from 'react-router';
import {Link} from '~/components/Link';
import type {Route} from './+types/blogs.$blogHandle.$articleHandle';
import {Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {useTranslation} from '~/lib/translations';
import {useSelectedLocale} from '~/lib/i18n';
import {cleanHtmlContent, calculateReadingTime} from '~/lib/htmlSanitizer';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `${data?.article.title ?? 'Field Dispatch'} | LimiPhotography Journal`},
    {
      name: 'description',
      content:
        data?.article.seo?.description ||
        'Read photography, filmmaking, and optical gear guides by LimiPhotography.',
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Not found', {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(ARTICLE_QUERY, {
      variables: {
        blogHandle,
        articleHandle,
        language: context.storefront.i18n?.language,
        country: context.storefront.i18n?.country,
      },
    }),
  ]);

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(
    request,
    {
      handle: articleHandle,
      data: blog.articleByHandle,
    },
    {
      handle: blogHandle,
      data: blog,
    },
  );

  const article = blog.articleByHandle;
  const relatedArticles = (blog.articles?.nodes || [])
    .filter((a) => a.handle !== articleHandle)
    .slice(0, 3);

  return {
    article,
    blogHandle,
    blogTitle: blog.title,
    relatedArticles,
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Article() {
  const {article, blogHandle, blogTitle, relatedArticles} = useLoaderData<typeof loader>();
  const {title, image, contentHtml, author, tags, publishedAt} = article;
  const {t} = useTranslation();
  const selectedLocale = useSelectedLocale();
  const [copied, setCopied] = useState(false);

  const localeTag = selectedLocale.language === 'VI' ? 'vi-VN' : 'en-US';

  const publishedDate = new Intl.DateTimeFormat(localeTag, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(publishedAt));

  const readingMinutes = calculateReadingTime(contentHtml);
  const sanitizedContent = cleanHtmlContent(contentHtml);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        })
        .catch(() => {
          // Fallback if clipboard API is not permitted
        });
    }
  };

  return (
    <main className="min-h-screen bg-canvas text-text-main pb-24">
      {/* 1. Industrial Breadcrumb Navigation */}
      <div className="border-b border-border bg-surface/50">
        <div className="mx-auto max-w-5xl px-4 md:px-8 py-3.5">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-display text-text-muted overflow-x-auto whitespace-nowrap"
          >
            <Link to="/" className="hover:text-text-main transition-colors">
              {t('nav_home')}
            </Link>
            <span className="text-border">/</span>
            <Link
              to={`/blogs/${blogHandle}`}
              className="hover:text-text-main transition-colors uppercase tracking-wider"
            >
              {blogTitle || t('article_news_heading')}
            </Link>
            <span className="text-border">/</span>
            <span className="text-shutter font-semibold truncate max-w-60 md:max-w-100">
              {title}
            </span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 md:px-8 pt-10">
        {/* 2. Hero Editorial Header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-plate/80 px-2.5 py-1 text-[10px] font-display font-bold uppercase tracking-widest text-shutter shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-shutter animate-pulse" />
              {blogTitle ? `${blogTitle} // ${t('blog_division_badge')}` : t('blog_division_badge')}
            </span>

            <span className="text-xs font-mono text-text-muted">
              {readingMinutes} {t('article_min_read')}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight text-text-main leading-tight mb-6">
            {title}
          </h1>

          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border text-xs font-display text-text-muted">
            <div className="flex flex-wrap items-center gap-4">
              {author?.name && (
                <div className="flex items-center gap-1.5">
                  <span className="text-text-muted/60">{t('article_by_author')}</span>
                  <span className="font-semibold text-text-main">{author.name}</span>
                </div>
              )}
              <span className="text-border hidden sm:inline">&bull;</span>
              <time dateTime={publishedAt} className="text-text-muted">
                {publishedDate}
              </time>
            </div>

            {/* Share action */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-surface px-3 py-1.5 text-xs font-display hover:border-shutter hover:text-shutter transition-colors cursor-pointer"
                title={t('article_share')}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span>{copied ? t('article_copied_link') : t('article_share')}</span>
              </button>
            </div>
          </div>

          {/* Tags List */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted mr-1">
                {t('article_tags_badge')}:
              </span>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-xs border border-border/80 bg-surface/60 px-2 py-0.5 text-[11px] font-mono text-text-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* 3. Cinema Banner with Optical Viewfinder Corners */}
        {image && (
          <div className="relative mb-12 rounded-sm border border-border bg-black/40 overflow-hidden shadow-sm group">
            {/* 4 Corner Crosshairs */}
            <div className="absolute top-3 left-3 z-10 font-mono text-[10px] text-white/50 select-none">
              + 0.00° [VIEWFINDER // 16:9]
            </div>
            <div className="absolute top-3 right-3 z-10 font-mono text-[10px] text-white/50 select-none">
              ISO 400 +
            </div>
            <div className="absolute bottom-3 left-3 z-10 font-mono text-[10px] text-white/50 select-none">
              + T2.8 50MM
            </div>
            <div className="absolute bottom-3 right-3 z-10 font-mono text-[10px] text-white/50 select-none">
              [TELEMETRY OK] +
            </div>

            <figure className="aspect-video w-full overflow-hidden">
              <Image
                data={image}
                sizes="(min-width: 64em) 900px, 100vw"
                loading="eager"
                alt={image.altText || title}
                className="w-full h-full object-cover grayscale-15 group-hover:grayscale-0 transition-all duration-700 group-hover:scale-[1.01]"
              />
            </figure>
          </div>
        )}

        {/* 4. Industrial Editorial Body */}
        <article className="rounded-sm border border-border bg-surface p-6 md:p-12 shadow-xs mb-12">
          <div
            dangerouslySetInnerHTML={{__html: sanitizedContent}}
            className="prose-industrial text-sm md:text-base text-text-muted leading-relaxed font-body"
          />
        </article>

        {/* 5. Post Actions & Quick Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-sm border border-border bg-surface/70 mb-16">
          <Link
            to={`/blogs/${blogHandle}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xs border border-border bg-surface px-5 py-2.5 text-xs font-display font-semibold uppercase tracking-wider text-text-main hover:border-shutter hover:text-shutter transition-colors shadow-2xs"
          >
            {t('article_back_to_blog')}
          </Link>

          <Link
            to="/collections/all"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xs bg-shutter px-5 py-2.5 text-xs font-display font-bold uppercase tracking-wider text-white hover:bg-shutter/90 transition-colors shadow-xs"
          >
            {t('article_inspect_gear')}
          </Link>
        </div>

        {/* 6. Related Field Guides Section */}
        {relatedArticles.length > 0 && (
          <section aria-labelledby="related-articles-heading" className="pt-8 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <h2
                id="related-articles-heading"
                className="text-xs font-display font-bold uppercase tracking-widest text-text-main flex items-center gap-2"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-shutter" />
                {t('article_related_guides')}
              </h2>

              <Link
                to={`/blogs/${blogHandle}`}
                className="text-xs font-display text-shutter hover:underline tracking-wider uppercase"
              >
                {t('blog_explore_articles')}
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => {
                const relDate = new Intl.DateTimeFormat(localeTag, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }).format(new Date(rel.publishedAt));

                return (
                  <Link
                    key={rel.handle}
                    to={`/blogs/${blogHandle}/${rel.handle}`}
                    className="group flex flex-col rounded-sm border border-border bg-surface overflow-hidden hover:border-shutter/60 transition-colors shadow-2xs"
                  >
                    {rel.image && (
                      <div className="aspect-16/10 w-full overflow-hidden bg-black/30 border-b border-border">
                        <Image
                          data={rel.image}
                          sizes="(min-width: 45em) 300px, 100vw"
                          loading="lazy"
                          alt={rel.image.altText || rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <time className="text-[10px] font-mono text-text-muted mb-2 block">
                          {relDate}
                        </time>
                        <h3 className="text-sm font-display font-bold text-text-main group-hover:text-shutter transition-colors line-clamp-2 leading-snug">
                          {rel.title}
                        </h3>
                      </div>
                      <div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-display font-semibold text-shutter flex items-center gap-1">
                        <span>{t('blog_read_article')}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      title
      articleByHandle(handle: $articleHandle) {
        handle
        title
        contentHtml
        publishedAt
        tags
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }
      articles(first: 4) {
        nodes {
          handle
          title
          publishedAt
          tags
          image {
            id
            altText
            url
            width
            height
          }
        }
      }
    }
  }
` as const;
