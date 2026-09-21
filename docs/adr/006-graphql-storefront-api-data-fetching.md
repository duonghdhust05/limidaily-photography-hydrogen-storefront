# ADR-006: Chiến Lược Truy Vấn Dữ Liệu Bằng GraphQL Storefront API & GraphiQL

> **Trạng thái:** ACCEPTED  
> **Ngày quyết định:** 2026-09-18  
> **Người quyết định:** Hà Đức Dương & Team Engineering  
> **Phân hệ áp dụng:** `Week13-14` (Phase 2 — Custom Hydrogen Headless Storefront)  

---

## 1. Bối Cảnh (Context)

Khác với mô hình Liquid trong Theme OS 2.0 (nơi các biến toàn cục `product`, `collection`, `cart` được nạp sẵn vào view), trong kiến trúc Headless Storefront, lập trình viên chịu trách nhiệm 100% việc truy vấn dữ liệu từ Shopify SaaS backend thông qua **GraphQL Storefront API**.

Các thách thức kỹ thuật cần chuẩn hóa:
1. Tránh truy vấn thừa thãi (over-fetching) hoặc thiếu hụt trường dữ liệu (under-fetching).
2. Xử lý phân trang cho danh mục sản phẩm lớn mà không dùng số trang truyền thống (`offset`/`limit`).
3. Truy vấn các trường siêu dữ liệu tùy chỉnh (Metafields: thông số kỹ thuật, phụ kiện trong hộp, hệ ngàm tương thích) mà không làm phức tạp hóa query.
4. Kiểm thử tính đúng đắn của query trước khi tích hợp vào code dự án.

---

## 2. Quyết Định Kiến Trúc (Decision)

Chúng tôi quyết định chuẩn hóa quy trình truy vấn dữ liệu theo các nguyên tắc sau:

1. **Công Cụ Kiểm Thử Tiên Quyết: Shopify GraphiQL App:**
   - Trước khi đưa bất kỳ query nào vào route loader, kỹ sư bắt buộc phải thử nghiệm và xác thực trên **Shopify GraphiQL App** (`https://shopify-graphiql-app.shopifycloud.com/login`) kết nối với dev store.
   - Hoàn thành đầy đủ bộ 7 bài tập query chuẩn mực (Shop info, Products & Variants, Collection, Product options, Blog & Articles, Metafields, Pagination).
2. **Quy Chuẩn Colocated Queries:**
   - Mỗi file route (`_index.tsx`, `collections.$handle.tsx`, `products.$handle.tsx`, `blogs.$blogHandle.$articleHandle.tsx`) sở hữu một GraphQL Query Document riêng biệt đặt ngay trong cùng file (hoặc file `.graphql` liền kề).
   - Đặt tên query rõ ràng theo tiền tố route (ví dụ: `HomeQuery`, `ProductQuery`, `CollectionQuery`).
3. **Phân Trang Chuẩn Hóa Cursor-Based Pagination:**
   - Tuyệt đối không dùng logic phân trang số trang (Page 1, Page 2).
   - Áp dụng cấu trúc chuẩn GraphQL Connection: `edges { node { ... } }`, `pageInfo { hasNextPage, hasPreviousPage, startCursor, endCursor }`, kết hợp các tham số `first: $first`, `after: $after`, `last: $last`, `before: $before`.
4. **Truy Vấn Metafields Có Định Hướng (Targeted Metafields):**
   - Sử dụng trường `metafield(namespace: "custom", key: "...")` trực tiếp trên `Product` hoặc `Collection` để trích xuất giá trị 3 Metafields: `technical_specifications`, `package_contents`, và `compatibility`.
5. **Đồng Bộ Thị Trường Qua `@inContext`:**
   - Toàn bộ query khi cần hiển thị giá và ngôn ngữ địa phương hóa sẽ được tự động bao bọc bởi chỉ thị `@inContext(country: $country, language: $language)` dựa trên ngữ cảnh i18n của Hydrogen.

---

## 3. Hệ Quả & Đánh Đổi (Consequences)

### Tích cực (Positive):
- Tối ưu hóa tối đa payload mạng giữa Edge Server của Hydrogen và Shopify GraphQL API.
- Đảm bảo tính mở rộng cao (scalability): Cursor pagination hoạt động cực nhanh ngay cả khi danh mục có hàng chục nghìn sản phẩm, không bị suy giảm hiệu năng như `OFFSET`.
- Dễ dàng debug: Mọi lỗi schema GraphQL được phát hiện sớm ngay từ bước kiểm thử với GraphiQL.

### Đánh đổi (Trade-offs):
- Lập trình viên phải làm quen với cú pháp Connection (`edges`, `node`, `pageInfo`) thay vì mảng phẳng JSON truyền thống.
- Cần quản trị tốt con trỏ `cursor` trên URL query params (`?after=...`).
