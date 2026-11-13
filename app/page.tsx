import Link from 'next/link';
import { HomeBackdrop } from '@/components/layerwake/backdrop';
import { HomeActions, HomeSample } from '@/components/layerwake/home';
import { LayerwakeBrand } from '@/components/layerwake/logo';

const STEPS = [
  {
    title: 'Capture',
    text: 'Pick one component on a page you can inspect. The extension saves its structure and measurements to a local file.',
  },
  {
    title: 'Inspect',
    text: 'Walk the layer tree. See the spacing, type, color, radius and shadow values behind each part.',
  },
  {
    title: 'Rebuild',
    text: 'Change the palette, type size, gaps, padding and corners. The preview follows every edit.',
  },
  {
    title: 'Export',
    text: 'Leave with CSS variables, a tokens file and clean HTML and CSS built on placeholder content.',
  },
];

export default function LayerwakeHome() {
  return (
    <div className='lw-home'>
      <HomeBackdrop />
      <nav className='lw-home__nav' aria-label='Layerwake'>
        <Link href='/' aria-label='Layerwake home'>
          <LayerwakeBrand />
        </Link>
        <div className='lw-home__links'>
          <Link href='/motion'>Motion Gallery</Link>
          <Link href='/demo'>Demo page</Link>
          <Link href='/workspace'>Workspace</Link>
        </div>
      </nav>

      <main>
        <section className='lw-hero'>
          <div>
            <h1>
              See how interfaces are built. <span>Make them your own.</span>
            </h1>
            <p className='lw-hero__lede'>
              Layerwake turns one UI component into a layer tree, a set of
              design tokens and starter code you can adapt.
            </p>
            <HomeActions />
          </div>
          <HomeSample />
        </section>

        <ol className='lw-steps'>
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <b>0{index + 1}</b>
              <h2>{step.title}</h2>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>

        <section className='lw-split'>
          <div>
            <h2>What a capture holds</h2>
            <p>
              Sizes, positions, generic tag names and an allowlist of computed
              styles. Page text, form values, attributes, links and asset URLs
              are left behind, so a rebuild always starts from placeholder
              content.
            </p>
            <p>
              One capture is one component at one viewport size. Full pages and
              screenshots are out of scope for this release.
            </p>
          </div>
          <div>
            <h2>Capture your own</h2>
            <ol>
              <li>
                Build the extension with{' '}
                <code className='lw-code-inline'>npm run build:extension</code>.
              </li>
              <li>
                In Chrome, open the extensions page, turn on Developer mode and
                load <code className='lw-code-inline'>extension/dist</code>.
              </li>
              <li>
                Practice on the <Link href='/demo'>demo page</Link>, then import
                the file here.
              </li>
            </ol>
          </div>
        </section>
      </main>

      <footer className='lw-footer'>
        Layerwake. See how interfaces are built. Make them your own.
      </footer>
    </div>
  );
}
