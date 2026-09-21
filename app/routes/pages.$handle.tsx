import {useState} from 'react';
import {useLoaderData, data, Form, useActionData, useNavigation} from 'react-router';
import {Link} from '~/components/Link';
import type {Route} from './+types/pages.$handle';
import {useTranslation, getTranslationDictionary} from '~/lib/translations';
import {getLocaleFromRequest} from '~/lib/i18n';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {cleanHtmlContent} from '~/lib/htmlSanitizer';
import {
  getClientIp,
  checkRateLimit,
  createRateLimitHeaders,
} from '~/lib/rateLimiter';
import {
  getIdempotencyRecord,
  setIdempotencyRecord,
  generateIdempotencyKey,
} from '~/lib/idempotency';

export interface ContactActionResponse {
  success: boolean;
  dispatchCode?: string;
  error?: string;
}

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `${data?.page.title ?? 'Specification'} | LimiPhotography`}];
};

export async function action({request, params}: Route.ActionArgs) {
  if (params.handle !== 'contact') {
    return data({success: false, error: 'Method not allowed'}, {status: 405});
  }

  // Rate Limiting: Max 3 contact submissions per 5 minutes per client IP
  const clientIp = getClientIp(request);
  const rateLimitKey = `contact-rma:${clientIp}`;
  const rateLimitResult = checkRateLimit(rateLimitKey, {
    maxRequests: 3,
    windowMs: 300_000,
  });

  const selectedLocale = getLocaleFromRequest(request);
  const dict = getTranslationDictionary(selectedLocale.language);
  const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

  if (!rateLimitResult.allowed) {
    return data(
      {
        success: false,
        error: dict.contact_rate_limited,
      },
      {status: 429, headers: rateLimitHeaders},
    );
  }

  const formData = await request.formData();
  const name = formData.get('name')?.toString().trim();
  const email = formData.get('email')?.toString().trim();
  const serial = formData.get('serial')?.toString().trim() || 'NONE';
  const message = formData.get('message')?.toString().trim();
  const idempotencyKey =
    formData.get('idempotencyKey')?.toString() ||
    `rma-${email}-${serial}`;

  if (!name || !email || !message) {
    return data(
      {success: false, error: 'All fields are required.'},
      {status: 400},
    );
  }

  // Idempotency: Return cached dispatch code if identical submission within 30s
  const cached = getIdempotencyRecord<ContactActionResponse>(idempotencyKey);
  if (cached) {
    return data(cached.data, {status: 200});
  }

  const codeSuffix = Math.floor(1000 + Math.random() * 9000);
  const responseData: ContactActionResponse = {
    success: true,
    dispatchCode: `LIMI-${codeSuffix}`,
  };

  setIdempotencyRecord(idempotencyKey, {data: responseData, status: 200});

  return data(responseData, {status: 200});
}

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
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
        language: context.storefront.i18n?.language,
        country: context.storefront.i18n?.country,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

  return {
    page,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Page() {
  const {page} = useLoaderData<typeof loader>();
  const actionData = useActionData<ContactActionResponse>();
  const navigation = useNavigation();
  const {t} = useTranslation();
  const [resetSubmitted, setResetSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    serial: '',
    message: '',
  });

  const isSubmitting = navigation.state === 'submitting';
  const isSuccess = !resetSubmitted && Boolean(actionData?.success && actionData?.dispatchCode);
  const activeDispatchCode = actionData?.dispatchCode || '';

  const sanitizedBody = cleanHtmlContent(page.body);
  const isContactPage = page.handle === 'contact';

  return (
    <main className="min-h-screen bg-canvas text-text-main pb-24">
      {/* 1. Breadcrumb Navigation */}
      <div className="border-b border-border bg-surface/50">
        <div className="mx-auto max-w-5xl px-4 md:px-8 py-3.5">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-display text-text-muted"
          >
            <Link to="/" className="hover:text-text-main transition-colors">
              {t('nav_home')}
            </Link>
            <span className="text-border">/</span>
            <span className="text-shutter font-semibold uppercase truncate">
              {page.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 md:px-8 pt-10">
        <article className="rounded-sm border border-border bg-surface p-6 md:p-12 shadow-xs mb-10">
          {/* Badge & Title */}
          <div className="inline-flex items-center gap-2 rounded-xs border border-border bg-plate/80 px-3 py-1 text-[10px] font-display font-bold tracking-widest text-shutter uppercase shadow-2xs mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-shutter" />
            {isContactPage ? t('contact_badge') : t('page_spec_doc_badge')}
          </div>

          <h1 className="text-2xl md:text-4xl font-display font-extrabold tracking-tight text-text-main mb-8 border-b border-border pb-4">
            {page.title}
          </h1>

          {/* Sanitized Body with Prose Styling */}
          {sanitizedBody && (
            <div
              dangerouslySetInnerHTML={{__html: sanitizedBody}}
              className="prose-industrial text-xs md:text-sm text-text-muted leading-relaxed font-body"
            />
          )}
        </article>

        {/* 2. Specialized Component for Contact Page: Interactive Support & Calibration Form */}
        {isContactPage && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Form Column */}
            <div className="md:col-span-3 rounded-sm border border-border bg-surface p-6 md:p-8 shadow-xs">
              <h2 className="text-lg font-display font-bold text-text-main mb-2">
                {t('contact_form_title')}
              </h2>
              <p className="text-xs text-text-muted mb-6 font-body">
                {t('contact_form_desc')}
              </p>

              {isSuccess ? (
                <div className="rounded-xs border border-shutter/30 bg-shutter/10 p-5 text-xs text-shutter font-display">
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider mb-2">
                    <span className="h-2 w-2 rounded-full bg-shutter animate-ping" />
                    {`[${t('contact_dispatch_logged')} // CODE: ${activeDispatchCode}]`}
                  </div>
                  <p className="text-text-main font-body">
                    {t('contact_success')}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setResetSubmitted(true);
                      setFormData({name: '', email: '', serial: '', message: ''});
                    }}
                    className="mt-4 inline-flex items-center rounded-xs border border-shutter px-3 py-1 text-[11px] font-display uppercase tracking-wider text-shutter hover:bg-shutter hover:text-white transition-colors cursor-pointer"
                  >
                    {t('contact_new_dispatch')}
                  </button>
                </div>
              ) : (
                <Form method="POST" className="space-y-4">
                  <input
                    type="hidden"
                    name="idempotencyKey"
                    defaultValue={generateIdempotencyKey('rma')}
                  />

                  {actionData?.error && (
                    <div className="rounded-xs border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400 font-display">
                      {actionData.error}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-[11px] font-display font-semibold uppercase tracking-wider text-text-muted mb-1"
                    >
                      {t('contact_name')} *
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full rounded-xs border border-border bg-canvas px-3 py-2 text-xs text-text-main focus:border-shutter focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-[11px] font-display font-semibold uppercase tracking-wider text-text-muted mb-1"
                    >
                      {t('contact_email')} *
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full rounded-xs border border-border bg-canvas px-3 py-2 text-xs text-text-main focus:border-shutter focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-serial"
                      className="block text-[11px] font-display font-semibold uppercase tracking-wider text-text-muted mb-1"
                    >
                      {t('contact_serial')}
                    </label>
                    <input
                      id="contact-serial"
                      name="serial"
                      type="text"
                      placeholder="e.g. SN-ARRI-35-9081"
                      value={formData.serial}
                      onChange={(e) => setFormData({...formData, serial: e.target.value})}
                      className="w-full rounded-xs border border-border bg-canvas px-3 py-2 text-xs text-text-main focus:border-shutter focus:outline-none font-mono transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-[11px] font-display font-semibold uppercase tracking-wider text-text-muted mb-1"
                    >
                      {t('contact_message')} *
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full rounded-xs border border-border bg-canvas px-3 py-2 text-xs text-text-main focus:border-shutter focus:outline-none transition-colors font-body"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center rounded-xs bg-shutter py-2.5 px-4 text-xs font-display font-bold uppercase tracking-wider text-white hover:bg-shutter/90 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? t('contact_transmitting') : t('contact_submit')}
                  </button>
                </Form>
              )}
            </div>

            {/* Station Telemetry Column */}
            <div className="md:col-span-2 space-y-4">
              <div className="rounded-sm border border-border bg-surface p-6 shadow-xs">
                <div className="text-[10px] font-mono text-shutter uppercase tracking-widest mb-1">
                  [{t('contact_telemetry_node')}]
                </div>
                <h3 className="text-xs font-display font-bold text-text-main uppercase tracking-wider mb-2">
                  {t('contact_lab_hours')}
                </h3>
                <p className="text-xs font-body text-text-muted leading-relaxed">
                  {t('contact_lab_hours_val')}
                </p>
              </div>

              <div className="rounded-sm border border-border bg-surface p-6 shadow-xs">
                <div className="text-[10px] font-mono text-shutter uppercase tracking-widest mb-1">
                  [{t('contact_physical_station')}]
                </div>
                <h3 className="text-xs font-display font-bold text-text-main uppercase tracking-wider mb-2">
                  {t('contact_lab_address')}
                </h3>
                <p className="text-xs font-body text-text-muted leading-relaxed mb-3">
                  {t('contact_lab_address_val')}
                </p>
                <div className="text-xs font-mono text-shutter border-t border-border/60 pt-2">
                  {t('contact_lab_hotline')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
` as const;
