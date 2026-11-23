// Whole-page theming: the production integration. The Preview tab shows the
// self-contained panel; this is how the same reveal switches a real site.
import { createSiteTheme } from './site-theme';
import { themeInitScript } from './site-theme-script';
import { ThemeToggle, useSiteTheme } from './site-theme-toggle';

/** 1. One store for the whole site. */
export const siteTheme = createSiteTheme({
  storageKey: 'my-site.theme',
  colors: { dark: '#080808', light: '#ffffff' },
});

/**
 * 2. Put this in your root layout's <head>, after a
 *    <meta name="theme-color">. It applies the saved theme before first paint.
 */
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeInitScript(siteTheme.options) }}
    />
  );
}

/** 3. Drop the button in any header, on any route. They all agree. */
export function HeaderThemeToggle() {
  const theme = useSiteTheme(siteTheme);
  return <ThemeToggle theme={theme} onThemeChange={siteTheme.set} />;
}

/*
  4. Style both themes from <html data-theme>:

  :root                 { --bg: #080808; --fg: #ffffff; color-scheme: dark; }
  :root[data-theme='light'] { --bg: #ffffff; --fg: #080808; color-scheme: light; }
  body                  { background: var(--bg); color: var(--fg); }
*/
