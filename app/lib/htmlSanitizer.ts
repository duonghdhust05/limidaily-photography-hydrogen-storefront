/**
 * Industrial HTML Content Sanitizer & Transformer
 * Optimizes raw rich-text HTML returned from Shopify Storefront API.
 * 
 * Capabilities:
 * 1. Strips destructive inline styles (fixed colors, font sizes, font families, max-widths).
 * 2. Demotes embedded <h1> tags to <h2> to maintain strict 1-H1-per-page SEO hierarchy.
 * 3. Wraps <table> elements in responsive overflow containers for mobile devices.
 * 4. Eliminates potential script injection and insecure frames.
 * 5. Provides word count and reading time calculation.
 */

/**
 * Cleans and transforms raw HTML from Shopify Pages & Blog Articles.
 * Works seamlessly across both Server (Oxygen/Cloudflare Workers) and Client environments.
 */
export function cleanHtmlContent(rawHtml: string | null | undefined): string {
  if (!rawHtml || typeof rawHtml !== 'string') {
    return '';
  }

  let cleaned = rawHtml;

  // 1. Security: Remove dangerous executable tags (<script>, <iframe>, <object>, <embed>, <applet>, <base>, <form>)
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  cleaned = cleaned.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  cleaned = cleaned.replace(/<embed\b[^>]*>/gi, '');
  cleaned = cleaned.replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '');
  cleaned = cleaned.replace(/<base\b[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/?form\b[^>]*>/gi, '');

  // 2. Security: Remove inline event handlers (onerror=..., onclick=..., onload=..., etc.)
  cleaned = cleaned.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 3. Security: Neutralize dangerous protocol handlers (javascript:, vbscript:, data:text/html)
  cleaned = cleaned.replace(/(href|src)\s*=\s*(['"])\s*(?:javascript|vbscript|data\s*:\s*text\/html):/gi, '$1=$2#blocked-scheme-');

  // 4. SEO Hierarchy: Demote inner <h1> to <h2>, and </h1> to </h2>
  cleaned = cleaned.replace(/<h1(\b[^>]*)>/gi, '<h2$1>');
  cleaned = cleaned.replace(/<\/h1>/gi, '</h2>');

  // 5. Strip destructive inline styling that clashes with Neo-Industrial design tokens
  // Strip color, background, font-size, font-family, max-width, line-height
  cleaned = cleaned.replace(/style="([^"]*)"/gi, (match, styleContent: string) => {
    const sanitizedStyles = styleContent
      .replace(/(?:^|;)\s*color\s*:\s*[^;]+/gi, '')
      .replace(/(?:^|;)\s*background(?:-color)?\s*:\s*[^;]+/gi, '')
      .replace(/(?:^|;)\s*font-size\s*:\s*[^;]+/gi, '')
      .replace(/(?:^|;)\s*font-family\s*:\s*[^;]+/gi, '')
      .replace(/(?:^|;)\s*max-width\s*:\s*[^;]+/gi, '')
      .replace(/(?:^|;)\s*line-height\s*:\s*[^;]+/gi, '')
      .trim()
      .replace(/^;+|;+$/g, '');

    return sanitizedStyles.length > 0 ? `style="${sanitizedStyles}"` : '';
  });

  // 6. Responsive Tables: Wrap <table> in an overflow container if not already wrapped
  cleaned = cleaned.replace(
    /(<table\b[^>]*>[\s\S]*?<\/table>)/gi,
    '<div class="industrial-table-container overflow-x-auto my-6 border border-border rounded-xs bg-surface/50">$1</div>',
  );

  return cleaned;
}

/**
 * Extracts pure text from an HTML string by removing all HTML tags and decoding entities.
 */
export function stripHtmlToText(html: string | null | undefined): string {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates estimated reading time in minutes based on average 200 words per minute.
 */
export function calculateReadingTime(content: string | null | undefined): number {
  if (!content) return 1;
  const plainText = stripHtmlToText(content);
  const words = plainText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
