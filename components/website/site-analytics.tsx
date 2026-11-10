'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

/**
 * Third-party page analytics for the Motion-Primitives site. Layerwake routes
 * are excluded: that tool promises to make no outside requests.
 */
export function SiteAnalytics() {
  const pathname = usePathname();
  if (process.env.NODE_ENV === 'development') return null;
  if (pathname?.startsWith('/layerwake')) return null;
  return (
    <Script async defer src='https://assets.onedollarstats.com/stonks.js' />
  );
}
