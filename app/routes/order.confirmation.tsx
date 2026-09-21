import {useLoaderData} from 'react-router';
import {Link} from '~/components/Link';
import type {Route} from './+types/order.confirmation';
import {useTranslation} from '~/lib/translations';
import {useSelectedLocale} from '~/lib/i18n';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Order Manifest Confirmed | LimiPhotography'}];
};

export async function loader({request}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const rawOrderNumber = url.searchParams.get('order_number') || url.searchParams.get('order_id');
  const confirmationNumber = url.searchParams.get('confirmation_number') || '7K9P2X8M';
  const orderNumber = rawOrderNumber ? rawOrderNumber.replace(/^#/, '') : '1084';
  
  // Dynamic Payment Method & Gateway resolution from checkout return parameters
  const rawGateway = url.searchParams.get('gateway') || url.searchParams.get('payment_method');
  const paymentMethod = rawGateway ? rawGateway.trim().toUpperCase() : null;

  // Dynamic Shipping Method resolution
  const rawShipping = url.searchParams.get('shipping_method') || url.searchParams.get('shipping_line');
  const shippingMethod = rawShipping ? rawShipping.trim().toUpperCase() : null;

  const customerEmail = url.searchParams.get('email') || null;
  const processedAt = new Date().toISOString();

  return {
    orderNumber,
    confirmationNumber,
    paymentMethod,
    shippingMethod,
    customerEmail,
    processedAt,
  };
}

export default function OrderConfirmation() {
  const {
    orderNumber,
    confirmationNumber,
    paymentMethod,
    shippingMethod,
    customerEmail,
    processedAt,
  } = useLoaderData<typeof loader>();
  const {t} = useTranslation();
  const selectedLocale = useSelectedLocale();

  // Format human-readable date & time
  const formattedDate = new Date(processedAt).toLocaleDateString(
    selectedLocale.language === 'VI' ? 'vi-VN' : 'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );

  return (
    <main
      className="order-confirmation-page min-h-screen bg-canvas text-text-main pb-24"
      aria-labelledby="order-confirmation-title"
    >
      <div className="mx-auto max-w-4xl px-4 md:px-8 pt-8">
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
            {t('order_confirmed_badge')}
          </span>
        </nav>

        {/* Hero Confirmation Card */}
        <div className="rounded-sm border border-border bg-surface p-6 sm:p-10 shadow-sm mb-8">
          {/* Top Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6 mb-8">
            <div className="inline-flex items-center gap-2 rounded-xs border border-signal-green/40 bg-signal-green/10 px-3 py-1.5 text-xs font-display font-bold text-signal-green uppercase tracking-wider shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-signal-green" />
              </span>
              <span>{t('order_confirmed_badge')}</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-text-subtle">
              <span>{t('order_status_paid')}</span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Heading & Order Number Banner */}
          <div className="mb-8">
            <h1
              id="order-confirmation-title"
              className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold tracking-tight text-text-main mb-3"
            >
              {t('order_confirmed_title')}
            </h1>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-body max-w-2xl">
              {t('order_confirmed_desc')}
            </p>
          </div>

          {/* Key Reference Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xs border border-border bg-plate/40 mb-8">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-subtle font-bold">
                {t('account_order_number')}
              </span>
              <span className="text-lg sm:text-xl font-mono font-bold text-shutter tracking-wider">
                #LM-{orderNumber}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-subtle font-bold">
                {t('order_confirmation_hash')}
              </span>
              <span className="text-lg sm:text-xl font-mono font-bold text-text-main tracking-wider">
                {confirmationNumber}
              </span>
            </div>
          </div>

          {/* Technical Transaction Parameters */}
          <div className="mb-8">
            <div className="text-xs font-display font-bold uppercase tracking-wider text-text-muted border-b border-border/80 pb-2 mb-4">
              {t('order_receipt_heading')}
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div className="border border-border/70 rounded-xs p-3 bg-surface/50">
                <dt className="text-[10px] uppercase text-text-subtle font-semibold mb-1">
                  {t('order_payment_method_label')}
                </dt>
                <dd className="text-text-main font-bold">
                  {paymentMethod || t('order_payment_method_val')}
                </dd>
              </div>
              <div className="border border-border/70 rounded-xs p-3 bg-surface/50">
                <dt className="text-[10px] uppercase text-text-subtle font-semibold mb-1">
                  {t('order_shipping_method_label')}
                </dt>
                <dd className="text-text-main font-bold">
                  {shippingMethod || t('order_shipping_method_val')}
                </dd>
              </div>
              <div className="border border-border/70 rounded-xs p-3 bg-surface/50">
                <dt className="text-[10px] uppercase text-text-subtle font-semibold mb-1">
                  {t('order_processing_time_label')}
                </dt>
                <dd className="text-text-main font-bold">
                  {t('order_processing_time_val')}
                </dd>
              </div>
              <div className="border border-border/70 rounded-xs p-3 bg-surface/50">
                <dt className="text-[10px] uppercase text-text-subtle font-semibold mb-1">
                  {t('market_region_label')}
                </dt>
                <dd className="text-text-main font-bold flex items-center gap-1.5">
                  <span>{selectedLocale.flag}</span>
                  <span>{selectedLocale.country} ({selectedLocale.currency})</span>
                </dd>
              </div>
              {customerEmail && (
                <div className="border border-border/70 rounded-xs p-3 bg-surface/50 sm:col-span-2">
                  <dt className="text-[10px] uppercase text-text-subtle font-semibold mb-1">
                    {t('order_dispatch_email')}
                  </dt>
                  <dd className="text-text-main font-bold">
                    {customerEmail}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Warranty & Logistics Value-Add Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="rounded-xs border border-border bg-plate/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-shutter"
                  aria-hidden="true"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-main">
                  {t('order_warranty_title')}
                </h3>
              </div>
              <p className="text-[11px] text-text-muted font-body leading-relaxed">
                {t('order_warranty_desc')}
              </p>
            </div>

            <div className="rounded-xs border border-border bg-plate/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-shutter"
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-main">
                  {t('order_support_title')}
                </h3>
              </div>
              <p className="text-[11px] text-text-muted font-body leading-relaxed">
                {t('order_support_desc')}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
            <Link
              to="/collections/all"
              className="inline-flex items-center justify-center gap-2 rounded-xs bg-shutter border border-shutter-hover px-6 py-3.5 text-xs font-display font-bold uppercase tracking-wider text-white shadow-xs hover:bg-shutter-hover active:translate-x-px active:translate-y-px transition-all cursor-pointer tactile-btn text-center"
            >
              <span>{t('order_continue_shopping')}</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
            {/*
            <Link
              to="/account/orders"
              className="inline-flex items-center justify-center gap-2 rounded-xs border border-border bg-plate/60 px-6 py-3.5 text-xs font-display font-bold uppercase tracking-wider text-text-main shadow-2xs hover:border-shutter hover:text-shutter active:translate-x-px active:translate-y-px transition-all cursor-pointer tactile-btn text-center"
            >
              <span>{t('order_check_history')}</span>
            </Link>
            */}
            <Link
              to="/"
              className="text-xs font-display text-text-subtle hover:text-text-main underline-offset-4 hover:underline transition-colors px-2 py-3.5"
            >
              {t('nav_home')}
            </Link>
          </div>
        </div>

        {/* Cryptographic Compliance Badge */}
        <div className="text-center font-mono text-[10px] text-text-subtle uppercase tracking-widest">
          {t('order_security_notice')}
        </div>
      </div>
    </main>
  );
}
