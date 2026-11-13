import type { Metadata } from 'next';
import Link from 'next/link';
import { WaveBackdrop } from '@/components/layerwake/backdrop';
import { LayerwakeBrand } from '@/components/layerwake/logo';
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
      <nav className='lw-home__nav' aria-label='Layerwake'>
        <Link href='/' aria-label='Layerwake home'>
          <LayerwakeBrand />
        </Link>
        <div className='lw-home__links'>
          <Link href='/motion' aria-current='page'>
            Motion Gallery
          </Link>
          <Link href='/demo'>Demo page</Link>
          <Link href='/workspace'>Workspace</Link>
        </div>
      </nav>
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
