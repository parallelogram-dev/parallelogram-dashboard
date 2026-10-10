import { bem, escape } from '../lib.js';

const ROW_FIELDS = [
  ['first', 'First name', 'Jane'],
  ['last', 'Last name', 'Cooper'],
  ['title', 'Job title', 'Editor'],
  ['phone', 'Phone', '+61 400 000 000'],
];

const COUNTERS = {
  ok: ['35 / 200', ''],
  warning: ['184 / 200', 'warning'],
  error: ['212 / 200', 'error'],
};

function label(id, text, marker = '') {
  return `<label class="form__label" for="${id}">${escape(text)}${marker}</label>`;
}

function textField([key, text, placeholder], s, first = false) {
  const id = `pg-form-${key}`;
  const required = s.markers && first;
  const marker = required ? ' <span class="form__required" aria-hidden="true">*</span>' : '';
  return `<div class="form__field">${label(id, text, marker)}`
    + `<input type="text" id="${id}" class="input form__control" placeholder="${escape(placeholder)}"${required ? ' required' : ''}></div>`;
}

function nameFields(s) {
  const count = { '': 2, 2: 2, 3: 3, 4: 4, '1-2': 2, '2-1': 2 }[s.row];
  const fields = ROW_FIELDS.slice(0, count).map((f, i) => textField(f, s, i === 0)).join('');
  return s.row ? `<div class="${bem('form__row', s.row)}">${fields}</div>` : fields;
}

function emailField(s) {
  const id = 'pg-form-email';
  const invalid = s.state === 'error';
  const messageId = `${id}-message`;
  const message = invalid
    ? `<p class="form__error" id="${messageId}">Please enter a valid email address.</p>`
    : `<p class="form__description" id="${messageId}">We'll never share your email.</p>`;
  return `<div class="form__field">${label(id, 'Email address')}`
    + `<input type="email" id="${id}" class="input form__control" value="${invalid ? 'jane@' : 'jane@example.com'}"`
    + ` aria-describedby="${messageId}"${invalid ? ' aria-invalid="true"' : ''}>${message}</div>`;
}

function groupField(s) {
  if (s.group === 'block') {
    return '<div class="form__field"><label class="form__label" for="pg-form-street">Address</label>'
      + '<div class="form__group form__group--block">'
      + '<input type="text" id="pg-form-street" class="input form__control" placeholder="Street address" aria-label="Street address">'
      + '<input type="text" class="input form__control" placeholder="Suburb" aria-label="Suburb">'
      + '<input type="text" class="input form__control" placeholder="Postcode" aria-label="Postcode">'
      + '</div></div>';
  }
  const input = '<input type="text" id="pg-form-website" class="input form__control" placeholder="example.com">';
  const parts = s.group === 'button'
    ? `${input}<button type="button" class="btn btn--outline">Verify</button>`
    : `<span class="form__addon">https://</span>${input}`;
  return `<div class="form__field">${label('pg-form-website', 'Website')}<div class="form__group">${parts}</div></div>`;
}

function roleField() {
  return `<div class="form__field">${label('pg-form-role', 'Role')}`
    + '<select id="pg-form-role" class="select form__control"><option>Editor</option><option>Author</option><option>Administrator</option></select></div>';
}

function bioField(s) {
  const id = 'pg-form-bio';
  const optional = s.markers ? ' <span class="form__optional">(optional)</span>' : '';
  const counter = COUNTERS[s.counter];
  const counterHtml = counter
    ? `<div class="${bem('form__counter', counter[1])}" id="${id}-counter">${counter[0]}</div>`
    : '';
  const attrs = (counter ? ` maxlength="200" aria-describedby="${id}-counter"` : '')
    + (s.counter === 'error' ? ' aria-invalid="true"' : '');
  return `<div class="form__field">${label(id, 'Bio', optional)}`
    + `<textarea id="${id}" class="textarea form__control" rows="3"${attrs}>Editor and occasional photographer based in Melbourne.</textarea>${counterHtml}</div>`;
}

function fieldset() {
  return '<fieldset class="form__fieldset"><legend class="form__legend">Notifications</legend>'
    + `<div class="form__field">${label('pg-form-digest', 'Email digest')}`
    + '<select id="pg-form-digest" class="select form__control"><option>Daily</option><option>Weekly</option><option>Never</option></select></div>'
    + '<label class="switch"><input type="checkbox" class="switch__input" role="switch" checked><span class="switch__label">Notify me about comments</span></label>'
    + '</fieldset>';
}

function actions(s) {
  const className = bem('form__actions', s.actions, s.actionsBorder && 'border', s.actionsSticky && 'sticky');
  const buttons = s.actions === 'between'
    ? '<span class="text--sm text--muted">Last saved 2 minutes ago</span><button type="button" class="btn btn--primary">Save changes</button>'
    : '<button type="button" class="btn btn--outline">Cancel</button><button type="button" class="btn btn--primary">Save changes</button>';
  return `<div class="${className}">${buttons}</div>`;
}

export default {
  id: 'form-layout',
  name: 'Form Layout',
  description: 'Form sections, rows, and enhanced fields.',
  sources: ['components/_form-layout.scss'],
  target: '.form',
  matrix: { rows: 'variant', cols: 'row' },
  layout: 'block',
  ignore: [
    // Deprecated in _form-layout.scss in favour of aria-invalid="true" on the control
    'form__field--error',
  ],
  controls: [
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      options: [
        { value: '', label: 'Stacked' },
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'compact', label: 'Compact' },
      ],
    },
    {
      key: 'row',
      label: 'Name row',
      type: 'select',
      default: '2',
      options: [
        { value: '', label: 'None (stacked)' },
        { value: '2', label: '2 columns' },
        { value: '3', label: '3 columns' },
        { value: '4', label: '4 columns' },
        { value: '1-2', label: '1 : 2' },
        { value: '2-1', label: '2 : 1' },
      ],
    },
    {
      key: 'section',
      label: 'Section',
      type: 'select',
      default: 'plain',
      options: [
        { value: '', label: 'None' },
        { value: 'plain', label: 'With header' },
        { value: 'bordered', label: 'Bordered' },
      ],
    },
    {
      key: 'group',
      label: 'Input group',
      type: 'select',
      options: [
        { value: 'addon', label: 'Addon' },
        { value: 'button', label: 'Button' },
        { value: 'block', label: 'Stacked (--block)' },
      ],
    },
    {
      key: 'state',
      label: 'Email state',
      type: 'select',
      options: [{ value: '', label: 'Default' }, { value: 'error', label: 'Invalid (aria-invalid)' }],
    },
    {
      key: 'counter',
      label: 'Bio counter',
      type: 'select',
      default: 'ok',
      options: [
        { value: '', label: 'None' },
        { value: 'ok', label: 'Within limit' },
        { value: 'warning', label: 'Warning' },
        { value: 'error', label: 'Over limit' },
      ],
    },
    { key: 'markers', label: 'Required / optional markers', type: 'toggle', default: true },
    { key: 'fieldset', label: 'Fieldset', type: 'toggle' },
    {
      key: 'actions',
      label: 'Actions',
      type: 'select',
      default: 'end',
      options: [
        { value: '', label: 'Start' },
        { value: 'end', label: 'End' },
        { value: 'between', label: 'Space between' },
      ],
    },
    { key: 'actionsBorder', label: 'Actions border', type: 'toggle', default: true },
    { key: 'actionsSticky', label: 'Sticky actions', type: 'toggle' },
  ],
  presets: [
    { name: 'Profile', state: {} },
    { name: 'Settings (horizontal)', state: { variant: 'horizontal', row: '', section: 'bordered', actions: 'between', actionsBorder: false } },
    { name: 'Validation errors', state: { state: 'error', counter: 'error' } },
    { name: 'Compact with fieldset', state: { variant: 'compact', fieldset: true, row: '3', counter: '', markers: false } },
    { name: 'Address block', state: { group: 'block', row: '2-1', section: 'bordered' } },
    { name: 'Long form, sticky actions', state: { row: '4', fieldset: true, actionsSticky: true, counter: 'warning' } },
  ],
  render(s) {
    const body = [nameFields(s), emailField(s), groupField(s), roleField(), bioField(s)].join('');
    const content = s.section
      ? `<div class="${bem('form__section', s.section === 'bordered' && 'bordered')}">`
        + '<div class="form__section-header"><h3 class="form__section-title">Profile</h3>'
        + '<p class="form__section-description">This information will be displayed publicly.</p></div>'
        + `${body}</div>`
      : body;
    return `<form class="${bem('form', s.variant)}">${content}${s.fieldset ? fieldset() : ''}${actions(s)}</form>`;
  },
};
