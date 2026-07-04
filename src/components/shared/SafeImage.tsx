/**
 * SafeImage — a wrapper around next/image that validates the src hostname
 * against the same allowlist as next.config.js remotePatterns.
 *
 * If the hostname is not in the list (or src is empty/invalid), it renders
 * a neutral placeholder div instead of calling next/image — preventing the
 * "hostname not configured" build/render error that would crash the section.
 *
 * Keep ALLOWED_HOSTNAME_PATTERNS in sync with next.config.js remotePatterns.
 */

import Image, { ImageProps } from 'next/image';

/** Patterns mirror next.config.js remotePatterns hostname values. */
const ALLOWED_HOSTNAME_PATTERNS: Array<string | RegExp> = [
  /\.supabase\.co$/,       // **.supabase.co
  'encrypted-tbn0.gstatic.com',
  /\.gstatic\.com$/,       // **.gstatic.com
  'images.unsplash.com',
  'i.pinimg.com',
];

function isAllowedHostname(src: string): boolean {
  let hostname: string;
  try {
    hostname = new URL(src).hostname;
  } catch {
    // Relative URLs or invalid strings: let next/image handle them (local assets)
    return true;
  }

  return ALLOWED_HOSTNAME_PATTERNS.some((pattern) => {
    if (typeof pattern === 'string') return hostname === pattern;
    return pattern.test(hostname);
  });
}

interface SafeImageProps extends ImageProps {
  /** Extra classes for the placeholder div (matches the container dimensions). */
  placeholderClassName?: string;
}

export default function SafeImage({
  src,
  alt,
  placeholderClassName,
  className,
  ...rest
}: SafeImageProps) {
  const srcStr = typeof src === 'string' ? src : '';

  if (!srcStr || !isAllowedHostname(srcStr)) {
    return (
      <div
        className={placeholderClassName ?? className ?? 'w-full h-full bg-gray-100'}
        role="img"
        aria-label={alt as string}
      />
    );
  }

  return <Image src={src} alt={alt} className={className} {...rest} />;
}
