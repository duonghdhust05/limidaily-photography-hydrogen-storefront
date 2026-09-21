/**
 * Strict contract schema for UI translations.
 * Applying SOLID Liskov Substitution Principle:
 * Any new locale dictionary (e.g. ja.ts, fr.ts) MUST fully implement this contract.
 * If any key is missing, TypeScript fails compilation immediately.
 */
export interface TranslationSchema {
  // Navigation & Header
  nav_menu: string;
  nav_close: string;
  nav_search: string;
  nav_cart: string;
  nav_account: string;
  nav_signin: string;
  nav_home: string;
  nav_collections: string;
  nav_all_hardware: string;
  nav_disciplines: string;
  nav_units: string;
  nav_blogs: string;
  nav_journal: string;
  nav_about: string;
  nav_client_console: string;
  nav_orders: string;
  nav_profile: string;
  nav_addresses: string;
  nav_sign_out: string;
  nav_quick_find: string;
  nav_search_placeholder: string;
  nav_all_articles: string;
  nav_disciplines_count: string;

  // Hero & Stages
  hero_badge: string;
  hero_headline_main: string;
  hero_headline_sub: string;
  hero_default_desc: string;
  hero_cta_optics: string;
  hero_cta_all: string;
  hero_sub: string;
  hero_cta_browse: string;
  hero_cta_specs: string;
  stage_01: string;
  stage_02: string;
  stage_03: string;
  stage_04: string;

  // Technical Specs Badges
  spec_dynamic_range: string;
  spec_zero_clipping: string;
  spec_factory_warranty: string;

  // Categories & Curated Units
  cat_explore_badge: string;
  cat_featured_heading: string;
  cat_view_directory: string;
  cat_all_hardware_title: string;
  cat_all_hardware_desc: string;
  cat_all_hardware_badge: string;
  cat_optics: string;
  cat_lighting: string;
  cat_rigging: string;
  cat_optics_desc: string;
  cat_lighting_desc: string;
  cat_rigging_desc: string;
  curated_bench_tested: string;
  curated_hardware_units: string;
  curated_showing_top: string;
  curated_browse_all: string;
  mod_enter: string;
  status_in_stock: string;
  status_no_media: string;

  // Product Cards
  card_unit_price: string;
  card_view_gear: string;
  card_module: string;

  // Cart & Checkout
  cart_title: string;
  cart_manifest: string;
  cart_order_summary: string;
  cart_taxes_included: string;
  cart_subtotal: string;
  cart_checkout: string;
  cart_empty_title: string;
  cart_empty_desc: string;
  cart_empty_cta: string;
  cart_discount_code: string;
  cart_gift_card: string;
  cart_apply: string;
  cart_remove: string;
  cart_remove_discount: string;
  cart_applied_gift_card: string;
  cart_shipping_calculated: string;
  cart_loading: string;

  // Product & PDP
  pdp_add_to_order: string;
  pdp_adding_to_cart: string;
  pdp_preorder: string;
  pdp_sold_out: string;
  pdp_special_offer: string;
  pdp_specs: string;
  pdp_in_stock: string;
  pdp_out_of_stock: string;
  pdp_breadcrumb_catalog: string;
  pdp_select_option: string;
  pdp_specs_title: string;
  pdp_package_contents: string;
  pdp_compatibility: string;
  pdp_overview_title: string;
  pdp_overview_badge: string;
  pdp_specs_badge: string;
  pdp_qc_badge: string;
  pdp_warranty_badge: string;
  pdp_transit_note: string;
  pdp_transit_shield: string;
  pdp_secure: string;
  pdp_in_the_box: string;
  price_special_offer: string;
  pdp_hardware_view: string;
  pdp_default_image_alt: string;

  // Pagination & Catalog Resources
  pagination_previous: string;
  pagination_next: string;
  pagination_loading: string;
  pagination_empty_heading: string;
  pagination_empty_desc: string;
  pagination_empty_badge: string;
  pagination_browse_all: string;

  // Search & Filters
  search_placeholder: string;
  search_cta: string;
  search_hardware_matches: string;
  search_divisions: string;
  search_no_results: string;
  search_articles_heading: string;
  search_pages_heading: string;
  search_products_heading: string;
  search_scanning: string;
  search_no_preview: string;
  search_inspect: string;
  search_empty_badge: string;
  search_empty_desc: string;
  search_banner_badge: string;
  search_banner_desc: string;
  search_submit_cta: string;
  search_view_all: string;

  // Account Console (Orders, Profile, Addresses)
  account_welcome: string;
  account_overview: string;
  account_badge: string;
  account_client_id: string;
  account_filter_orders: string;
  account_order_number: string;
  account_confirmation_number: string;
  account_search: string;
  account_searching: string;
  account_clear: string;
  account_no_orders_match: string;
  account_clear_filters: string;
  account_no_orders_yet: string;
  account_start_shopping: string;
  account_view_order: string;
  account_confirmation_label: string;
  account_order_title: string;
  account_placed_on: string;
  account_product: string;
  account_price: string;
  account_quantity: string;
  account_total: string;
  account_discounts: string;
  account_tax: string;
  account_shipping_address: string;
  account_no_shipping_address: string;
  account_order_status: string;
  account_view_order_status: string;
  account_my_profile: string;
  account_personal_info: string;
  account_first_name: string;
  account_last_name: string;
  account_update: string;
  account_updating: string;
  account_create_address: string;
  account_no_addresses: string;
  account_existing_addresses: string;
  account_create: string;
  account_creating: string;
  account_save: string;
  account_saving: string;
  account_delete: string;
  account_deleting: string;
  account_company: string;
  account_address1: string;
  account_address2: string;
  account_city: string;
  account_state: string;
  account_zip: string;
  account_country: string;
  account_phone: string;
  account_set_default_address: string;

  // Journal & Blogs
  blog_archive_badge: string;
  blog_archive_desc: string;
  blog_technical_article: string;
  blog_read_article: string;
  blog_directory_badge: string;
  blog_directory_title: string;
  blog_directory_desc: string;
  blog_division_badge: string;
  blog_explore_articles: string;
  article_by_author: string;
  article_back_to_all: string;
  article_news_heading: string;
  article_reading_time: string;
  article_min_read: string;
  article_field_notes: string;
  article_related_guides: string;
  article_share: string;
  article_copied_link: string;
  article_inspect_gear: string;
  article_back_to_blog: string;
  article_prev: string;
  article_next: string;
  article_tags_badge: string;
  article_gear_specs_heading: string;

  // Policies & Documentation Pages
  policy_compliance_badge: string;
  policy_operating_terms: string;
  policy_operating_desc: string;
  policy_directive_badge: string;
  policy_read_directive: string;
  policy_official_badge: string;
  page_spec_doc_badge: string;
  collections_dir_badge: string;
  collections_dir_desc: string;
  contact_badge: string;
  contact_form_title: string;
  contact_form_desc: string;
  contact_name: string;
  contact_email: string;
  contact_serial: string;
  contact_message: string;
  contact_submit: string;
  contact_success: string;
  contact_lab_hours: string;
  contact_lab_hours_val: string;
  contact_lab_address: string;
  contact_lab_address_val: string;
  contact_lab_hotline: string;

  // System & Error Boundary
  error_404_badge: string;
  error_500_badge: string;
  error_404_title: string;
  error_500_title: string;
  error_404_desc: string;
  error_500_desc: string;
  error_return_home: string;
  error_inspect_hardware: string;
  mock_bench_badge: string;
  mock_bench_title: string;
  mock_bench_desc: string;

  // Markets & Footer
  market_region_label: string;
  market_primary_label: string;
  market_intl_label: string;
  market_badge: string;
  market_select_aria: string;
  market_select_heading: string;
  market_markets_plural: string;
  market_markets_singular: string;
  market_primary_badge: string;
  market_drawer_heading: string;
  footer_slogan: string;
  footer_showroom_specs: string;
  footer_catalog_heading: string;
  footer_compliance_heading: string;
  footer_privacy: string;
  footer_terms: string;
  footer_shipping: string;
  footer_refund: string;
  footer_rights: string;
  footer_newsletter_desc: string;
  footer_newsletter_placeholder: string;
  footer_newsletter_cta: string;
  footer_newsletter_success: string;
  footer_system_operational: string;
  footer_tech_stack_hydrogen: string;
  footer_tech_stack_shopify: string;

  // Sidebar Guides & Operations
  sidebar_items_unit: string;
  sidebar_products_unit: string;
  sidebar_article_primes_title: string;
  sidebar_article_primes_tag: string;
  sidebar_article_primes_desc: string;
  sidebar_article_lighting_title: string;
  sidebar_article_lighting_tag: string;
  sidebar_article_lighting_desc: string;
  sidebar_article_audio_title: string;
  sidebar_article_audio_tag: string;
  sidebar_article_audio_desc: string;
  sidebar_operations_heading: string;
  sidebar_care_title: string;
  sidebar_care_desc: string;
  sidebar_privacy_title: string;
  sidebar_privacy_desc: string;
  sidebar_shipping_title: string;
  sidebar_shipping_desc: string;
  sidebar_showroom_title: string;
  sidebar_showroom_desc: string;
  sidebar_about_title: string;
  sidebar_about_desc: string;

  // Homepage Specs
  spec_24_month: string;
  spec_15_stops: string;
  spec_4k120p: string;
  spec_10bit_alli: string;
  spec_32bit_float: string;

  // Cart Line Accessibility
  cart_qty_decrease: string;
  cart_qty_increase: string;
  cart_remove_item: string;

  // Priority 2 Localized Strings
  contact_new_dispatch: string;
  contact_transmitting: string;
  contact_telemetry_node: string;
  contact_physical_station: string;
  pdp_sku: string;
  sidebar_precision_optics: string;
  sidebar_store_online: string;

  // Priority 4 Interactive Feedback & Forms
  footer_newsletter_connected: string;
  footer_newsletter_transmitting: string;
  contact_dispatch_logged: string;

  // Post-Checkout Order Confirmation
  order_confirmed_badge: string;
  order_confirmed_title: string;
  order_confirmed_desc: string;
  order_receipt_heading: string;
  order_status_paid: string;
  order_payment_method_label: string;
  order_payment_method_val: string;
  order_shipping_method_label: string;
  order_shipping_method_val: string;
  order_processing_time_label: string;
  order_processing_time_val: string;
  order_warranty_title: string;
  order_warranty_desc: string;
  order_support_title: string;
  order_support_desc: string;
  order_continue_shopping: string;
  order_check_history: string;
  order_security_notice: string;
  order_confirmation_hash: string;
  order_dispatch_email: string;

  // Rate Limiting & Telemetry
  search_rate_limited: string;
  search_query_error: string;
  cart_discount_rate_limited: string;
  cart_market_throttled: string;
  cart_creation_rate_limited: string;
  account_address_rate_limited: string;
  account_profile_rate_limited: string;
  contact_rate_limited: string;
  newsletter_rate_limited: string;
}

export type TranslationKey = keyof TranslationSchema;
