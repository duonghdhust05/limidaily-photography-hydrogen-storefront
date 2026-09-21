import {Link} from '~/components/Link';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {useTranslation} from '~/lib/translations';

export function ProductItem({
  product,
  loading,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
}) {
  const {t} = useTranslation();
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;

  return (
    <Link
      className="group relative flex flex-col justify-between rounded-sm border border-border bg-surface p-4 transition-all duration-150 hover:border-border-strong hover:shadow-[3px_3px_0px_#CBD5E1] text-inherit no-underline"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      <div>
        {/* Product Image Frame */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xs bg-canvas flex items-center justify-center border border-border/70">
          {image ? (
            <Image
              alt={image.altText || product.title}
              aspectRatio="1/1"
              data={image}
              loading={loading}
              className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              sizes="(min-width: 45em) 300px, 100vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-display text-text-subtle">
              {t('status_no_media')}
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-xs bg-surface px-2 py-0.5 border border-border shadow-xs">
            <span className="h-1.5 w-1.5 rounded-xs bg-signal-green" />
            <span className="text-[10px] font-display font-medium tracking-wider text-text-main">
              {t('status_in_stock')}
            </span>
          </div>
        </div>

        {/* Product Metadata */}
        <div className="mt-3.5">
          <h3 className="text-sm font-display font-semibold text-text-main line-clamp-2 min-h-10 leading-snug group-hover:text-shutter transition-colors">
            {product.title}
          </h3>
        </div>
      </div>

      {/* Pricing & CTA Row */}
      <div className="mt-4 pt-3 border-t border-border flex items-end justify-between">
        <div>
          <span className="block text-[10px] font-display tracking-widest text-text-subtle uppercase">
            {t('card_unit_price')}
          </span>
          <span className="text-base font-bold tabular-nums text-text-main tracking-tight">
            <Money data={product.priceRange.minVariantPrice} />
          </span>
        </div>
        <span className="flex items-center gap-1 text-xs font-display font-semibold text-shutter group-hover:translate-x-1 transition-transform">
          {t('card_view_gear')}
        </span>
      </div>
    </Link>
  );
}
