# 🎬 LimiPhotography — Custom Shopify Hydrogen Headless Storefront

[![Shopify Hydrogen](https://img.shields.io/badge/Shopify%20Hydrogen-2026.4.5-black?logo=shopify)](https://shopify.dev/custom-storefronts/hydrogen)
[![React Router v7](https://img.shields.io/badge/React%20Router-v7.16.0-CA4245?logo=react-router)](https://reactrouter.com/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS-v4.1.6-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-v8.0.1-646CFF?logo=vite)](https://vitejs.dev/)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-5.9.x%20Strict-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Shopify Oxygen Edge](https://img.shields.io/badge/Shopify%20Oxygen-Edge%20Worker-95BF47?logo=shopify)](https://shopify.dev/custom-storefronts/oxygen)
[![Tests](https://img.shields.io/badge/Vitest-112%20Passed-4BB543?logo=vitest)](https://vitest.dev/)

> **Cửa hàng demo:** `intern-ha-duc-duong-store.myshopify.com`  
> **Nền tảng máy chủ biên:** Shopify Oxygen Global Edge Worker (`gid://shopify/HydrogenStorefront/1000180215`)  
> **Phong cách thiết kế:** Studio White Precision Light Style — Tối giản, thẩm mỹ quang học điện ảnh sắc nét  
> **Tiêu chuẩn bảo mật:** Zero Secret Leaks Policy, Husky Pre-Commit Secret Scanner, Rate Limiting, Idempotency

---

## 🌟 Tổng Quan Dự Án (Project Overview)

**LimiPhotography** là nền tảng thương mại điện tử Headless Storefront hiện đại dành cho thương hiệu thiết bị quay phim điện ảnh, máy ảnh mirrorless, ống kính Cine Prime & Zoom, hệ thống ánh sáng studio và phụ kiện rig chuyên nghiệp.

Dự án được xây dựng từ nền tảng **Shopify Hydrogen 2026** và **React Router v7 Framework Mode**, kết nối trực tiếp với **Shopify GraphQL Storefront API** và vận hành trên mạng lưới máy chủ biên toàn cầu **Shopify Oxygen**.

---

## 🚀 Tính Năng Nổi Bật (Key Features)

1. **Kiến Trúc Headless Đa Thị Trường (Shopify Markets & Multi-Currency):**
   - Hỗ trợ chuyển đổi mượt mà giữa thị trường Việt Nam (VND - `vi-VN`) và Quốc tế (USD - `en-US`) với quy tắc làm tròn giá tự động.
   - Tự động đồng bộ `BuyerIdentity` trong giỏ hàng khi người dùng chuyển đổi thị trường qua GraphQL Storefront API.
2. **5 Tuyến Đường Cốt Lõi (Core Routes & Semantic UI):**
   - **Trang chủ (`/`):** Hero section phong cách Studio Cinema, danh mục nổi bật, sản phẩm tiêu biểu.
   - **Bộ sưu tập (`/collections/:handle`):** Phân trang cursor-based, lọc và sắp xếp sản phẩm.
   - **Chi tiết sản phẩm (`/products/:handle`):** Variant picker đa trục (Mount / Kit / Color), cập nhật URL params thời gian thực, hiển thị 3 nhóm Metafields kỹ thuật:
     - `custom.technical_specifications`: Thông số cảm biến, ngàm, dải tần, độ sáng.
     - `custom.package_contents`: Danh sách phụ kiện đóng gói theo hộp.
     - `custom.compatibility`: Hệ ngàm ống kính và hệ sinh thái tương thích.
   - **Giỏ hàng Headless (`/cart`):** Quản lý mutations giỏ hàng (`cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove`), mã hóa phiên cookie HttpOnly và chuyển hướng thanh toán an toàn trực tiếp sang Shopify Hosted Checkout (`checkoutUrl`).
   - **Tạp chí Quang học (`/blogs/:blogHandle/:articleHandle`):** Bài viết hướng dẫn chuyên sâu với Typography chuẩn mực.
3. **An Toàn & Hiệu Năng Vượt Trội (Security & Edge Performance):**
   - **Rate Limiting:** Cơ chế Token Bucket bảo vệ route tìm kiếm khỏi spam.
   - **Idempotency:** Bộ nhớ đệm chống gửi trùng lặp request giỏ hàng.
   - **HTML Sanitizer:** Loại bỏ mã độc XSS từ nội dung mô tả sản phẩm.
   - **Zero Secret Leaks:** Rào chắn Husky quét tự động ngăn chặn commit file `.env` hoặc private tokens.

---

## 🛠️ Hướng Dẫn Cài Đặt Cục Bộ (Local Setup)

### Yêu Cầu Môi Trường
- **Node.js:** Phiên bản `>= 20.x` hoặc `22.x / 24.x LTS`
- **npm:** Phiên bản `>= 10.x`
- **Git**

### 1. Clone Mã Nguồn
```bash
git clone https://github.com/<your-username>/limiphotography-hydrogen-storefront.git
cd limiphotography-hydrogen-storefront
```

### 2. Cài Đặt Thư Viện
```bash
npm install
```
*(Lệnh này sẽ tự động khởi tạo Husky hooks bảo mật qua script `prepare`).*

### 3. Cấu Hình Biến Môi Trường Cục Bộ
Sao chép tệp mẫu và điền thông tin kết nối Storefront API:
```bash
cp .env.example .env
```

Nội dung tệp `.env`:
```env
# Tên miền cửa hàng Shopify
PUBLIC_STORE_DOMAIN=intern-ha-duc-duong-store.myshopify.com

# Token truy vấn Storefront API công khai
PUBLIC_STOREFRONT_API_TOKEN=your_public_storefront_token

# Phiên bản Storefront API
PUBLIC_STOREFRONT_API_VERSION=2025-01

# Khóa mã hóa session cookie giỏ hàng (tối thiểu 32 ký tự)
SESSION_SECRET=your-random-secure-session-secret-key-32-chars

# Token đặc quyền cho server-side queries (tùy chọn)
PRIVATE_STOREFRONT_API_TOKEN=your_private_storefront_api_token
```

> [!TIP]
> Bạn cũng có thể liên kết nhanh với Shopify Oxygen bằng lệnh:
> ```bash
> npx shopify hydrogen link
> ```

### 4. Khởi Chạy Dev Server
```bash
npm run dev
```
Mở trình duyệt tại: `http://localhost:3000`

---

## 🛡️ Rào Chắn Bảo Mật & Quy Trình Gitflow (Security & Gitflow)

### 1. Quy Trình Phân Nhánh (Branching Strategy)
- **`main`:** Nhánh phản ánh mã nguồn Production chính thức, kết nối trực tiếp với **Shopify Oxygen Production Environment**.
- **`feat/*`, `fix/*`:** Các nhánh tính năng hoặc sửa lỗi, tự động tạo **Preview Environment** trên Oxygen khi triển khai.

### 2. Tiêu Chuẩn Commit (Conventional Commits)
Mọi commit phải tuân thủ chuẩn:
```text
<type>(<scope>): <mô tả ngắn gọn bằng tiếng Anh>
```
*Ví dụ:*
- `feat(cart): implement headless cart mutations and session cookie`
- `fix(currency): fix price rounding in VN market`
- `docs(oxygen): update deployment runbook and secret variables guide`

### 3. Husky Pre-Commit Hook (Secret Leak Guard)
Mỗi khi bạn chạy `git commit`, Husky sẽ tự động:
1. 🛡️ **Quét danh sách staged files:** Ngăn chặn ngay lập tức nếu phát hiện `.env`, `.pem`, `.key`, `.shopify/` hoặc tệp nhạy cảm.
2. 🚨 **Quét staged diff:** Chặn nếu phát hiện chuỗi private token (`shpat_...`) bị hardcode.
3. 🧹 **Kiểm tra chất lượng:** Tự động chạy `npm run typecheck` và `npm run lint`.

---

## ☁️ Hướng Dẫn Triển Khai Lên Shopify Oxygen (Oxygen Deployment)

Nền tảng máy chủ biên **Shopify Oxygen** cung cấp hiệu năng sub-second TTFB toàn cầu cho ứng dụng Hydrogen.

### Cách 1: Kết Nối Trực Tiếp GitHub Với Shopify Oxygen (Khuyến Nghị)
1. Truy cập [Shopify Admin](https://admin.shopify.com/store/intern-ha-duc-duong-store).
2. Điều hướng: **Settings** $\to$ **Apps and sales channels** $\to$ chọn **Hydrogen**.
3. Chọn storefront **LimiDaily Pho tography**.
4. Bấm **Connect to GitHub** $\to$ Chọn repository `limiphotography-hydrogen-storefront`.
5. Chọn branch Production là `main`.
6. Cấu hình biến môi trường tại tab **Environments** $\to$ **Environment variables**:
   - `PUBLIC_STORE_DOMAIN`: `intern-ha-duc-duong-store.myshopify.com`
   - `PUBLIC_STOREFRONT_API_TOKEN`: *(Điền token của bạn)*
   - `PUBLIC_STOREFRONT_API_VERSION`: `2025-01`
   - `SESSION_SECRET`: *(Secret, mã hóa cookie)*
   - `PRIVATE_STOREFRONT_API_TOKEN`: *(Secret, server-side)*
7. **Xong!** Mỗi khi push code lên `main`, Oxygen sẽ tự động đóng gói và deploy Production trong vòng 1-2 phút!

### Cách 2: Triển Khai Thủ Công Qua Shopify CLI

#### Triển Khai Bản Preview (Kiểm Thử):
```bash
npm run build
npx shopify hydrogen deploy
```
*CLI sẽ trả về Preview URL dạng:* `https://limidaily-pho-tography-preview-[hash].oxygen.storefronts.shopify.com`

#### Triển Khai Bản Production (Chính Thức):
```bash
npm run build
npx shopify hydrogen deploy --production
```

---

## 🧪 Kiểm Thử & Đảm Bảo Chất Lượng (Quality Gates)

Dự án sở hữu bộ 112 bài kiểm thử tự động (Unit & Integration tests):

```bash
# Kiểm tra an toàn kiểu dữ liệu TypeScript Strict
npm run typecheck

# Kiểm tra quy chuẩn cú pháp ESLint
npm run lint

# Chạy toàn bộ 112 bài test tự động (Vitest)
npm run test

# Kiểm tra đóng gói Production Bundle
npm run build
```

---

## 📚 Bản Đồ Tài Liệu Kỹ Thuật (Documentation Map)

| Tài Liệu | Đường Dẫn | Nội Dung Trọng Tâm |
| :--- | :--- | :--- |
| **Kiến Trúc Hệ Thống** | [docs/architecture.md](docs/architecture.md) | Kiến trúc Shopify Hydrogen, Edge Data Flow, Loaders & Actions |
| **Lộ Trình Phát Triển** | [docs/roadmap.md](docs/roadmap.md) | 5 Milestones hoàn thiện phân hệ Headless Commerce |
| **Quyết Định Kiến Trúc** | [docs/adr/](docs/adr/) | 8 bản ADRs (Theme, Metafields, Markets, GraphQL, Cart, Oxygen...) |
| **Đặc Tả Kỹ Thuật** | [docs/product/store-specs.md](docs/product/store-specs.md) | Đặc tả 10 sản phẩm, 5 routes, 7 bài tập truy vấn GraphQL Storefront |
| **Vận Hành Oxygen** | [docs/engineering/oxygen-deployment.md](docs/engineering/oxygen-deployment.md) | Sổ tay vận hành, rollback khẩn cấp & CI/CD Oxygen |
| **Catalog Sản Phẩm** | [catalog/](catalog/) | 3 tệp CSV dữ liệu sản phẩm, biến thể, options và giá |

---

## 📄 Bản Quyền & Giấy Phép (License)

Dự án được phát triển trong khuôn khổ chương trình đào tạo kỹ thuật Weaverse Internship.  
Phát triển bởi **Hà Đức Dương** (@HaDuong05).  
Giấy phép: MIT.
