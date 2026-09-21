// Query 6: Truy vấn 3 Custom Metafields kỹ thuật của sản phẩm (Storefront API 2026-07)
export const GET_PRODUCT_WITH_METAFIELDS_QUERY = `#graphql
  query GetProductWithMetafields($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      technicalSpecs: metafield(namespace: "custom", key: "technical_specifications") {
        value
        type
      }
      packageContents: metafield(namespace: "custom", key: "package_contents") {
        value
        type
      }
      compatibility: metafield(namespace: "custom", key: "compatibility") {
        value
        type
      }
    }
  }
` as const;
