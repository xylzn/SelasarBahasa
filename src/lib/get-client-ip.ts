/**
 * Extract the trusted client IP address from a Web API Request.
 *
 * Priority order (most-trusted proxy header first → fallback → default):
 *   1. x-real-ip          — Vercel / Nginx / single-proxy deployments
 *   2. cf-connecting-ip   — Cloudflare edge
 *   3. 'unknown'          — Fallback when no trusted proxy header is present
 *
 * SECURITY: Only proxy headers set by a trusted edge (Cloudflare / Vercel /
 *           Nginx) are read. Client-supplied x-forwarded-for is intentionally
 *           NOT consulted to prevent IP spoofing.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('cf-connecting-ip') ??
    'unknown'
  );
}
