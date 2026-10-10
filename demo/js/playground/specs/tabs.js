import { bem, cx, escape, ICONS } from '../lib.js';

const TAB_ICONS = {
  user: '<path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"/><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>',
  lock: '<path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z"/><path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"/><path d="M8 11v-4a4 4 0 1 1 8 0v4"/>',
  bell: '<path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6"/><path d="M9 17v1a3 3 0 0 0 6 0v-1"/>',
  mail: ICONS.mail,
  star: ICONS.star,
  search: ICONS.search,
  info: ICONS.info,
};

const TABS = [
  { label: 'Account', icon: 'user', text: 'Make changes to your account here. Update your profile information and preferences.' },
  { label: 'Password', icon: 'lock', text: 'Change your password and configure two-factor authentication.' },
  { label: 'Notifications', icon: 'bell', badge: '3', text: 'Configure how and when you receive notifications.' },
  { label: 'Email', icon: 'mail', text: 'Choose which emails you receive and how often.' },
  { label: 'Favourites', icon: 'star', text: 'Records and pages you have starred.' },
  { label: 'Search', icon: 'search', text: 'Saved searches and filters.' },
  { label: 'About', icon: 'info', text: 'Workspace details, plan and usage.' },
];

const SEGMENTS = ['Day', 'Week', 'Month', 'Year'];

function tabIcon(name) {
  return `<svg class="icon tabs__trigger-icon" viewBox="0 0 24 24" aria-hidden="true">${TAB_ICONS[name]}</svg>`;
}

function segmented(s) {
  const selected = Number(s.selected);
  const items = SEGMENTS.map((label, i) => `<button type="button" class="segmented-control__item" aria-pressed="${i === selected}">${label}</button>`).join('');
  return `<div class="segmented-control"><div class="segmented-control__list" role="group" aria-label="Date range">${items}</div></div>`;
}

export default {
  id: 'tabs',
  name: 'Tabs',
  description: 'Tabbed navigation for content sections.',
  sources: ['components/_tabs.scss'],
  target: '.tabs, .segmented-control',
  matrix: { rows: 'variant', cols: 'orientation' },
  layout: 'block',
  ignore: [
    // The indicator needs JS to measure and position it under the selected tab, and none ships with the library
    'tabs--animated',
    'tabs__indicator',
  ],
  controls: [
    {
      key: 'kind',
      label: 'Component',
      type: 'select',
      options: [
        { value: 'tabs', label: 'Tabs' },
        { value: 'segmented', label: 'Segmented control' },
      ],
    },
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      options: [{ value: '', label: 'Default' }, 'underline', 'pills'],
      when: s => s.kind === 'tabs',
    },
    {
      key: 'orientation',
      label: 'Orientation',
      type: 'select',
      options: [{ value: '', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }],
      when: s => s.kind === 'tabs',
    },
    {
      key: 'selected',
      label: 'Selected',
      type: 'select',
      options: [{ value: '0', label: 'First' }, { value: '1', label: 'Second' }, { value: '2', label: 'Third' }],
    },
    { key: 'full', label: 'Full width', type: 'toggle', when: s => s.kind === 'tabs' },
    { key: 'many', label: 'Many tabs (scrollable)', type: 'toggle', when: s => s.kind === 'tabs' },
    { key: 'icons', label: 'Icons', type: 'toggle', when: s => s.kind === 'tabs' },
    { key: 'badge', label: 'Count badge', type: 'toggle', when: s => s.kind === 'tabs' },
    { key: 'disabled', label: 'Disable last tab', type: 'toggle', when: s => s.kind === 'tabs' },
  ],
  presets: [
    { name: 'Default', state: {} },
    { name: 'Underline with badges', state: { variant: 'underline', badge: true } },
    { name: 'Pills', state: { variant: 'pills', selected: '1' } },
    { name: 'Vertical settings', state: { orientation: 'vertical', icons: true } },
    { name: 'Full width', state: { full: true, icons: true } },
    { name: 'Scrollable', state: { variant: 'underline', many: true } },
    { name: 'Segmented control', state: { kind: 'segmented', selected: '1' } },
  ],
  render(s) {
    if (s.kind === 'segmented') {
      return segmented(s);
    }
    const id = `pg-tabs-${s.variant || 'default'}-${s.orientation || 'horizontal'}`;
    const tabs = s.many ? TABS : TABS.slice(0, 3);
    const selected = Number(s.selected);

    const triggers = tabs.map((tab, i) => {
      const disabled = s.disabled && i === tabs.length - 1 && i !== selected ? ' disabled' : '';
      const badge = s.badge && tab.badge ? `<span class="tabs__trigger-badge">${tab.badge}</span>` : '';
      return `<button type="button" class="tabs__trigger" id="${id}-tab-${i}" data-tab="${id}-panel-${i}" aria-controls="${id}-panel-${i}" aria-selected="${i === selected}"${disabled}>`
        + `${s.icons ? tabIcon(tab.icon) : ''}${escape(tab.label)}${badge}</button>`;
    }).join('');

    const panels = tabs.map((tab, i) => `<div class="card" id="${id}-panel-${i}" data-tab-panel aria-labelledby="${id}-tab-${i}"${i === selected ? '' : ' hidden'}>`
      + `<div class="card__content card__content--pt"><strong>${escape(tab.label)}</strong><p class="text--sm text--muted">${escape(tab.text)}</p></div></div>`).join('');

    const className = cx(bem('tabs', s.variant, s.orientation, s.full && 'full'), s.many && 'tabs--scrollable');
    return `<div class="${className}" data-tabs><div class="tabs__list" data-tabs-list aria-label="Settings">${triggers}</div>`
      + `<div class="tabs__content" data-tabs-panels>${panels}</div></div>`;
  },
};
