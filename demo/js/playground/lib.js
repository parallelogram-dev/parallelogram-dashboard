/**
 * Helpers shared by playground component specs.
 *
 * Specs must stay DOM-free so the coverage check can render them under Node.
 */

/**
 * Build a BEM class string from a block and a list of modifiers.
 *
 * Falsy modifiers are skipped, so `bem('btn', size, full && 'full')` reads naturally.
 */
export function bem(block, ...modifiers) {
  return [block, ...modifiers.filter(Boolean).map(m => `${block}--${m}`)].join(' ');
}

/** Join class names, dropping falsy entries. */
export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function escape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Tabler icon paths (MIT) used across specs. */
export const ICONS = {
  plus: '<path d="M12 5l0 14"/><path d="M5 12l14 0"/>',
  download: '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"/><path d="M7 11l5 5l5 -5"/><path d="M12 4l0 12"/>',
  trash: '<path d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>',
  x: '<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>',
  check: '<path d="M5 12l5 5l10 -10"/>',
  loader: '<path d="M12 3a9 9 0 1 0 9 9"/>',
  search: '<path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/><path d="M21 21l-6 -6"/>',
  mail: '<path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z"/><path d="M3 7l9 6l9 -6"/>',
  star: '<path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/>',
  dots: '<path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>',
  info: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 9h.01"/><path d="M11 12h1v4h1"/>',
  success: '<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M9 12l2 2l4 -4"/>',
  warning: '<path d="M12 9v4"/><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"/><path d="M12 16h.01"/>',
  error: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 9v4"/><path d="M12 16h.01"/>',
};

export function icon(name, className = '') {
  return `<svg class="${cx('icon', className)}" viewBox="0 0 24 24">${ICONS[name]}</svg>`;
}

/**
 * Normalise select options to `{ value, label }`.
 *
 * An empty-string value is shown as "None", meaning "no modifier class".
 */
export function normaliseOptions(options) {
  return options.map(o => (typeof o === 'object' ? o : { value: o, label: o === '' ? 'None' : o }));
}

/** Resolve a spec's default state from its controls. */
export function defaultState(spec) {
  const state = {};
  for (const control of spec.controls) {
    if (control.default !== undefined) {
      state[control.key] = control.default;
    } else if (control.type === 'select') {
      state[control.key] = normaliseOptions(control.options)[0].value;
    } else if (control.type === 'toggle') {
      state[control.key] = false;
    } else {
      state[control.key] = '';
    }
  }
  return state;
}
