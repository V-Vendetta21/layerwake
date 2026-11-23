import Link from 'next/link';
import { LayerwakeBrand } from './logo';
import { SiteThemeToggle } from './theme-toggle';

export interface NavLink {
  href: string;
  label: string;
  current?: boolean;
}

/** The header shared by the home, gallery and demo pages. */
export function SiteNav({ links }: { links: NavLink[] }) {
  return (
    <nav className='lw-home__nav' aria-label='Layerwake'>
      <Link href='/' aria-label='Layerwake home' className='lw-home__brand'>
        <LayerwakeBrand />
      </Link>
      <div className='lw-home__links'>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={link.current ? 'page' : undefined}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <SiteThemeToggle />
    </nav>
  );
}
