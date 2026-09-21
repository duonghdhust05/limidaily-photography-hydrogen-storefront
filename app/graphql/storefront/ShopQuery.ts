// Query 1.1: Lấy thông tin cửa hàng và toàn bộ thị trường hỗ trợ (Storefront API 2026-07)
export const GET_SHOP_AND_LOCALIZATION_QUERY = `#graphql
  query GetShopAndLocalization {
    shop {
      name
      description
      primaryDomain {
        url
        host
      }
      moneyFormat
      shipsToCountries
    }
    localization {
      country {
        isoCode
        name
        currency {
          isoCode
          name
          symbol
        }
      }
      availableCountries {
        isoCode
        name
        currency {
          isoCode
          name
          symbol
        }
      }
      language {
        isoCode
        name
      }
      availableLanguages {
        isoCode
        name
      }
    }
  }
` as const;

// Query 1.2: Lấy thông tin shop theo ngữ cảnh Việt Nam (@inContext Directive)
export const GET_SHOP_IN_VIETNAM_CONTEXT_QUERY = `#graphql
  query GetShopInVietnamContext($n: Int!) @inContext(country: VN, language: VI) {
    localization {
      country {
        isoCode
        name
        currency {
          isoCode
          name
          symbol
        }
      }
    }
    products(first: $n) {
      edges {
        node {
          title
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
` as const;
