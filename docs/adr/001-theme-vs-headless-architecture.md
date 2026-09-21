# ADR-001: Lựa Chọn Mô Hình Kiến Trúc Theme Storefront (Phase 1) vs. Hydrogen Headless (Phase 2)

> **Trạng thái:** ACCEPTED  
> **Ngày quyết định:** 2026-09-16  
> **Người quyết định:** Hà Đức Dương & Team Engineering  
> **Phân hệ áp dụng:** `Week13-14`  

---

## 1. Bối Cảnh (Context)

Dự án Week 13-14 có mục tiêu kép: Giúp kỹ sư thực tập hiểu sâu sắc hệ thống thương mại điện tử Shopify từ góc nhìn vận hành thực tế của Merchant, đồng thời nắm bắt công nghệ phát triển Storefront hiện đại bậc nhất hiện nay (Headless Commerce với Hydrogen).

Khi tiếp cận một hệ thống thương mại điện tử Shopify, có hai hướng kiến trúc chính:
1. **Monolithic Liquid Theme (Online Store 2.0):** Giao diện và CMS liên kết chặt chẽ trong nền tảng Shopify.
2. **Headless Commerce (Hydrogen Storefront):** Giao diện chạy độc lập bằng React/Remix, giao tiếp với Shopify backend qua GraphQL Storefront API.

Nếu nhảy ngay vào code Hydrogen mà chưa từng cấu hình sản phẩm, biến thể, thuế, thị trường hay apps trên Shopify Admin, kỹ sư sẽ bị thiếu hụt tư duy miền nghiệp vụ (domain knowledge), không hiểu được nguồn gốc dữ liệu trả về từ GraphQL API.

---

## 2. Quyết Định Kiến Trúc (Decision)

Chúng tôi quyết định áp dụng **Chiến Lược Tiếp Cận Hai Giai Đoạn (Two-Phase Progressive Strategy)**:
1. **Nửa đầu (Phase 1 — Tuần 13): Xây dựng Theme Storefront trên nền Online Store 2.0 (Theme Dawn):**
   - Đóng vai trò Merchant & Theme Customizer.
   - Trực tiếp cấu hình dữ liệu, sản phẩm, variants, metafields, vận chuyển, thị trường và apps.
   - Kiểm chứng trọn vẹn nghiệp vụ mua sắm từ duyệt catalog đến thanh toán.
2. **Nửa sau (Phase 2 — Tuần 14): Xây dựng Hydrogen Headless Storefront:**
   - Kết nối trực tiếp với chính Development Store vừa tạo ở Phase 1.
   - Sử dụng GraphQL Storefront API để query chính các sản phẩm, collections và metafields thực tế đã nhập.

---

## 3. Hệ Quả & Đánh Đổi (Consequences)

### Tích cực (Positive):
- Kỹ sư hiểu thấu đáo 100% vòng đời dữ liệu: từ khi merchant tạo sản phẩm trong Admin đến khi nó xuất hiện trên Storefront API.
- Store dữ liệu của Phase 1 đóng vai trò là "Live Backend" thực thụ cho Phase 2, loại bỏ nhu cầu sử dụng mock data giả lập.
- Tiết kiệm thời gian gỡ lỗi ở Phase 2 vì đã nắm rõ cấu trúc variant, currency và metafield namespaces.

### Đánh đổi (Trade-offs):
- Cần hoàn thành toàn bộ Phase 1 một cách nghiêm túc và chỉn chu trong tuần đầu tiên trước khi chuyển sang viết code React/Hydrogen ở tuần tiếp theo.
