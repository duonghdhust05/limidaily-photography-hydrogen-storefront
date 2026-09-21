// Query 4: Chi tiết sản phẩm, tùy chọn optionValues và tồn kho biến thể (Storefront API 2026-07)
export const GET_PRODUCT_DETAILS_WITH_VARIANTS_QUERY = `#graphql
  query GetProductDetailsWithVariants($handle: String!, $m: Int!) {
    product(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      vendor
      options {
        id
        name
        optionValues {
          id
          name
        }
      }
      variants(first: $m) {
        edges {
          node {
            id
            title
            sku
            availableForSale
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            image {
              url
              altText
            }
          }
        }
      }
    }
  }
` as const;
