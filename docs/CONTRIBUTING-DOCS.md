# CONTRIBUTING-DOCS.md — Quy Chuẩn Quản Trị & Đóng Góp Tài Liệu Kỹ Thuật

Tài liệu này định nghĩa các nguyên tắc, tiêu chuẩn định dạng và quy trình bắt buộc trong việc khởi tạo, bảo trì và đồng bộ hóa hệ thống tài liệu kỹ thuật chuẩn mực (Technical SSOT Suite) của phân hệ **Week 13-14**.

---

## 1. Nguyên Tắc Quản Trị Tài Liệu (Documentation Principles)

1. **Docs-as-Code:** Tài liệu kỹ thuật được quản lý phiên bản cùng với mã nguồn trong Git. Mọi thay đổi về kiến trúc, cấu hình store hay API contracts đều phải được phản ánh ngay vào tài liệu trong cùng commit hoặc pull request tương ứng.
2. **Docs-Truth Rule (Nguyên tắc trung thực):**
   - Tuyệt đối không đánh dấu tích `[x]` vào các checklist nếu các hạng mục thực tế chưa được hoàn thành và xác minh.
   - Trạng thái nhiệm vụ trong `.scratch/checkpoint.md` phải phản ánh chính xác hiện trạng thực tế.
3. **No Guesswork (Không đoán mò):**
   - Mọi thông số kỹ thuật (Metafield keys, GraphQL fields, API endpoints, App names) phải đối chiếu từ Shopify Admin hoặc tài liệu chính thức của Shopify.

---

## 2. Cấu Trúc Hệ Thống Tài Liệu Week 13-14

```text
Week13-14/
├── AGENTS.md                          # Chuẩn mực tối cao cho AI Coding Agents (SSOT)
├── README.md                          # Giới thiệu phân hệ & Hướng dẫn khởi động
├── CONTRIBUTING.md                    # Quy chế đóng góp mã nguồn (Remix/Hydrogen)
├── .scratch/
│   ├── checkpoint.md                  # Sổ cái tiến độ sống (Living Ledger SSOT)
│   └── commits.md                     # Kế hoạch commit nguyên tử & Conventional Commits
└── docs/
    ├── CONTRIBUTING-DOCS.md           # [Tài liệu này] Quy chuẩn quản trị tài liệu
    ├── architecture.md                # Kiến trúc hệ sinh thái Shopify & Headless Hydrogen
    ├── roadmap.md                     # Lộ trình 2 giai đoạn: Phase 1 Theme & Phase 2 Hydrogen
    ├── adr/                           # Hồ sơ các quyết định kiến trúc cốt lõi
    │   ├── 001-theme-vs-headless-architecture.md
    │   ├── 002-data-modeling-metafields.md
    │   ├── 003-markets-multi-currency-strategy.md
    │   ├── 004-app-integration-theme-extensions.md
    │   ├── 005-hydrogen-headless-remix-architecture.md
    │   ├── 006-graphql-storefront-api-data-fetching.md
    │   ├── 007-headless-cart-and-checkout-strategy.md
    │   └── 008-oxygen-edge-deployment-strategy.md
    ├── product/                       # Tài liệu sản phẩm & nghiệp vụ
    │   ├── glossary.md                # Từ điển thuật ngữ E-commerce, Hydrogen & GraphQL
    │   └── store-specs.md             # Đặc tả 10 SP, 5 routes Hydrogen, 7 queries thực hành
    ├── engineering/                   # Tài liệu kỹ thuật & quy trình phát triển
    │   ├── dev-setup.md               # Hướng dẫn setup Partner, Dev Store & Hydrogen App
    │   ├── git-workflow.md            # Quy trình Gitflow, Conventional Commits Phase 1 & 2
    │   └── oxygen-deployment.md       # Hướng dẫn triển khai & kiểm soát CI/CD trên Oxygen
    └── qa/                            # Kiểm soát chất lượng
        └── quality-gates.md           # 10 Cổng kiểm định chất lượng (QG-1 đến QG-10)
```

---

## 3. Tiêu Chuẩn Trình Bày (Formatting & Syntax Standards)

### 3.1 GitHub Markdown & Callouts
Sử dụng các khối cảnh báo chuẩn của GitHub để làm nổi bật thông tin quan trọng:
```markdown
> [!NOTE]
> Thông tin ngữ cảnh hoặc hướng dẫn bổ sung.

> [!TIP]
> Thủ thuật tối ưu hóa hoặc mẹo thao tác nhanh trên Shopify Admin.

> [!IMPORTANT]
> Yêu cầu bắt buộc hoặc quy định cốt lõi cần ghi nhớ.

> [!WARNING]
> Cảnh báo rủi ro về xung đột theme, giới hạn API hoặc thất thoát dữ liệu.
```

### 3.2 Sơ Đồ Kiến Trúc Mermaid
Mọi sơ đồ luồng dữ liệu, phân tầng kiến trúc hoặc quy trình nghiệp vụ phải được vẽ bằng Mermaid:
- Bao bọc nhãn node có ký tự đặc biệt bằng dấu ngoặc kép: `id["Label (Extra Info)"]`.
- Không sử dụng thẻ HTML thô bên trong nhãn node.

### 3.3 Quy Chuẩn Hồ Sơ Quyết Định Kiến Trúc (ADR - Architectural Decision Record)
Mỗi tệp tin trong `docs/adr/` phải đặt tên theo định dạng `NNN-<kebab-case-title>.md` (ví dụ: `001-theme-vs-headless-architecture.md`) và tuân thủ cấu trúc chuẩn:
1. **Title:** `# ADR-NNN: <Tên quyết định>`
2. **Metadata:** Trạng thái (`ACCEPTED` / `PROPOSED` / `SUPERSEDED`), Ngày quyết định, Người quyết định.
3. **Context (Bối cảnh):** Vấn đề hoặc thách thức kỹ thuật đặt ra.
4. **Decision (Quyết định):** Giải pháp được chọn và căn cứ lựa chọn.
5. **Consequences (Hệ quả):** Tác động tích cực (Positive) và thách thức/đánh đổi (Negative/Trade-offs).

---

## 4. Quy Trình Đồng Bộ Checkpoint & Bàn Giao (Handover Protocol)

Trước khi kết thúc bất kỳ phiên làm việc nào hoặc khi hoàn thành một nhiệm vụ:
1. Cập nhật `Current HEAD` và thời gian `Last Synchronized` tại Header của `.scratch/checkpoint.md`.
2. Ghi nhận chi tiết các bước đã thực hiện và kết quả đạt được vào mục Task Ledger tương ứng.
3. Cập nhật khối `Quick Resume Protocol` để phiên làm việc tiếp theo có thể tiếp tục ngay lập tức mà không bị mất ngữ cảnh.
