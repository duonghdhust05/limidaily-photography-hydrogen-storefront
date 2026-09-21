import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {useState, useEffect, useRef} from 'react';
import {generateIdempotencyKey} from '~/lib/idempotency';
import {useTranslation} from '~/lib/translations';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
}) {
  const {t} = useTranslation();
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    generateIdempotencyKey('cart'),
  );
  const prevStateRef = useRef<string>('idle');

  return (
    <CartForm
      route="/cart"
      inputs={{lines, idempotencyKey}}
      action={CartForm.ACTIONS.LinesAdd}
    >
      {(fetcher: FetcherWithComponents<unknown>) => {
        // Regenerate key once submission lifecycle transitions back to idle
        if (
          prevStateRef.current !== 'idle' &&
          fetcher.state === 'idle'
        ) {
          prevStateRef.current = 'idle';
          // Queue next key for subsequent addition
          setTimeout(() => setIdempotencyKey(generateIdempotencyKey('cart')), 0);
        } else if (fetcher.state !== 'idle') {
          prevStateRef.current = fetcher.state;
        }

        return (
          <>
            <input
              name="analytics"
              type="hidden"
              value={JSON.stringify(analytics)}
            />
            <input
              name="idempotencyKey"
              type="hidden"
              value={idempotencyKey}
            />
            <button
              type="submit"
              onClick={onClick}
              disabled={disabled ?? fetcher.state !== 'idle'}
              className="w-full rounded-xs bg-shutter border border-shutter-hover px-8 py-3.5 text-sm font-display font-bold uppercase tracking-wider text-white shadow-[2px_2px_0px_#9CA3AF] transition-all duration-120 hover:bg-shutter-hover active:translate-x-px active:translate-y-px active:shadow-none disabled:cursor-not-allowed disabled:bg-plate disabled:text-text-subtle disabled:shadow-none disabled:border-border flex items-center justify-center gap-3 cursor-pointer"
            >
              {fetcher.state !== 'idle' ? (
                <>
                  <span className="h-2 w-2 rounded-xs bg-white animate-pulse" />
                  <span>{t('pdp_adding_to_cart')}</span>
                </>
              ) : (
                children
              )}
            </button>
          </>
        );
      }}
    </CartForm>
  );
}
