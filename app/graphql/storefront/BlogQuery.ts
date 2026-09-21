// Query 5: Danh sách n bài viết blog chuẩn SEO kèm tác giả và ngày xuất bản (Storefront API 2026-07)
export const GET_BLOG_ARTICLES_QUERY = `#graphql
  query GetBlogArticles($blogHandle: String!, $n: Int!) {
    blog(handle: $blogHandle) {
      id
      title
      articles(first: $n) {
        edges {
          node {
            id
            title
            handle
            excerpt
            contentHtml
            publishedAt
            authorV2 {
              name
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
