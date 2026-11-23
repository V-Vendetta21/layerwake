'use client';

import {
  ThemeToggle,
  useSiteTheme,
} from '@/components/motion/items/theme-transition-panel/site-theme-toggle';
import { siteTheme } from './theme';

/**
 * The sun/moon button for every header. It is the gallery's Theme Transition
 * Panel circle, applied to the whole document.
 */
export function SiteThemeToggle() {
  const theme = useSiteTheme(siteTheme);
  return (
    <ThemeToggle
      theme={theme}
      onThemeChange={siteTheme.set}
      className='lw-theme-toggle'
    />
  );
}
