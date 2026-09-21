import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {useTranslation} from '~/lib/translations';

export function ProductPrice({
  price,
  compareAtPrice,
  className = '',
  size = 'lg',
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  className?: string;
  size?: 'sm' | 'base' | 'lg';
}) {
  const {t} = useTranslation();
  const priceTextSize =
    size === 'sm'
      ? 'text-xs sm:text-sm font-display font-bold tabular-nums tracking-tight text-text-main'
      : size === 'base'
      ? 'text-base md:text-lg font-display font-bold tabular-nums tracking-tight text-text-main'
      : 'text-2xl md:text-3xl font-display font-bold tabular-nums tracking-tight text-text-main';

  const compareTextSize =
    size === 'sm'
      ? 'text-[10px] sm:text-xs tabular-nums line-through text-text-subtle'
      : size === 'base'
      ? 'text-xs md:text-sm tabular-nums line-through text-text-subtle'
      : 'text-sm md:text-base tabular-nums line-through text-text-subtle';

  return (
    <div
      aria-label="Price"
      className={`product-price flex items-baseline gap-2 sm:gap-3 ${className}`}
      role="group"
    >
      {compareAtPrice ? (
        <div className="product-price-on-sale flex items-baseline gap-2 sm:gap-3">
          {price ? (
            <span className={priceTextSize}>
              <Money data={price} />
            </span>
          ) : null}
          <span className={compareTextSize}>
            <Money data={compareAtPrice} />
          </span>
          {size === 'lg' && (
            <span className="inline-flex items-center rounded-xs border border-orange-300 bg-shutter-light px-2 py-0.5 text-[10px] font-display font-bold tracking-wider text-shutter uppercase shadow-2xs">
              {t('price_special_offer')}
            </span>
          )}
        </div>
      ) : price ? (
        <span className={priceTextSize}>
          <Money data={price} />
        </span>
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
