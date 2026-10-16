import { defaultState, escape, normaliseOptions } from './lib.js';
import { formatHtml } from './format.js';
import { codeButton, refreshCode } from '../components/code-sheet.js';

const SETTINGS_KEY = 'pg-settings';
const FRAME_SRC = new URL('../../playground-frame.html', import.meta.url).href;

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage can be unavailable (private mode); settings then last for the page view only
  }
}

function segmented(label, attr, options) {
  const buttons = options
    .map(([value, text]) => `<button type="button" class="btn btn--outline btn--sm" ${attr}="${value}" aria-pressed="false">${text}</button>`)
    .join('');
  return `<div class="btn__group" role="group" aria-label="${label}">${buttons}</div>`;
}

const TEMPLATE = `
  <div class="pw__bar" role="toolbar" aria-label="Preview options">
    ${segmented('View', 'data-view', [['single', 'Single'], ['matrix', 'All variants']])}
    ${segmented('Viewport width', 'data-viewport', [['375', 'Mobile'], ['768', 'Tablet'], ['1280', 'Desktop'], ['full', 'Fit']])}
    <label class="switch">
      <input type="checkbox" class="switch__input" role="switch" data-checker>
      <span class="switch__label text--sm">Checkerboard</span>
    </label>
    <span class="pw__baraction" data-code-slot></span>
  </div>
  <div class="pw__body">
    <div class="pw__stage">
      <div class="pw__viewport" data-viewport-frame>
        <iframe class="pw__frame" title="Component preview" data-frame></iframe>
        <span class="pw__width text--xs text--muted" data-width-label></span>
      </div>
      <div class="pw__classes" data-classes-bar>
        <span class="text--xs text--muted">Classes</span>
        <code class="pw__classcode" data-classes></code>
        <button type="button" class="btn btn--ghost btn--sm" data-copy-classes>Copy</button>
        <button type="button" class="btn btn--ghost btn--sm" data-copy-selector>Copy selector</button>
      </div>
    </div>
    <aside class="pw__panel" aria-label="Controls">
      <div class="pw__presetsblock" data-presets-block>
        <h3 class="pw__heading">Presets</h3>
        <div class="pw__presets" data-presets></div>
      </div>
      <div class="pw__headingrow">
        <h3 class="pw__heading">Controls</h3>
        <button type="button" class="btn btn--link btn--sm" data-reset>Reset</button>
      </div>
      <form class="pw__controls" data-controls></form>
    </aside>
  </div>
`;

const COPY_ICON = '<svg class="icon" viewBox="0 0 24 24"><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"/><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"/></svg>';

/**
 * Class attribute of the element a spec's variants apply to, e.g. "btn btn--outline btn--sm".
 *
 * Specs name that element with a `target` selector; otherwise the first element is used.
 */
function targetClasses(spec, html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  const el = spec.target ? template.content.querySelector(spec.target) : template.content.firstElementChild;
  return el?.getAttribute('class') || '';
}

function toSelector(classes) {
  return classes.split(/\s+/).filter(Boolean).map(c => `.${c}`).join('');
}

async function copy(text, what) {
  try {
    await navigator.clipboard.writeText(text);
    window.toast?.success(`Copied ${what}: ${text}`, { duration: 2000 });
  } catch {
    window.toast?.error('Copy failed. Select the text and copy it manually.');
  }
}

const ID_REFERENCES = /(\s(?:id|for|aria-controls|aria-labelledby|aria-describedby|aria-owns|commandfor|headers|list)=")([^"]+)"/g;

/**
 * Give every id in a fragment a suffix, and update the attributes that refer to those ids.
 *
 * Each cell of the variants grid renders the same spec, so without this the copies would share
 * ids and toggles, labels and dialogs in later cells would act on the first one.
 */
function scopeIds(html, suffix) {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
  if (!ids.size) {
    return html;
  }
  const scope = value => (ids.has(value) ? `${value}${suffix}` : value);
  return html
    .replace(ID_REFERENCES, (match, attr, value) => `${attr}${value.split(/\s+/).map(scope).join(' ')}"`)
    .replace(/(\s(?:data-toggle-target|href)="#)([^"]+)"/g, (match, attr, value) => `${attr}${scope(value)}"`);
}

/**
 * Render an interactive playground for one spec into container.
 *
 * State lives in the URL hash as query parameters (e.g. `#variant=destructive&size=sm`) so
 * a configured preview can be shared. Only values that differ from the defaults are written.
 * Returns the current markup getter for callers such as "Copy for LLM".
 */
export function mountPlayground(container, spec) {
  container.classList.add('pw');
  container.innerHTML = TEMPLATE;

  const $ = selector => container.querySelector(selector);
  const els = {
    viewport: $('[data-viewport-frame]'),
    widthLabel: $('[data-width-label]'),
    frame: $('[data-frame]'),
    classesBar: $('[data-classes-bar]'),
    classes: $('[data-classes]'),
    presetsBlock: $('[data-presets-block]'),
    presets: $('[data-presets]'),
    controls: $('[data-controls]'),
    checker: $('[data-checker]'),
  };

  const settings = { view: 'single', viewport: 'full', checker: false, ...loadSettings() };
  let state = defaultState(spec);
  let frameReady = false;
  let markup = '';

  const codeTrigger = codeButton({
    title: `${spec.name} playground`,
    description: 'Markup for the current controls and preset.',
    getCode: () => markup,
    className: 'btn btn--outline btn--sm',
  });
  $('[data-code-slot]').append(codeTrigger);

  function readHash() {
    state = defaultState(spec);
    const params = new URLSearchParams(location.hash.replace(/^#/, ''));
    for (const control of spec.controls) {
      if (params.has(control.key)) {
        const raw = params.get(control.key);
        state[control.key] = control.type === 'toggle' ? raw === '1' : raw;
      }
    }
  }

  function writeHash() {
    const defaults = defaultState(spec);
    const params = new URLSearchParams();
    for (const control of spec.controls) {
      const value = state[control.key];
      if (value !== defaults[control.key]) {
        params.set(control.key, control.type === 'toggle' ? (value ? '1' : '0') : value);
      }
    }
    const query = params.toString();
    history.replaceState(null, '', query ? `#${query}` : location.pathname + location.search);
  }

  function renderControls() {
    els.controls.innerHTML = spec.controls.map(control => {
      const id = `pw-control-${control.key}`;
      const value = state[control.key];

      if (control.type === 'toggle') {
        return `<div class="pw__field" data-field="${control.key}">
          <label class="switch"><input id="${id}" type="checkbox" class="switch__input" role="switch" name="${control.key}"${value ? ' checked' : ''}>
          <span class="switch__label text--sm">${escape(control.label)}</span></label></div>`;
      }

      const label = `<label class="pw__label" for="${id}">${escape(control.label)}</label>`;
      if (control.type === 'select') {
        const options = normaliseOptions(control.options)
          .map(o => `<option value="${escape(o.value)}"${o.value === value ? ' selected' : ''}>${escape(o.label)}</option>`)
          .join('');
        return `<div class="pw__field" data-field="${control.key}">${label}<select id="${id}" class="select input--sm" name="${control.key}">${options}</select></div>`;
      }

      return `<div class="pw__field" data-field="${control.key}">${label}<input id="${id}" type="text" class="input input--sm" name="${control.key}" value="${escape(value)}"></div>`;
    }).join('');
    updateVisibility();
  }

  function updateVisibility() {
    for (const control of spec.controls) {
      const field = els.controls.querySelector(`[data-field="${control.key}"]`);
      field.hidden = control.when ? !control.when(state) : false;
    }
  }

  function renderPresets() {
    const presets = spec.presets || [];
    els.presetsBlock.hidden = presets.length === 0;
    els.presets.innerHTML = presets
      .map((p, i) => `<button type="button" class="btn btn--outline btn--sm" data-preset="${i}">${escape(p.name)}</button>`)
      .join('');
  }

  function matrixHtml() {
    const rowsControl = spec.controls.find(c => c.key === spec.matrix.rows);
    const colsControl = spec.controls.find(c => c.key === spec.matrix.cols);
    const axis = control => (control.type === 'toggle'
      ? [{ value: false, label: 'Off' }, { value: true, label: 'On' }]
      : normaliseOptions(control.options));
    const rows = axis(rowsControl);
    const cols = axis(colsControl);

    const head = `<tr><th></th>${cols.map(c => `<th scope="col">${escape(colsControl.label)}: ${escape(c.label)}</th>`).join('')}</tr>`;
    const body = rows.map((r, ri) => {
      const cells = cols.map((c, ci) => {
        const html = scopeIds(spec.render({ ...state, [rowsControl.key]: r.value, [colsControl.key]: c.value }), `-r${ri}c${ci}`);
        const classes = escape(targetClasses(spec, html));
        return `<td><div class="pg-cell"><div class="pg-cell__preview">${html}</div>`
          + `<button type="button" class="pg-class" data-copy-text="${classes}" title="Copy class names"><code>${classes}</code>${COPY_ICON}</button></div></td>`;
      });
      return `<tr><th scope="row">${escape(r.label)}</th>${cells.join('')}</tr>`;
    });
    return `<table class="pg-matrix"><thead>${head}</thead><tbody>${body.join('')}</tbody></table>`;
  }

  function renderPreview() {
    if (!frameReady) {
      return;
    }
    const root = els.frame.contentDocument.getElementById('root');
    const html = spec.render(state);
    const matrix = settings.view === 'matrix' && spec.matrix;

    root.className = spec.layout ? `pg-stage pg-stage--${spec.layout}` : 'pg-stage';
    root.innerHTML = matrix ? matrixHtml() : html;
    els.frame.contentWindow.Parallelogram?.init(root);

    markup = formatHtml(html);
    refreshCode();
    els.classes.textContent = targetClasses(spec, html);
    codeTrigger.disabled = Boolean(matrix);
    els.classesBar.hidden = Boolean(matrix);
  }

  function applySettings() {
    if (frameReady) {
      const doc = els.frame.contentDocument;
      doc.documentElement.setAttribute('data-theme', document.documentElement.getAttribute('data-theme') || '');
      doc.body.classList.toggle('pg-checker', settings.checker);
    }

    // Page-level layouts (navbar, sidebar, dashboard) collapse below 1024px, so they open at desktop width
    const viewport = settings.viewport === 'full' && spec.layout === 'full' ? '1280' : settings.viewport;
    els.viewport.style.width = viewport === 'full' ? '' : `${viewport}px`;
    els.viewport.style.maxWidth = viewport === 'full' ? '' : 'none';
    els.checker.checked = settings.checker;
    container.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === settings.view)));
    container.querySelectorAll('[data-viewport]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.viewport === viewport)));
    container.querySelector('[data-view="matrix"]').disabled = !spec.matrix;
  }

  function update() {
    updateVisibility();
    writeHash();
    renderPreview();
  }

  els.controls.addEventListener('input', event => {
    const control = spec.controls.find(c => c.key === event.target.name);
    if (!control) {
      return;
    }
    state[control.key] = control.type === 'toggle' ? event.target.checked : event.target.value;
    update();
  });

  els.controls.addEventListener('submit', event => event.preventDefault());

  els.presets.addEventListener('click', event => {
    const button = event.target.closest('[data-preset]');
    if (!button) {
      return;
    }
    state = { ...defaultState(spec), ...spec.presets[button.dataset.preset].state };
    renderControls();
    update();
  });

  $('[data-reset]').addEventListener('click', () => {
    state = defaultState(spec);
    renderControls();
    update();
  });

  container.addEventListener('click', event => {
    const view = event.target.closest('[data-view]');
    const viewport = event.target.closest('[data-viewport]');
    if (view) {
      settings.view = view.dataset.view;
    } else if (viewport) {
      settings.viewport = viewport.dataset.viewport;
    } else {
      return;
    }
    saveSettings(settings);
    applySettings();
    renderPreview();
  });

  els.checker.addEventListener('change', () => {
    settings.checker = els.checker.checked;
    saveSettings(settings);
    applySettings();
  });

  $('[data-copy-classes]').addEventListener('click', () => copy(els.classes.textContent, 'classes'));
  $('[data-copy-selector]').addEventListener('click', () => copy(toSelector(els.classes.textContent), 'selector'));

  new ResizeObserver(() => {
    els.widthLabel.textContent = `${Math.round(els.frame.getBoundingClientRect().width)}px`;
  }).observe(els.viewport);

  // Follow the page's theme so the preview always matches the surrounding docs
  new MutationObserver(applySettings).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  window.addEventListener('hashchange', () => {
    readHash();
    renderControls();
    renderPreview();
  });

  els.frame.addEventListener('load', () => {
    els.frame.contentDocument.addEventListener('click', event => {
      const button = event.target.closest('[data-copy-text]');
      if (button) {
        copy(button.dataset.copyText, 'classes');
      }
    });
    frameReady = true;
    applySettings();
    renderPreview();
  });

  readHash();
  renderPresets();
  renderControls();
  applySettings();
  els.frame.src = FRAME_SRC;

  return { markup: () => markup };
}
