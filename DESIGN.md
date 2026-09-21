# DESIGN.md — Limi Photography Hardware & Optics Storefront

**System name:** Limi Photography Commerce Engine  
**Surfaces:** Headless Storefront (Remix / Hydrogen / React 19) · Shopify Hosted Checkout · Shopify Admin  
**Tech Engine:** Shopify Hydrogen v2026.4.x · React Router v7 · Tailwind CSS v4 · Vite 8  

> **Status:** Canonical UI/UX Design Specification & Visual SSOT (Tactile Neo-Industrial — Bauhaus Functionalism)  
> **Authority:** Design & Frontend Architecture  
> **Last reviewed:** 2026-09-19  
> **Path:** `Week13-14/DESIGN.md`  
> **If conflicts:** Live design tokens in `app/styles/tailwind.css` win; update this file to maintain bidirectional truth.  

---

## 0. Triết Lý & Phong Cách Thiết Kế: "Tactile Neo-Industrial" (Dieter Rams & Bauhaus Functionalism)

### 0.1. Tên Phong Cách (Aesthetic Identity)
**Tactile Neo-Industrial** — Sự giao thoa giữa chủ nghĩa công năng Bauhaus ("Hình thức đi sau công năng"), 10 nguyên tắc thiết kế kinh điển của Dieter Rams (Braun), và tính kỷ luật cơ khí chính xác của máy ảnh quang học Leica M & ống kính Carl Zeiss.

Giao diện không đóng vai trò như một trang web thương mại thông thường, mà vận hành như một **bàn điều khiển cơ khí chính xác (Precision Instrument Console)**:
- **Trung thực với vật liệu:** Tôn vinh bề mặt nhôm anot hóa (Anodized Aluminum), khung chassis trắng gia công CNC, đường cắt khớp nối cơ khí 1px dứt khoát.
- **Xúc giác & Phản hồi vật lý (Tactile Feedback):** Mọi nút bấm, cần gạt biến thể và thẻ sản phẩm đều mang lại cảm giác bấm phím cơ học chân thực (tactile clicks) với độ lún 1px và bóng cứng dập nổi.
- **Tuyệt đối không chi tiết thừa:** Loại bỏ hoàn toàn các yếu tố đồ họa rườm rà, đèn tín hiệu giả lập không chức năng, hiệu ứng bóng mờ nhòe vô căn cứ. Mọi yếu tố trên màn hình đều phục vụ việc đánh giá, lựa chọn và sở hữu thiết bị quang học.

### 0.2. Lý do chọn phong cách này & Bảng so sánh từ chối (Rejection Matrix)

| Phong cách bị từ chối | Tại sao thất bại với Limi Photography? |
| :--- | :--- |
| **Generic Cluttered E-commerce** (Amazon, Shopee) | Quá nhiều banner nhấp nháy, popup mã giảm giá lòe loẹt làm mất đi giá trị của những cỗ máy quang học hàng nghìn USD. |
| **Soft Pastel / Lifestyle Store** | Tông màu be, kem, chữ mềm mại chỉ hợp thời trang, hoàn toàn lạc lõng với khung kim loại, thấu kính phi cầu và rig carbon. |
| **Dark Cyberpunk / Terminal Hack** | Tông màu đen kịt cùng hiệu ứng neon gây mỏi mắt, làm méo mó màu sắc thực tế của thiết bị và không phù hợp môi trường làm việc ban ngày. |
| **Unstyled Bare Wireframe** | Quá đơn sơ, thiếu đi sự chỉn chu và độ hoàn thiện cơ khí tinh xảo cần có để tạo dựng niềm tin giao dịch giá trị cao. |

---

## 1. Học Thuyết Hình Học Cơ Khí (The Industrial Geometry Doctrine)

Hệ thống hình học tuân thủ kỷ luật cơ khí chế tác kim loại: các góc vát nhỏ, sắc sảo, mô phỏng góc bo 2px-6px trên thân máy ảnh hợp kim magiê:

| Phân tầng hình học | Bán kính bo góc (Radius) | Vị trí áp dụng | Mục đích công thái học & cảm xúc |
| :--- | :--- | :--- | :--- |
| **Chassis & Panels (Khung thân)** | `rounded-sm` (4px) / `rounded-md` (6px) | Thẻ sản phẩm, Khối danh mục, Khung ảnh Media, Cart Aside Drawer | Mô phỏng khối chassis thiết bị vững chắc, bền bỉ, phân định ranh giới rõ ràng. |
| **Controls & Triggers (Cơ cấu bấm)** | `rounded-xs` (2px) / `rounded-sm` (4px) | Nút Add-to-cart, Nút chọn Option biến thể, Bộ đếm số lượng, Search Bar | Tạo cảm giác như các phím bấm cơ khí (tactile buttons) có thể ấn xuống được. |
| **Data Tags & Badges (Nhãn chỉ báo)** | `rounded-xs` (2px) / `rounded-none` (0px) | Nhãn thương hiệu Vendor, Mã SKU, Thông số kỹ thuật, Chỉ báo In-Stock | Tái hiện tem kim loại dập nổi (metal nameplate) trên thân máy và ống kính. |

> **Nguyên tắc cốt lõi:** Tuyệt đối không dùng các góc bo tròn hình viên thuốc quá lớn (`rounded-full` / `rounded-3xl` > 16px) vì sẽ làm mất đi cảm giác cơ khí chính xác và độ đầm chắc của thiết bị công nghiệp.

---

## 2. Màu Sắc Dưới Góc Độ Vật Liệu & Công Năng (Color as Material & Function)

Bảng màu được xây dựng dựa trên vật liệu chế tạo thiết bị quang học và phòng lab cơ khí:

```text
CANVAS (Nhôm Anot Hóa)     →  #F1F3F5 Industrial Cool Canvas · #E9ECEF Machined Plate
CHASSIS (Bề Mặt Thao Tác)   →  #FFFFFF Pure Mechanical White
BORDERS (Đường Ghép Cơ Khí) →  #D1D5DB 1px Mechanical Seam · #9CA3AF 1.5px Structural Border
TYPOGRAPHY (Độ Sắc Nét Cao) →  #111827 Technical Ink (Deep Gray-900) · #4B5563 Engineering Gray
SIGNATURE ACCENT (SHUTTER)  →  #EA580C / #F97316 Shutter Button Orange (Nút chụp máy ảnh Braun/Sony)
OPTICAL ACCENT (COATING)    →  #0D9488 Optical Teal (Lớp phủ chống lóa thấu kính)
SIGNAL / DATA (Kỹ Thuật)    →  #16A34A Measured In-Stock Green · #DC2626 Warning Red
```

### Bảng Mã Màu Chuẩn (Design Tokens — Tailwind CSS v4):

| Định danh Token | Mã Hex | Vai trò công năng trong hệ thống |
| :--- | :--- | :--- |
| `--color-industrial-canvas` | `#F1F3F5` | Nền canvas toàn hệ thống, màu xám nhôm mát mắt, chống lóa màn hình. |
| `--color-industrial-plate` | `#E9ECEF` | Bề mặt phụ, nền khung ảnh sản phẩm, dải phân cách module. |
| `--color-industrial-surface` | `#FFFFFF` | Bề mặt thẻ sản phẩm, khối điều khiển mua hàng, thanh Header & Aside. |
| `--color-industrial-border` | `#D1D5DB` | Đường kẻ ghép nối cơ khí 1px giữa các phân vùng chức năng. |
| `--color-industrial-border-strong` | `#9CA3AF` | Đường viền cấu trúc 1.5px cho các khối tương tác trọng tâm. |
| `--color-industrial-text` | `#111827` | Văn bản chính, tiêu đề H1/H2/H3 với độ tương phản cao đạt chuẩn công thái học. |
| `--color-industrial-muted` | `#4B5563` | Nhãn kỹ thuật, mô tả sản phẩm, đường dẫn breadcrumb. |
| `--color-industrial-subtle` | `#6B7280` | Đơn vị đo (mm, kg, stop), mã SKU, ghi chú kỹ thuật phụ. |
| `--color-industrial-shutter` | `#EA580C` | Màu Cam Shutter — nút bấm hành động chính (Add-to-cart, Checkout). |
| `--color-industrial-shutter-hover` | `#C2410C` | Trạng thái hover cho nút Shutter. |
| `--color-industrial-shutter-light` | `#FFF7ED` | Nền nhạt cho badge active hoặc biến thể đang được chọn. |
| `--color-industrial-teal` | `#0D9488` | Màu xanh ngọc phủ thấu kính — điểm nhấn quang học và icon công nghệ. |
| `--color-industrial-success` | `#16A34A` | Chỉ báo trạng thái thiết bị sẵn sàng giao hàng (In Stock). |

---

## 3. Xử Lý Bề Mặt & Bóng Đổ Xúc Giác (Tactile Elevation & Depth Stack)

Thay vì dùng bóng mờ nhòe (soft diffuse blur) vốn xa rời thế giới vật lý, hệ thống sử dụng **bóng đổ cứng dập khối (Hard Offset Tactile Shadows)**:

1. **Lớp 1: Khung Nhôm Canvas (`#F1F3F5`)** — Bề mặt phẳng tĩnh lặng làm phông nền cho toàn bộ không gian làm việc.
2. **Lớp 2: Khối Chassis Trắng (`#FFFFFF`)** — Nổi bật trên nền canvas với đường viền cơ khí `#D1D5DB`.
3. **Lớp 3: Bóng Đổ Cứng Xúc Giác (Tactile Shadow `2px 2px 0px #CBD5E1`)** — Tạo cảm giác khối linh kiện được đặt nổi trên bàn máy bay cơ khí.
4. **Lớp 4: Phản Hồi Nhấn Phím (Depressed Active State):**
   - Trạng thái bình thường: `box-shadow: 2px 2px 0px #CBD5E1; transform: translate(0, 0);`
   - Trạng thái khi ấn chuột (`:active`): `box-shadow: 0px 0px 0px transparent; transform: translate(2px, 2px);`
   - Cảm giác tương tác: Người dùng nhận được phản hồi thị giác ngay lập tức như đang nhấn một nút bấm vật lý thực sự.

---

## 4. Quy Chuẩn Kiểu Chữ Công Nghiệp (Typography Hierarchy & Rhythm)

Hệ thống kiểu chữ lấy cảm hứng từ các bản vẽ kỹ thuật và ấn phẩm kiến trúc hiện đại:

- **Phông chữ tiêu đề & Định danh (Display & Headings):** `Space Grotesk` hoặc `Plus Jakarta Sans` — các góc vát hình học, đường nét dứt khoát, thanh lịch mà vững chãi.
- **Phông chữ nội dung & Đọc hiểu (Body & UI):** `Geist` hoặc `Inter` — tối ưu hóa độ đọc cho văn bản kỹ thuật và mô tả thiết bị.
- **Định dạng số liệu (Tabular Numbers):** Sử dụng `font-variant-numeric: tabular-nums` cho giá tiền, mã SKU, tiêu cự lens, khẩu độ và dải dynamic range.

```text
Display Title (Hero H1)    → 40px / 1.15 / font-bold / tracking-tight / #111827
Section Heading (H2)       → 24px / 1.25 / font-bold / tracking-tight / #111827
Product Title (Card H3)    → 16px / 1.35 / font-semibold / #111827
Technical Label / Vendor   → 11px / 1.4 / font-medium / uppercase / tracking-wider / #4B5563
Price Display (Primary)    → 20px / 1.2 / font-bold / tabular-nums / #111827
Specs Value (PDP Matrix)   → 13px / 1.5 / font-medium / tabular-nums / #111827
```

---

## 5. Cấu Trúc Thành Phần Giao Diện Chuẩn (Component Archetypes)

### 5.1. Header (Machined Control Tower)
- Thanh điều khiển cố định (Sticky Top) với chiều cao chuẩn `64px` (`h-16`).
- Nền trắng cơ khí `#FFFFFF`, viền đáy 1px `#D1D5DB` sắc nét, không dùng blur mờ nhòe.
- Logo **LIMI PHOTOGRAPHY** bằng phông hình học đậm nét kèm điểm nhấn khối vuông Cam Shutter kích thước 6px.
- Menu danh mục ngang được phân tách bằng khoảng cách công thái học rõ ràng: *Cameras & Optics*, *Lighting & Audio*, *Rigging & Accessories*, *All Hardware*, *Journal*.
- Cụm công cụ bên phải: Nút Search dạng ô nhập liệu cơ khí, Nút Account, và Nút Giỏ Hàng có badge số lượng màu Cam Shutter dạng tem dập nổi.

### 5.2. Hero Section (Industrial Hardware Showcase)
- Bố cục lưới công năng chuẩn Bauhaus, phân chia không gian thành các module mạch lạc.
- Tag định danh: Khối viền kim loại nhỏ in hoa `● HARDWARE ECOSYSTEM // OPTICAL BENCHMARK`.
- Tiêu đề H1: Trực diện, truyền tải sức mạnh công nghệ quang học của các cỗ máy Sony FX3 / FX6 và thấu kính khẩu lớn.
- Khối thông số kỹ thuật dạng ma trận 4 ô (Specs Grid) đặt ngay dưới tiêu đề:
  - `4K 120P RAW` · `15+ STOPS DR` · `DUAL BASE ISO` · `ACTIVE COOLING`
- Cụm nút bấm công nghiệp:
  - **Nút Primary (Cam Shutter):** Nút chữ nhật bo 4px, màu cam `#EA580C`, viền `#C2410C`, có hiệu ứng lún cơ học khi nhấn.
  - **Nút Secondary (Khung Thép):** Nền trắng `#FFFFFF`, viền xám thép `#D1D5DB`, hover đổi màu sang xám nhôm `#E9ECEF`.

### 5.3. Thẻ Bộ Sưu Tập (Hardware Module Cards)
- Bố cục lưới 3 cột tương ứng 3 phân hệ thiết bị chính.
- Tỉ lệ khung hình `16:9` với viền cơ khí 1px bao quanh toàn bộ khung.
- Nhãn chỉ mục module kỹ thuật: `MOD-01`, `MOD-02`, `MOD-03` ở góc trên.
- Lớp phủ thông tin có nền mờ bảo vệ độ tương phản chữ, tên danh mục in hoa sắc nét.

### 5.4. Thẻ Sản Phẩm (Modular Chassis Card)
- Khối chassis trắng cơ khí `#FFFFFF`, bo góc `rounded-sm` (4px), bao quanh bởi viền kim loại 1px `#D1D5DB`.
- Hiệu ứng hover: Viền chuyển sang màu xám đậm `#9CA3AF` kết hợp bóng đổ cứng dập nổi `shadow-[3px_3px_0px_#CBD5E1]`.
- Khung ảnh sản phẩm tỉ lệ `1:1` với nền nhôm gia công `#F1F3F5` giúp tôn vinh chi tiết cơ khí và lớp phủ ống kính.
- Nhãn thương hiệu Vendor: Đóng khung tem nhỏ `border border-gray-300 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-700`.
- Dải giá rõ ràng với định dạng số đếm chuẩn, giá so sánh gạch ngang tinh tế.
- Chỉ báo trạng thái kho: Vạch tín hiệu màu xanh lá dứt khoát `[ IN STOCK ]`.

### 5.5. Bảng Thông Số Kỹ Thuật (Hardware Specification Matrix)
- Thiết kế dạng bảng ma trận kiểm định chất lượng (Quality Inspection Matrix).
- Viền lưới kỹ thuật 1px bao quanh các ô dữ liệu.
- Cột bên trái: Tên hạng mục thông số (Sensor, Mount, Shutter Type, Dynamic Range, Weight...) in hoa màu xám `#4B5563`.
- Cột bên phải: Giá trị thông số thực tế từ Metafields in đậm sắc nét màu `#111827`.

### 5.6. Giỏ Hàng & Khung Điều Khiển (Cart Drawer & Console)
- Bảng kê đơn hàng dạng docket kỹ thuật (Technical Order Docket).
- Từng dòng sản phẩm có khung hiển thị rõ mã SKU, biến thể đã chọn, đơn giá và cụm tăng giảm số lượng gồm 3 nút cơ khí riêng biệt `[-] [Qty] [+]`.
- Nút tiến hành thanh toán **"PROCEED TO CHECKOUT"** màu Cam Shutter toàn chiều rộng với phản hồi xúc giác mạnh mẽ.

---

## 6. Bộ Tokens Tích Hợp Tailwind CSS v4 (`@theme`)

Mọi thông số thiết kế được định nghĩa trong `app/styles/tailwind.css` qua chuẩn `@theme` của Tailwind CSS v4:

```css
@import 'tailwindcss';

@theme {
  /* Industrial Palette */
  --color-canvas: #F1F3F5;
  --color-plate: #E9ECEF;
  --color-surface: #FFFFFF;
  --color-border: #D1D5DB;
  --color-border-strong: #9CA3AF;
  
  --color-text-main: #111827;
  --color-text-muted: #4B5563;
  --color-text-subtle: #6B7280;

  --color-shutter: #EA580C;
  --color-shutter-hover: #C2410C;
  --color-shutter-light: #FFF7ED;

  --color-optical-teal: #0D9488;
  --color-signal-green: #16A34A;

  /* Typography */
  --font-display: 'Space Grotesk', system-ui, -apple-system, sans-serif;
  --font-body: 'Geist', 'Inter', system-ui, -apple-system, sans-serif;

  /* Crisp Industrial Radii */
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 6px;
}
```
