# AGENTS.md — Shopify Hydrogen Headless Storefront (AI Instructions & Technical SSOT)

> **Repository:** `limiphotography-hydrogen-storefront`  
> **Trạng thái:** Chuẩn mực tối cao (Canonical AI Instructions & Technical SSOT)  
> **Kiến trúc:** Shopify Hydrogen 2026.4.x, React Router v7, Vite 8, Tailwind CSS v4, Shopify Oxygen Edge  
> **Thang cấp thẩm quyền (Precedence Ladder):**  
> `Storefront GraphQL Schema` > `docs/architecture.md` > `docs/product/store-specs.md` > `docs/adr/` > `README.md` > `Chat Assumptions`

---

## 1. AI Behavioral Principles (Nguyên Tắc Hành Vi Cốt Lõi)

1. **Think & Verify Before Coding (Kiểm chứng trước khi viết mã):**
   - Luôn đọc và kiểm tra GraphQL queries, Remix Loaders/Actions, và Metafields definitions trước khi sửa đổi.
   - **Tuyệt đối không đoán mò** tên fields, arguments của Storefront API (`@inContext`, `country`, `language`), hay tên namespace/key của Metafield (`custom.technical_specifications`, `custom.package_contents`, `custom.compatibility`).
2. **Zero Sensitive Data Leaks (Bảo vệ thông tin bí mật tuyệt đối):**
   - **TUYỆT ĐỐI CẤM** commit bất kỳ tệp `.env`, `.pem`, `.key`, hoặc chuỗi token đặc quyền (`private storefront tokens`) lên Git.
   - Luôn kiểm tra `.gitignore` và để pre-commit hook hoạt động bình thường.
3. **Controlled Oxygen Deployment (Triển khai Oxygen có kiểm soát):**
   - Nhánh `main`: Tự động deploy hoặc triển khai chính thức lên **Production Environment**.
   - Nhánh `feat/*`, `fix/*`: Triển khai lên **Preview Environment** để nghiệm thu giao diện.
4. **Goal-Driven Verification:**
   - Trước khi commit hoặc tạo PR, bắt buộc phải chạy:
     - `npm run typecheck` (0 errors)
     - `npm run lint` (0 errors)
     - `npm run test` (112 tests pass)
     - `npm run build` (pass 100%)

---

## 2. Tech Stack & Production Architecture

- **Framework & Runtime:** Shopify Hydrogen (`v2026.4.5`), React Router v7 (`7.16.0`), Vite 8, TypeScript Strict.
- **Data Access:** Shopify GraphQL Storefront API (`@inContext(country, language)`).
- **Edge Hosting:** Shopify Oxygen (`gid://shopify/HydrogenStorefront/1000180215`) & MiniOxygen local runtime.
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`).
- **Cart & Commerce Operations:** Headless Cart mutations (`cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove`), Web Checkout redirect với session cookie.
- **Security & Quality:** Rate limiter token-bucket, HTML sanitizer (DOMPurify equivalent), idempotency deduplication cache.

---

## 3. Gitflow & Quality Gates

- **Conventional Commits:** `<type>(<scope>): <short description>`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `deploy`.
  - Scopes: `catalog`, `metafields`, `markets`, `shipping`, `apps`, `theme`, `hydrogen`, `graphql`, `routes`, `cart`, `checkout`, `deploy`, `ui`, `i18n`.
- **Pre-commit Gate:** Husky hook tự động quét mã nguồn chống rò rỉ bí mật và kiểm tra lint/typecheck trước khi commit.
