# ĐẶC TẢ DỮ LIỆU CỬA HÀNG: SHOPIFY DEVELOPMENT STORE — LIMIPHOTOGRAPHY

> **Tài liệu:** Canonical Store Data & Catalog Specification SSOT  
> **Workspace:** `Week13-14`  
> **Cửa hàng:** LimiPhotography Store (`limiphotography-store` hoặc tên tương đương)  
> **Chủ đề (Niche):** Ngành Media, Thiết bị Quay Phim, Nhiếp Ảnh & Studio Điện Ảnh (Cinema, Photography & Media Production Gear)  

---

## 1. Định Vị Thương Hiệu & Bản Sắc Thị Giác (Brand Identity)

- **Tên thương hiệu:** **LimiPhotography**
- **Khẩu hiệu (Slogan):** *Precision Optical & Cinema Gear for Visual Storytellers*
- **Sứ mệnh:** Cung cấp hệ sinh thái thiết bị quang học, máy ảnh, ống kính điện ảnh, ánh sáng studio, âm thanh và phụ kiện quay chụp chuyên nghiệp, bền bỉ, chuẩn điện ảnh dành cho các nhà sáng tạo nội dung, nhiếp ảnh gia và đoàn làm phim thương mại.
- **Bản sắc thị giác & Bảng màu chủ đạo (Color Palette):**
  - Màu nền chính (Dark Canvas / Studio Backdrop): `#0E1116` (Obsidian Matte Black)
  - Màu nền sáng phụ trợ (Clean Light Surface): `#F4F6F8` (Studio Soft Gray)
  - Màu tương phản chính (Primary Typography): `#FFFFFF` (trên nền tối) / `#111827` (trên nền sáng)
  - Màu nhấn đặc trưng (Tally Record Indicator Accent): `#E50914` (Chấm đỏ REC chuẩn máy quay điện ảnh)
  - Màu kim loại kỹ thuật (Anodized Aluminum Accent): `#3B82F6` (Cinema Anodized Blue)
- **Typography:**
  - Tiêu đề (Headings): `Oswald` hoặc `Syne` (đậm nét, cứng cáp, mang phong cách kỹ thuật quang học)
  - Nội dung (Body): `Inter` hoặc `Geist` (dễ đọc, hiển thị thông số kỹ thuật sắc nét)

---

## 2. Collections Specification (Automated Collections)

All 3 core collections are configured as **Automated Collections** based on `Product type` or `Tag`:

| Collection Title | Handle | Type | Conditions | Description Summary |
| :--- | :--- | :--- | :--- | :--- |
| **Cameras & Optics** | `cameras-optics` | Automated | `Product type is equal to 'Cameras & Optics'` or `Tag is equal to 'optics'` | Cinema cameras, mirrorless bodies, and precision optical lenses. |
| **Lighting & Audio** | `lighting-audio` | Automated | `Product type is equal to 'Lighting & Audio'` or `Tag is equal to 'studio'` | Professional studio COB lights, RGBW pixel light tubes, and 32-bit float wireless audio. |
| **Rigging & Accessories** | `rigging-accessories` | Automated | `Product type is equal to 'Accessories'` or `Tag is equal to 'gear'` | Carbon fiber gimbals, fluid head video tripods, rugged camera backpacks, and rigging gear. |

### Detailed Collection Specifications (English Copy for Shopify Admin):

#### Collection 1: Cameras & Optics
- **Title:** `Cameras & Optics`
- **Handle:** `cameras-optics`
- **Collection type:** `Automated`
- **Conditions:** `Product type` is equal to `Cameras & Optics`
- **Description (Rich Text):**
  > Explore our industry-grade cinema cameras, high-resolution mirrorless bodies, and precision optical lenses. Designed for cinematographers, directors, and commercial photographers demanding uncompromising image fidelity, extreme dynamic range, and robust field reliability.
- **Collection Image (Add from URL):** `https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&auto=format&fit=crop&q=80`
- **Search Engine Listing (SEO):**
  - **Page title:** `Cinema Cameras & Precision Optical Lenses | LimiPhotography`
  - **Meta description:** `Discover professional cinema cameras, mirrorless bodies, and cine prime lenses engineered for uncompromising visual storytelling and broadcast production.`

#### Collection 2: Lighting & Audio
- **Title:** `Lighting & Audio`
- **Handle:** `lighting-audio`
- **Collection type:** `Automated`
- **Conditions:** `Product type` is equal to `Lighting & Audio`
- **Description (Rich Text):**
  > Illuminate your scene with cinematic color accuracy and capture pristine broadcast audio. Featuring high-output Bowens-mount COB LED lights, creative RGBW pixel tube bars, and 32-bit float wireless lavalier microphone systems that eliminate audio clipping on set.
- **Collection Image (Add from URL):** `https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80`
- **Search Engine Listing (SEO):**
  - **Page title:** `Studio Lighting & Broadcast Audio Equipment | LimiPhotography`
  - **Meta description:** `High-CRI studio COB LED lights, flexible RGBW tubes, and 32-bit float wireless microphones for film sets, broadcast studios, and creative productions.`

#### Collection 3: Rigging & Accessories
- **Title:** `Rigging & Accessories`
- **Handle:** `rigging-accessories`
- **Collection type:** `Automated`
- **Conditions:** `Product type` is equal to `Accessories`
- **Description (Rich Text):**
  > Heavy-duty camera stabilization, fluid head video tripods, modular cages, and weatherproof field backpacks. Crafted from aerospace-grade carbon fiber and high-tensile alloys to support and protect your camera package in any production environment.
- **Collection Image (Add from URL):** `https://images.unsplash.com/photo-1589872510940-2cb039d91f86?w=1200&auto=format&fit=crop&q=80`
- **Search Engine Listing (SEO):**
  - **Page title:** `Camera Rigging, Carbon Tripods & Protective Bags | LimiPhotography`
  - **Meta description:** `Stabilize and protect your cinema equipment with carbon fiber handheld gimbals, fluid head tripods, and all-weather modular camera backpacks.`

## 3. Metadata Architecture: Metafields & Metaobjects

To support structured technical specifications on Theme Dawn (Phase 1) and direct querying via the GraphQL Storefront API on Hydrogen (Phase 2), the store implements the following standardized data schema:

### 3.1. Custom Metafield Definitions (Product Level)
Configure in: `Settings > Metafields and metaobjects > Products > Add definition`

1. **`custom.technical_specifications`**:
   - **Name:** `Technical Specifications`
   - **Type:** `Multi-line text`
   - **Description:** *Core technical hardware specifications (Sensor size, lens mount, ISO range, resolution, optical output, battery capacity).*
2. **`custom.package_contents`**:
   - **Name:** `Package Contents`
   - **Type:** `Multi-line text`
   - **Description:** *Itemized list of hardware, accessories, and cables included in the box (In The Box).*
3. **`custom.compatibility`**:
   - **Name:** `Compatibility`
   - **Type:** `Single line text` (One value)
   - **Description:** *Supported lens mount standards and ecosystem compatibility (e.g., Sony E-Mount / Full-Frame, Universal Bowens Mount).*

### 3.2. Metaobject Definition: Gear Warranty Plan (`gear_warranty_plan`)
Configure in: `Settings > Metafields and metaobjects > Metaobjects > Add definition`

- **Metaobject Name:** `Gear Warranty Plan` (Handle: `gear_warranty_plan`)
- **Fields:**
  1. `plan_name` (`single_line_text_field`): Warranty tier title (e.g., "LimiCare Cinema Pro 24M").
  2. `duration_months` (`number_integer`): Warranty coverage duration in months (e.g., `24`).
  3. `coverage_summary` (`multi_line_text_field`): Coverage details (e.g., "Full sensor and PCB warranty, 30-day 1-to-1 replacement for factory defects, bi-annual complimentary optical cleaning").
  4. `support_channel` (`single_line_text_field`): Priority support hotline (e.g., "support@limiphotography.com | 24/7 Field Dispatch").
- **Product Association:** Create a Product Metafield `custom.warranty_plan` with type **Metaobject reference** pointing to the `gear_warranty_plan` definition.

---

## 4. 10 Core Authentic Sony Ecosystem & Compatible 3rd-Party Products

### 📷 CATEGORY 1: CAMERAS & OPTICS (4 Products)

#### Product 1: Sony FX3 Full-Frame Cinema Line Camera (Body)
- **Collection:** Cameras & Optics | **Type:** `Cameras & Optics` | **Vendor:** `Sony`
- **Tags:** `sony, cinema line, fx3, full-frame, 4k 120p, e-mount, featured`
- **Description:**
  An authentic professional Cinema Line camera from Sony featuring a 10.2MP Back-Illuminated Full-Frame Exmor R CMOS sensor, 15+ stops of dynamic range, and 4K 120p 10-bit 4:2:2 All-Intra recording. Engineered with an active cooling fan for uninterrupted takes, 5-axis in-body image stabilization (IBIS) with Active Mode, and an ergonomic cage-free body with a detachable XLR top handle unit for dual XLR audio capture.
- **Media (Add from URL):** `https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80`
- **Pricing:** Price: `94.990.000₫` | Compare-at price: `101.990.000₫`
- **Options & Variants:**
  - Option 1: `Package Edition` $\to$ Values: `Standard Kit with XLR Handle` (`ILME-FX3-XLRKIT`), `Body Only (Without Handle)` (`ILME-FX3-BODY` - `84.990.000₫`)
- **SKU Logic:** `ILME-FX3-{EDITION}`
- **Metafields:**
  - `custom.technical_specifications`: `10.2MP Full-Frame BSI Exmor R CMOS Sensor | Dual Base ISO 800/12800 | 4K 120p 10-bit 4:2:2 All-Intra | S-Cinetone & S-Log3 15+ Stops Dynamic Range | Active Internal Cooling Fan | 5-Axis IBIS with Active Mode | Dual CFexpress Type A / SD Slots`
  - `custom.package_contents`: `1x Sony FX3 Camera Body, 1x XLR Handle Unit with Microphone Holder, 1x NP-FZ100 Rechargeable Battery, 1x BC-QZ1 Battery Charger, 1x Body Cap, 1x Handle Shoe Cap, 1x USB-A to USB-C Cable.`
  - `custom.compatibility`: `Sony E-Mount (Full-Frame & APS-C lenses in crop mode).`

#### Product 2: Sony FE 24-70mm F2.8 GM II Lens
- **Collection:** Cameras & Optics | **Type:** `Cameras & Optics` | **Vendor:** `Sony`
- **Tags:** `sony, g master, gm ii, 24-70mm, f2.8, e-mount, lens, featured`
- **Description:**
  The world's lightest F2.8 standard zoom lens (SEL2470GM2) from Sony G Master series. Packed with four XD Linear Motors for lightning-fast tracking, advanced optical construction including two XA and two Super ED elements, Nano AR Coating II, and a de-clickable aperture ring. Designed for professional hybrid shooters demanding maximum optical clarity and silent autofocus.
- **Media (Add from URL):** `https://images.unsplash.com/photo-1606978436034-e758784d2f09?w=800&auto=format&fit=crop&q=80`
- **Pricing:** Price: `49.990.000₫` | Compare-at price: `53.990.000₫`
- **Options & Variants:**
  - Option 1: `Lens Edition` $\to$ Values: `Standard Retail Pack` (`SEL2470GM2`)
- **SKU Logic:** `SEL2470GM2`
- **Metafields:**
  - `custom.technical_specifications`: `Focal Length: 24-70mm | Constant Maximum Aperture: F2.8 - F22 | 4x XD Linear Autofocus Motors | 2 XA & 2 Super ED Glass Elements | 11-Blade Circular Aperture | Filter Diameter: 82mm | Weight: 695g | Weather-Sealed Dust/Moisture Resistance`
  - `custom.package_contents`: `1x Sony FE 24-70mm F2.8 GM II Lens, 1x ALC-SH168 Lens Hood with Filter Window, 1x ALC-F82S 82mm Front Lens Cap, 1x ALC-R1EM Rear Lens Cap, 1x Padded Carrying Case with Strap.`
  - `custom.compatibility`: `Sony E-Mount (Full-Frame and APS-C bodies).`

#### Product 3: Sigma 85mm F1.4 DG DN Art Lens for Sony E
- **Collection:** Cameras & Optics | **Type:** `Cameras & Optics` | **Vendor:** `Sigma`
- **Tags:** `sigma, art, 85mm, f1.4, portrait, sony e-mount, lens, featured`
- **Description:**
  A benchmark portrait prime lens from Sigma's Art line re-engineered exclusively for Sony E-mount mirrorless systems. Features 5 SLD elements and 1 aspherical element, an 11-blade rounded diaphragm for creamy optical bokeh, an aperture ring with click/de-click switch, and a customizable AFL button fully integrated with Sony camera firmware.
- **Media (Add from URL):** `https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&auto=format&fit=crop&q=80`
- **Pricing:** Price: `23.490.000₫` | Compare-at price: `25.500.000₫`
- **Options & Variants:**
  - Option 1: `Lens Edition` $\to$ Values: `Standard Retail Pack` (`SIGMA-85F14-SONYE`)
- **SKU Logic:** `SIGMA-85F14-SONYE`
- **Metafields:**
  - `custom.technical_specifications`: `Focal Length: 85mm | Maximum Aperture: F1.4 - F16 | High-Speed Stepping AF Motor | 5 SLD & 1 Aspherical Element | 11-Blade Rounded Diaphragm | Filter Diameter: 77mm | Weight: 630g | De-Clickable Aperture Ring & AFL Button`
  - `custom.package_contents`: `1x Sigma 85mm F1.4 DG DN Art Lens (Sony E), 1x LH828-02 Petal Lens Hood with Lock, 1x LCF-77mm Front Cap, 1x LCR II Rear Cap, 1x Padded Lens Case.`
  - `custom.compatibility`: `Native Sony E-Mount (Full-Frame and APS-C). Fully supports Sony Fast Hybrid AF, Real-Time Eye AF, and In-Camera Aberration Correction.`

#### Product 4: Tamron 28-75mm F2.8 Di III VXD G2 for Sony E
- **Collection:** Cameras & Optics | **Type:** `Cameras & Optics` | **Vendor:** `Tamron`
- **Tags:** `tamron, g2, 28-75mm, f2.8, vxd, zoom, sony e-mount, lens`
- **Description:**
  The acclaimed second-generation (Model A063) fast standard zoom lens from Tamron for Sony E-mount. Equipped with Tamron's VXD linear motor focus mechanism for rapid and precise autofocus, a minimum object distance of 0.18m for wide macro perspectives, and a built-in USB-C port compatible with Tamron Lens Utility software for custom focus ring tuning.
- **Media (Add from URL):** `https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=800&auto=format&fit=crop&q=80`
- **Pricing:** Price: `19.990.000₫` | Compare-at price: `21.900.000₫`
- **Options & Variants:**
  - Option 1: `Lens Edition` $\to$ Values: `Standard Retail Pack` (`TAMRON-2875G2-SONYE`)
- **SKU Logic:** `TAMRON-2875G2-SONYE`
- **Metafields:**
  - `custom.technical_specifications`: `Focal Range: 28-75mm | Constant F2.8 Aperture | VXD Linear Motor Autofocus Mechanism | Minimum Focus Distance: 0.18m (Wide) / 0.38m (Tele) | Tamron Lens Utility Connector Port (USB-C) | Filter Size: 67mm | Weight: 540g`
  - `custom.package_contents`: `1x Tamron 28-75mm F2.8 Di III VXD G2 Lens (Sony E), 1x Flower-Shaped Lens Hood, 1x Front Lens Cap (67mm), 1x Rear Lens Cap.`
  - `custom.compatibility`: `Native Sony E-Mount (Full-Frame & APS-C). Supports Sony Fast Hybrid AF, Eye AF, and Direct Manual Focus (DMF).`

---

### 💡 CATEGORY 2: LIGHTING & AUDIO (3 Products)

#### Product 5: Sony ECM-B1M Digital Shotgun Microphone
- **Collection:** Lighting & Audio | **Type:** `Lighting & Audio` | **Vendor:** `Sony`
- **Tags:** `sony, microphone, shotgun, ecm-b1m, mi-shoe, digital-audio, featured`
- **Description:**
  An authentic Sony shotgun microphone equipped with 8 high-performance mic capsules and advanced beamforming digital signal processing. Connects via Sony's proprietary Multi-Interface (MI) Shoe for direct cable-free and battery-free digital audio transfer. Offers three switchable directivity patterns (Super-directional, Unidirectional, Omnidirectional) and internal noise-cut filters.
- **Media (Add from URL):** `https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80`
- **Pricing:** Price: `8.490.000₫` | Compare-at price: `9.290.000₫`
- **Options & Variants:**
  - Option 1: `Edition` $\to$ Values: `Standard Pack with Windscreen` (`ECM-B1M`)
- **SKU Logic:** `ECM-B1M`
- **Metafields:**
  - `custom.technical_specifications`: `8 High-Performance Mic Capsules with Beamforming DSP | 3 Directivity Patterns (Super-Directional, Uni, Omni) | Cable-Free & Battery-Free via Sony MI Shoe | Digital Audio Interface Support | Low-Cut & Noise-Cut Acoustic Filters | Weight: 77.3g`
  - `custom.package_contents`: `1x Sony ECM-B1M Shotgun Microphone, 1x Furry Windscreen, 1x Connector Protect Cap, 1x Dedicated Carrying Pouch.`
  - `custom.compatibility`: `Sony Multi-Interface (MI) Shoe. Delivers direct digital 24-bit audio to Sony FX3, FX30, A7 IV, A7S III, A7R V, A1, ZV-E1.`

#### Product 6: Godox V1-S Round Head Flash for Sony
- **Collection:** Lighting & Audio | **Type:** `Lighting & Audio` | **Vendor:** `Godox`
- **Tags:** `godox, flash, v1-s, speedlight, round-head, sony mi-shoe`
- **Description:**
  A professional 76Ws on-camera flash engineered specifically with a dedicated Sony Multi-Interface (MI) foot. Its round fresnel flash head produces smooth, circular light falloff reminiscent of studio strobes. Fully compatible with Sony TTL, 1/8000s High-Speed Sync (HSS), magnetic AK-R1 light modifiers, and powered by a 2600mAh Li-ion battery supporting 480 full-power pops with 1.5s recycle time.
- **Media (Add from URL):** `https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80`
- **Pricing:** Price: `4.990.000₫` | Compare-at price: `5.600.000₫`
- **Options & Variants:**
  - Option 1: `Kit Option` $\to$ Values: `Standard Flash Kit` (`GODOX-V1S-STD`), `Flash + AK-R1 Magnetic Accessory Kit` (`GODOX-V1S-AKR1` - `6.190.000₫`)
- **SKU Logic:** `GODOX-V1S-{KIT}`
- **Metafields:**
  - `custom.technical_specifications`: `Output Power: 76Ws | Round Fresnel Head with Magnetic Modifier Port | Sony TTL & 1/8000s HSS Support | 7.2V 2600mAh Li-ion Battery (480 Full Flashes, 1.5s Recycle) | Built-in Godox 2.4G Wireless X System | 10-Level LED Modeling Lamp`
  - `custom.package_contents`: `1x Godox V1-S Flash for Sony, 1x VB26 Li-ion Battery, 1x USB Battery Charger & USB-C Cable, 1x Mini Stand, 1x Protective Zipper Pouch.`
  - `custom.compatibility`: `Sony Multi-Interface (MI) Hot Shoe. Compatible with Sony A7 Series, A9, A1, A6000 Series, FX3.`

#### Product 7: DJI Mic 2 Wireless Microphone System
- **Collection:** Lighting & Audio | **Type:** `Lighting & Audio` | **Vendor:** `DJI`
- **Tags:** `dji, mic 2, wireless microphone, 32-bit float, noise cancelling, sony compatible, featured`
- **Description:**
  DJI's flagship dual-channel wireless microphone system featuring 32-bit float on-board internal recording, intelligent AI noise cancellation, and a 250m transmission range. Connects seamlessly to Sony cameras via 3.5mm TRS or direct digital receiver shoe, delivering 18 hours of total operating time with the high-capacity charging case.
- **Media (Add from URL):** `https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80`
- **Pricing:** Price: `8.490.000₫` | Compare-at price: `9.490.000₫`
- **Options & Variants:**
  - Option 1: `Case Color` $\to$ Values: `Shadow Black` (`DJI-MIC2-2TX1RX-BLK`), `Pearl White` (`DJI-MIC2-2TX1RX-WHT`)
- **SKU Logic:** `DJI-MIC2-2TX1RX-{COLOR}`
- **Metafields:**
  - `custom.technical_specifications`: `Dual-Channel 2.4GHz Digital & Bluetooth Transmission | 32-bit Float Internal Recording (8GB per TX / 14 hrs) | Intelligent AI Noise Cancelling | 250m Transmission Range | 18h Battery Life with Charging Case | 1.1" OLED Touchscreen with Dial Control`
  - `custom.package_contents`: `2x DJI Mic 2 Transmitters (Shadow Black), 1x DJI Mic 2 Receiver, 1x Mobile Phone Adapters (Type-C & Lightning), 1x 3.5mm TRS Camera Cable, 2x Furry Windscreens, 2x Magnetic Clips, 1x Charging Case, 1x Carrying Pouch.`
  - `custom.compatibility`: `Universal 3.5mm TRS input for all Sony Alpha / Cinema cameras; direct USB-C/Lightning for smartphones; supports Sony MI shoe via optional active adapter.`

---

### 🎒 CATEGORY 3: RIGGING & ACCESSORIES (3 Products)

#### Product 8: DJI RS 4 Pro Handheld Gimbal Stabilizer
- **Collection:** Rigging & Accessories | **Type:** `Accessories` | **Vendor:** `DJI`
- **Tags:** `dji, ronin, rs 4 pro, gimbal, stabilizer, carbon fiber, sony fx3 a7iv, featured`
- **Description:**
  A heavy-duty cinema gimbal crafted with carbon fiber axis arms capable of payload capacities up to 4.5kg (10 lbs). Features 2nd-gen automated axis locks, 4th-gen RS stabilization algorithms, native vertical shooting capability, and wireless Bluetooth shutter control designed to control Sony Alpha & FX cinema cameras without cables.
- **Media (Add from URL):** `https://images.unsplash.com/photo-1589872510940-2cb039d91f86?w=800&auto=format&fit=crop&q=80`
- **Pricing:** Price: `19.990.000₫` | Compare-at price: `21.990.000₫`
- **Options & Variants:**
  - Option 1: `Combo Pack` $\to$ Values: `Standard Gimbal Kit` (`DJI-RS4PRO-STD`), `Combo (Focus Pro Motor + Transmitter)` (`DJI-RS4PRO-COMBO` - `25.490.000₫`)
- **SKU Logic:** `DJI-RS4PRO-{COMBO}`
- **Metafields:**
  - `custom.technical_specifications`: `Tested Payload: 4.5kg (10 lbs) | Carbon Fiber Structural Axis Arms | 2nd-Gen Automated Axis Locks | 4th-Gen RS Stabilization Algorithm | 1.8" Full-Color OLED Touchscreen | Bluetooth Shutter Control for Sony Alpha/FX | 13-Hour Runtime with PD Fast Charge`
  - `custom.package_contents`: `1x DJI RS 4 Pro Gimbal, 1x BG30 Battery Grip, 1x Quick-Release Plate (Arca-Swiss/Manfrotto), 1x Extended Grip/Tripod (Metal), 1x Lens-Fastening Support, 1x Multi-Camera Control Cable (USB-C), 1x Carrying Case.`
  - `custom.compatibility`: `Fully tested & certified for Sony Cinema & Alpha cameras: Sony FX3, FX30, A7S III, A7 IV, A7R V, A1, A9 III with heavy zoom lenses.`

#### Product 9: SmallRig "Black Mamba" Camera Cage Kit for Sony Alpha 7 IV / A7S III
- **Collection:** Rigging & Accessories | **Type:** `Accessories` | **Vendor:** `SmallRig`
- **Tags:** `smallrig, black mamba, cage, sony a7iv, sony a7siii, rigging, top handle`
- **Description:**
  An all-in-one form-fitting bionic protective cage kit (Model 3669B) custom-sculpted for Sony Alpha 7 IV, Alpha 7S III, Alpha 1, and Alpha 7R V. Includes an ergonomic contoured top handle and dedicated HDMI cable clamp. Features an integrated Arca-Swiss quick-release base plate allowing instant mounting onto DJI RS gimbals and Arca tripods without changing plates.
- **Media (Add from URL):** `https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=800&auto=format&fit=crop&q=80`
- **Pricing:** Price: `3.590.000₫` | Compare-at price: `4.190.000₫`
- **Options & Variants:**
  - Option 1: `Configuration` $\to$ Values: `Cage Kit with Top Handle & HDMI Clamp` (`SMALLRIG-3669B-KIT`), `Cage Body Only` (`SMALLRIG-3667B-CAGE` - `2.190.000₫`)
- **SKU Logic:** `SMALLRIG-3669B-{CONFIG}`
- **Metafields:**
  - `custom.technical_specifications`: `CNC-Machined Aluminum Alloy Construction | Bionic Streamline Ergonomic Grip | Integrated Arca-Swiss Bottom Plate (DJI RS 2 / RS 3 / RS 4 Compatible) | Anti-Twist 1/4"-20 & Side Lock Pin Securing | Built-in Cold Shoe, NATO Rail, ARRI 3/8"-16 Holes`
  - `custom.package_contents`: `1x "Black Mamba" Full Camera Cage, 1x Dedicated "Black Mamba" Top Handle, 1x HDMI Cable Clamp, 1x Magnetic Screwdriver Tool.`
  - `custom.compatibility`: `Tailor-made for Sony Alpha 7 IV (ILCE-7M4), Sony Alpha 7S III (ILCE-7SM3), Sony Alpha 7R V, and Sony Alpha 1.`

#### Product 10: Sony TOUGH CEA-G160T 160GB CFexpress Type A Memory Card
- **Collection:** Rigging & Accessories | **Type:** `Accessories` | **Vendor:** `Sony`
- **Tags:** `sony, tough, cfexpress, type a, 160gb, 800mbps, vpg400, memory card, featured`
- **Description:**
  An authentic Sony TOUGH specification CFexpress Type A memory card (CEA-G160T) engineered for demanding professional video and continuous burst photography. Delivers blazing read speeds up to 800 MB/s and write speeds up to 700 MB/s with VPG400 certification guaranteeing minimum sustained 400 MB/s write performance for 4K 120p All-Intra recording. IP57 dust and waterproof with 5x drop and 10x bend resistance.
- **Media (Add from URL):** `https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=800&auto=format&fit=crop&q=80`
- **Pricing:** Price: `9.990.000₫` | Compare-at price: `10.990.000₫`
- **Options & Variants:**
  - Option 1: `Capacity` $\to$ Values: `160GB TOUGH Edition` (`CEA-G160T`), `80GB TOUGH Edition` (`CEA-G80T` - `5.490.000₫`)
- **SKU Logic:** `CEA-G{CAPACITY}T`
- **Metafields:**
  - `custom.technical_specifications`: `Capacity: 160GB / 80GB | Form Factor: CFexpress Type A | Max Read Speed: 800 MB/s | Max Write Speed: 700 MB/s | Sustained Video Performance: VPG400 (400 MB/s Guaranteed) | TOUGH Rigidity (150N Bend Proof, 7.5m Drop Proof) | IP57 Dust & Water Sealed`
  - `custom.package_contents`: `1x Sony TOUGH CFexpress Type A Memory Card, 1x Protective Jewel Case, 1x Instruction Manual.`
  - `custom.compatibility`: `Compatible with CFexpress Type A slots on Sony FX3, FX30, FX6, A7 IV, A7S III, A7R V, A1, A9 III.`

---

## 5. Blog Posts Specification (Blog "News")

- **Blog Category Name:** `News` (Handle: `news`)
- **Article 1:** *The Modern Filmmaker's Guide: Choosing Between Cinema Primes and Zoom Lenses*
  - *Author:* Ha Duc Duong | *Tags:* `Cinematography, Optics, Gear Guide`
  - *Summary:* A comprehensive field analysis examining the optical fidelity, shallow depth of field, and distinct aesthetic character of fast cinema prime lenses versus the versatility of constant-aperture zooms on active production sets.
- **Article 2:** *Three-Point Lighting Mastery: How to Shape Cinematic Portraits on Any Budget*
  - *Author:* LimiPhotography Team | *Tags:* `Studio Lighting, Filmmaking, Masterclass`
  - *Summary:* A masterclass on shaping depth and emotion using Key, Fill, and Rim lights. Learn how to control contrast ratios, soften harsh shadows with Bowens-mount softboxes, and achieve broadcast-grade color fidelity.
- **Article 3:** *Sound is 50% of the Movie: Why 32-Bit Float Audio Changes the Game*
  - *Author:* Ha Duc Duong | *Tags:* `Audio Recording, Field Work, Sound Design`
  - *Summary:* Demystifying 32-bit float audio technology: how dual analog-to-digital converters eliminate distorted audio clipping in unpredictable documentary environments without tedious manual gain adjustments.

---

## 6. Static Pages & Policies Specification

1. **About Us (`/pages/about-us`):** The story of **LimiPhotography** — Empowering independent filmmakers, commercial studios, and passionate creators with cinema-grade tools, expert calibration, and field-tested reliability.
2. **Contact Us (`/pages/contact`):** Gear demonstration showroom booking, technical equipment consultations, field support dispatch hotline, and contact submission form (template: `contact`).
3. **Warranty & Service Policy (`/policies/refund-policy` / Warranty):** 12-to-24 month comprehensive warranty on optical elements and digital circuitry, 30-day no-questions-asked replacement for factory defects, and complimentary bi-annual optical cleaning services.
4. **Shipping & Transit Insurance Policy (`/policies/shipping-policy`):** Express domestic shipping (2-4 business days) and international delivery with 100% full-value transit insurance on all high-precision optical and digital gear.
5. **Privacy Policy (`/policies/privacy-policy`):** Full compliance with international customer data protection standards, secure checkout data encryption, and transparent cookie handling policies.

---

## 7. Bộ 7 Bài Tập Truy Vấn GraphQL Storefront API Thực Hành (API Version: 2026-07)

> [!IMPORTANT]
> **Quy Chuẩn Storefront API Phiên Bản 2026-07 (Modern Headless Standard):**
> - **API Version:** Toàn bộ 7 truy vấn dưới đây đã được kiểm chứng tính tương thích 100% trên **Shopify Storefront API Version `2026-07`**.
> - **Loại Bỏ Hoàn Toàn `paymentSettings` trong Query 1:** Trong chuẩn hiện đại `2026-07`, trường tiền tệ và ngữ cảnh địa phương được tách rời khỏi cài đặt cổng thanh toán kỹ thuật và quản lý tập trung qua root field **`localization`** (`country`, `currency`, `language`) theo Shopify Markets.
> - **Endpoint & Headers:**
>   - **Endpoint:** `https://intern-ha-duc-duong-store.myshopify.com/api/2026-07/graphql.json`
>   - **Method:** `POST`
>   - **Headers:**
>     - `Content-Type: application/json`
>     - `X-Shopify-Storefront-Access-Token: e35cd8c7a216d5927727fdda93f22957`

---

### Query 1: Thông Tin Cửa Hàng & Toàn Bộ Thị Trường Địa Phương (Shop & Multi-Market Localization)
*Mục đích:* Nạp tên shop, domain, quy cách tiền tệ (`moneyFormat`), quốc gia được giao hàng (`shipsToCountries`), cùng **toàn bộ danh sách các thị trường / quốc gia hỗ trợ** (`availableCountries`) và ngôn ngữ (`availableLanguages`) theo Shopify Markets.

#### Query 1.1: Lấy Danh Sách Toàn Bộ Thị Trường & Quốc Gia Hỗ Trợ (Available Markets)
```graphql
query GetShopAndLocalization {
  shop {
    name
    description
    primaryDomain {
      url
      host
    }
    moneyFormat
    shipsToCountries
  }
  localization {
    country {
      isoCode
      name
      currency {
        isoCode
        name
        symbol
      }
    }
    availableCountries {
      isoCode
      name
      currency {
        isoCode
        name
        symbol
      }
    }
    language {
      isoCode
      name
    }
    availableLanguages {
      isoCode
      name
    }
  }
}
```
*Variables:* `{}`

#### Query 1.2: Kiểm Thử Chuyển Đổi Sang Thị Trường Việt Nam (@inContext Directive)
*Mục đích:* Giả lập khách hàng truy cập từ thị trường Việt Nam để kiểm tra đơn vị tiền tệ `VND` (`₫`) và tính năng tự động chuyển đổi tỷ giá sản phẩm từ Shopify Markets.
```graphql
query GetShopInVietnamContext @inContext(country: VN, language: VI) {
  localization {
    country {
      isoCode
      name
      currency {
        isoCode
        name
        symbol
      }
    }
  }
  products(first: 1) {
    edges {
      node {
        title
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
}
```
*Variables:* `{}`

---

### Query 2: Danh Sách 10 Sản Phẩm Kèm Biến Thể & Dải Giá (Products with Variants)
*Mục đích:* Lấy 10 sản phẩm đầu tiên phục vụ hiển thị trên trang chủ hoặc catalog tổng quát.
```graphql
query GetProductsWithVariants {
  products(first: 10) {
    edges {
      node {
        id
        title
        handle
        description
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        featuredImage {
          url
          altText
          width
          height
        }
        variants(first: 5) {
          edges {
            node {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
}
```

---

### Query 3: Lấy Bộ Sưu Tập Theo Handle Kèm Sản Phẩm (Collection by Handle)
*Mục đích:* Tải thông tin collection và danh sách sản phẩm bên trong cho trang `collections/$handle`.
```graphql
query GetCollectionByHandle($handle: String!, $first: Int = 10) {
  collection(handle: $handle) {
    id
    title
    handle
    descriptionHtml
    image {
      url
      altText
    }
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          featuredImage {
            url
            altText
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
```
*Variables:*
```json
{
  "handle": "cameras-optics",
  "first": 6
}
```

---

### Query 4: Chi Tiết Sản Phẩm, Tùy Chọn & Tồn Kho (Product Options & Variants)
*Mục đích:* Phục vụ logic chọn Mount / Kit / Color và cập nhật giá tương ứng trên trang sản phẩm `products/$handle`. Sử dụng sản phẩm có sẵn trong catalog cửa hàng: Sony FX3 Cinema Camera.
```graphql
query GetProductDetailsWithVariants($handle: String!) {
  product(handle: $handle) {
    id
    title
    handle
    descriptionHtml
    vendor
    options {
      id
      name
      optionValues{
        id name
      }
    }
    variants(first: 5) {
      edges {
        node {
          id
          title
          sku
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          image {
            url
            altText
          }
        }
      }
    }
  }
}
```
*Variables:*
```json
{
  "handle": "sony-tough-cea-g160t-160gb-cfexpress-type-a-memory-card"
}
```

---

### Query 5: Danh Sách Bài Viết Blog Chuẩn SEO (Blog Articles with Author & Date)
*Mục đích:* Tải các bài viết kiến thức chuyên môn từ Blog "News".
```graphql
query GetBlogArticles($blogHandle: String = "news", $first: Int = 5) {
  blog(handle: $blogHandle) {
    id
    title
    articles(first: $first) {
      edges {
        node {
          id
          title
          handle
          excerpt
          contentHtml
          publishedAt
          authorV2 {
            name
          }
          image {
            url
            altText
          }
        }
      }
    }
  }
}
```
*Variables:*
```json
{
  "blogHandle": "news",
  "first": 3
}
```

---

### Query 6: Truy Vấn Custom Metafields Kỹ Thuật (Targeted Metafields)
*Mục đích:* Trích xuất 3 thông số kỹ thuật chuyên môn thực tế từ sản phẩm: `technical_specifications`, `package_contents`, `compatibility`.
```graphql
query GetProductWithMetafields($handle: String!) {
  product(handle: $handle) {
    id
    title
    handle
    technicalSpecs: metafield(namespace: "custom", key: "technical_specifications") {
      value
      type
    }
    packageContents: metafield(namespace: "custom", key: "package_contents") {
      value
      type
    }
    compatibility: metafield(namespace: "custom", key: "compatibility") {
      value
      type
    }
  }
}
```
*Variables:*
```json
{
  "handle": "sony-fx3-full-frame-cinema-line-camera-body"
}
```

---

### Query 7: Phân Trang Bằng Con Trỏ (Cursor-Based Pagination)
*Mục đích:* Thực hành cơ chế phân trang tối ưu hiệu năng `first` và `after` cho catalog sản phẩm.
```graphql
query GetProductsWithCursorPagination($first: Int, $after: String) {
  products(first: $first, after: $after) {
    edges {
      cursor
      node {
        id
        title
        handle
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
```
*Variables (Lần 1):*
```json
{
  "first": 3,
  "after": null
}
```
*Variables (Lần 2 - Dùng endCursor từ lần 1):*
```json
{
  "first": 3,
  "after": "eyJsYXN0X2lkIjoxMDU2NTk2MDYzMDU1MSwibGFzdF92YWx1ZSI6MTA1NjU5NjA2MzA1NTEsIm9mZnNldCI6Mn0="
}
```


---

## 8. Đặc Tả Chi Tiết 5 Routes Cốt Lõi Của Hydrogen Storefront

> [!NOTE]
> **Nguyên tắc thiết kế UI:** Giữ markup HTML sạch sẽ, cấu trúc rõ ràng, semantic. Không dành thời gian cho CSS cầu kỳ, animation phức tạp hay cài thư viện UI cồng kềnh. Tập trung 100% vào việc liên kết dữ liệu GraphQL, routing, và luồng Cart/Checkout.

### Route 1: Homepage (`/` — `app/routes/_index.tsx`)
- **Loader Data:**
  - Thông tin Shop: tên, mô tả ngắn gọn (`shop.name`, `shop.description`).
  - Danh sách 4 sản phẩm mới nhất (`products(first: 4)`).
  - Danh sách 3 collections chính (*Cameras & Optics*, *Lighting & Audio*, *Rigging & Accessories*).
- **Giao diện & Thành phần UI:**
  - Semantic `<header>` với tên shop và navigation bar.
  - `<section>` Hero Banner đơn giản giới thiệu thương hiệu LimiPhotography.
  - `<section>` Lưới Collections cards (title, link tới `/collections/:handle`).
  - `<section>` Lưới Featured Products (ảnh, tiêu đề, giá VND/USD, link tới `/products/:handle`).

### Route 2: Collection Page (`/collections/:handle` — `app/routes/collections.$handle.tsx`)
- **Loader Data:**
  - Nhận `$handle` từ URL param (`params.handle`).
  - Lấy thông tin Collection: Tiêu đề, mô tả.
  - Lấy danh sách sản phẩm với cursor-based pagination (`first: 6`, `after: url.searchParams.get("cursor")`).
- **Giao diện & Thành phần UI:**
  - Tiêu đề Collection và mô tả HTML.
  - Lưới sản phẩm (Product Grid) hiển thị ảnh đại diện, tên sản phẩm, khoảng giá (`priceRange.minVariantPrice`).
  - Thanh phân trang tối giản: Nút "Next Page" liên kết với URL `?cursor=${endCursor}` khi `pageInfo.hasNextPage === true`.

### Route 3: Product Detail Page (`/products/:handle` — `app/routes/products.$handle.tsx`)
- **Loader Data:**
  - Nhận `$handle` từ URL param.
  - Lấy chi tiết sản phẩm, thư viện ảnh, danh sách options và variants, tình trạng kho (`availableForSale`), và 3 Metafields (`technical_specifications`, `package_contents`, `compatibility`).
- **Giao diện & Thành phần UI:**
  - Thư viện ảnh sản phẩm (ảnh chính + thumbnail).
  - Tiêu đề, vendor, giá bán lẻ (`price`), giá so sánh (`compareAtPrice`).
  - **Variant Selector:** Nhóm các nút chọn Option trực quan (Mount: Sony E / Canon RF; Kit: Body Only / Pro Combo).
  - **Bảng Thông Số Kỹ Thuật (Metafields):** Bảng hiển thị thông số cảm biến, danh sách trong hộp và hệ thiết bị tương thích lấy trực tiếp từ dữ liệu Metafield.
  - **Form Thêm Vào Giỏ Hàng:** Form POST action với input ẩn `merchandiseId` (ID của variant đang chọn) và số lượng `quantity`. Nút "Add to Cart" bị vô hiệu hóa nếu `availableForSale === false`.

### Route 4: Cart Flow (`/cart` — `app/routes/cart.tsx`)
- **Loader & Action Data:**
  - `loader`: Đọc `cartId` từ session cookie, query đối tượng `cart` (danh sách line items, subtotal, total tax, `checkoutUrl`).
  - `action`: Tiếp nhận các thao tác:
    - Thêm sản phẩm (`linesAdd` hoặc `cartCreate` nếu chưa có giỏ).
    - Tăng/giảm số lượng (`linesUpdate`).
    - Xóa dòng sản phẩm (`linesRemove`).
- **Giao diện & Thành phần UI:**
  - Bảng danh sách mục hàng: Ảnh nhỏ, tên sản phẩm, tên biến thể đã chọn, đơn giá, bộ nút `[-] [Số lượng] [+]`, và nút "Remove".
  - Khung tóm tắt chi phí: Tạm tính (Subtotal), Thuế ước tính (Tax), Tổng tiền (Total).
  - Nút **"Proceed to Checkout"**: Nút hành động liên kết trực tiếp tới `checkoutUrl` của Shopify để chuyển hướng người dùng sang trang thanh toán chính thức.

### Route 5: Blog Article Page (`/blogs/:blogHandle/:articleHandle` — `app/routes/blogs.$blogHandle.$articleHandle.tsx`)
- **Loader Data:**
  - Query bài viết từ blog handle (`news`) và article handle.
  - Trích xuất: Tiêu đề, tên tác giả (`authorV2.name`), ngày xuất bản (`publishedAt`), ảnh banner bài viết và toàn văn `contentHtml`.
- **Giao diện & Thành phần UI:**
  - Semantic `<article>` với tiêu đề bài viết, thông tin tác giả và ngày đăng formatted.
  - Ảnh đại diện bài viết.
  - Nội dung HTML chuyên sâu được render qua `dangerouslySetInnerHTML`.
  - Nút điều hướng "Back to Home" hoặc "Back to News".


