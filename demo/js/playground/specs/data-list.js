import { bem, escape } from '../lib.js';

function rows(s) {
  return [
    ['Full name', escape(s.name), false],
    ['Email', '<a href="#">john@example.com</a>', true],
    ['Phone', '+1 (555) 123-4567', true],
    ['Status', '<span class="badge badge--success-muted">Active</span>', false],
    ['Created', 'January 15, 2024', false],
  ];
}

function datalist(s) {
  const items = rows(s).map(([label, value, copyable]) => {
    const action = s.action && copyable
      ? `<div class="datalist__action"><button type="button" class="btn btn--ghost btn--sm" aria-label="Copy ${label.toLowerCase()}">Copy</button></div>`
      : '';
    return `<div class="datalist__item"><span class="datalist__label">${label}</span><span class="datalist__value">${value}</span>${action}</div>`;
  });
  return `<div class="${bem('datalist', s.layout, s.style, s.compact && 'compact')}">${items.join('')}</div>`;
}

function descriptionList(s) {
  const groups = rows(s).map(([label, value]) => `<div class="descriptionlist__group"><dt>${label}</dt><dd>${value}</dd></div>`);
  return `<dl class="descriptionlist">${groups.join('')}</dl>`;
}

function kvpairs(s) {
  const pairs = [['Version', '2.1.0'], ['License', 'MIT'], ['Size', '45kb']].map(([key, value]) => (
    `<span class="${bem('kvpair', s.kvSize, s.muted && 'muted')}"><span class="kvpair__key">${key}</span><span class="kvpair__value">${value}</span></span>`
  ));
  return `<div class="cluster cluster--lg">${pairs.join('')}</div>`;
}

function propertyList() {
  const items = [
    ['Two-factor authentication', 'Require a one-time code when signing in.', '<label class="switch"><input type="checkbox" class="switch__input" role="switch" checked aria-label="Two-factor authentication"></label>'],
    ['Session timeout', 'Sign out automatically after a period of inactivity.', '<select class="select select--auto input--sm" aria-label="Session timeout"><option>30 minutes</option><option>1 hour</option><option>8 hours</option></select>'],
    ['API access', 'Personal access tokens for scripts and integrations.', '<span class="badge badge--secondary">2 tokens</span><button type="button" class="btn btn--outline btn--sm">Manage</button>'],
  ];
  return `<div class="property__list">${items.map(([label, description, value]) => '<div class="property__list__item">'
    + `<div class="property__list__info"><div class="property__list__label">${label}</div><div class="property__list__description">${description}</div></div>`
    + `<div class="property__list__value">${value}</div></div>`).join('')}</div>`;
}

export default {
  id: 'data-list',
  name: 'Data List',
  description: 'Key-value pair displays for record details.',
  sources: ['components/_data-list.scss'],
  target: '.datalist, .descriptionlist, .kvpair, .property__list',
  matrix: { rows: 'layout', cols: 'style' },
  layout: 'block',
  controls: [
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'datalist', label: 'Data list' },
        { value: 'dl', label: 'Description list (<dl>)' },
        { value: 'kvpair', label: 'Inline key-value' },
        { value: 'property', label: 'Property list' },
      ],
    },
    { key: 'layout', label: 'Layout', type: 'select', options: [{ value: '', label: 'Rows' }, 'horizontal', 'grid'], when: s => s.type === 'datalist' },
    { key: 'style', label: 'Style', type: 'select', options: ['', 'striped', 'bordered'], when: s => s.type === 'datalist' },
    { key: 'compact', label: 'Compact', type: 'toggle', when: s => s.type === 'datalist' },
    { key: 'action', label: 'Row actions', type: 'toggle', when: s => s.type === 'datalist' },
    { key: 'name', label: 'Name value', type: 'text', default: 'John Doe', when: s => ['datalist', 'dl'].includes(s.type) },
    { key: 'kvSize', label: 'Size', type: 'select', options: ['', 'sm', 'lg'], when: s => s.type === 'kvpair' },
    { key: 'muted', label: 'Muted values', type: 'toggle', when: s => s.type === 'kvpair' },
  ],
  presets: [
    { name: 'Record details', state: {} },
    { name: 'Bordered with actions', state: { style: 'bordered', action: true } },
    { name: 'Order summary grid', state: { layout: 'grid', style: 'bordered' } },
    { name: 'Compact striped', state: { style: 'striped', compact: true } },
    { name: 'Horizontal stats', state: { layout: 'horizontal' } },
    { name: 'Package meta', state: { type: 'kvpair', kvSize: 'sm', muted: true } },
    { name: 'Settings', state: { type: 'property' } },
  ],
  render(s) {
    switch (s.type) {
      case 'dl':
        return descriptionList(s);
      case 'kvpair':
        return kvpairs(s);
      case 'property':
        return propertyList();
      default:
        return datalist(s);
    }
  },
};
