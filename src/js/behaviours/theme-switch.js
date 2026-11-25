/**
 * Light, dark or the system's choice, remembered across visits.
 *
 * The theme is data-theme="light" or "dark" on <html>; with neither, the page follows
 * prefers-color-scheme. Two kinds of control set it, anywhere in the page:
 *
 * - a [data-theme-toggle] button flips between light and dark, and reports which is showing
 *   with aria-pressed (true when dark);
 * - [data-theme-value="light" | "dark" | "system"] items choose one, and report the chosen one
 *   with aria-checked when they are role="radio", otherwise aria-pressed, which suits the items
 *   of a .segmented-control.
 *
 * The choice is stored under ThemeSwitch.storageKey. To apply it before the stylesheet paints,
 * so a dark page never flashes light, put this in the <head> ahead of the stylesheet:
 *
 *   <script>try { var t = localStorage.getItem('pd-theme'); if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t); } catch (e) {}</script>
 *
 * Controls added later, such as in a page swapped in by a router, are kept in step by calling
 * ThemeSwitch.sync(). A change dispatches theme:change on <html> with { theme, dark }.
 */
export class ThemeSwitch {
  static storageKey = 'pd-theme';

  static #media = window.matchMedia('(prefers-color-scheme: dark)');

  static {
    document.addEventListener('click', (event) => {
      const toggle = event.target.closest('[data-theme-toggle]');
      if (toggle) {
        ThemeSwitch.set(ThemeSwitch.isDark() ? 'light' : 'dark');
        return;
      }
      const choice = event.target.closest('[data-theme-value]');
      if (choice) ThemeSwitch.set(choice.dataset.themeValue);
    });
    ThemeSwitch.#media.addEventListener('change', () => ThemeSwitch.sync());
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => ThemeSwitch.sync(), { once: true });
    } else {
      ThemeSwitch.sync();
    }
  }

  /**
   * The chosen theme: "light", "dark", or "system" when the page follows the OS.
   */
  static get() {
    const theme = document.documentElement.getAttribute('data-theme');
    return theme === 'light' || theme === 'dark' ? theme : 'system';
  }

  /**
   * Whether the page is showing dark, whichever way that was chosen.
   */
  static isDark() {
    const theme = ThemeSwitch.get();
    return theme === 'dark' || (theme === 'system' && ThemeSwitch.#media.matches);
  }

  /**
   * Applies and remembers a theme: "light", "dark", or "system" (or "") to follow the OS.
   */
  static set(theme) {
    const root = document.documentElement;
    const chosen = theme === 'light' || theme === 'dark' ? theme : 'system';

    if (chosen === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', chosen);
    }

    try {
      if (chosen === 'system') {
        localStorage.removeItem(ThemeSwitch.storageKey);
      } else {
        localStorage.setItem(ThemeSwitch.storageKey, chosen);
      }
    } catch {
      // Storage can be unavailable (private browsing); the choice then lasts for this page only
    }

    ThemeSwitch.sync();
    root.dispatchEvent(new CustomEvent('theme:change', { detail: { theme: chosen, dark: ThemeSwitch.isDark() } }));
  }

  /**
   * Brings every theme control within root in step with the current theme.
   */
  static sync(root = document) {
    const theme = ThemeSwitch.get();
    const dark = ThemeSwitch.isDark();

    root.querySelectorAll('[data-theme-toggle]').forEach((toggle) => {
      toggle.setAttribute('aria-pressed', String(dark));
    });
    root.querySelectorAll('[data-theme-value]').forEach((choice) => {
      const value = choice.dataset.themeValue === 'light' || choice.dataset.themeValue === 'dark'
        ? choice.dataset.themeValue
        : 'system';
      const attribute = choice.getAttribute('role') === 'radio' ? 'aria-checked' : 'aria-pressed';
      choice.setAttribute(attribute, String(value === theme));
    });
  }
}
