# ADR-004: Chiến Lược Tích Hợp Ứng Dụng Qua Theme App Extensions (Zero Theme Pollution)

> **Trạng thái:** ACCEPTED  
> **Ngày quyết định:** 2026-09-16  
> **Người quyết định:** Hà Đức Dương & Team Engineering  
> **Phân hệ áp dụng:** `Week13-14`  

---

## 1. Bối Cảnh (Context)

Trong kiến trúc Online Store 1.0 cũ trước đây, khi cài đặt ứng dụng (như Judge.me reviews, Klaviyo, live chat), các ứng dụng thường tự động chèn các đoạn mã JavaScript/Liquid trực tiếp vào file theme chính `layout/theme.liquid` hoặc tạo hàng loạt file `.liquid` rác trong `snippets/`.

Khi gỡ cài đặt app:
1. Các đoạn mã rác (ghost code) vẫn nằm lại trong theme, gây lỗi console, làm chậm tốc độ tải trang (hại điểm Core Web Vitals) và có nguy cơ xung đột JavaScript với các tính năng khác.
2. Merchant không thể chủ động kéo thả hoặc thay đổi vị trí widget trên giao diện mà phải nhờ developer sửa code.

---

## 2. Quyết Định Kiến Trúc (Decision)

Chúng tôi quyết định áp dụng chuẩn mực **Theme App Extensions** độc quyền của Online Store 2.0 cho toàn bộ 5 ứng dụng trong store:
1. **Tuyệt đối cấm sửa file theme code thô (`theme.liquid`):**
   - Mọi ứng dụng được kích hoạt qua 2 cơ chế chính thức của Shopify:
     - **App Theme Blocks:** Đối với các widget có vị trí hiển thị cụ thể trên trang (ví dụ: Judge.me Star Rating đặt dưới Title sản phẩm; Judge.me Review Widget đặt ở cuối trang sản phẩm).
     - **App Embeds:** Đối với các script hoặc widget chạy toàn cục (ví dụ: Chat bubble của Shopify Inbox).
2. **Quản trị trực quan:**
   - Việc bật, tắt, sắp xếp vị trí được thực hiện 100% qua Theme Customizer.
3. **Nguyên tắc "Clean Uninstall":**
   - Nếu gỡ ứng dụng khỏi Shopify Admin, các Block và Embed tự động biến mất sạch sẽ, không để lại bất kỳ dòng code rác nào trong theme.

---

## 3. Hệ Quả & Đánh Đổi (Consequences)

### Tích cực (Positive):
- Bảo vệ toàn vẹn mã nguồn theme gốc, tốc độ tải trang đạt chuẩn tối ưu.
- Merchant có toàn quyền kiểm soát vị trí và bố cục của các thành phần app trên giao diện.
- Trải nghiệm chuyên nghiệp, an toàn tuyệt đối khi nâng cấp hoặc đổi theme mới.

### Đánh đổi (Trade-offs):
- Phải lựa chọn các ứng dụng hỗ trợ chuẩn Online Store 2.0 Theme App Extensions (tất cả 5 app được chọn: Search & Discovery, Translate & Adapt, Inbox, Judge.me, Klaviyo đều tuân thủ 100% chuẩn này).
