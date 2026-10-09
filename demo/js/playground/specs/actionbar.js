import { bem, cx, escape, icon } from '../lib.js';

const GRIP = '<svg class="icon" viewBox="0 0 24 24"><path d="M9 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M9 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M9 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M15 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M15 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M15 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/></svg>';
const CHEVRON = '<svg class="icon" viewBox="0 0 24 24"><path d="M6 9l6 6l6 -6"/></svg>';
const CHECK = '<svg class="icon dropdown__item-check" viewBox="0 0 24 24"><path d="M5 12l5 5l10 -10"/></svg>';
const STATUS = { Published: 'badge--success-muted', Draft: 'badge--secondary', Scheduled: 'badge--info-muted' };

function bar(s, title = s.title, n = 1) {
  const id = `ab-${n}`;
  const segments = [];

  if (s.expand) {
    segments.push(`<button type="button" class="actionbar__segment actionbar__toggle" aria-expanded="true" aria-controls="${id}-children" aria-label="Show child pages of ${escape(title)}">${CHEVRON}</button>`);
  }
  if (s.handle) {
    segments.push(`<button type="button" class="actionbar__segment actionbar__handle" aria-label="Reorder ${escape(title)}">${GRIP}</button>`);
  }
  if (s.select) {
    segments.push(`<label class="actionbar__segment actionbar__select"><input type="checkbox" class="checkbox__input" aria-label="Select ${escape(title)}"${s.state === 'selected' ? ' checked' : ''}></label>`);
  }

  const badge = s.status ? `<span class="badge badge--sm ${STATUS[s.status]}">${s.status}</span>` : '';
  const meta = s.meta ? `<span class="actionbar__meta">${escape(s.meta)}</span>` : '';
  segments.push(`<div class="actionbar__segment actionbar__title"><a href="#" class="actionbar__label">${escape(title)}</a>${meta}${badge}</div>`);

  if (s.template) {
    segments.push(`<div class="actionbar__segment dropdown" data-priority="medium" data-label="Template: Article">`
      + `<button type="button" class="actionbar__trigger dropdown__trigger" aria-haspopup="menu" data-toggle data-toggle-target="#${id}-template" data-toggle-capture="true">Article ${CHEVRON}</button>`
      + `<div class="dropdown__menu" id="${id}-template" role="menu">`
      + ['Article', 'Landing page', 'Gallery'].map((t, i) => `<button type="button" class="dropdown__item" role="menuitemradio" aria-checked="${i === 0}"><span class="dropdown__item-text">${t}</span>${CHECK}</button>`).join('')
      + '</div></div>');
  }
  if (s.toggle) {
    segments.push(`<label class="actionbar__segment" data-priority="low" data-label="Visible in navigation"><span class="switch switch--sm"><input type="checkbox" class="switch__input" role="switch"${s.toggleOn ? ' checked' : ''}><span class="switch__label">Visible</span></span></label>`);
  }
  if (s.actions !== 'none') {
    segments.push(`<button type="button" class="actionbar__segment" data-priority="low">${icon('star')}<span>Preview</span></button>`);
  }
  if (s.actions === 'edit') {
    segments.push(`<a href="#" class="${bem('actionbar__segment', s.emphasis)}">Edit</a>`);
  }

  const className = cx(bem('actionbar', s.size));
  const disabled = s.state === 'disabled' ? ' aria-disabled="true"' : '';
  return `<div class="${className}"${disabled}>${segments.join('')}<div class="actionbar__segment actionbar__more dropdown" hidden>`
    + `<button type="button" class="actionbar__trigger dropdown__trigger" aria-label="More actions" aria-haspopup="menu" data-toggle data-toggle-target="#${id}-more" data-toggle-capture="true">${icon('dots')}</button>`
    + `<div class="dropdown__menu" id="${id}-more" role="menu"></div></div></div>`;
}

export default {
  id: 'actionbar',
  name: 'Action Bar',
  description: 'A segmented bar standing for one record, with a reorder handle, title, switches, dropdowns and actions.',
  sources: ['components/_actionbar.scss'],
  target: '.actionbar',
  matrix: { rows: 'emphasis', cols: 'size' },
  layout: 'block',
  controls: [
    { key: 'title', label: 'Title', type: 'text', default: 'About us' },
    { key: 'meta', label: 'Meta', type: 'text', default: '/about' },
    { key: 'status', label: 'Status badge', type: 'select', options: ['', 'Published', 'Draft', 'Scheduled'], default: 'Published' },
    { key: 'size', label: 'Size', type: 'select', options: ['', 'sm', 'lg'] },
    {
      key: 'emphasis',
      label: 'Edit segment',
      type: 'select',
      default: 'primary',
      options: [
        { value: '', label: 'Plain' },
        { value: 'primary', label: 'Primary' },
        { value: 'outline', label: 'Outline' },
        { value: 'muted', label: 'Muted' },
      ],
      when: s => s.actions === 'edit',
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'select',
      default: 'edit',
      options: [
        { value: 'none', label: 'None' },
        { value: 'preview', label: 'Preview' },
        { value: 'edit', label: 'Preview + Edit' },
      ],
    },
    {
      key: 'state',
      label: 'State',
      type: 'select',
      options: [
        { value: '', label: 'Default' },
        { value: 'selected', label: 'Selected' },
        { value: 'disabled', label: 'Unavailable (aria-disabled)' },
      ],
    },
    { key: 'handle', label: 'Reorder handle', type: 'toggle', default: true },
    { key: 'select', label: 'Selection checkbox', type: 'toggle' },
    { key: 'expand', label: 'Expand toggle', type: 'toggle' },
    { key: 'template', label: 'Template dropdown', type: 'toggle', default: true },
    { key: 'toggle', label: 'Visibility switch', type: 'toggle', default: true },
    { key: 'toggleOn', label: 'Switch on', type: 'toggle', default: true, when: s => s.toggle },
    { key: 'list', label: 'Sortable list', type: 'toggle' },
  ],
  presets: [
    { name: 'Page row', state: {} },
    { name: 'Record index row', state: { select: true, handle: false, template: false, title: 'Invoice INV-2024-089', meta: 'Jan 12, 2024', status: 'Draft' } },
    { name: 'Selected', state: { select: true, state: 'selected' } },
    { name: 'Outline edit', state: { emphasis: 'outline' } },
    { name: 'Compact', state: { size: 'sm', template: false } },
    { name: 'Sortable page list', state: { list: true } },
  ],
  render(s) {
    if (!s.list) {
      return bar(s);
    }
    const pages = [['Home', '/', 'Published'], ['About us', '/about', 'Published'], ['Careers', '/careers', 'Draft']];
    const items = pages.map(([title, meta, status], i) => `<li>${bar({ ...s, meta, status }, title, i + 1)}</li>`).join('');
    return `<ul class="actionbar__list" data-actionbar-sortable aria-label="Pages">${items}</ul>`;
  },
};
