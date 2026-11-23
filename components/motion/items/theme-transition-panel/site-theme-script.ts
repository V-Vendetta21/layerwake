/**
 * A tiny script for the page's <head>. It applies the saved theme before the
 * first paint, so a refresh never flashes the wrong background. First-time
 * visitors get the default theme (dark). Unavailable storage is ignored.
 *
 * Plain strings only, so it can be imported from a server component.
 */
export function themeInitScript(options: {
  storageKey: string;
  colors: { light: string; dark: string };
}): string {
  const key = JSON.stringify(options.storageKey);
  const colors = JSON.stringify(options.colors);
  return (
    `(function(){var t='dark';` +
    `try{var v=localStorage.getItem(${key});if(v==='light'||v==='dark')t=v}catch(e){}` +
    `document.documentElement.setAttribute('data-theme',t);` +
    `var m=document.querySelector('meta[name="theme-color"]');` +
    `if(m)m.setAttribute('content',${colors}[t])})()`
  );
}
