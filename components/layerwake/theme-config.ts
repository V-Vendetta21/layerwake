/**
 * The site's theme settings. Plain constants, so the root layout (a server
 * component) can use them for the pre-paint script without pulling in React.
 */
export const THEME_KEY = 'layerwake.theme';

/** Browser UI colours (<meta name="theme-color">). They match each canvas. */
export const THEME_COLORS = { dark: '#080808', light: '#f5f5f5' } as const;
