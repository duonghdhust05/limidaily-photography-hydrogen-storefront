# ADR-003: Chiến Lược Thương Mại Toàn Cầu, Đa Thị Trường & Đa Tiền Tệ Qua Shopify Markets

> **Trạng thái:** ACCEPTED  
> **Ngày quyết định:** 2026-09-16  
> **Người quyết định:** Hà Đức Dương & Team Engineering  
> **Phân hệ áp dụng:** `Week13-14`  

---

## 1. Bối Cảnh (Context)

Một cửa hàng thương mại điện tử hiện đại cần phục vụ khách hàng trên toàn cầu với các yêu cầu:
- Khách hàng nội địa tại Việt Nam muốn xem giá bằng `VND`, giao diện tiếng Việt và mức cước vận chuyển nội địa (COD / Chuyển khoản).
- Khách hàng quốc tế (Bắc Mỹ, Châu Âu) muốn thanh toán bằng `USD`, giao diện tiếng Anh, giá đã quy đổi theo tỉ giá thị trường kèm quy tắc làm tròn (ví dụ kết thúc bằng `.99`) và phương thức thanh toán bằng thẻ tín dụng quốc tế.

Trước đây, để làm điều này merchant phải tạo nhiều store độc lập (Multi-store setup), gây tốn kém chi phí, khó đồng bộ kho hàng và phức tạp khi phát triển.

---

## 2. Quyết Định Kiến Trúc (Decision)

Chúng tôi quyết định tận dụng **Shopify Markets** để điều phối đa thị trường tập trung trên một store duy nhất:
1. **Phân định 2 thị trường:**
   - **Primary Market (Vietnam):** Tiền tệ gốc `VND`. Ngôn ngữ mặc định: Tiếng Việt. Phí vận chuyển nội địa 30.000₫ (Miễn phí từ 500.000₫).
   - **International Market (United States & Global):** Tiền tệ thanh toán `USD`. Ngôn ngữ hiển thị: English (thông qua Shopify Translate & Adapt). Phí vận chuyển quốc tế Flat-rate $15 USD.
2. **Quy tắc làm tròn giá (Rounding Rules):**
   - Kích hoạt quy tắc làm tròn tự động cho USD để mức giá quy đổi luôn hiển thị đẹp mắt (ví dụ: `$18.99` thay vì `$18.43`).
3. **Bộ chọn thị trường trên Storefront:**
   - Bật Header / Footer country-currency selector trong Theme Dawn để khách hàng có thể chủ động chuyển đổi giữa Việt Nam (VND) và Hoa Kỳ (USD).
4. **Chuẩn bị cho Phase 2 (Hydrogen):**
   - Sử dụng chỉ thị GraphQL `@inContext(country: US, language: EN)` trong Storefront API để nhận dữ liệu giá và ngôn ngữ tương ứng với người mua.

---

## 3. Hệ Quả & Đánh Đổi (Consequences)

### Tích cực (Positive):
- Quản lý tập trung toàn bộ sản phẩm, tồn kho và đơn hàng trên một Admin duy nhất.
- Hỗ trợ trải nghiệm mua sắm bản địa hóa cao cho cả hai tệp khách hàng.
- Nền tảng hoàn hảo để kiểm thử tính năng đa thị trường của GraphQL Storefront API trong Phase 2.

### Đánh đổi (Trade-offs):
- Cần cấu hình kỹ bảng Shipping Profiles và kiểm tra tỉ giá quy đổi để đảm bảo giá bán quốc tế không bị thấp hơn giá vốn.
