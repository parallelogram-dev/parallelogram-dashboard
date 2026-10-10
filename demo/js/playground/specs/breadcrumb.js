import { bem, escape, icon } from '../lib.js';

const CHEVRON = '<svg class="icon" viewBox="0 0 24 24"><path d="M9 6l6 6l-6 6"/></svg>';
const CHEVRON_DOWN = '<svg class="icon" viewBox="0 0 24 24"><path d="M6 9l6 6l6 -6"/></svg>';
const HOME = '<svg class="icon breadcrumb__icon" viewBox="0 0 24 24"><path d="M5 12l-2 0l9 -9l9 9l-2 0"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"/><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"/></svg>';
const TRAIL = ['Home', 'Settings', 'Workspace', 'Members', 'Profile'];
const SIBLINGS = ['General', 'Billing', 'Members', 'Integrations'];

function item(content) {
  return `<li class="breadcrumb__item">${content}</li>`;
}

function trail(s, id) {
  const separator = `<li class="breadcrumb__item" aria-hidden="true"><span class="breadcrumb__separator">${s.separator ? '' : CHEVRON}</span></li>`;
  const labels = s.collapse ? [TRAIL[0], null, ...TRAIL.slice(-2)] : TRAIL;
  const last = labels.length - 1;

  const items = labels.map((label, i) => {
    if (label === null) {
      return item(`<button type="button" class="breadcrumb__ellipsis" aria-label="Show ${TRAIL.length - 3} more">${icon('dots')}</button>`);
    }
    if (i === last) {
      const text = escape(s.page || label);
      return item(s.current === 'link'
        ? `<a href="#" class="breadcrumb__link" aria-current="page">${text}</a>`
        : `<span class="breadcrumb__page" aria-current="page">${text}</span>`);
    }
    if (i === last - 1 && s.dropdown) {
      const menu = SIBLINGS.map(sibling => `<a href="#" class="breadcrumb__dropdown-item" role="menuitem">${sibling}</a>`).join('');
      return item(`<div class="breadcrumb__dropdown">`
        + `<button type="button" class="breadcrumb__dropdown-trigger" aria-haspopup="menu" aria-expanded="${s.menuOpen}" data-toggle data-toggle-target="#${id}-menu" data-toggle-capture="true">${label}${CHEVRON_DOWN}</button>`
        + `<div class="breadcrumb__dropdown-menu" id="${id}-menu" role="menu">${menu}</div></div>`);
    }
    const home = i === 0 && s.homeIcon ? HOME : '';
    return item(`<a href="#" class="breadcrumb__link">${home}${label}</a>`);
  });

  const className = bem('breadcrumb', s.separator, s.size);
  return `<nav class="${className}" aria-label="Breadcrumb"><ol class="breadcrumb__list">${items.join(separator)}</ol></nav>`;
}

export default {
  id: 'breadcrumb',
  name: 'Breadcrumb',
  description: 'Navigation path indicator.',
  sources: ['components/_breadcrumb.scss'],
  target: '.breadcrumb',
  matrix: { rows: 'separator', cols: 'size' },
  controls: [
    {
      key: 'separator',
      label: 'Separator',
      type: 'select',
      options: [
        { value: '', label: 'Chevron (SVG)' },
        { value: 'slash', label: 'Slash' },
        { value: 'arrow', label: 'Arrow' },
        { value: 'dot', label: 'Dot' },
      ],
    },
    { key: 'size', label: 'Size', type: 'select', options: ['', 'sm', 'lg'] },
    { key: 'page', label: 'Current page', type: 'text', default: 'Profile' },
    {
      key: 'current',
      label: 'Current item',
      type: 'select',
      options: [
        { value: 'page', label: '<span class="breadcrumb__page">' },
        { value: 'link', label: '<a aria-current="page">' },
      ],
    },
    { key: 'homeIcon', label: 'Home icon', type: 'toggle' },
    { key: 'collapse', label: 'Collapse middle (ellipsis)', type: 'toggle' },
    { key: 'dropdown', label: 'Sibling dropdown', type: 'toggle' },
    { key: 'menuOpen', label: 'Dropdown open', type: 'toggle', when: s => s.dropdown },
    {
      key: 'header',
      label: 'Page header',
      type: 'select',
      options: [
        { value: '', label: 'None' },
        { value: 'stacked', label: 'Stacked' },
        { value: 'row', label: 'Row (actions beside)' },
      ],
    },
  ],
  presets: [
    { name: 'Default', state: {} },
    { name: 'Slash with home icon', state: { separator: 'slash', homeIcon: true } },
    { name: 'Collapsed trail', state: { collapse: true, separator: 'arrow' } },
    { name: 'Sibling switcher', state: { dropdown: true, menuOpen: true } },
    { name: 'Compact dots', state: { separator: 'dot', size: 'sm', current: 'link' } },
    { name: 'Page header', state: { header: 'row', homeIcon: true } },
  ],
  render(s) {
    const id = `pg-breadcrumb-${s.separator || 'chevron'}-${s.size || 'md'}`;
    const nav = trail(s, id);
    if (!s.header) {
      return nav;
    }
    const title = `<h1 class="pageheader__title">${escape(s.page)}</h1>`
      + '<p class="pageheader__description">Update your name, photo and contact details.</p>';
    const actions = '<div class="pageheader__actions"><button type="button" class="btn btn--outline">Cancel</button>'
      + '<button type="button" class="btn btn--primary">Save</button></div>';
    if (s.header === 'row') {
      return `<div class="pageheader pageheader--row"><div class="pageheader__content">${nav}${title}</div>${actions}</div>`;
    }
    return `<div class="pageheader">${nav}${title}${actions}</div>`;
  },
};
