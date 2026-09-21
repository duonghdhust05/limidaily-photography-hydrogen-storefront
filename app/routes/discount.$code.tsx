import {redirect} from 'react-router';
import type {Route} from './+types/discount.$code';
import {
  getClientIp,
  checkRateLimit,
  createRateLimitHeaders,
} from '~/lib/rateLimiter';
import {getLocaleFromRequest} from '~/lib/i18n';
import {getTranslationDictionary} from '~/lib/translations';

/**
 * Automatically applies a discount found on the url
 * If a cart exists it's updated with the discount, otherwise a cart is created with the discount already applied
 *
 * @example
 * Example path applying a discount and optional redirecting (defaults to the home page)
 * ```js
 * /discount/FREESHIPPING?redirect=/products
 *
 * ```
 */
export async function loader({request, context, params}: Route.LoaderArgs) {
  const {cart} = context;
  const {code} = params;

  // Rate Limiting: Max 5 discount code checks per 60s per client IP (shared with cart)
  const clientIp = getClientIp(request);
  const rateLimitKey = `discount:${clientIp}`;
  const rateLimitResult = checkRateLimit(rateLimitKey, {
    maxRequests: 5,
    windowMs: 60_000,
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  let redirectParam =
    searchParams.get('redirect') || searchParams.get('return_to') || '/';

  const isSafeRelative =
    redirectParam.startsWith('/') &&
    !redirectParam.startsWith('//') &&
    !redirectParam.startsWith('/\\') &&
    !redirectParam.includes(':');

  if (!isSafeRelative) {
    // Avoid redirecting to external URLs or executing malicious schemes to prevent phishing attacks
    redirectParam = '/';
  }

  searchParams.delete('redirect');
  searchParams.delete('return_to');

  const redirectUrl = `${redirectParam}?${searchParams}`;

  if (!rateLimitResult.allowed) {
    const selectedLocale = getLocaleFromRequest(request);
    const dict = getTranslationDictionary(selectedLocale.language);
    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

    const acceptHeader = request.headers.get('accept') || '';
    if (acceptHeader.includes('application/json')) {
      return new Response(JSON.stringify({error: dict.cart_discount_rate_limited}), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...rateLimitHeaders,
        },
      });
    }

    const warningUrl = new URL(redirectUrl, request.url);
    warningUrl.searchParams.set('discount_warning', 'rate_limited');
    return redirect(warningUrl.pathname + warningUrl.search, {
      status: 303,
      headers: rateLimitHeaders,
    });
  }

  if (!code) {
    return redirect(redirectUrl);
  }

  const result = await cart.updateDiscountCodes([code]);
  const headers = cart.setCartId(result.cart.id);

  // Using set-cookie on a 303 redirect will not work if the domain origin have port number (:3000)
  // If there is no cart id and a new cart id is created in the progress, it will not be set in the cookie
  // on localhost:3000
  return redirect(redirectUrl, {
    status: 303,
    headers,
  });
}
