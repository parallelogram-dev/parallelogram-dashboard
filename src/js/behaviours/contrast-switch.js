/**
 * Standard or high contrast, or the system's choice, remembered across visits.
 *
 * The contrast is data-contrast="standard" or "more" on <html>; with neither, the page follows
 * prefers-contrast. As with ThemeSwitch, two kinds of control set it, anywhere in the page:
 *
 * - a [data-contrast-toggle] button flips between standard and high, and reports high with
 *   aria-pressed;
 * - [data-contrast-value="standard" | "more" | "system"] items choose one, and report the chosen
 *   one with aria-checked when they are role="radio", otherwise aria-pressed.
 *
 * The choice is stored under ContrastSwitch.storageKey. Apply it before the stylesheet paints with
 * the same <head> snippet as the theme, extended:
 *
 *   <script>try { var c = localStorage.getItem('pd-contrast'); if (c === 'standard' || c === 'more') document.documentElement.setAttribute('data-contrast', c); } catch (e) {}</script>
 *
 * ContrastSwitch.sync() brings controls added later in step. A change dispatches contrast:change
 * on <html> with { contrast, more }.
 */
export class ContrastSwitch {
  static storageKey = 'pd-contrast';

  static #media = window.matchMedia('(prefers-contrast: more)');

  static {
    document.addEventListener('click', (event) => {
      const toggle = event.target.closest('[data-contrast-toggle]');
      if (toggle) {
        ContrastSwitch.set(ContrastSwitch.isMore() ? 'standard' : 'more');
        return;
      }
      const choice = event.target.closest('[data-contrast-value]');
      if (choice) ContrastSwitch.set(choice.dataset.contrastValue);
    });
    ContrastSwitch.#media.addEventListener('change', () => ContrastSwitch.sync());
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => ContrastSwitch.sync(), { once: true });
    } else {
      ContrastSwitch.sync();
    }
  }

  /**
   * The chosen contrast: "standard", "more", or "system" when the page follows the OS.
   */
  static get() {
    const contrast = document.documentElement.getAttribute('data-contrast');
    return contrast === 'standard' || contrast === 'more' ? contrast : 'system';
  }

  /**
   * Whether high contrast is showing, whichever way that was chosen.
   */
  static isMore() {
    const contrast = ContrastSwitch.get();
    return contrast === 'more' || (contrast === 'system' && ContrastSwitch.#media.matches);
  }

  /**
   * Applies and remembers a contrast: "standard", "more", or "system" (or "") to follow the OS.
   */
  static set(contrast) {
    const root = document.documentElement;
    const chosen = contrast === 'standard' || contrast === 'more' ? contrast : 'system';

    if (chosen === 'system') {
      root.removeAttribute('data-contrast');
    } else {
      root.setAttribute('data-contrast', chosen);
    }

    try {
      if (chosen === 'system') {
        localStorage.removeItem(ContrastSwitch.storageKey);
      } else {
        localStorage.setItem(ContrastSwitch.storageKey, chosen);
      }
    } catch {
      // Storage can be unavailable (private browsing); the choice then lasts for this page only
    }

    ContrastSwitch.sync();
    root.dispatchEvent(new CustomEvent('contrast:change', { detail: { contrast: chosen, more: ContrastSwitch.isMore() } }));
  }

  /**
   * Brings every contrast control within root in step with the current contrast.
   */
  static sync(root = document) {
    const contrast = ContrastSwitch.get();
    const more = ContrastSwitch.isMore();

    root.querySelectorAll('[data-contrast-toggle]').forEach((toggle) => {
      toggle.setAttribute('aria-pressed', String(more));
    });
    root.querySelectorAll('[data-contrast-value]').forEach((choice) => {
      const value = choice.dataset.contrastValue === 'standard' || choice.dataset.contrastValue === 'more'
        ? choice.dataset.contrastValue
        : 'system';
      const attribute = choice.getAttribute('role') === 'radio' ? 'aria-checked' : 'aria-pressed';
      choice.setAttribute(attribute, String(value === contrast));
    });
  }
}
