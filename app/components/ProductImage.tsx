import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';
import {useTranslation} from '~/lib/translations';

export function ProductImage({
  image,
}: {
  image: ProductVariantFragment['image'];
}) {
  const {t} = useTranslation();

  if (!image) {
    return (
      <div className="aspect-square w-full rounded-sm border border-border bg-canvas flex items-center justify-center text-text-subtle font-display text-xs">
        {t('status_no_media')}
      </div>
    );
  }
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-sm border border-border bg-surface p-4 md:p-8 flex items-center justify-center shadow-xs">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-xs border border-border bg-surface/95 px-2.5 py-1 text-[10px] font-display tracking-widest text-text-muted uppercase shadow-xs">
        <span className="h-1.5 w-1.5 rounded-xs bg-optical-teal" />
        {t('pdp_hardware_view')}
      </div>
      <Image
        alt={image.altText || t('pdp_default_image_alt')}
        aspectRatio="1/1"
        data={image}
        key={image.id}
        sizes="(min-width: 45em) 50vw, 100vw"
        className="h-full w-full object-contain max-h-125 transition-transform duration-300 hover:scale-103"
      />
    </div>
  );
}
