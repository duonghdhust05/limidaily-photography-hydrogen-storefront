import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
  useLocation,
} from 'react-router';
import {Link} from '~/components/Link';
import type {Route} from './+types/root';
import favicon from '~/assets/favicon.svg';
import {FOOTER_QUERY, HEADER_QUERY, SIDEBAR_QUERY} from '~/lib/fragments';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import {PageLayout} from './components/PageLayout';
import {
  getLocaleFromRequest,
  getLocaleFromPathname,
  getPathWithoutLocale,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  type Locale,
} from '~/lib/i18n';
import {useTranslation} from '~/lib/translations';

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Revalidate root loader when transitioning between market locales dynamically
  const currentLocale = getLocaleFromPathname(currentUrl.pathname);
  const nextLocale = getLocaleFromPathname(nextUrl.pathname);
  if (currentLocale.pathPrefix !== nextLocale.pathPrefix) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const selectedLocale = getLocaleFromRequest(args.request);

  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args, selectedLocale);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args, selectedLocale);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    selectedLocale,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: selectedLocale.country,
      language: selectedLocale.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs, selectedLocale: Locale) {
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheShort(),
      variables: {
        headerMenuHandle: 'main-menu',
        country: selectedLocale.country,
        language: selectedLocale.language,
      },
    }),
  ]);

  return {header};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs, selectedLocale: Locale) {
  const {storefront, customerAccount, cart} = context;

  // Automatically ensure existing cart buyer identity matches active market country
  const cartPromise = cart
    .get()
    .then(async (cartData) => {
      if (
        cartData?.id &&
        cartData.buyerIdentity?.countryCode &&
        cartData.buyerIdentity.countryCode !== selectedLocale.country
      ) {
        try {
          await cart.updateBuyerIdentity({
            countryCode: selectedLocale.country,
          });
          // Crucial: Refetch complete cart with CART_QUERY_FRAGMENT so lines, bundles, and converted prices are fully loaded
          return (await cart.get()) ?? cartData;
        } catch (e) {
          console.error('Failed to sync buyer identity on market change:', e);
          return cartData;
        }
      }
      return cartData;
    })
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheShort(),
      variables: {
        footerMenuHandle: 'footer',
        country: selectedLocale.country,
        language: selectedLocale.language,
      },
    })
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  // defer the sidebar query (hardware collections and journal articles)
  const sidebar = storefront
    .query(SIDEBAR_QUERY, {
      cache: storefront.CacheShort(),
      variables: {
        country: selectedLocale.country,
        language: selectedLocale.language,
      },
    })
    .catch((error: Error) => {
      console.error('Failed to load sidebar data:', error);
      return null;
    });

  return {
    cart: cartPromise,
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
    sidebar,
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  const data = useRouteLoaderData<RootLoader>('root');
  const location = useLocation();
  const selectedLocale = data?.selectedLocale ?? DEFAULT_LOCALE;
  const htmlLang = selectedLocale.language.toLowerCase();
  const rawPath = getPathWithoutLocale(location.pathname);

  return (
    <html lang={htmlLang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <link rel="stylesheet" href={tailwindCss}></link>
        {/* Dynamic SEO Hreflang Alternates */}
        {SUPPORTED_LOCALES.map((loc) => {
          const rawPref = loc.pathPrefix || '';
          const prefix = rawPref ? (rawPref.startsWith('/') ? rawPref : `/${rawPref}`) : '';
          const href = `${prefix}${rawPath === '/' ? '' : rawPath}` || '/';
          return (
            <link
              key={`hreflang-${loc.language}-${loc.country}`}
              rel="alternate"
              hrefLang={`${loc.language.toLowerCase()}-${loc.country.toLowerCase()}`}
              href={href}
            />
          );
        })}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={rawPath || '/'}
        />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-canvas text-text-main antialiased selection:bg-orange-100 selection:text-orange-900">
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <PageLayout
        key={`${data.selectedLocale?.language}-${data.selectedLocale?.country}`}
        {...data}
      >
        <Outlet />
      </PageLayout>
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const {t} = useTranslation();
  let errorMessage = 'Unknown telemetry exception';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  const isNotFound = errorStatus === 404;

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl rounded-sm border border-border bg-surface p-6 sm:p-10 shadow-sm">
        {/* Terminal Header Badge */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div className="inline-flex items-center gap-2 rounded-xs border border-border bg-plate/60 px-3 py-1 text-[10px] font-display font-semibold tracking-widest text-shutter uppercase shadow-2xs">
            {isNotFound
              ? t('error_404_badge')
              : `${t('error_500_badge')} ${errorStatus}`}
          </div>
          <span className="font-mono text-xs text-text-subtle">
            STATUS: {errorStatus}
          </span>
        </div>

        {/* Title and Explanation */}
        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-text-main mb-3">
          {isNotFound
            ? t('error_404_title')
            : t('error_500_title')}
        </h1>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-body mb-6">
          {isNotFound
            ? t('error_404_desc')
            : t('error_500_desc')}
        </p>

        {/* Diagnostic Output Log */}
        {errorMessage && (
          <div className="rounded-xs border border-border bg-plate/40 p-4 mb-8">
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-subtle mb-1">
              DIAGNOSTIC LOG:
            </div>
            <pre className="font-mono text-xs text-text-main whitespace-pre-wrap break-all overflow-x-auto">
              {errorMessage}
            </pre>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xs bg-shutter border border-shutter-hover px-6 py-3 text-xs font-display font-bold uppercase tracking-wider text-white shadow-xs hover:bg-shutter-hover active:translate-x-px active:translate-y-px transition-all cursor-pointer tactile-btn"
          >
            <span>{t('error_return_home')}</span>
          </Link>
          <Link
            to="/collections/all"
            className="inline-flex items-center gap-2 rounded-xs border border-border bg-plate/60 px-6 py-3 text-xs font-display font-bold uppercase tracking-wider text-text-main shadow-2xs hover:border-shutter hover:text-shutter active:translate-x-px active:translate-y-px transition-all cursor-pointer tactile-btn"
          >
            <span>{t('error_inspect_hardware')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
