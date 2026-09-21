import {useLoaderData, data, type HeadersFunction} from 'react-router';
import {Link} from '~/components/Link';
import type {Route} from './+types/cart';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {CartMain} from '~/components/CartMain';
import {getLocaleFromRequest} from '~/lib/i18n';
import {useTranslation, getTranslationDictionary} from '~/lib/translations';
import {
  getIdempotencyRecord,
  setIdempotencyRecord,
  getInFlightPromise,
  setInFlightPromise,
  clearInFlight,
} from '~/lib/idempotency';
import {
  getClientIp,
  checkRateLimit,
  createRateLimitHeaders,
} from '~/lib/rateLimiter';

export const meta: Route.MetaFunction = () => {
  return [{title: `Shopping Cart | LimiPhotography`}];
};

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

export async function action({request, context}: Route.ActionArgs) {
  const {cart} = context;
  const selectedLocale = getLocaleFromRequest(request);
  const dict = getTranslationDictionary(selectedLocale.language);

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryDataReturn;
  let isIdempotentReplay = false;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd: {
      const idempotencyKey =
        (typeof inputs.idempotencyKey === 'string' ? inputs.idempotencyKey : null) ||
        formData.get('idempotencyKey')?.toString() ||
        request.headers.get('x-idempotency-key') ||
        null;

      if (idempotencyKey) {
        // 1. Check if cached record exists within 30s TTL
        const cached = getIdempotencyRecord<CartQueryDataReturn>(idempotencyKey);
        if (cached) {
          result = cached.data;
          isIdempotentReplay = true;
          break;
        }

        // 2. Check if identical request is currently in flight (concurrency lock)
        const inFlight = getInFlightPromise<CartQueryDataReturn>(idempotencyKey);
        if (inFlight) {
          result = (await inFlight).data;
          isIdempotentReplay = true;
          break;
        }

        // 3. First execution: register in-flight and execute mutation
        const executionPromise = cart
          .addLines(inputs.lines)
          .then((res) => {
            setIdempotencyRecord(idempotencyKey, {data: res, status: 200});
            return {
              status: 200,
              headers: {},
              data: res,
              timestamp: Date.now(),
              expiresAt: Date.now() + 30_000,
            };
          })
          .catch((err) => {
            clearInFlight(idempotencyKey);
            throw err;
          });

        setInFlightPromise(idempotencyKey, executionPromise);
        result = (await executionPromise).data;
      } else {
        result = await cart.addLines(inputs.lines);
      }
      break;
    }
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const clientIp = getClientIp(request);
      const rateLimitKey = `discount:${clientIp}`;
      const rateLimitResult = checkRateLimit(rateLimitKey, {
        maxRequests: 5,
        windowMs: 60_000,
      });

      if (!rateLimitResult.allowed) {
        const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
        const currentCart = await cart.get();
        const headers = currentCart?.id ? cart.setCartId(currentCart.id) : new Headers();
        for (const [hKey, hVal] of Object.entries(rateLimitHeaders)) {
          headers.set(hKey, hVal);
        }

        return data(
          {
            cart: currentCart,
            errors: [
              {
                message: `${dict.cart_discount_rate_limited} (${rateLimitResult.retryAfterSeconds}S)`,
              },
            ],
            warnings: [],
            analytics: {
              cartId: currentCart?.id,
            },
          },
          {status: 429, headers},
        );
      }

      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesAdd: {
      const formGiftCardCode = inputs.giftCardCode;

      const giftCardCodes = (
        formGiftCardCode ? [formGiftCardCode] : []
      ) as string[];

      result = await cart.addGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesRemove: {
      const appliedGiftCardIds = inputs.giftCardCodes as string[];
      result = await cart.removeGiftCardCodes(appliedGiftCardIds);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      const clientIp = getClientIp(request);
      const rateLimitKey = `buyer-identity:${clientIp}`;
      const rateLimitResult = checkRateLimit(rateLimitKey, {
        maxRequests: 10,
        windowMs: 60_000,
      });

      if (!rateLimitResult.allowed) {
        // Throttled: gracefully return current cart without spamming Storefront API
        const currentCart = await cart.get();
        const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
        const headers = currentCart?.id ? cart.setCartId(currentCart.id) : new Headers();
        for (const [hKey, hVal] of Object.entries(rateLimitHeaders)) {
          headers.set(hKey, hVal);
        }

        return data(
          {
            cart: currentCart,
            errors: [],
            warnings: [
              {
                message: dict.cart_market_throttled,
              },
            ],
            analytics: {
              cartId: currentCart?.id,
            },
          },
          {status: 429, headers},
        );
      }

      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  if (isIdempotentReplay) {
    headers.set('X-Idempotent-Replay', 'true');
  }
  const {cart: cartResult, errors, warnings} = result;

  const rawRedirectTo = formData.get('redirectTo') ?? null;
  if (typeof rawRedirectTo === 'string') {
    // Prevent open redirect attacks (e.g. //evil.com, https://evil.com, /\evil.com, javascript:)
    const isSafeRelative =
      rawRedirectTo.startsWith('/') &&
      !rawRedirectTo.startsWith('//') &&
      !rawRedirectTo.startsWith('/\\') &&
      !rawRedirectTo.includes(':');
    if (isSafeRelative) {
      status = 303;
      headers.set('Location', rawRedirectTo);
    }
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({context, request}: Route.LoaderArgs) {
  const {cart} = context;
  const selectedLocale = getLocaleFromRequest(request);
  const cartData = await cart.get();

  if (
    cartData?.id &&
    cartData.buyerIdentity?.countryCode &&
    cartData.buyerIdentity.countryCode !== selectedLocale.country
  ) {
    try {
      await cart.updateBuyerIdentity({
        countryCode: selectedLocale.country,
      });
      // Refetch complete cart with full lines and re-priced values
      return (await cart.get()) ?? cartData;
    } catch (e) {
      console.error('Failed to sync buyer identity on cart page load:', e);
      return cartData;
    }
  }

  return cartData;
}

export default function Cart() {
  const cart = useLoaderData<typeof loader>();
  const {t} = useTranslation();

  return (
    <main
      className="cart-page min-h-screen bg-canvas text-text-main pb-24"
      aria-labelledby="cart-page-title"
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
            {t('cart_title')}
          </span>
        </nav>

        {/* Page Header */}
        <header className="relative mb-8 overflow-hidden rounded-sm border border-border bg-surface p-6 md:p-8 shadow-xs flex flex-col items-start gap-2">
          <div className="inline-flex items-center gap-2 rounded-xs border border-border bg-plate/60 px-3 py-1 text-[10px] font-display font-semibold tracking-widest text-shutter uppercase shadow-2xs">
            {t('cart_manifest')}
          </div>
          <h1
            id="cart-page-title"
            className="text-2xl md:text-3xl font-display font-bold tracking-tight text-text-main"
          >
            {t('cart_title')}
          </h1>
        </header>

        <CartMain layout="page" cart={cart} />
      </div>
    </main>
  );
}
