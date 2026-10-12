/**
 * Escape user-controlled strings before interpolating into raw HTML email templates.
 * Prevents Email HTML Injection / Stored XSS in email clients.
 *
 * Escapes the 5 SGML/XML special characters per OWASP XSS Prevention Rule #1.
 * Also escapes backtick as defense-in-depth for legacy email clients with IE-like parsers.
 */
export function escapeHtml(input: string | null | undefined): string {
  if (input == null) return '';
  const str = String(input);
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    switch (c) {
      case 0x26: // &
        out += '&amp;';
        break;
      case 0x3c: // <
        out += '&lt;';
        break;
      case 0x3e: // >
        out += '&gt;';
        break;
      case 0x22: // "
        out += '&quot;';
        break;
      case 0x27: // '
        out += '&#x27;';
        break;
      case 0x60: // ` (defense-in-depth)
        out += '&#x60;';
        break;
      default:
        out += str[i];
    }
  }
  return out;
}
