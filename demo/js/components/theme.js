/**
 * Light/dark theme shared by the component pages and the index.
 *
 * Each page also applies the stored theme in an inline <head> script to avoid a flash of
 * the wrong theme before this module runs.
 */
const THEME_KEY = 'pd-theme';

export function bindThemeToggle(button) {
  const root = document.documentElement;
  const sync = () => button.setAttribute('aria-pressed', String(root.getAttribute('data-theme') === 'dark'));

  button.addEventListener('click', () => {
    const dark = root.getAttribute('data-theme') !== 'dark';
    root.setAttribute('data-theme', dark ? 'dark' : '');
    try {
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    } catch {
      // Storage can be unavailable (private mode); the theme then applies to this page only
    }
    sync();
  });
  sync();
}
