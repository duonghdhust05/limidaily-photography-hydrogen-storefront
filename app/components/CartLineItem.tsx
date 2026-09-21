import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from '~/components/Link';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import {useTranslation} from '~/lib/translations';
import type {
  CartApiQueryFragment,
  CartLineFragment,
} from 'storefrontapi.generated';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 * If the line is a parent line that has child components (like warranties or gift wrapping), they are
 * rendered nested below the parent line.
 */
export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;

  return (
    <li key={id} className="cart-line">
      <div className="cart-line-inner flex gap-4 md:gap-4 items-start">
        {image && (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xs border border-border bg-plate/40 p-1 shrink-0 flex items-center justify-center overflow-hidden">
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              height={96}
              loading="lazy"
              width={96}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <Link
                prefetch="intent"
                to={lineItemUrl}
                onClick={() => {
                  if (layout === 'aside') {
                    close();
                  }
                }}
                className="font-display font-semibold text-xs sm:text-sm text-text-main hover:text-shutter transition-colors line-clamp-2 leading-snug"
              >
                {product.title}
              </Link>
              <div className="shrink-0 text-right">
                <ProductPrice price={line?.cost?.totalAmount} size="sm" />
              </div>
            </div>

            {selectedOptions &&
              selectedOptions.filter((opt) => opt.value !== 'Default Title').length > 0 && (
                <ul className="flex flex-wrap gap-1 mt-1 mb-1">
                  {selectedOptions
                    .filter((opt) => opt.value !== 'Default Title')
                    .map((option) => (
                      <li key={option.name}>
                        <span className="inline-block text-[10px] font-mono uppercase bg-plate/60 border border-border px-1.5 py-0.5 rounded-2xs text-text-muted">
                          {option.name}: {option.value}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
          </div>

          <CartLineQuantity line={line} />
        </div>
      </div>

      {lineItemChildren ? (
        <div>
          <ul aria-labelledby={childrenLabelId} className="cart-line-children">
            {lineItemChildren.map((childLine) => (
              <CartLineItem
                childrenMap={childrenMap}
                key={childLine.id}
                line={childLine}
                layout={layout}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  const {t} = useTranslation();
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="cart-line-quantity flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/40">
      {/* Quantity Stepper */}
      <div className="inline-flex items-center rounded-xs border border-border bg-surface shadow-2xs overflow-hidden">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            type="submit"
            aria-label={t('cart_qty_decrease')}
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
            className="cart-qty-btn w-7 h-7 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-plate/60 active:bg-plate disabled:opacity-30 disabled:pointer-events-none transition-colors border-r border-border text-xs cursor-pointer select-none"
          >
            <span>&#8722;</span>
          </button>
        </CartLineUpdateButton>
        <span className="w-8 text-center text-xs font-mono font-bold text-text-main select-none">
          {quantity}
        </span>
        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            type="submit"
            aria-label={t('cart_qty_increase')}
            name="increase-quantity"
            value={nextQuantity}
            disabled={!!isOptimistic}
            className="cart-qty-btn w-7 h-7 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-plate/60 active:bg-plate disabled:opacity-30 disabled:pointer-events-none transition-colors border-l border-border text-xs cursor-pointer select-none"
          >
            <span>&#43;</span>
          </button>
        </CartLineUpdateButton>
      </div>

      {/* Remove Button */}
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  const {t} = useTranslation();
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        disabled={disabled}
        type="submit"
        aria-label={t('cart_remove_item')}
        className="cart-line-remove-btn inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-display font-semibold uppercase tracking-wider text-text-muted hover:text-red-600 hover:border-red-300 border border-border rounded-xs bg-surface hover:bg-red-50/60 transition-all cursor-pointer tactile-btn shadow-2xs"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
        <span>{t('cart_remove')}</span>
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
