# CONTRIBUTING.md — Quy Chuẩn Đóng Góp Dự Án Week 13-14

Tài liệu này quy định các chuẩn mực kỹ thuật, quy trình làm việc và nguyên tắc kiểm soát chất lượng bắt buộc đối với tất cả lập trình viên và AI Coding Agents tham gia phát triển phân hệ **Week 13-14 (Shopify Commerce Platform)**.

---

## 1. Nguyên Tắc Cốt Lõi (Core Tenets)

1. **Tuân Thủ Nguồn Chân Lý (SSOT):**
   - Mọi quyết định kỹ thuật phải tuân theo thứ tự ưu tiên:
     `Store Data Thực Tế & GraphQL Schema` > `docs/architecture.md` > `docs/product/store-specs.md` > `docs/adr/` > `README.md` > `Chat Assumptions`.
2. **Cô Lập Tuyệt Đối (Zero Side-Effects):**
   - Nghiêm cấm mọi hành vi chỉnh sửa, format lại code hoặc làm xáo trộn các thư mục của phân hệ đã đóng băng (`Week7-8`, `Week9-10`, `Week11-12`).
3. **Nguyên Tử Hóa Commit (One Concern = One Commit):**
   - Mỗi commit chỉ giải quyết duy nhất một mục tiêu cụ thể.
   - Tuân thủ nghiêm ngặt **Conventional Commits**: `<type>(<scope>): <description>`.
4. **Kiểm Định Đầy Đủ Trước Khi Bàn Giao:**
   - Không được bàn giao công việc khi chưa vượt qua đầy đủ các Quality Gates tương ứng với từng giai đoạn.

---

## 2. Quy Trình Làm Việc (Gitflow & Task Lifecycle)

### 2.1 Các Nhánh Chuẩn
- `main`: Nhánh ổn định, phản ánh trạng thái đã nghiệm thu.
- `feat/<task-name>`: Nhánh phát triển tính năng mới (ví dụ: `feat/store-catalog-setup`, `feat/markets-shipping-config`).
- `fix/<bug-name>`: Nhánh khắc phục lỗi phát sinh (ví dụ: `fix/metafield-binding`, `fix/currency-rounding`).
- `docs/<doc-name>`: Nhánh bổ sung hoặc cập nhật tài liệu kỹ thuật.

### 2.2 Quy Trình 5 Bước Cho Mỗi Nhiệm Vụ
1. **Kiểm tra Checkpoint:** Mở `.scratch/checkpoint.md` để xác định nhiệm vụ đang thực hiện.
2. **Tạo Nhánh:** Khởi tạo nhánh mới từ nhánh `main` mới nhất:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/<task-name>
   ```
3. **Thực Hiện & Tự Đánh Giá:** Hoàn thành cấu hình trên Shopify Admin / Theme Customizer hoặc code tính năng.
4. **Kiểm Thử Qua Quality Gates:** Đối chiếu theo các tiêu chí trong `docs/qa/quality-gates.md`.
5. **Commit & Ghi Nhận Ledger:** Commit mã nguồn theo chuẩn và cập nhật tiến độ vào `.scratch/checkpoint.md`.

---

## 3. Tiêu Chuẩn Cho Từng Phân Kỳ

### 3.1 Nửa Đầu (Phase 1 — Theme Customizer & Admin Operations)
- Dữ liệu store phải chân thực, mô tả đầy đủ, hình ảnh HD chuẩn tỷ lệ.
- Tận dụng tối đa tính năng Online Store 2.0 (Sections, Blocks, Dynamic Sources kết nối Metafields).
- Không nhúng mã JavaScript tùy tiện vào theme khi ứng dụng đã hỗ trợ App Theme Blocks / App Embeds.

### 3.2 Nửa Sau (Phase 2 — Hydrogen Headless Storefront)
- **TypeScript Nghiêm Ngặt:** Bật `strict: true`, tuyệt đối cấm sử dụng `any`. Mọi dữ liệu trả về từ GraphQL loader phải có interface / type rõ ràng.
- **Zero CSS Bloat:** Tuân thủ quy chuẩn của tuần này: *Không tốn thời gian cho CSS đẹp. Markup đơn giản, dễ đọc là đủ. Tập trung vào routing, loaders, Shopify data, GraphQL, cart và checkout flow.* Tránh cài đặt thư viện component phức tạp.
- **GraphiQL-First:** Toàn bộ các câu query/mutation phải được kiểm thử và xác thực trên Shopify GraphiQL App trước khi gắn vào loader/action.
- **Colocated GraphQL Queries:** Đặt query document ngay trong tệp route tương ứng để code trực quan và dễ bảo trì.
- **Server-First Data Fetching:** Toàn bộ truy vấn Storefront API thực hiện trong Remix `loader`; toàn bộ đột biến giỏ hàng (Cart mutations) thực hiện trong Remix `action`. Không thực hiện gọi Storefront API trực tiếp từ client-side component.

