import type { Metadata } from 'next';
import Link from 'next/link';
import { DemoCard } from '@/components/layerwake/demo-card';
import { LayerwakeBrand } from '@/components/layerwake/logo';

export const metadata: Metadata = {
  title: 'Demo component — Layerwake',
};

export default function DemoPage() {
  return (
    <div className='lw-demo'>
      <nav className='lw-home__nav' aria-label='Layerwake'>
        <Link href='/' aria-label='Layerwake home'>
          <LayerwakeBrand />
        </Link>
        <div className='lw-home__links'>
          <Link href='/motion'>Motion Gallery</Link>
          <Link href='/workspace'>Workspace</Link>
        </div>
      </nav>

      <h1>A component to practice on</h1>
      <p className='lw-demo__lede'>
        This coastal weather card is plain HTML and CSS, made for Layerwake.
        Capture it with the extension to run the whole loop yourself.
      </p>

      <div className='lw-demo__stage lw-dots'>
        <DemoCard />
      </div>

      <div className='lw-split' style={{ paddingTop: 0 }}>
        <div>
          <h2>Capture it</h2>
          <ol>
            <li>
              Click the Layerwake toolbar button, then{' '}
              <strong>Capture component</strong>.
            </li>
            <li>
              Hover the card until the outline wraps all of it, and click.
            </li>
            <li>
              Check the summary, then choose{' '}
              <strong>Download Layerwake JSON</strong>.
            </li>
            <li>
              Open the <Link href='/workspace'>workspace</Link> and import the
              file.
            </li>
          </ol>
        </div>
        <div>
          <h2>No extension yet?</h2>
          <p>
            The same card ships as a ready-made capture.{' '}
            <Link href='/workspace?demo=1'>Try the demo</Link> to skip straight
            to inspecting and rebuilding.
          </p>
          <p>
            To install the extension, run{' '}
            <code className='lw-code-inline'>npm run build:extension</code> and
            load <code className='lw-code-inline'>extension/dist</code> as an
            unpacked extension. The README has the full steps.
          </p>
        </div>
      </div>
    </div>
  );
}
