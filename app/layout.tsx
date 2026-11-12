import './globals.css';
import './layerwake.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GeistMono } from 'geist/font/mono';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Layerwake — See how interfaces are built. Make them your own.',
  description:
    'Capture one UI component, inspect its spacing, type and color decisions, rebuild your own variant and export design tokens and starter code.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={`${inter.className} ${GeistMono.variable} antialiased`}>
        <div className='lw-app'>{children}</div>
      </body>
    </html>
  );
}
