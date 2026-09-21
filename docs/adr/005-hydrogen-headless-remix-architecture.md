# ADR-005: Kiến Trúc Headless Storefront Bằng Shopify Hydrogen (Remix & Vite)

> **Trạng thái:** ACCEPTED  
> **Ngày quyết định:** 2026-09-18  
> **Người quyết định:** Hà Đức Dương & Team Engineering  
> **Phân hệ áp dụng:** `Week13-14` (Phase 2 — Custom Hydrogen Headless Storefront)  

---

## 1. Bối Cảnh (Context)

Sau khi hoàn tất Phase 1 (khởi tạo dữ liệu và cấu hình Theme Store trên Shopify Admin), Phase 2 chuyển sang xây dựng một storefront tách rời (Decoupled / Headless Storefront) kết nối trực tiếp với chính Shopify Development Store `LimiPhotography`.

Yêu cầu kỹ thuật cốt lõi:
1. Nền tảng phải tối ưu hóa cho thương mại điện tử: hỗ trợ Server-Side Rendering (SSR), streaming dữ liệu, tối ưu SEO và thời gian tải trang ban đầu (TTFB).
2. Tích hợp sâu với hệ sinh thái Shopify Storefront API mà không cần tự phát triển các thư viện wrapper phức tạp.
3. Hỗ trợ quy trình phát triển hiện đại với TypeScript Strict, Vite bundler, và kiến trúc định tuyến lồng nhau (Nested Routing).
4. **Nguyên tắc trọng tâm tuần này:** Tập trung tuyệt đối vào kiến trúc dữ liệu, routing, loaders, GraphQL queries, Cart và Checkout flow. Giữ markup đơn giản, không tốn thời gian cho CSS cầu kỳ.

---

## 2. Quyết Định Kiến Trúc (Decision)

Chúng tôi quyết định chọn **Shopify Hydrogen** (framework chính thức của Shopify dựa trên **Remix** / React Router framework mode, Vite, TypeScript):

1. **Khởi tạo và Runtime:**
   - Sử dụng lệnh chuẩn: `npm create @shopify/hydrogen@latest`.
   - Chạy trên kiến trúc Edge Server (tương thích Shopify Oxygen / Node runtime).
2. **Mô hình Dữ liệu Server-First (Loaders & Actions):**
   - Sử dụng `loader` của Remix để thực hiện toàn bộ các truy vấn GraphQL Storefront API phía server-side.
   - Trình duyệt chỉ nhận HTML/JSON đã biên dịch hoặc luồng streaming (Suspense), không để lộ Storefront API Private Access Token ở client-side.
   - Xử lý các thao tác đột biến giỏ hàng thông qua `action` function của route.
3. **Chiến lược UI & Styling Tối Giản (Clean Semantic HTML / Tailwind):**
   - Tuân thủ nghiêm ngặt chỉ dẫn: *Trong tuần này, không cần dành thời gian cho CSS đẹp. Mục tiêu là hiểu Hydrogen routing, loaders, Shopify data, GraphQL, cart, và checkout flow. Markup đơn giản, dễ đọc là đủ.*
   - Sử dụng cấu trúc HTML ngữ nghĩa (`<main>`, `<header>`, `<article>`, `<section>`, `<table>`, `<form>`), các lớp Tailwind cơ bản cho grid layout, không cài thêm component libraries nặng (như MUI, AntD).

---

## 3. Hệ Quả & Đánh Đổi (Consequences)

### Tích cực (Positive):
- **Tích hợp sẵn Storefront API Client:** Hydrogen cung cấp sẵn tiện ích `createStorefrontClient` tích hợp các cơ chế caching chuẩn hóa (`CacheShort`, `CacheLong`) và tự động chèn `@inContext` header cho đa tiền tệ / Markets.
- **Tối ưu SEO & Performance:** SSR tự nhiên giúp crawler đọc được đầy đủ dữ liệu sản phẩm, bài viết và schema markup.
- **Tránh bloat code:** Việc giới hạn phạm vi giao diện ở mức tối giản giúp kỹ sư tập trung 100% thời gian vào bản chất kỹ thuật của Headless Commerce: quản lý trạng thái giỏ hàng, kết nối GraphQL và xử lý phân trang.

### Đánh đổi (Trade-offs):
- Kỹ sư cần nắm vững tư duy SSR của Remix: phân biệt rõ ràng mã nào chạy ở Server (`loader`, `action`) và mã nào chạy ở Client (interactive hooks, state).
- Giao diện chưa được chau chuốt bóng bẩy (polish sẽ để dành cho Final Project).
