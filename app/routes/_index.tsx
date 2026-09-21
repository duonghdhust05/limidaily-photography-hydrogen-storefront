import { Await, useLoaderData } from 'react-router';
import type { Route } from './+types/_index';
import { Suspense, useEffect, useState } from 'react';
import { Image } from '@shopify/hydrogen';
import type {
  HomepageDataQuery,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import { Link } from '~/components/Link';
import { ProductItem } from '~/components/ProductItem';
import { MockShopNotice } from '~/components/MockShopNotice';
import { useTranslation } from '~/lib/translations';
import heroBg from '~/assets/hero-section.webp';
import featureCollectionBg from '~/assets/feature-collection.webp';
import productBg from '~/assets/product.webp';

export const meta: Route.MetaFunction = () => {
  return [
    { title: 'Limi Photography | Precision Optical & Cinema Hardware' },
    {
      name: 'description',
      content:
        'Professional cinema cameras, factory-calibrated lenses, studio lighting, and audio gear for cinematographers and visual architects.',
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
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({ context }: Route.LoaderArgs) {
  const [homepageData] = await Promise.all([
    context.storefront.query(HOMEPAGE_DATA_QUERY, {
      variables: {
        country: context.storefront.i18n?.country,
        language: context.storefront.i18n?.language,
      },
    }),
  ]);

  const rawCollections = homepageData?.collections?.nodes ?? [];
  const featuredCollections = rawCollections.filter(
    (c) => c.handle !== 'frontpage',
  );

  return {
    featuredCollections,
    shop: homepageData.shop,
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({ context }: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY, {
      variables: {
        country: context.storefront.i18n?.country,
        language: context.storefront.i18n?.language,
      },
    })
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const shopDescription =
    data.shop?.description || t('hero_default_desc');

  return (
    <div className="home relative bg-canvas text-text-main">
      {/* Floating Stage Navigation Dock */}
      <HomepageStageIndicator />

      {data.isShopLinked ? null : <MockShopNotice />}

      {/* 1. Tactile Neo-Industrial Hero Stage */}
      <section
        id="stage-hero"
        className="relative md:snap-start md:snap-always md:min-h-[calc(100dvh-4rem)] flex flex-col justify-center items-center overflow-hidden border-b border-border bg-surface px-4 py-16 md:py-12"
        aria-label="Brand Hero Stage"
      >
        {/* Cinematic Hardware Hero Background Image */}
        <div
          className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
        >
          <img
            src={heroBg}
            alt=""
            className="w-full h-full object-cover object-center opacity-70 scale-105 transition-transform duration-1000"
            loading="eager"
            fetchPriority="high"
          />
          {/* Studio Vignette & Contrast Overlays */}
          <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/65 to-surface/35" />
          <div className="absolute inset-0 bg-radial from-transparent via-surface/25 to-surface/65" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center flex flex-col items-center">
          {/* Main Headline */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-gray-700 leading-tight mb-4 md:mb-6">
            {t('hero_headline_main')}
            <span className="block text-shutter">
              {t('hero_headline_sub')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl text-balance text-xs md:text-sm text-text-muted leading-relaxed font-body mb-6 md:mb-8">
            {shopDescription}
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-8 md:mb-10">
            <Link
              to="/collections/cameras-optics"
              className="inline-flex items-center gap-2 rounded-xs bg-shutter border border-shutter-hover px-6 py-3 text-xs md:text-sm font-display font-bold text-white shadow-[2px_2px_0px_#9CA3AF] hover:bg-shutter-hover active:translate-x-px active:translate-y-px active:shadow-none transition-all tactile-btn cursor-pointer"
            >
              {t('hero_cta_optics')}
            </Link>
            <Link
              to="/collections/all"
              className="inline-flex items-center gap-2 rounded-xs border border-border bg-surface px-6 py-3 text-xs md:text-sm font-display font-semibold text-text-main shadow-2xs hover:bg-plate/60 hover:border-border-strong active:translate-x-px active:translate-y-px transition-all tactile-btn cursor-pointer"
            >
              {t('hero_cta_all')}
            </Link>
          </div>

          {/* Instrument Specs Highlight Strip */}
          <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-border text-[11px] font-display text-text-muted">
            <div className="rounded-xs border border-border bg-plate/40 p-2.5 shadow-2xs">
              <span className="block text-text-main font-bold">{t('spec_15_stops')}</span>
              <span>{t('spec_dynamic_range')}</span>
            </div>
            <div className="rounded-xs border border-border bg-plate/40 p-2.5 shadow-2xs">
              <span className="block text-text-main font-bold">{t('spec_4k120p')}</span>
              <span>{t('spec_10bit_alli')}</span>
            </div>
            <div className="rounded-xs border border-border bg-plate/40 p-2.5 shadow-2xs">
              <span className="block text-text-main font-bold">{t('spec_32bit_float')}</span>
              <span>{t('spec_zero_clipping')}</span>
            </div>
            <div className="rounded-xs border border-border bg-plate/40 p-2.5 shadow-2xs">
              <span className="block text-text-main font-bold">{t('spec_24_month')}</span>
              <span>{t('spec_factory_warranty')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Hardware Collections Section */}
      <section
        id="stage-disciplines"
        className="relative md:snap-start md:snap-always md:min-h-[calc(100dvh-4rem)] flex flex-col justify-center overflow-hidden border-b border-border bg-canvas px-4 md:px-8 py-16 md:py-12"
        aria-labelledby="featured-collections-heading"
      >
        {/* Featured Hardware Collections Background Image Layer */}
        <div
          className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
        >
          <img
            src={featureCollectionBg}
            alt=""
            className="w-full h-full object-cover object-center opacity-80 scale-105 transition-transform duration-1000"
            loading="lazy"
          />
          {/* Studio Vignette & Contrast Overlays */}
          <div className="absolute inset-0 bg-linear-to-t from-canvas via-canvas/75 to-canvas/40" />
          <div className="absolute inset-0 bg-radial from-transparent via-canvas/70 to-canvas/85" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-3">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-display font-semibold tracking-widest text-shutter uppercase mb-1">
                <span>{t('cat_explore_badge')}</span>
              </div>
              <h2
                id="featured-collections-heading"
                className="text-2xl md:text-3xl font-display font-bold tracking-tight text-text-main"
              >
                {t('cat_featured_heading')}
              </h2>
            </div>
            <Link
              to="/collections/all"
              className="text-xs font-display font-semibold text-shutter hover:underline"
            >
              {t('cat_view_directory')}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {data.featuredCollections.map((collection, index) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. Curated Hardware Grid (Recommended Products) */}
      <section
        id="stage-units"
        className="relative md:snap-start md:snap-always md:min-h-[calc(100dvh-4rem)] flex flex-col justify-center overflow-hidden border-b border-border bg-surface px-4 md:px-8 py-16 md:py-12"
        aria-labelledby="recommended-products-heading"
      >
        {/* Curated Hardware Grid Background Image Layer */}
        <div
          className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
        >
          <img
            src={productBg}
            alt=""
            className="w-full h-full object-cover object-center opacity-80 scale-105 transition-transform duration-1000"
            loading="lazy"
          />
          {/* Studio Vignette & Contrast Overlays */}
          <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/75 to-surface/40" />
          <div className="absolute inset-0 bg-radial from-transparent via-surface/30 to-surface/85" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-3">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-display font-semibold tracking-widest text-shutter uppercase mb-1">
                <span>{t('curated_bench_tested')}</span>
              </div>
              <h2
                id="recommended-products-heading"
                className="text-2xl md:text-3xl font-display font-bold tracking-tight text-text-main"
              >
                {t('curated_hardware_units')}
              </h2>
            </div>
            <p className="text-xs font-display text-text-muted">
              {t('curated_showing_top')}
            </p>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-72 rounded-sm border border-border bg-surface animate-pulse"
                  />
                ))}
              </div>
            }
          >
            <Await resolve={data.recommendedProducts}>
              {(response) => (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                  {response
                    ? response.products.nodes.slice(0, 3).map((product) => (
                        <ProductItem key={product.id} product={product} />
                      ))
                    : null}
                </div>
              )}
            </Await>
          </Suspense>

          <div className="mt-8 text-center">
            <Link
              to="/collections/all"
              className="inline-flex items-center gap-2 rounded-xs border border-border bg-surface px-8 py-3 text-xs font-display font-bold text-text-main shadow-2xs hover:border-shutter hover:text-shutter active:translate-x-px active:translate-y-px transition-all cursor-pointer tactile-btn"
            >
              {t('curated_browse_all')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

type CollectionNode = HomepageDataQuery['collections']['nodes'][number];

function CollectionCard({
  collection,
  index,
}: {
  collection: CollectionNode;
  index: number;
}) {
  const { t } = useTranslation();
  const image = collection?.image;
  const modCode = `MOD-0${index + 1}`;

  return (
    <article className="group relative flex flex-col justify-end overflow-hidden rounded-sm border border-border bg-surface transition-all duration-200 hover:border-border-strong hover:shadow-[3px_3px_0px_#CBD5E1] min-h-85">
      <Link
        className="block h-full w-full text-inherit no-underline"
        to={`/collections/${collection.handle}`}
      >
        {/* Background Image with Scrim */}
        {image ? (
          <div className="absolute inset-0 z-0">
            <Image
              data={image}
              sizes="(min-width: 45em) 33vw, 100vw"
              alt={image.altText || collection.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Scrim */}
            <div className="absolute inset-0 bg-linear-to-t from-gray-950/85 via-gray-900/40 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-plate" />
        )}

        {/* Content Overlay */}
        <div className="relative z-10 p-6 flex flex-col justify-end h-full">
          <span className="text-[10px] font-display tracking-widest text-orange-300 uppercase mb-1 font-semibold">
            {`${modCode} • ${t('card_module')}`}
          </span>
          <h3 className="text-xl font-display font-bold text-white tracking-tight group-hover:text-orange-200 transition-colors">
            {collection.title}
          </h3>
          {collection.description && (
            <p className="mt-2 text-xs text-gray-200 line-clamp-2 leading-relaxed font-body">
              {collection.description}
            </p>
          )}
          <div className="mt-4 flex items-center gap-1.5 text-xs font-display font-semibold text-white group-hover:text-orange-300 transition-colors">
            <span>{t('mod_enter')}</span>
            <span className="transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

// Configure stage glide duration in milliseconds (e.g. 500 = fast, 850 = cinematic, 1200 = slow glide)
const STAGE_SCROLL_DURATION_MS = 100;

function smoothScrollTo(container: HTMLElement, targetY: number, duration: number) {
  const startY = container.scrollTop;
  const difference = targetY - startY;
  const startTime = performance.now();

  // Cinematic easeInOutCubic curve for graceful acceleration and deceleration
  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

  function step(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    container.scrollTop = startY + difference * easeInOutCubic(progress);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      // Re-enable native snap behavior once animation has finished
      container.style.scrollSnapType = '';
    }
  }

  // Temporarily disable scroll-snap during programmatic animation so browser snap doesn't conflict
  container.style.scrollSnapType = 'none';
  requestAnimationFrame(step);
}

const HOMEPAGE_STAGES = [
  { id: 'stage-hero', number: '01', key: 'stage_01' as const },
  { id: 'stage-disciplines', number: '02', key: 'stage_02' as const },
  { id: 'stage-units', number: '03', key: 'stage_03' as const },
  { id: 'stage-footer', number: '04', key: 'stage_04' as const },
] as const;

function HomepageStageIndicator() {
  const [activeStage, setActiveStage] = useState<string>('stage-hero');
  const { t } = useTranslation();

  useEffect(() => {
    const root = document.getElementById('homepage-scroll-container');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveStage(entry.target.id);
          }
        }
      },
      {
        root,
        threshold: 0.45,
      }
    );

    HOMEPAGE_STAGES.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToStage = (id: string) => {
    const container = document.getElementById('homepage-scroll-container');
    const target = document.getElementById(id);
    if (!container || !target || window.innerWidth < 768) {
      target?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    smoothScrollTo(container, target.offsetTop, STAGE_SCROLL_DURATION_MS);
  };

  return (
    <nav
      aria-label="Stage showcase navigation"
      className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-2 p-2 rounded-xs border border-border/80 bg-surface/90 backdrop-blur-xs shadow-xs"
    >
      {HOMEPAGE_STAGES.map((stage) => {
        const isActive = activeStage === stage.id;
        return (
          <button
            key={stage.id}
            type="button"
            onClick={() => scrollToStage(stage.id)}
            className={`group flex items-center gap-2 px-1.5 py-1 text-left transition-all cursor-pointer rounded-xs ${
              isActive
                ? 'text-shutter font-bold bg-shutter-light'
                : 'text-text-muted hover:text-text-main hover:bg-plate/40'
            }`}
            aria-label={`Jump to stage ${stage.number} ${t(stage.key)}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-xs transition-all ${
                isActive
                  ? 'bg-shutter shadow-[1px_1px_0px_#C2410C] scale-125'
                  : 'bg-border group-hover:bg-text-muted'
              }`}
            />
            <span className="text-[10px] font-mono tracking-wider">
              {stage.number}
            </span>
            <span className="text-[10px] font-display uppercase tracking-wide hidden lg:inline">
              {t(stage.key)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

const HOMEPAGE_DATA_QUERY = `#graphql
  fragment FeaturedCollectionItem on Collection {
    id
    title
    description
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query HomepageData($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      name
      description
    }
    collections(first: 10, sortKey: UPDATED_AT) {
      nodes {
        ...FeaturedCollectionItem
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 6, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
