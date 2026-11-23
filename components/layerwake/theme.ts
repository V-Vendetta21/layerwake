import { createSiteTheme } from '@/components/motion/items/theme-transition-panel/site-theme';
import { THEME_COLORS, THEME_KEY } from './theme-config';

/**
 * Layerwake's one theme store. The header, the workspace toolbar and every
 * other control read and write it, so they always agree.
 */
export const siteTheme = createSiteTheme({
  storageKey: THEME_KEY,
  colors: THEME_COLORS,
});
