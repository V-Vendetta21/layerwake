import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SiteAnalytics } from '@/components/website/site-analytics';
import { ThemeProvider } from '@/components/website/theme-provider';
import { GeistMono } from 'geist/font/mono';
import { TooltipProvider } from '@/components/ui/tooltip';
const inter = Inter({ subsets: ['latin'] });
const geistMono = GeistMono;

export const metadata: Metadata = {
  title:
    'Motion-Primitives - UI kit to make beautiful, animated interfaces, faster.',
  description:
    'Motion-Primitives is an open-source UI kit to make beautiful, animated interfaces, faster. Built for React, Next.js, and Tailwind CSS.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <SiteAnalytics />
      <body
        className={`${inter.className} ${geistMono.variable} bg-white font-sans antialiased dark:bg-zinc-950`}
      >
        <ThemeProvider attribute='class'>
          <TooltipProvider>
            <div className='isolate min-h-screen'>{children}</div>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
