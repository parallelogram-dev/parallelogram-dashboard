/**
 * Tracks unsaved edits in a [data-unsaved-guard] area.
 *
 * Each field's value is recorded when the area is enhanced; while any differs (so undoing an edit
 * makes it clean again) the area gets data-dirty, as does the .tabs__trigger of any tab panel
 * holding a changed field, and leaving the page asks first. Fields inside [data-unsaved-ignore]
 * (e.g. rows that save themselves) don't count, and fields added later start clean. Dispatch
 * "unsaved:reset" on the area after saving to take the current values as saved. The area fires
 * "unsaved:change" with { dirty } when its state flips.
 */
export class UnsavedGuard {
  static dirty = new Set();

  static {
    window.addEventListener('beforeunload', (event) => {
      if (!UnsavedGuard.dirty.size) return;
      event.preventDefault();
      event.returnValue = '';
    });
  }

  constructor() {
    this.saved = new WeakMap();
  }

  mount(area) {
    if (this.saved.has(area)) return;
    this._record(area);
    const check = () => this._check(area);
    area.addEventListener('input', check);
    area.addEventListener('change', check);
    area.addEventListener('unsaved:reset', () => {
      this._record(area);
      this._check(area);
    });
  }

  /** Native fields, plus custom form fields with a name such as <p-datetime>. */
  _fields(area) {
    return [...area.querySelectorAll('input, select, textarea, [name]')]
      .filter(field => /^(INPUT|SELECT|TEXTAREA)$/.test(field.tagName) || field.localName.includes('-'))
      .filter(field => !['button', 'submit', 'reset', 'file', 'search'].includes(field.type))
      .filter(field => !field.closest('[data-unsaved-ignore]'));
  }

  /** A disabled field isn't submitted, so it counts as empty; a custom field not yet loaded reads its attribute. */
  _value(field) {
    if (field.disabled || field.hasAttribute('disabled')) return '';
    if (field.type === 'checkbox' || field.type === 'radio') return field.checked;
    return field.value ?? field.getAttribute('value') ?? '';
  }

  _record(area) {
    this.saved.set(area, new Map(this._fields(area).map(field => [field, this._value(field)])));
  }

  _check(area) {
    const saved = this.saved.get(area);
    const panels = new Set();
    let dirty = false;
    for (const field of this._fields(area)) {
      if (!saved.has(field)) saved.set(field, this._value(field));
      if (saved.get(field) === this._value(field)) continue;
      dirty = true;
      const panel = field.closest('[data-tab-panel]');
      if (panel) panels.add(panel.id);
    }

    area.querySelectorAll('.tabs__trigger[data-tab]').forEach((trigger) => {
      const changed = panels.has(trigger.dataset.tab);
      trigger.toggleAttribute('data-dirty', changed);
      if (changed) trigger.setAttribute('aria-description', 'Unsaved changes');
      else trigger.removeAttribute('aria-description');
    });

    if (dirty === area.hasAttribute('data-dirty')) return;
    area.toggleAttribute('data-dirty', dirty);
    if (dirty) UnsavedGuard.dirty.add(area);
    else UnsavedGuard.dirty.delete(area);
    area.dispatchEvent(new CustomEvent('unsaved:change', { bubbles: true, detail: { dirty } }));
  }

  static enhanceAll(selector = '[data-unsaved-guard]', root = document) {
    const instance = new UnsavedGuard();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}
