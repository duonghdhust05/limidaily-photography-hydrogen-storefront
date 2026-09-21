import {redirect, useLoaderData} from 'react-router';
import {Link} from '~/components/Link';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  Image,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {useTranslation} from '~/lib/translations';
import {cleanHtmlContent} from '~/lib/htmlSanitizer';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `${data?.product.title ?? 'Product'} | Limi Photography Hardware`},
    {
      name: 'description',
      content:
        data?.product.seo?.description ||
        data?.product.description?.slice(0, 160) ||
        'Buy professional cinema cameras, lenses, and production gear at Limi Photography.',
    },
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs) {
  return {};
}

export default function Product() {
  const {t} = useTranslation();
  const {product} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  const hasMetafields = Boolean(
    product.technicalSpecs?.value ||
      product.packageContents?.value ||
      product.compatibility?.value,
  );

  return (
    <main
      className="min-h-screen bg-canvas text-text-main pb-8"
      aria-labelledby="product-title"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8 pt-8">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-display text-text-muted mb-8 overflow-hidden text-ellipsis whitespace-nowrap"
        >
          <Link to="/" className="hover:text-text-main transition-colors">
            {t('nav_home')}
          </Link>
          <span>/</span>
          <Link to="/collections/all" className="hover:text-text-main transition-colors">
            {t('pdp_breadcrumb_catalog')}
          </Link>
          <span>/</span>
          <span className="text-shutter font-bold uppercase truncate">
            {title}
          </span>
        </nav>

        {/* 2-Column Product Precision Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Media Gallery & Overview & Specifications */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Primary Viewport */}
            <div className="product-gallery">
              <ProductImage image={selectedVariant?.image} />

              {/* Thumbnails Strip */}
              {product.images?.nodes && product.images.nodes.length > 1 && (
                <div
                  className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-4"
                  aria-label="Alternative perspectives"
                >
                  {product.images.nodes.map((img: {id?: string | null; altText?: string | null}, idx: number) => {
                    const isActive = Boolean(
                      img.id && selectedVariant?.image?.id === img.id,
                    );
                    return (
                      <div
                        key={img.id ?? idx}
                        className={`relative aspect-square overflow-hidden rounded-xs border p-1.5 transition-all duration-150 ${
                          isActive
                            ? 'border-shutter bg-shutter-light shadow-xs ring-1 ring-shutter/30'
                            : 'border-border hover:border-border-strong bg-plate/50 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <Image
                          data={img}
                          sizes="120px"
                          aspectRatio="1/1"
                          alt={img.altText || title}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Product Overview Section */}
            {descriptionHtml && (
              <section
                className="rounded-sm border border-border bg-surface p-6 md:p-8 shadow-xs"
                aria-labelledby="desc-heading"
              >
                <div className="inline-flex items-center gap-2 rounded-xs border border-border bg-plate/60 px-3 py-1 text-[10px] font-display font-semibold tracking-widest text-shutter uppercase shadow-2xs mb-4">
                  {t('pdp_overview_badge')}
                </div>
                <h2
                  id="desc-heading"
                  className="text-lg font-display font-bold text-text-main mb-4"
                >
                  {t('pdp_overview_title')}
                </h2>
                <div
                  className="prose max-w-none text-xs md:text-sm text-text-muted leading-relaxed space-y-3 font-body"
                  dangerouslySetInnerHTML={{__html: cleanHtmlContent(descriptionHtml)}}
                />
              </section>
            )}

            {/* Hardware Specifications Table (Custom Metafields SSOT) */}
            {hasMetafields && (
              <section
                className="rounded-sm border border-border bg-surface p-6 md:p-8 shadow-xs overflow-hidden"
                aria-labelledby="specs-heading"
              >
                <div className="inline-flex items-center gap-2 rounded-xs border border-border bg-plate/60 px-3 py-1 text-[10px] font-display font-semibold tracking-widest text-shutter uppercase shadow-2xs mb-4">
                  {t('pdp_specs_badge')}
                </div>
                <h2
                  id="specs-heading"
                  className="text-lg font-display font-bold text-text-main mb-6"
                >
                  {t('pdp_specs_title')}
                </h2>
                <div className="overflow-x-auto rounded-xs border border-border">
                  <table className="w-full text-left font-display text-xs border-collapse">
                    <tbody className="divide-y divide-border">
                      {product.technicalSpecs?.value && (
                        <tr className="transition-colors hover:bg-plate/30">
                          <th
                            scope="row"
                            className="py-3.5 px-4 font-bold text-text-muted uppercase bg-plate/50 w-1/3 border-r border-border"
                          >
                            {t('pdp_specs')}
                          </th>
                          <td className="py-3.5 px-4 text-text-main font-body">
                            {product.technicalSpecs?.value}
                          </td>
                        </tr>
                      )}
                      {product.packageContents?.value && (
                        <tr className="transition-colors hover:bg-plate/30">
                          <th
                            scope="row"
                            className="py-3.5 px-4 font-bold text-text-muted uppercase bg-plate/50 w-1/3 border-r border-border"
                          >
                            {t('pdp_package_contents')}
                          </th>
                          <td className="py-3.5 px-4 text-text-main font-body">
                            {product.packageContents?.value}
                          </td>
                        </tr>
                      )}
                      {product.compatibility?.value && (
                        <tr className="transition-colors hover:bg-plate/30">
                          <th
                            scope="row"
                            className="py-3.5 px-4 font-bold text-text-muted uppercase bg-plate/50 w-1/3 border-r border-border"
                          >
                            {t('pdp_compatibility')}
                          </th>
                          <td className="py-3.5 px-4 text-text-main font-body">
                            {product.compatibility?.value}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Console & Configuration Form */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start flex flex-col gap-6">
            <div className="rounded-sm border border-border bg-surface p-6 md:p-8 flex flex-col gap-6 shadow-sm">
              {/* Brand & Stock Status Header */}
              <div className="flex items-center justify-between gap-3">
                {product.vendor ? (
                  <span className="inline-flex items-center rounded-xs border border-border bg-plate/60 px-2.5 py-1 text-[11px] font-display font-bold tracking-wider text-text-main uppercase">
                    {product.vendor}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-xs border border-border bg-plate/60 px-2.5 py-1 text-[11px] font-display font-bold tracking-wider text-text-main uppercase">
                    {t('nav_units')}
                  </span>
                )}

                {selectedVariant?.availableForSale ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-display font-semibold text-signal-green">
                    <span className="h-2 w-2 rounded-xs bg-signal-green" />
                    {t('pdp_in_stock')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-display text-text-subtle">
                    <span className="h-2 w-2 rounded-xs bg-gray-400" />
                    {t('pdp_out_of_stock')}
                  </span>
                )}
              </div>

              {/* Title & SKU */}
              <div>
                <h1
                  id="product-title"
                  className="text-2xl md:text-3xl font-display font-bold tracking-tight text-text-main mb-2"
                >
                  {title}
                </h1>
                {selectedVariant?.sku && (
                  <p className="text-xs font-display text-text-muted">
                    {t('pdp_sku')}: <span className="text-text-main font-bold">{selectedVariant.sku}</span>
                  </p>
                )}
              </div>

              {/* Price Console Card */}
              <div className="rounded-xs border border-border bg-plate/40 p-4">
                <ProductPrice
                  price={selectedVariant?.price}
                  compareAtPrice={selectedVariant?.compareAtPrice}
                />
                <p className="text-[11px] font-display text-text-muted mt-2">
                  {t('pdp_transit_note')}
                </p>
              </div>

              {/* Variant Selector & Purchase Action */}
              <ProductForm
                productOptions={productOptions}
                selectedVariant={selectedVariant}
              />

              {/* Trust & Assurance Micro-grid */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border text-center">
                <div className="rounded-xs bg-plate/40 border border-border p-2.5">
                  <div className="text-xs font-display font-bold text-text-main">{t('spec_24_month')}</div>
                  <div className="text-[9px] font-display text-text-muted uppercase">{t('spec_factory_warranty')}</div>
                </div>
                <div className="rounded-xs bg-plate/40 border border-border p-2.5">
                  <div className="text-xs font-display font-bold text-shutter">{t('pdp_qc_badge')}</div>
                  <div className="text-[9px] font-display text-text-muted uppercase">{t('curated_bench_tested')}</div>
                </div>
                <div className="rounded-xs bg-plate/40 border border-border p-2.5">
                  <div className="text-xs font-display font-bold text-text-main">{t('pdp_secure')}</div>
                  <div className="text-[9px] font-display text-text-muted uppercase">{t('pdp_transit_shield')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </main>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 6) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    technicalSpecs: metafield(namespace: "custom", key: "technical_specifications") {
      value
    }
    packageContents: metafield(namespace: "custom", key: "package_contents") {
      value
    }
    compatibility: metafield(namespace: "custom", key: "compatibility") {
      value
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
