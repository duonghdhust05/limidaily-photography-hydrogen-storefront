import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useEffect, useId, useRef, useState} from 'react';
import {useFetcher} from 'react-router';
import {useTranslation} from '~/lib/translations';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const {t} = useTranslation();
  const isPage = layout === 'page';
  const className = isPage
    ? 'cart-summary-page w-full max-w-lg mx-auto'
    : 'cart-summary-aside';
  const summaryId = useId();
  const discountsHeadingId = useId();
  const discountCodeInputId = useId();
  const giftCardHeadingId = useId();
  const giftCardInputId = useId();

  return (
    <div aria-labelledby={summaryId} className={className}>
      <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
        <h4 id={summaryId} className="font-display font-bold text-xs uppercase tracking-wider text-text-muted m-0">
          {t('cart_order_summary')}
        </h4>
        <span className="text-[10px] font-mono text-shutter uppercase">
          {t('cart_taxes_included')}
        </span>
      </div>
      <dl role="group" className="cart-subtotal flex items-center justify-between font-display font-bold text-base mb-4 text-text-main">
        <dt>{t('cart_subtotal')}</dt>
        <dd>
          {cart?.cost?.subtotalAmount?.amount ? (
            <Money data={cart?.cost?.subtotalAmount} />
          ) : (
            '-'
          )}
        </dd>
      </dl>
      <CartDiscounts
        discountCodes={cart?.discountCodes}
        discountsHeadingId={discountsHeadingId}
        discountCodeInputId={discountCodeInputId}
      />
      <CartGiftCard
        giftCardCodes={cart?.appliedGiftCards}
        giftCardHeadingId={giftCardHeadingId}
        giftCardInputId={giftCardInputId}
      />
      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />
    </div>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  const {t} = useTranslation();
  if (!checkoutUrl) return null;

  return (
    <div className="mt-4 w-full flex justify-center">
      <a
        href="/checkout"
        target="_self"
        className="w-full inline-flex items-center justify-center gap-2 rounded-xs bg-shutter border border-shutter-hover px-6 py-3.5 text-xs font-display font-bold uppercase tracking-widest text-white shadow-[2px_2px_0px_#9CA3AF] transition-all duration-120 hover:bg-shutter-hover active:translate-x-px active:translate-y-px active:shadow-none tactile-btn text-center cursor-pointer no-underline"
      >
        <span>{t('cart_checkout')}</span>
        <span aria-hidden="true">&rarr;</span>
      </a>
    </div>
  );
}

function CartDiscounts({
  discountCodes,
  discountsHeadingId,
  discountCodeInputId,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
  discountsHeadingId: string;
  discountCodeInputId: string;
}) {
  const {t} = useTranslation();
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <section aria-label={t('cart_discount_code')}>
      {/* Have existing discount, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt id={discountsHeadingId}>{t('cart_discount_code')}</dt>
          <UpdateDiscountForm>
            <div
              className="cart-discount"
              role="group"
              aria-labelledby={discountsHeadingId}
            >
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button type="submit" aria-label={t('cart_remove_discount')}>
                {t('cart_remove')}
              </button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div className="flex items-center gap-2 mt-2">
          <label htmlFor={discountCodeInputId} className="sr-only">
            {t('cart_discount_code')}
          </label>
          <input
            id={discountCodeInputId}
            type="text"
            name="discountCode"
            placeholder={t('cart_discount_code')}
            className="flex-1 min-w-0 rounded-xs border border-border bg-plate/40 px-3 py-2 text-xs font-display text-text-main placeholder:text-text-subtle focus:border-shutter focus:outline-hidden"
          />
          <button
            type="submit"
            aria-label={t('cart_apply')}
            className="rounded-xs border border-border bg-plate/60 px-3.5 py-2 text-xs font-display font-semibold text-text-main hover:border-shutter hover:text-shutter cursor-pointer tactile-btn shrink-0"
          >
            {t('cart_apply')}
          </button>
        </div>
      </UpdateDiscountForm>
    </section>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
  giftCardHeadingId,
  giftCardInputId,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
  giftCardHeadingId: string;
  giftCardInputId: string;
}) {
  const {t} = useTranslation();
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const removeButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const previousCardIdsRef = useRef<string[]>([]);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});
  const [removedCardIndex, setRemovedCardIndex] = useState<number | null>(null);

  useEffect(() => {
    if (giftCardAddFetcher.data) {
      if (giftCardCodeInput.current !== null) {
        giftCardCodeInput.current.value = '';
      }
    }
  }, [giftCardAddFetcher.data]);

  useEffect(() => {
    const currentCardIds = giftCardCodes?.map((card) => card.id) || [];

    if (removedCardIndex !== null && giftCardCodes) {
      const focusTargetIndex = Math.min(
        removedCardIndex,
        giftCardCodes.length - 1,
      );
      const focusTargetCard = giftCardCodes[focusTargetIndex];
      const focusButton = focusTargetCard
        ? removeButtonRefs.current.get(focusTargetCard.id)
        : null;

      if (focusButton) {
        focusButton.focus();
      } else if (giftCardCodeInput.current) {
        giftCardCodeInput.current.focus();
      }

      setRemovedCardIndex(null);
    }

    previousCardIdsRef.current = currentCardIds;
  }, [giftCardCodes, removedCardIndex]);

  const handleRemoveClick = (cardId: string) => {
    const index = previousCardIdsRef.current.indexOf(cardId);
    if (index !== -1) {
      setRemovedCardIndex(index);
    }
  };

  return (
    <section aria-label={t('cart_gift_card')}>
      {giftCardCodes && giftCardCodes.length > 0 && (
        <dl>
          <dt id={giftCardHeadingId}>{t('cart_applied_gift_card')}</dt>
          {giftCardCodes.map((giftCard) => (
            <dd key={giftCard.id} className="cart-discount">
              <RemoveGiftCardForm
                giftCardId={giftCard.id}
                lastCharacters={giftCard.lastCharacters}
                onRemoveClick={() => handleRemoveClick(giftCard.id)}
                buttonRef={(el: HTMLButtonElement | null) => {
                  if (el) {
                    removeButtonRefs.current.set(giftCard.id, el);
                  } else {
                    removeButtonRefs.current.delete(giftCard.id);
                  }
                }}
              >
                <code>***{giftCard.lastCharacters}</code>
                &nbsp;
                <Money data={giftCard.amountUsed} />
              </RemoveGiftCardForm>
            </dd>
          ))}
        </dl>
      )}

      <AddGiftCardForm fetcherKey="gift-card-add">
        <div className="flex items-center gap-2 mt-2">
          <label htmlFor={giftCardInputId} className="sr-only">
            {t('cart_gift_card')}
          </label>
          <input
            id={giftCardInputId}
            type="text"
            name="giftCardCode"
            placeholder={t('cart_gift_card')}
            ref={giftCardCodeInput}
            className="flex-1 min-w-0 rounded-xs border border-border bg-plate/40 px-3 py-2 text-xs font-display text-text-main placeholder:text-text-subtle focus:border-shutter focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={giftCardAddFetcher.state !== 'idle'}
            aria-label={t('cart_apply')}
            className="rounded-xs border border-border bg-plate/60 px-3.5 py-2 text-xs font-display font-semibold text-text-main hover:border-shutter hover:text-shutter cursor-pointer tactile-btn shrink-0"
          >
            {t('cart_apply')}
          </button>
        </div>
      </AddGiftCardForm>
    </section>
  );
}

function AddGiftCardForm({
  fetcherKey,
  children,
}: {
  fetcherKey?: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesAdd}
    >
      {children}
    </CartForm>
  );
}

function RemoveGiftCardForm({
  giftCardId,
  lastCharacters,
  children,
  onRemoveClick,
  buttonRef,
}: {
  giftCardId: string;
  lastCharacters: string;
  children: React.ReactNode;
  onRemoveClick?: () => void;
  buttonRef?: (el: HTMLButtonElement | null) => void;
}) {
  const {t} = useTranslation();
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      {children}
      &nbsp;
      <button
        type="submit"
        aria-label={`${t('cart_remove')} ***${lastCharacters}`}
        onClick={onRemoveClick}
        ref={buttonRef}
      >
        {t('cart_remove')}
      </button>
    </CartForm>
  );
}
