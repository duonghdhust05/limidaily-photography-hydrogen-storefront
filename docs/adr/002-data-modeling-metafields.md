# ADR-002: Chiến Lược Mở Rộng Lược Đồ Dữ Liệu Bằng Shopify Metafields & Metaobjects

> **Trạng thái:** ACCEPTED  
> **Ngày quyết định:** 2026-09-16  
> **Người quyết định:** Hà Đức Dương & Team Engineering  
> **Phân hệ áp dụng:** `Week13-14` (LimiPhotography)  

---

## 1. Bối Cảnh (Context)

Các thiết bị quang học, máy quay điện ảnh, hệ thống chiếu sáng và phụ kiện studio cao cấp của thương hiệu **LimiPhotography** đòi hỏi phải hiển thị các thông số kỹ thuật chuyên biệt và phức tạp:
- **Cấu hình thông số kỹ thuật chi tiết** (ví dụ: kích thước cảm biến Full-Frame, ngàm ống kính, dynamic range 15+ stops, công suất phát quang, độ nhạy ISO...).
- **Danh mục phụ kiện đi kèm trong hộp (In The Box)** (ví dụ: thân máy, pin li-ion, củ sạc, dây đeo, cáp SDI/HDMI...).
- **Khả năng tương thích ngàm & hệ sinh thái** (ví dụ: `Sony E-Mount / Full-Frame`, `Universal Bowens Mount`).
- **Chính sách bảo hành & gói dịch vụ chuyên dụng** (ví dụ: Gói bảo hành cảm biến và bo mạch LimiCare Pro 24 tháng).

Nếu nhồi nhét tất cả các thông tin này vào khung soạn thảo mô tả HTML chung (`descriptionHtml`):
1. Dữ liệu bị phân mảnh, khó kiểm soát chất lượng và không đồng bộ giữa các sản phẩm.
2. Không thể tách riêng thành các khối Accordion / Tab kỹ thuật chuyên nghiệp trong Theme Customizer mà không can thiệp code Liquid phức tạp.
3. Khi sang Phase 2 (Hydrogen Headless), ứng dụng React/Remix sẽ phải parse HTML thô thay vì nhận dữ liệu có cấu trúc (Structured Data) từ GraphQL Storefront API.

---

## 2. Quyết Định Kiến Trúc (Decision)

Chúng tôi quyết định sử dụng tính năng **Shopify Metafields & Metaobjects** cấp Store để chuẩn hóa toàn bộ các thuộc tính kỹ thuật này:

### 2.1. Khai Báo Custom Metafields (Cấp Product)
Trong `Settings > Metafields and metaobjects > Products`:
1. `custom.technical_specifications`: Kiểu `multi_line_text_field`.
2. `custom.package_contents`: Kiểu `multi_line_text_field`.
3. `custom.compatibility`: Kiểu `single_line_text_field`.
4. Ghim (Pin) cả 3 trường này lên giao diện Product Edit của Shopify Admin để Merchant thuận tiện nhập liệu.

### 2.2. Khai Báo Metaobject Độc Lập: `gear_warranty_plan`
Trong `Settings > Metafields and metaobjects > Metaobjects`:
- Tạo thực thể dữ liệu thực thể nhiều trường (Multi-field Entity) đại diện cho chính sách bảo hành thiết bị quang học, gồm: `plan_name`, `duration_months`, `coverage_details`, `support_channel`.
- Liên kết với Product qua Metafield `custom.warranty_plan` (kiểu `metaobject_reference`).

### 2.3. Hiển Thị Động (Dynamic Source Binding)
- Trong Theme Customizer (Phase 1): Sử dụng biểu tượng "Connect dynamic source" để gắn trực tiếp các Metafields này vào các hàng Accordion (Collapsible rows) trên trang chi tiết sản phẩm của theme Dawn.
- Trong Headless Hydrogen (Phase 2): Storefront API query trực tiếp qua:
  ```graphql
  metafields(identifiers: [
    {namespace: "custom", key: "technical_specifications"},
    {namespace: "custom", key: "package_contents"},
    {namespace: "custom", key: "compatibility"}
  ]) {
    key
    value
  }
  ```

---

## 3. Hệ Quả & Đánh Đổi (Consequences)

### Tích cực (Positive):
- Dữ liệu có cấu trúc chuẩn mực, tái sử dụng liền mạch 100% giữa Theme Liquid (Phase 1) và GraphQL Storefront API trên Hydrogen (Phase 2).
- Trải nghiệm mua sắm thiết bị công nghệ điện ảnh cao cấp: Khách hàng dễ dàng tra cứu nhanh thông số cảm biến, ngàm tương thích và phụ kiện đi kèm theo dạng tab/accordion trực quan.
- Tách biệt rõ ràng giữa nội dung marketing (Description) và dữ liệu kỹ thuật (Specs & Metafields).

### Đánh đổi (Trade-offs):
- Bắt buộc phải khai báo Metafields và Metaobjects trước khi nhập liệu sản phẩm.
- Đòi hỏi quy trình nhập liệu nghiêm ngặt hơn: Cả 10 sản phẩm phải có đủ dữ liệu để tránh hiển thị khối rỗng trên giao diện người dùng.
