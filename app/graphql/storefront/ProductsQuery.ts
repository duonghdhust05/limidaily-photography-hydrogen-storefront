// Query 2: Danh sách n sản phẩm đầu tiên kèm m biến thể và dải giá (Storefront API 2026-07)
export const GET_PRODUCTS_WITH_VARIANTS_QUERY = `#graphql
  query GetProductsWithVariants($n: Int!, $m: Int!) {
    products(first: $n) {
      edges {
        node {
          id
          title
          handle
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          featuredImage {
            url
            altText
            width
            height
          }
          variants(first: $m) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
` as const;

// Query 7: Phân trang sản phẩm bằng con trỏ cursor-based (Storefront API 2026-07)
export const GET_PRODUCTS_WITH_CURSOR_PAGINATION_QUERY = `#graphql
  query GetProductsWithCursorPagination($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          title
          handle
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;
