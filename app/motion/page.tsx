import type { Metadata } from 'next';
import { WaveBackdrop } from '@/components/layerwake/backdrop';
import { SiteNav } from '@/components/layerwake/site-nav';
import { CATALOG } from '@/components/motion/catalog';
import { MotionGallery } from '@/components/motion/gallery';
import './motion.css';

export const metadata: Metadata = {
  title: 'Motion Gallery — Layerwake',
  description:
    'Small, reusable React motion components with live previews and copyable source.',
};

export default function MotionPage() {
  return (
    <div className='lw-home mgx'>
      <WaveBackdrop blurred />
      <SiteNav
        links={[
          { href: '/motion', label: 'Motion Gallery', current: true },
          { href: '/demo', label: 'Demo page' },
          { href: '/workspace', label: 'Workspace' },
        ]}
      />
      <main>
        <header className='mgx-hero'>
          <h1>{CATALOG.length} motion components you can copy</h1>
          <p>
            Each one is a React file and a CSS file, sometimes with a small
            helper, and nothing to install beyond React. Try it in Preview, then
            take the source from Code. Every component respects reduced-motion
            settings.
          </p>
        </header>
        <MotionGallery />
      </main>
      <footer className='lw-footer'>
        Layerwake. See how interfaces are built. Make them your own.
      </footer>
    </div>
  );
}
