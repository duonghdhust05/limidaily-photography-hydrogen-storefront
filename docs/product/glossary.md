# TỪ ĐIỂN THUẬT NGỮ: SHOPIFY COMMERCE & HEADLESS

> **Tài liệu:** Canonical Product & Engineering Glossary SSOT  
> **Workspace:** `Week13-14`  

---

## 1. Thuật Ngữ Quản Trị Danh Mục & Sản Phẩm (Catalog & Products)

| Thuật ngữ | Khái niệm & Giải thích kỹ thuật |
| :--- | :--- |
| **Product (Sản phẩm)** | Thực thể hàng hóa trung tâm trong Shopify. Chứa các thuộc tính chung: tiêu đề, mô tả, nhà cung cấp, loại sản phẩm, media và tags. |
| **Variant (Biến thể)** | Phiên bản cụ thể của một sản phẩm dựa trên các tùy chọn (Options) như Hệ ngàm (Mount), Bộ combo (Kit) hoặc Màu sắc (Color). Mỗi Variant sở hữu giá, SKU, tồn kho và mã vạch riêng. |
| **Option (Tùy chọn)** | Trục phân loại biến thể. Standard Shopify cho phép tối đa 3 options (ví dụ: Option 1: Mount, Option 2: Kit Option, Option 3: Color) và tối đa 100 variants cho mỗi sản phẩm. |
| **SKU (Stock Keeping Unit)** | Mã định danh duy nhất của từng biến thể sản phẩm dùng để quản lý xuất nhập tồn kho (ví dụ: `CAM-FX6-EMOUNT`, `LNS-50T15-SONYE`). |
| **Compare-at Price** | Giá gốc ban đầu của sản phẩm trước khi giảm giá. Dùng để hiển thị giá gạch ngang và nhãn "Sale" khuyến mãi trên storefront. |
| **Manual Collection** | Bộ sưu tập thủ công do merchant tự tay chọn và thêm từng sản phẩm vào danh sách. |
| **Automated Collection** | Bộ sưu tập tự động (Smart Collection) tự động gom các sản phẩm thỏa mãn điều kiện logic (ví dụ: `Product type is equal to 'Cameras & Optics'` hoặc `Tag is equal to 'studio'`). |
| **Metafield** | Cơ chế mở rộng lược đồ dữ liệu nguyên bản của Shopify. Cho phép lưu trữ các trường dữ liệu tùy biến (ví dụ: thông số cảm biến, danh sách phụ kiện trong hộp, hệ ngàm tương thích) gắn với Product, Collection, Customer hoặc Order. |
| **Metaobject** | Bảng dữ liệu tùy chỉnh do merchant tự định nghĩa (gồm nhiều trường) có thể tái sử dụng trên nhiều sản phẩm (ví dụ: Gói bảo hành thiết bị quang học LimiCare, Hồ sơ Director/Cinematographer). |
| **Inventory Policy** | Quy tắc kiểm soát kho hàng khi số lượng tồn về 0: `Deny` (chặn mua) hoặc `Continue` (cho phép tiếp tục đặt hàng trước). |

---

## 2. Thuật Ngữ Vận Hành & Khách Hàng (Operations & Customers)

| Thuật ngữ | Khái niệm & Giải thích kỹ thuật |
| :--- | :--- |
| **Order Status** | Vòng đời thanh toán của đơn hàng: `Authorized` (đã giữ tiền) $\to$ `Paid` (đã thu tiền) $\to$ `Partially Refunded` / `Refunded` (đã hoàn tiền). |
| **Fulfillment Status** | Trạng thái đóng gói và vận chuyển đơn hàng: `Unfulfilled` (chờ xử lý) $\to$ `In Progress` $\to$ `Fulfilled` (đã giao cho đơn vị vận chuyển kèm mã tracking). |
| **Draft Order** | Đơn hàng nháp do nhân viên tạo thủ công trong Shopify Admin để gửi hóa đơn thanh toán cho khách hàng qua email. |
| **Abandoned Checkout** | Giỏ hàng bị bỏ rơi: Trường hợp khách hàng đã điền thông tin liên hệ/địa chỉ tại trang Checkout nhưng chưa hoàn tất bước thanh toán cuối cùng. |
| **Discount Combination** | Quy tắc cho phép hoặc không cho phép kết hợp nhiều chương trình khuyến mãi trong cùng một đơn hàng (ví dụ: gộp giảm giá sản phẩm với mã miễn phí vận chuyển). |
| **Classic vs New Accounts** | `Classic`: Đăng nhập bằng email + mật khẩu truyền thống. `New Customer Accounts`: Đăng nhập không cần mật khẩu qua mã OTP 6 số gửi về email (bảo mật cao, hỗ trợ Headless tốt). |

---

## 3. Thuật Ngữ Thị Trường Quốc Tế & Thanh Toán (Markets & Global Commerce)

| Thuật ngữ | Khái niệm & Giải thích kỹ thuật |
| :--- | :--- |
| **Shopify Markets** | Trung tâm quản lý thương mại toàn cầu, cho phép cấu hình trải nghiệm mua sắm riêng biệt cho từng quốc gia hoặc khu vực địa lý. |
| **Primary Market** | Thị trường quê nhà / nội địa mặc định của cửa hàng (ví dụ: Vietnam - VND). |
| **Multi-Currency** | Tính năng định giá và thanh toán bằng nhiều loại tiền tệ khác nhau dựa trên vị trí địa lý của khách hàng. |
| **Rounding Rule** | Quy tắc tự động làm tròn giá tiền sau khi quy đổi tỷ giá ngoại tệ (ví dụ: làm tròn số nguyên hoặc kết thúc bằng `.99`). |
| **Shipping Profile** | Hồ sơ cước phí vận chuyển. `General Profile` áp dụng chung cho toàn bộ sản phẩm; `Custom Profile` áp dụng riêng cho hàng cồng kềnh, dễ vỡ. |
| **Shipping Zone** | Phân vùng địa lý giao hàng (ví dụ: Khu vực Đông Nam Bộ, Toàn quốc, hoặc Khu vực Bắc Mỹ). |
| **Bogus Gateway** | Cổng thanh toán giả lập có sẵn trong Shopify Admin dùng để test checkout bằng thẻ tín dụng ảo: nhập số `1` (thành công), `2` (từ chối), `3` (lỗi hệ thống). |

---

## 4. Thuật Ngữ Giao Diện Theme & Tiện Ích Mở Rộng (Storefront & Theme)

| Thuật ngữ | Khái niệm & Giải thích kỹ thuật |
| :--- | :--- |
| **Online Store 2.0 (OS 2.0)** | Kiến trúc theme hiện đại của Shopify, thay thế cấu hình cố định bằng các template JSON linh hoạt, cho phép thêm Sections và Blocks ở mọi trang. |
| **Liquid** | Ngôn ngữ mẫu (Template Engine) do Shopify phát triển bằng Ruby, dùng để render dữ liệu động ra HTML phía máy chủ. |
| **Theme Customizer** | Trình chỉnh sửa giao diện trực quan WYSIWYG của Shopify Admin, cho phép merchant kéo thả sections, blocks và cấu hình theme settings. |
| **App Theme Block** | Khối giao diện do Shopify App cung cấp (viết bằng Liquid/CSS/JS độc lập) mà merchant có thể kéo thả vào bất kỳ Section nào mà không sửa code theme gốc. |
| **App Embed** | Script hoặc widget toàn trang (như chat box, pixel) được kích hoạt qua công tắc bật/tắt trong Theme Settings, không can thiệp vào `theme.liquid`. |
| **Dynamic Source** | Nút liên kết trong Theme Customizer để map trực tiếp trường nhập liệu của Block tới một Metafield của sản phẩm đang hiển thị. |

---

## 5. Thuật Ngữ Headless Commerce, Hydrogen & GraphQL (Phase 2)

| Thuật ngữ | Khái niệm & Giải thích kỹ thuật |
| :--- | :--- |
| **Headless Commerce** | Kiến trúc tách rời hoàn toàn tầng hiển thị người dùng (Frontend) khỏi hệ thống quản trị thương mại (Backend SaaS của Shopify) thông qua GraphQL API. |
| **Shopify Hydrogen** | Bộ framework phát triển Headless Storefront chính thức của Shopify, xây dựng trên nền tảng React 19, Remix (React Router framework mode), Vite và TypeScript Strict. |
| **Shopify Oxygen** | Nền tảng hosting biên (Global Edge Hosting) của Shopify, tối ưu hóa để triển khai và vận hành các ứng dụng Hydrogen với độ trễ cực thấp. |
| **Storefront API** | Giao diện lập trình ứng dụng dạng GraphQL thuần túy, cung cấp quyền truy cập an toàn vào dữ liệu catalog, thông tin shop, giỏ hàng và checkout redirect. |
| **Shopify GraphiQL App** | Công cụ giao diện đồ họa web tương tác (`shopify-graphiql-app.shopifycloud.com`), dùng để viết, kiểm thử, auto-complete và debug các câu lệnh GraphQL Storefront API với live store. |
| **Remix Loader** | Hàm thực thi độc quyền trên môi trường máy chủ (Server-Side) của một route, chịu trách nhiệm gọi `storefront.query()` để nạp dữ liệu trước khi render component ra HTML. |
| **Remix Action** | Hàm thực thi trên máy chủ nhận các HTTP POST request từ UI, chịu trách nhiệm xử lý các đột biến trạng thái giỏ hàng (Cart mutations) và cập nhật session cookie. |
| **@inContext Directive** | Chỉ thị GraphQL trong Storefront API dùng để truyền ngữ cảnh người mua (ví dụ: `@inContext(country: US, language: EN)`) nhằm nhận dữ liệu giá đa tiền tệ và bản dịch tự động. |
| **Cursor-based Pagination** | Cơ chế phân trang dựa trên con trỏ opaque (`first`, `after`, `pageInfo { hasNextPage, endCursor }`) trong GraphQL, đạt hiệu năng tối đa khi tải danh mục lớn. |
| **Cart ID** | Chuỗi định danh GraphQL duy nhất của phiên giỏ hàng (ví dụ: `gid://shopify/Cart/c1-xxxx`), được bảo mật trong Encrypted Session Cookie trên trình duyệt. |
| **Line Item** | Mục hàng cụ thể trong giỏ hàng, liên kết trực tiếp với một `merchandiseId` (Variant ID), đi kèm số lượng (`quantity`), giá và các tùy chọn thuộc tính. |
| **Checkout URL** | Đường dẫn URL thanh toán an toàn chuẩn PCI-DSS Level 1 do Storefront API trả về trong đối tượng `Cart`, dùng để chuyển hướng người mua sang trang Shopify Hosted Checkout. |
| **Query Colocation** | Chuẩn mực đặt định nghĩa GraphQL query ngay trong cùng tệp với route component sử dụng dữ liệu đó, giúp code tường minh và dễ bảo trì. |
| **Sub-request Caching** | Cơ chế lưu cache các truy vấn GraphQL phụ (`CacheShort`, `CacheLong`, `CacheNone`) ở tầng Edge Server của Hydrogen để tối ưu tốc độ phản hồi. |

