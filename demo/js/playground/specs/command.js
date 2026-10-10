import { bem, escape, icon, ICONS } from '../lib.js';

const PATHS = {
  clock: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 7v5l3 3"/>',
  plus: ICONS.plus,
  settings: '<path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>',
  file: '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>',
  user: '<path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"/><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>',
  upload: '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"/><path d="M7 9l5 -5l5 5"/><path d="M12 4l0 12"/>',
};

const GROUPS = [
  {
    heading: 'Suggestions',
    items: [
      { title: 'Recent items', description: 'Jump back to pages you edited today', icon: 'clock' },
      { title: 'Create new page', description: 'Start from a blank page or a template', icon: 'plus', keys: ['⌘', 'N'] },
      { title: 'Upload media', description: 'Add images, video or documents', icon: 'upload', keys: ['⌘', 'U'] },
    ],
  },
  {
    heading: 'Navigate',
    items: [
      { title: 'Pages', description: '24 pages, 3 drafts', icon: 'file', keys: ['G', 'P'] },
      { title: 'Team members', description: 'Invite people and manage roles', icon: 'user', keys: ['G', 'T'] },
      { title: 'Settings', description: 'Workspace, billing and integrations', icon: 'settings', keys: ['⌘', ','] },
    ],
  },
];

function kbd(key, className = 'command__kbd') {
  return `<kbd class="${className}">${escape(key)}</kbd>`;
}

function item(s, entry, id, index) {
  const attrs = [`id="${id}-option-${index}"`, 'role="option"'];
  attrs.push(`aria-selected="${s.selected && index === 0}"`);
  if (s.disabled && index === 2) {
    attrs.push('aria-disabled="true"');
  }
  const parts = [];
  if (s.icons) {
    parts.push(`<svg class="icon command__item-icon" viewBox="0 0 24 24">${PATHS[entry.icon]}</svg>`);
  }
  const description = s.descriptions ? `<span class="command__item-description">${escape(entry.description)}</span>` : '';
  parts.push(`<span class="command__item-content"><span class="command__item-title">${escape(entry.title)}</span>${description}</span>`);
  if (s.shortcuts && entry.keys) {
    parts.push(`<span class="command__item-shortcut">${entry.keys.map(k => kbd(k)).join('')}</span>`);
  }
  return `<button type="button" class="command__item" ${attrs.join(' ')}>${parts.join('')}</button>`;
}

function list(s, id) {
  if (s.content === 'empty') {
    return `<div class="command__empty" role="status">No results found for “${escape(s.query || 'invoices')}”.</div>`;
  }
  let index = 0;
  const groups = s.content === 'flat'
    ? [{ items: GROUPS.flatMap(g => g.items).slice(0, 4) }]
    : GROUPS;
  return groups.map((group, g) => {
    const headingId = `${id}-group-${g}`;
    const heading = group.heading ? `<div class="command__group-heading" id="${headingId}">${escape(group.heading)}</div>` : '';
    const labelled = group.heading ? ` aria-labelledby="${headingId}"` : ' aria-label="Commands"';
    const items = group.items.map(entry => item(s, entry, id, index++)).join('');
    return `<div class="command__group" role="group"${labelled}>${heading}${items}</div>`;
  }).join('');
}

function dialog(s, id, standalone) {
  const value = s.content === 'empty' ? s.query || 'invoices' : s.query;
  const active = s.selected && s.content !== 'empty' ? ` aria-activedescendant="${id}-option-0"` : '';
  const input = `<div class="command__inputwrapper">${icon('search', 'command__icon')}`
    + `<input type="text" class="command__input" role="combobox" aria-expanded="true" aria-controls="${id}-list" aria-autocomplete="list" aria-label="Search commands"`
    + ` placeholder="${escape(s.placeholder)}" value="${escape(value)}"${active}>`
    + `<span class="command__shortcut">${kbd('Esc')}</span></div>`;
  const role = s.content === 'empty' ? '' : ' role="listbox" aria-label="Results"';
  const results = `<div class="command__list" id="${id}-list"${role}>${list(s, id)}</div>`;
  const hints = [['↑↓', 'Navigate'], ['↵', 'Select'], ['Esc', 'Close']]
    .map(([key, label]) => `<span class="command__hint-item">${kbd(key, bem('kbd', s.hintSize))} ${label}</span>`)
    .join('');
  const footer = s.footer
    ? `<div class="command__footer"><div class="command__hint">${hints}</div><span>${{ grouped: 6, flat: 4, empty: 0 }[s.content]} results</span></div>`
    : '';
  const a11y = standalone ? ' role="dialog" aria-label="Command palette"' : '';
  return `<div class="command__dialog"${a11y}>${input}${results}${footer}</div>`;
}

export default {
  id: 'command',
  name: 'Command',
  description: 'Command palette (⌘K style) for quick actions.',
  sources: ['components/_command.scss'],
  target: '.command, .command__dialog',
  matrix: { rows: 'content', cols: 'hintSize' },
  layout: 'block',
  controls: [
    {
      key: 'display',
      label: 'Display',
      type: 'select',
      options: [
        { value: 'inline', label: 'Panel only' },
        { value: 'open', label: '<dialog open> overlay' },
        { value: 'trigger', label: 'Button opens it (show-modal)' },
      ],
    },
    {
      key: 'content',
      label: 'Results',
      type: 'select',
      options: [
        { value: 'grouped', label: 'Grouped' },
        { value: 'flat', label: 'Single list' },
        { value: 'empty', label: 'No results' },
      ],
    },
    { key: 'hintSize', label: 'Footer key size', type: 'select', default: 'sm', options: [{ value: '', label: 'Default' }, 'sm', 'lg'], when: s => s.footer },
    { key: 'placeholder', label: 'Placeholder', type: 'text', default: 'Type a command or search…' },
    { key: 'query', label: 'Query', type: 'text', default: '' },
    { key: 'icons', label: 'Item icons', type: 'toggle', default: true, when: s => s.content !== 'empty' },
    { key: 'descriptions', label: 'Item descriptions', type: 'toggle', when: s => s.content !== 'empty' },
    { key: 'shortcuts', label: 'Item shortcuts', type: 'toggle', default: true, when: s => s.content !== 'empty' },
    { key: 'selected', label: 'First item selected', type: 'toggle', default: true, when: s => s.content !== 'empty' },
    { key: 'disabled', label: 'Third item disabled', type: 'toggle', when: s => s.content !== 'empty' },
    { key: 'footer', label: 'Footer hints', type: 'toggle', default: true },
  ],
  presets: [
    { name: 'Palette', state: {} },
    { name: 'With descriptions', state: { descriptions: true, content: 'flat', shortcuts: false } },
    { name: 'Filtering', state: { query: 'set', content: 'flat', disabled: true } },
    { name: 'No results', state: { content: 'empty', query: 'invoices' } },
    { name: 'Minimal', state: { icons: false, shortcuts: false, footer: false } },
    { name: 'Open overlay', state: { display: 'open' } },
    { name: 'Open with ⌘K button', state: { display: 'trigger', hintSize: 'lg' } },
  ],
  render(s) {
    const id = `command-${s.display}-${s.content}-${s.hintSize || 'md'}`;
    if (s.display === 'inline') {
      return dialog(s, id, true);
    }
    const overlay = `<dialog class="command" id="${id}" aria-label="Command palette"${s.display === 'open' ? ' open' : ''}>`
      + `<button type="button" class="command__backdrop" commandfor="${id}" command="close" aria-label="Close" tabindex="-1"></button>`
      + `${dialog(s, `${id}-panel`)}</dialog>`;
    if (s.display === 'open') {
      return overlay;
    }
    return `<button type="button" class="btn btn--outline" commandfor="${id}" command="show-modal">${icon('search', 'btn__icon')}Search…`
      + `<span class="command__shortcut">${kbd('⌘', 'kbd kbd--sm')}${kbd('K', 'kbd kbd--sm')}</span></button>${overlay}`;
  },
};
