import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from '~/components/Link';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {useTranslation} from '~/lib/translations';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

export type LineItemChildrenMap = {[parentId: string]: CartLine[]};
/** Returns a map of all line items and their children. */
function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const children: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const lineChildren = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(lineChildren)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}
/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);

  return (
    <section
      className={className}
      aria-label={layout === 'page' ? 'Cart page' : 'Cart drawer'}
    >
      <CartEmpty hidden={linesCount} layout={layout} />
      <div
        className={
          layout === 'page'
            ? 'cart-details grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'
            : 'cart-details'
        }
      >
        <div className={layout === 'page' ? 'lg:col-span-7' : ''}>
          <ul aria-labelledby="cart-lines">
            {(cart?.lines?.nodes ?? []).map((line) => {
              // we do not render non-parent lines at the root of the cart
              if (
                'parentRelationship' in line &&
                line.parentRelationship?.parent
              ) {
                return null;
              }
              return (
                <CartLineItem
                  key={line.id}
                  line={line}
                  layout={layout}
                  childrenMap={childrenMap}
                />
              );
            })}
          </ul>
        </div>
        {cartHasItems && (
          <div
            className={
              layout === 'page'
                ? 'lg:col-span-5 w-full flex justify-center'
                : 'w-full'
            }
          >
            <CartSummary cart={cart} layout={layout} />
          </div>
        )}
      </div>
    </section>
  );
}

function CartEmpty({
  hidden = false,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  const {t} = useTranslation();
  return (
    <div
      hidden={hidden}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="h-12 w-12 rounded-xs border border-border bg-plate/50 flex items-center justify-center mb-4 text-text-subtle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-plate/60 px-2 py-0.5 text-[9px] font-display font-semibold tracking-widest text-text-muted uppercase mb-2">
        {t('cart_empty_title')}
      </div>
      <p className="text-xs text-text-muted max-w-65 leading-relaxed mb-6 font-body">
        {t('cart_empty_desc')}
      </p>
      <Link
        to="/collections/all"
        onClick={close}
        prefetch="viewport"
        className="inline-flex items-center gap-2 rounded-xs border border-border bg-surface px-5 py-2.5 text-xs font-display font-bold uppercase tracking-wider text-text-main shadow-2xs hover:border-shutter hover:text-shutter active:translate-x-px active:translate-y-px transition-all cursor-pointer tactile-btn"
      >
        {t('cart_empty_cta')}
      </Link>
    </div>
  );
}
