/**
 * Light/dark theme shared by the component pages and the index.
 *
 * Each page also applies the stored theme in an inline <head> script to avoid a flash of
 * the wrong theme before this module runs. Without a stored choice the page follows the OS,
 * so the toggle always writes an explicit "light" or "dark".
 */
const THEME_KEY = 'pd-theme';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

export function isDarkTheme(root = document.documentElement) {
  const theme = root.getAttribute('data-theme');
  return theme === 'dark' || (theme !== 'light' && prefersDark.matches);
}

export function bindThemeToggle(button) {
  const root = document.documentElement;
  const sync = () => button.setAttribute('aria-pressed', String(isDarkTheme(root)));

  prefersDark.addEventListener('change', sync);
  button.addEventListener('click', () => {
    const dark = !isDarkTheme(root);
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    try {
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    } catch {
      // Storage can be unavailable (private mode); the theme then applies to this page only
    }
    sync();
  });
  sync();
}
