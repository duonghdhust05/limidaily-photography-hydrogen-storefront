# HƯỚNG DẪN THIẾT LẬP MÔI TRƯỜNG PHÁT TRIỂN (DEV SETUP)

> **Tài liệu:** Canonical Development Setup Guide SSOT  
> **Workspace:** `Week13-14`  
> **Mục tiêu:** Thiết lập tài khoản Shopify Partner, tạo Development Store, cài đặt Shopify CLI và chuẩn bị theme Dawn trong 15 phút.  

---

## 1. Yêu Cầu Tiên Quyết (Prerequisites)

- **Node.js:** Phiên bản `>= 20.x LTS` hoặc `>= 22.x LTS` (Khuyến nghị Node 22).
- **Trình duyệt web:** Google Chrome hoặc Microsoft Edge mới nhất.
- **Git:** Đã cấu hình và kết nối SSH/HTTPS với GitHub.
- **Email:** Tài khoản email cá nhân dùng để đăng ký Shopify Partner.

---

## 2. Bước 1: Khởi Tạo Tài Khoản Shopify Partner & Development Store

1. **Đăng ký tài khoản Partner:**
   - Truy cập: [https://partners.shopify.com](https://partners.shopify.com).
   - Bấm **Join now** và hoàn thành các thông tin cơ bản (chọn mục đích: "Building custom apps or stores for clients").
2. **Tạo Development Store:**
   - Tại trang quản trị Partner Dashboard, vào menu **Stores** $\to$ bấm **Add store** $\to$ chọn **Create development store**.
   - **Mục đích sử dụng:** Chọn *"Create a store to test and build"*.
   - **Tên cửa hàng (Store name):** Đặt tên đại diện, ví dụ: `limiphotography-store` (hoặc `intern-ha-duc-duong-photography`).
   - **Phiên bản (Build version):** Chọn phiên bản ổn định mặc định (không tích Developer Preview để đảm bảo tương thích 100% với toàn bộ app).
   - **Dữ liệu mẫu (Data):** Chọn "Start with an empty store" (để tự tay nhập 10 sản phẩm thực tế theo chuẩn [store-specs.md](../product/store-specs.md)).
   - Bấm **Create development store** và chờ khoảng 30–60 giây để hệ sinh thái khởi tạo.

---

## 3. Bước 2: Cài Đặt & Xác Thực Shopify CLI (Tùy Chọn Lập Trình Viên)

Shopify CLI là công cụ dòng lệnh chính thức hỗ trợ tải mã nguồn theme, xem trước thay đổi cục bộ (Local preview) và đồng bộ theme:

```bash
# 1. Cài đặt Shopify CLI toàn cục
npm install -g @shopify/cli @shopify/theme

# 2. Kiểm tra phiên bản CLI đã cài đặt thành công
shopify version

# 3. Đăng nhập vào tài khoản Shopify Partner qua trình duyệt
shopify auth login

# 4. (Tùy chọn) Kéo mã nguồn theme Dawn về máy để kiểm tra cấu trúc Liquid / JSON templates
shopify theme pull --store=limiphotography-store.myshopify.com
```

---

## 4. Bước 3: Thiết Lập Metafields & Metaobjects Trong Admin

Để hỗ trợ hiển thị cấu hình kỹ thuật máy quay, ống kính và phụ kiện trên trang sản phẩm:

### 4.1. Thiết Lập Custom Metafields (Products)
1. Đăng nhập vào Shopify Admin $\to$ Vào **Settings** (biểu tượng bánh răng góc dưới bên trái).
2. Chọn menu **Metafields and metaobjects** $\to$ Chọn **Products**.
3. Bấm **Add definition** để tạo 3 Metafields:
   - **Metafield 1:**
     - Name: `Technical Specifications`
     - Namespace and key: `custom.technical_specifications`
     - Type: Chọn **Multi-line text**
     - Description: *Cấu hình thông số kỹ thuật chi tiết của thiết bị quang học, máy quay và phụ kiện*
     - Bấm **Save** và bấm **Pin** để ghim trường lên trang sản phẩm.
   - **Metafield 2:**
     - Name: `Package Contents`
     - Namespace and key: `custom.package_contents`
     - Type: Chọn **Multi-line text**
     - Description: *Danh sách phụ kiện và thiết bị đóng gói kèm theo trong hộp (In The Box)*
     - Bấm **Save** và bấm **Pin**.
   - **Metafield 3:**
     - Name: `Compatibility`
     - Namespace and key: `custom.compatibility`
     - Type: Chọn **Single line text** (One value)
     - Description: *Hệ ngàm ống kính và chuẩn kết nối tương thích*
     - Bấm **Save** và bấm **Pin**.

### 4.2. Thiết Lập Metaobject: Gear Warranty Plan (Tùy Chọn Mở Rộng)
1. Trong **Settings > Metafields and metaobjects**, chọn tab **Metaobjects** $\to$ bấm **Add definition**.
2. **Name:** `Gear Warranty Plan` (Handle: `gear_warranty_plan`).
3. Thêm các trường dữ liệu:
   - `plan_name` (Single line text)
   - `duration_months` (Integer)
   - `coverage_summary` (Multi-line text)
   - `support_channel` (Single line text)
4. Bấm **Save**. Khi cần gắn gói bảo hành cho từng dòng máy, tạo Metafield kiểu *Metaobject reference* trên Product trỏ vào định nghĩa này.

---

## 5. Bước 4: Kích Hoạt Cổng Thanh Toán Thử Nghiệm (Bogus Test Gateway)

Để kiểm thử trọn vẹn luồng Checkout mà không mất tiền thật:
1. Vào **Settings** $\to$ **Payments**.
2. Tại mục thanh toán của bên thứ ba hoặc nhà cung cấp thẻ:
   - Nếu Shopify Payments chưa khả dụng ở khu vực của bạn: Bấm **See all other providers** $\to$ Tìm kiếm và chọn **(for testing) Bogus Gateway**.
   - Bấm **Activate (for testing) Bogus Gateway**.
3. **Quy tắc thẻ test Bogus Gateway khi thanh toán Checkout:**
   - Tên chủ thẻ (Cardholder name): Nhập bất kỳ (ví dụ: `Nguyen Van A`).
   - Ngày hết hạn (Expiry): Ngày bất kỳ trong tương lai (ví dụ: `12/28`).
   - Mã bảo mật (CVV): 3 số bất kỳ (ví dụ: `123`).
   - **Số thẻ tín dụng (Card Number):**
     - Nhập `1`: Mô phỏng giao dịch **Thành công (Successful)**.
     - Nhập `2`: Mô phỏng giao dịch **Bị ngân hàng từ chối (Declined)**.
     - Nhập `3`: Mô phỏng giao dịch **Lỗi cổng thanh toán (Gateway Error)**.
4. Thiết lập thêm phương thức thanh toán thủ công (Manual Payment Methods):
   - Vào **Settings** $\to$ **Payments** $\to$ Mục **Manual payment methods**.
   - Bấm **Add manual payment method** $\to$ Chọn **Cash on Delivery (COD)** và **Bank Deposit**.

---

## 6. Bước 5: Cài Đặt Theme Dawn & Bật Theme Customizer

1. Tại Shopify Admin, vào **Online Store** $\to$ **Themes**.
2. Theme **Dawn** đã được cài sẵn làm theme mặc định. Nếu chưa có, chọn **Add theme** $\to$ **Visit Theme Store** $\to$ Chọn **Dawn** (Free).
3. Bấm nút **Customize** màu xanh để mở trình chỉnh sửa giao diện Theme Customizer.
4. Mọi tài nguyên đồ họa (Logo, Banner, Favicon) nên lưu trữ tại thư mục assets cục bộ hoặc tải trực tiếp qua Files của Shopify (`Settings > Files`).

---

## 7. Bước 6: Khởi Tạo Dự Án Shopify Hydrogen & Cấu Hình Biến Môi Trường (Phase 2)

### 7.1. Khởi Tạo Dự Án Hydrogen Mới
Tại thư mục gốc của phân hệ `Week13-14/`, thực hiện khởi tạo Hydrogen app:

```bash
npm create @shopify/hydrogen@latest
```

**Các tùy chọn khuyến nghị khi CLI hỏi:**
- **Project name / Directory:** `hydrogen-storefront` (hoặc tên tương đương, ví dụ: `./` nếu cài đặt trực tiếp trong thư mục con).
- **Template:** Chọn `Skeleton` hoặc `Hello World` (đảm bảo code tinh gọn, dễ quản lý loaders/actions).
- **Language:** Chọn `TypeScript` (bắt buộc theo chuẩn mực TypeScript Strict của dự án).
- **Styling:** Chọn `Tailwind CSS`.
- **Install dependencies:** Chọn `Yes` (sử dụng `npm`).

### 7.2. Lấy Storefront API Credentials Từ Shopify Admin
Để Hydrogen có quyền truy vấn catalog sản phẩm và tạo giỏ hàng:
1. Đăng nhập vào Shopify Admin của dev store $\to$ **Settings** $\to$ **Apps and sales channels**.
2. Chọn **Develop apps** (bấm *Allow custom app development* nếu đây là lần đầu tiên).
3. Bấm **Create an app** $\to$ Đặt tên: `LimiPhotography Hydrogen Storefront`.
4. Tại tab **Configuration** $\to$ mục **Storefront API integration** $\to$ Bấm **Configure**:
   - Tích chọn các quyền (Storefront API scopes):
     - `unauthenticated_read_product_listings`: Đọc danh mục sản phẩm và collections.
     - `unauthenticated_read_product_inventory`: Đọc thông tin tồn kho.
     - `unauthenticated_read_product_tags`: Đọc tags sản phẩm.
     - `unauthenticated_read_content`: Đọc các bài viết blog và trang tĩnh.
     - `unauthenticated_write_checkouts` & `unauthenticated_read_checkouts`: Tạo và quản trị checkout.
     - `unauthenticated_write_customers` & `unauthenticated_read_customers`: Đồng bộ tài khoản khách hàng.
5. Bấm **Save** $\to$ Chuyển sang tab **API credentials** $\to$ Bấm **Install app**.
6. Sao chép chuỗi **Storefront API access token** (dạng token công khai hoặc private access token).
7. Mở tệp `.env` tại thư mục `Week13-14/limi-daily-pho-tography` và điền thông tin trong thư mục dự án Hydrogen với nội dung:

```env
# Chuỗi bí mật mã hóa Session Cookie (tối thiểu 32 ký tự)
SESSION_SECRET="limiphotography-hydrogen-secure-session-secret-key-2026"

# Domain cửa hàng Shopify Development Store
PUBLIC_STORE_DOMAIN="limiphotography-store.myshopify.com"

# Public Storefront API Access Token vừa tạo ở bước trên
PUBLIC_STOREFRONT_API_TOKEN="your_storefront_access_token_here"

# Phiên bản Storefront API ổn định
PUBLIC_STOREFRONT_API_VERSION="2025-01"
```

### 7.4. Khởi Chạy Môi Trường Phát Triển Cục Bộ (Local Dev Server)
```bash
# Di chuyển vào thư mục Hydrogen
cd hydrogen-storefront

# Khởi chạy dev server với Vite
npm run dev
```
Trình duyệt sẽ mở ứng dụng tại `http://localhost:3000`.

---

## 8. Bước 7: Cài Đặt & Sử Dụng Shopify GraphiQL App Để Thực Hành 7 Bài Tập Query

Trước khi tích hợp GraphQL queries vào code của route loaders, kỹ sư bắt buộc phải thử nghiệm trực quan qua **Shopify GraphiQL App**:

1. **Truy cập GraphiQL App:**
   - Mở trình duyệt và truy cập: [https://shopify-graphiql-app.shopifycloud.com/login](https://shopify-graphiql-app.shopifycloud.com/login).
   - Nhập domain dev store của bạn: `limiphotography-store.myshopify.com` $\to$ Bấm **Login**.
   - Cấp quyền truy cập ứng dụng vào store nếu được yêu cầu.
2. **Chọn Scope Storefront API:**
   - Tại thanh công cụ của GraphiQL App, đảm bảo endpoint được chọn là **Storefront API** (phiên bản `2025-01`).
3. **Thực hiện đầy đủ 7 bài tập query:**
   - Tham chiếu chi tiết danh sách câu lệnh và cấu trúc dữ liệu mẫu tại [store-specs.md](../product/store-specs.md#7-bộ-7-bài-tập-truy-vấn-graphql-storefront-api-thực-hành).
   - Lưu lại các đoạn query đã chạy thành công để dán trực tiếp vào các route loader tương ứng trong Hydrogen.

