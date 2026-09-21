import {redirect} from 'react-router';
import type {Route} from './+types/cart.$lines';
import {
  getClientIp,
  checkRateLimit,
  createRateLimitHeaders,
} from '~/lib/rateLimiter';
import {getLocaleFromRequest} from '~/lib/i18n';
import {getTranslationDictionary} from '~/lib/translations';

/**
 * Automatically creates a new cart based on the URL and redirects straight to checkout.
 * Expected URL structure:
 * ```js
 * /cart/<variant_id>:<quantity>
 *
 * ```
 *
 * More than one `<variant_id>:<quantity>` separated by a comma, can be supplied in the URL, for
 * carts with more than one product variant.
 *
 * @example
 * Example path creating a cart with two product variants, different quantities, and a discount code in the querystring:
 * ```js
 * /cart/41007289663544:1,41007289696312:2?discount=HYDROBOARD
 *
 * ```
 */
export async function loader({request, context, params}: Route.LoaderArgs) {
  const {cart} = context;
  const {lines} = params;
  if (!lines) return redirect('/cart');

  // Rate Limiting: Max 10 cart creations per 60s per client IP
  const clientIp = getClientIp(request);
  const rateLimitKey = `cart-lines:${clientIp}`;
  const rateLimitResult = checkRateLimit(rateLimitKey, {
    maxRequests: 10,
    windowMs: 60_000,
  });

  if (!rateLimitResult.allowed) {
    const selectedLocale = getLocaleFromRequest(request);
    const dict = getTranslationDictionary(selectedLocale.language);
    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

    return new Response(dict.cart_creation_rate_limited, {
      status: 429,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        ...rateLimitHeaders,
      },
    });
  }

  const linesMap = lines
    .split(',')
    .map((line) => {
      const lineDetails = line.split(':');
      const variantId = lineDetails[0]?.trim();
      const quantity = parseInt(lineDetails[1]?.trim() || '1', 10);

      // Validate numeric variant ID and positive quantity
      if (!variantId || !/^\d+$/.test(variantId) || isNaN(quantity) || quantity <= 0) {
        return null;
      }

      return {
        merchandiseId: `gid://shopify/ProductVariant/${variantId}`,
        quantity,
      };
    })
    .filter((line): line is {merchandiseId: string; quantity: number} => line !== null);

  if (linesMap.length === 0) {
    return redirect('/cart');
  }

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const discount = searchParams.get('discount');
  const discountArray = discount ? [discount] : [];

  // create a cart
  const result = await cart.create({
    lines: linesMap,
    discountCodes: discountArray,
  });

  const cartResult = result.cart;

  if (result.errors?.length || !cartResult) {
    throw new Response('Link may be expired. Try checking the URL.', {
      status: 410,
    });
  }

  // Update cart id in cookie
  const headers = cart.setCartId(cartResult.id);

  // redirect to checkout
  if (cartResult.checkoutUrl) {
    return redirect(cartResult.checkoutUrl, {headers});
  } else {
    throw new Error('No checkout URL found');
  }
}

export default function Component() {
  return null;
}
