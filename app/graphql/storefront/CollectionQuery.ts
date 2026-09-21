// Query 3: Lấy bộ sưu tập theo handle kèm danh sách sản phẩm (Storefront API 2026-07)
export const GET_COLLECTION_BY_HANDLE_QUERY = `#graphql
  query GetCollectionByHandle($handle: String!, $n: Int) {
    collection(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      image {
        url
        altText
      }
      products(first: $n) {
        edges {
          node {
            id
            title
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              url
              altText
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
` as const;
