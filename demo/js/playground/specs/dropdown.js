import { bem, cx, escape, ICONS } from '../lib.js';

const PATHS = {
  user: '<path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"/><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>',
  card: '<path d="M3 5m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z"/><path d="M3 10l18 0"/><path d="M7 15l.01 0"/><path d="M11 15l2 0"/>',
  settings: '<path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>',
  keyboard: '<path d="M2 6m0 2a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2z"/><path d="M6 10l0 .01"/><path d="M10 10l0 .01"/><path d="M14 10l0 .01"/><path d="M18 10l0 .01"/><path d="M6 14l0 .01"/><path d="M18 14l0 .01"/><path d="M10 14l4 .01"/>',
  logout: '<path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"/><path d="M9 12h12l-3 -3"/><path d="M18 15l3 -3"/>',
  invite: '<path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"/><path d="M16 19h6"/><path d="M19 16v6"/><path d="M6 21v-2a4 4 0 0 1 4 -4h4"/>',
  mail: ICONS.mail,
  message: '<path d="M8 9h8"/><path d="M8 13h6"/><path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z"/>',
  statusbar: '<path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"/><path d="M4 15l16 0"/>',
  sidebar: '<path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"/><path d="M9 4l0 16"/>',
  panel: '<path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"/><path d="M15 4l0 16"/>',
  newest: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 7v5l3 3"/>',
  oldest: '<path d="M12 8l0 4l2 2"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/>',
  az: '<path d="M16 8h4l-4 8h4"/><path d="M4 16v-6a2 2 0 1 1 4 0v6"/><path d="M4 13h4"/><path d="M11 12h2"/>',
  reset: '<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/>',
  down: '<path d="M6 9l6 6l6 -6"/>',
  right: '<path d="M9 6l6 6l-6 6"/>',
  check: ICONS.check,
};

const MENUS = {
  none: {
    trigger: 'My account',
    label: 'My account',
    items: [['Profile', 'user', '⇧⌘P'], ['Billing', 'card', '⌘B'], ['Settings', 'settings', '⌘S'], ['Keyboard shortcuts', 'keyboard', '⌘K']],
    destructive: ['Log out', 'logout', '⇧⌘Q'],
  },
  checkbox: {
    trigger: 'View',
    label: 'Appearance',
    items: [['Status bar', 'statusbar', '⌘/', true], ['Activity bar', 'sidebar', '', false], ['Panel', 'panel', '⌘J', true]],
    destructive: ['Reset layout', 'reset', ''],
  },
  radio: {
    trigger: 'Sort',
    label: 'Sort by',
    items: [['Newest first', 'newest', '', true], ['Oldest first', 'oldest', '', false], ['Name A–Z', 'az', '', false]],
    destructive: ['Clear sorting', 'reset', ''],
  },
};

const ROLES = { none: 'menuitem', checkbox: 'menuitemcheckbox', radio: 'menuitemradio' };

function svg(name, className) {
  return `<svg class="${cx('icon', className)}" viewBox="0 0 24 24">${PATHS[name]}</svg>`;
}

function item(s, cls, [text, iconName, shortcut, checked], extra = {}) {
  const role = extra.role || ROLES[s.selection];
  const attrs = [`role="${role}"`];
  if (role !== 'menuitem') {
    attrs.push(`aria-checked="${Boolean(checked)}"`);
  }
  if (extra.current) {
    attrs.push('aria-current="true"');
  }
  if (extra.disabled) {
    attrs.push('disabled');
  }
  if (extra.popup) {
    attrs.push('aria-haspopup="menu"', `aria-expanded="${extra.expanded}"`, `aria-controls="${extra.popup}"`);
  }
  const parts = [];
  if (s.decoration && iconName) {
    parts.push(svg(iconName, 'dropdown__item-icon'));
  }
  parts.push(`<span class="dropdown__item-text">${escape(text)}</span>`);
  if (s.decoration === 'shortcuts' && shortcut && !extra.popup) {
    parts.push(`<span class="dropdown__item-shortcut">${escape(shortcut)}</span>`);
  }
  if (role !== 'menuitem') {
    parts.push(svg('check', 'dropdown__item-check'));
  }
  if (extra.popup) {
    parts.push(svg('right', 'dropdown__submenu-arrow'));
  }
  return `<button type="button" class="${cls}" ${attrs.join(' ')}>${parts.join('')}</button>`;
}

function menuItems(s, block, id) {
  const menu = MENUS[s.selection];
  const itemClass = `${block}__item`;
  const divider = `<div class="${block}__divider" role="separator"></div>`;
  const parts = [];

  if (s.grouped) {
    parts.push(`<div class="${block}__label" role="presentation">${escape(menu.label)}</div>`);
  }
  menu.items.forEach((entry, i) => {
    const target = i === 1;
    parts.push(item(s, itemClass, entry, {
      current: target && s.itemState === 'current',
      disabled: target && s.itemState === 'disabled',
    }));
  });

  if (s.submenu) {
    const open = s.submenu === 'open';
    const subId = `${id}-invite`;
    const sub = [['Email', 'mail'], ['Message', 'message'], ['More…', '']]
      .map(entry => item(s, itemClass, entry, { role: 'menuitem' }))
      .join('');
    if (s.grouped) {
      parts.push(divider);
    }
    parts.push(`<div class="dropdown__submenu">`
      + item(s, cx(itemClass, 'dropdown__submenu-trigger'), ['Invite users', 'invite'], { role: 'menuitem', popup: subId, expanded: open })
      + `<div class="dropdown__menu dropdown__submenu-content" id="${subId}" role="menu" aria-label="Invite users"${open ? '' : ' hidden'}>${sub}</div>`
      + '</div>');
  }

  if (s.destructive) {
    if (s.grouped) {
      parts.push(divider);
    }
    parts.push(item(s, cx(itemClass, 'dropdown__item--destructive'), menu.destructive, { role: 'menuitem' }));
  }
  return parts.join('');
}

export default {
  id: 'dropdown',
  name: 'Dropdown',
  description: 'Contextual menus and actions.',
  sources: ['components/_dropdown.scss'],
  target: '.dropdown__menu, .contextmenu',
  matrix: { rows: 'position', cols: 'width' },
  controls: [
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'dropdown', label: 'Dropdown (trigger + menu)' },
        { value: 'contextmenu', label: 'Context menu' },
      ],
    },
    {
      key: 'position',
      label: 'Position',
      type: 'select',
      options: [
        { value: '', label: 'Below, left aligned' },
        { value: 'right', label: 'Below, right aligned' },
        { value: 'center', label: 'Below, centred' },
        { value: 'top', label: 'Above' },
      ],
      when: s => s.type === 'dropdown',
    },
    {
      key: 'positionOn',
      label: 'Position class on',
      type: 'select',
      options: [
        { value: 'wrapper', label: '.dropdown' },
        { value: 'menu', label: '.dropdown__menu' },
      ],
      when: s => s.type === 'dropdown' && s.position,
    },
    {
      key: 'width',
      label: 'Menu width',
      type: 'select',
      options: [{ value: '', label: 'Default' }, 'sm', 'md', 'lg', 'xl', 'full'],
      when: s => s.type === 'dropdown',
    },
    {
      key: 'selection',
      label: 'Items',
      type: 'select',
      options: [
        { value: 'none', label: 'Actions (menuitem)' },
        { value: 'checkbox', label: 'Checkboxes (menuitemcheckbox)' },
        { value: 'radio', label: 'Single choice (menuitemradio)' },
      ],
    },
    {
      key: 'decoration',
      label: 'Item extras',
      type: 'select',
      default: 'shortcuts',
      options: [
        { value: '', label: 'Text only' },
        { value: 'icons', label: 'Icons' },
        { value: 'shortcuts', label: 'Icons + shortcuts' },
      ],
    },
    {
      key: 'itemState',
      label: 'Second item',
      type: 'select',
      options: [
        { value: '', label: 'Default' },
        { value: 'current', label: 'Current (aria-current)' },
        { value: 'disabled', label: 'Disabled' },
      ],
    },
    {
      key: 'submenu',
      label: 'Submenu',
      type: 'select',
      options: [
        { value: '', label: 'None' },
        { value: 'closed', label: 'Closed' },
        { value: 'open', label: 'Open' },
      ],
    },
    { key: 'grouped', label: 'Label and dividers', type: 'toggle', default: true },
    { key: 'destructive', label: 'Destructive item', type: 'toggle', default: true },
    { key: 'open', label: 'Open', type: 'toggle', default: true, when: s => s.type === 'dropdown' },
  ],
  presets: [
    { name: 'Account menu', state: {} },
    { name: 'View options', state: { selection: 'checkbox', decoration: 'icons', destructive: false } },
    { name: 'Sort, right aligned', state: { selection: 'radio', position: 'right', decoration: '', grouped: false, destructive: false, width: 'sm' } },
    { name: 'With submenu', state: { submenu: 'open', itemState: 'current' } },
    { name: 'Opens upwards', state: { position: 'top', positionOn: 'menu', width: 'lg', itemState: 'disabled' } },
    { name: 'Centred, full width', state: { position: 'center', width: 'full', decoration: 'icons', positionOn: 'menu' } },
    { name: 'Context menu', state: { type: 'contextmenu', decoration: 'icons', submenu: 'closed' } },
  ],
  render(s) {
    const id = `dropdown-${s.selection}-${s.position || 'start'}-${s.width || 'auto'}`;
    const label = MENUS[s.selection].trigger;

    if (s.type === 'contextmenu') {
      return `<div class="contextmenu" role="menu" aria-label="${escape(label)}">${menuItems(s, 'contextmenu', id)}</div>`;
    }

    const onMenu = s.positionOn === 'menu';
    const wrapper = bem('dropdown', !onMenu && s.position);
    const menu = bem('dropdown__menu', onMenu && s.position, s.width);
    return `<div class="${wrapper}">`
      + `<button type="button" class="btn btn--outline dropdown__trigger" aria-haspopup="menu" aria-expanded="${Boolean(s.open)}" data-toggle data-toggle-target="#${id}" data-toggle-capture="true">${escape(label)}${svg('down', 'btn__icon')}</button>`
      + `<div class="${menu}" id="${id}" role="menu" aria-label="${escape(label)}">${menuItems(s, 'dropdown', id)}</div>`
      + '</div>';
  },
};
