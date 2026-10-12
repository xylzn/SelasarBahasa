import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML from the rich-text editor before rendering via dangerouslySetInnerHTML.
 * Allows standard prose tags; strips all event handlers and dangerous attributes.
 *
 * SECURITY: This is the primary defense against FINDING-001 (Stored XSS).
 * Never call dangerouslySetInnerHTML with unsanitized admin-authored HTML.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    // Allow standard prose/article content tags
    ALLOWED_TAGS: [
      'p', 'br',
      'h2', 'h3', 'h4',
      'strong', 'b', 'em', 'i', 'u', 's',
      'ul', 'ol', 'li',
      'a',
      'img',
      'blockquote',
      'code', 'pre',
      'hr',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: [
      // Links
      'href', 'target', 'rel',
      // Images
      'src', 'alt', 'width', 'height',
      // Tables
      'colspan', 'rowspan',
    ],
    // Force rel="noopener noreferrer" on all <a target="_blank">
    ADD_ATTR: ['target'],
    // Strip any remaining event handlers (belt-and-suspenders)
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
    // Prevent data: URIs in src attributes (SVG/XSS vector)
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORCE_BODY: true,
  });
}
