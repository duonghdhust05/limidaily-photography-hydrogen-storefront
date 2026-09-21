import {describe, it, expect} from 'vitest';
import {
  cleanHtmlContent,
  stripHtmlToText,
  calculateReadingTime,
} from '~/lib/htmlSanitizer';

describe('HTML Sanitizer & Transformer', () => {
  describe('cleanHtmlContent', () => {
    it('should return empty string for null or empty input', () => {
      expect(cleanHtmlContent(null)).toBe('');
      expect(cleanHtmlContent(undefined)).toBe('');
      expect(cleanHtmlContent('')).toBe('');
    });

    it('should strip malicious <script> tags and content', () => {
      const dirty = '<p>Cinema Tech</p><script>alert("xss")</script><p>Clean Text</p>';
      const cleaned = cleanHtmlContent(dirty);
      expect(cleaned).not.toContain('<script');
      expect(cleaned).not.toContain('alert("xss")');
      expect(cleaned).toContain('<p>Cinema Tech</p>');
      expect(cleaned).toContain('<p>Clean Text</p>');
    });

    it('should strip <iframe> elements', () => {
      const dirty = '<div>Before</div><iframe src="https://attacker.com"></iframe><div>After</div>';
      const cleaned = cleanHtmlContent(dirty);
      expect(cleaned).not.toContain('<iframe');
      expect(cleaned).not.toContain('attacker.com');
      expect(cleaned).toContain('<div>Before</div>');
    });

    it('should strip inline event handlers (onerror, onload, onclick) to eliminate DOM XSS vectors', () => {
      const dirty = '<img src="invalid.jpg" onerror="stealCookies()" /><svg onload="exploit()"><a onclick="evil()">Click</a></svg>';
      const cleaned = cleanHtmlContent(dirty);
      expect(cleaned).not.toContain('onerror');
      expect(cleaned).not.toContain('onload');
      expect(cleaned).not.toContain('onclick');
      expect(cleaned).not.toContain('stealCookies()');
      expect(cleaned).not.toContain('exploit()');
    });

    it('should neutralize javascript: and vbscript: pseudo-protocol URIs in links and sources', () => {
      const dirty = '<a href="javascript:alert(document.domain)">Payload</a><a href="vbscript:msgbox(1)">VisualBasic</a>';
      const cleaned = cleanHtmlContent(dirty);
      expect(cleaned).not.toContain('href="javascript:');
      expect(cleaned).not.toContain('href="vbscript:');
      expect(cleaned).toContain('Payload');
      expect(cleaned).toContain('VisualBasic');
    });

    it('should strip dangerous executable object, embed, applet, base and form tags', () => {
      const dirty = '<object data="malicious.swf"></object><embed src="bad.pdf"></embed><form action="/evil"><input /></form><base href="http://evil.com">';
      const cleaned = cleanHtmlContent(dirty);
      expect(cleaned).not.toContain('<object');
      expect(cleaned).not.toContain('<embed');
      expect(cleaned).not.toContain('<form');
      expect(cleaned).not.toContain('<base');
    });

    it('should demote inner <h1> tags to <h2> to protect SEO heading structure', () => {
      const raw = '<h1 class="font-bold">Main Section</h1><p>Body</p>';
      const cleaned = cleanHtmlContent(raw);
      expect(cleaned).not.toContain('<h1');
      expect(cleaned).toContain('<h2 class="font-bold">Main Section</h2>');
    });

    it('should strip destructive inline styling (color, font-family, background)', () => {
      const raw = '<p style="color: red; font-family: Comic Sans; background: yellow; text-align: center;">Hello</p>';
      const cleaned = cleanHtmlContent(raw);
      expect(cleaned).not.toContain('color: red');
      expect(cleaned).not.toContain('font-family');
      expect(cleaned).not.toContain('background: yellow');
      expect(cleaned).toContain('text-align: center');
    });

    it('should wrap <table> tags in an industrial responsive container', () => {
      const raw = '<table><thead><tr><th>Spec</th><th>Value</th></tr></thead></table>';
      const cleaned = cleanHtmlContent(raw);
      expect(cleaned).toContain('industrial-table-container');
      expect(cleaned).toContain('overflow-x-auto');
      expect(cleaned).toContain('<table><thead><tr><th>Spec</th><th>Value</th></tr></thead></table>');
    });
  });

  describe('stripHtmlToText', () => {
    it('should strip HTML tags and decode HTML entities', () => {
      const html = '<p>Limi &amp; Co. &lt;Optics&gt; &quot;Pro&quot;</p>';
      expect(stripHtmlToText(html)).toBe('Limi & Co. <Optics> "Pro"');
    });

    it('should collapse whitespace and handle empty values', () => {
      expect(stripHtmlToText('  <div>   Line 1  </div> \n <div> Line 2 </div>  ')).toBe('Line 1 Line 2');
      expect(stripHtmlToText(null)).toBe('');
      expect(stripHtmlToText('')).toBe('');
    });
  });

  describe('calculateReadingTime', () => {
    it('should return at least 1 minute for short content', () => {
      expect(calculateReadingTime('Short introduction')).toBe(1);
      expect(calculateReadingTime('')).toBe(1);
      expect(calculateReadingTime(null)).toBe(1);
    });

    it('should calculate reading time correctly based on 200 words per minute', () => {
      const words400 = new Array(400).fill('word').join(' ');
      expect(calculateReadingTime(words400)).toBe(2);

      const words550 = new Array(550).fill('word').join(' ');
      expect(calculateReadingTime(words550)).toBe(3);
    });
  });
});
