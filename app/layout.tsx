import './globals.css';
import './layerwake.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GeistMono } from 'geist/font/mono';
import { THEME_COLORS, THEME_KEY } from '@/components/layerwake/theme-config';
import { themeInitScript } from '@/components/motion/items/theme-transition-panel/site-theme-script';

const inter = Inter({ subsets: ['latin'] });

/**
 * Rounded scrollbar thumbs need ::-webkit-scrollbar, which turns overlay
 * scrollbars into permanent ones. So that styling is only switched on when
 * the system already shows classic scrollbars (they take up layout width).
 */
const SCROLLBAR_SCRIPT = `(function(){try{var d=document,p=d.createElement('div');p.style.cssText='position:absolute;top:-999px;width:80px;height:80px;overflow:scroll';d.documentElement.appendChild(p);var classic=p.offsetWidth-p.clientWidth>0;p.remove();d.documentElement.setAttribute('data-lw-scrollbars',classic?'classic':'overlay')}catch(e){}})()`;

export const metadata: Metadata = {
  title: 'Layerwake — See how interfaces are built. Make them your own.',
  description:
    'Capture one UI component, inspect its spacing, type and color decisions, rebuild your own variant and export design tokens and starter code.',
};

/**
 * Applies the saved theme before the first paint. First-time visitors get the
 * dark theme. The <meta name="theme-color"> is written by hand (not through
 * the viewport export) so this script can update it before anything renders.
 */
const THEME_SCRIPT = themeInitScript({
  storageKey: THEME_KEY,
  colors: THEME_COLORS,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <meta
          name='theme-color'
          content={THEME_COLORS.dark}
          suppressHydrationWarning
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: SCROLLBAR_SCRIPT }} />
      </head>
      <body className={`${inter.className} ${GeistMono.variable} antialiased`}>
        <div className='lw-app'>{children}</div>
      </body>
    </html>
  );
}
