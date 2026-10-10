import { bem, cx, escape } from '../lib.js';

const svg = (className, paths) => `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;

const PATHS = {
  logo: '<path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z"/>',
  home: '<path d="M5 12l-2 0l9 -9l9 9l-2 0"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"/><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"/>',
  pages: '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>',
  records: '<path d="M12 6m-8 0a8 3 0 1 0 16 0a8 3 0 1 0 -16 0"/><path d="M4 6v6a8 3 0 0 0 16 0v-6"/><path d="M4 12v6a8 3 0 0 0 16 0v-6"/>',
  media: '<path d="M15 8h.01"/><path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z"/><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"/><path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"/>',
  analytics: '<path d="M4 19l16 0"/><path d="M4 15l4 -6l4 2l4 -5l4 4"/>',
  team: '<path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0 -3 -3.85"/>',
  settings: '<path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>',
  chevronDown: '<path d="M6 9l6 6l6 -6"/>',
  chevronLeft: '<path d="M15 6l-6 6l6 6"/>',
  chevronRight: '<path d="M9 6l6 6l-6 6"/>',
  menu: '<path d="M4 6l16 0"/><path d="M4 12l16 0"/><path d="M4 18l16 0"/>',
};

const SIDEBAR_ID = 'pg-sidebar';
const SUBMENU_ID = 'pg-sidebar-records';

function item(s, key, text, badge = '') {
  const current = s.current === key ? ' aria-current="page"' : '';
  const disabled = s.disabled && key === 'analytics' ? ' aria-disabled="true" tabindex="-1"' : '';
  const badgeHtml = badge && s.badges ? `<span class="sidebar__item-badge">${badge}</span>` : '';
  return `<a href="#" class="sidebar__item"${current}${disabled} title="${escape(text)}">`
    + `${svg('icon sidebar__item-icon', PATHS[key])}<span class="sidebar__item-text">${escape(text)}</span>${badgeHtml}</a>`;
}

function records(s) {
  if (!s.submenu) {
    return item(s, 'records', 'Records', '1,248');
  }
  const open = s.submenu === 'open';
  const sub = [['all', 'All records'], ['starred', 'Starred'], ['archived', 'Archived']]
    .map(([key, text]) => `<a href="#" class="sidebar__item"${open && key === 'all' && s.current === 'records' ? ' aria-current="page"' : ''}><span class="sidebar__item-text">${text}</span></a>`)
    .join('');
  return `<button type="button" class="sidebar__item sidebar__item--expandable" aria-expanded="${open}" aria-controls="${SUBMENU_ID}" data-toggle data-toggle-target="#${SUBMENU_ID}" data-toggle-manual="true" title="Records">`
    + `${svg('icon sidebar__item-icon', PATHS.records)}<span class="sidebar__item-text">Records</span>${svg('icon sidebar__item-arrow', PATHS.chevronDown)}</button>`
    + `<div class="sidebar__submenu" id="${SUBMENU_ID}">${sub}</div>`;
}

function sidebar(s) {
  const collapsed = s.width === 'collapsed';
  const className = cx(bem('sidebar', collapsed && 'collapsed', s.side), s.open && 'sidebar--open');
  const footer = s.footer
    ? '<div class="sidebar__footer"><div class="layout layout--gap-md">'
      + '<span class="avatar avatar--sm"><span class="avatar__fallback">JD</span></span>'
      + '<span class="sidebar__footer-text">jane@example.com</span></div></div>'
    : '';
  return `<aside class="${className}" id="${SIDEBAR_ID}" aria-label="Sidebar">`
    + `<div class="sidebar__header"><a href="#" class="sidebar__logo">${svg('icon sidebar__logo-icon', PATHS.logo)}<span class="sidebar__logo-text">${escape(s.brand)}</span></a></div>`
    + '<nav class="sidebar__content" aria-label="Main">'
    + '<div class="sidebar__section"><div class="sidebar__section-title">Overview</div><div class="sidebar__nav">'
    + item(s, 'home', 'Dashboard') + item(s, 'analytics', 'Analytics')
    + '</div></div>'
    + '<div class="sidebar__section"><div class="sidebar__section-title">Content</div><div class="sidebar__nav">'
    + item(s, 'pages', 'Pages', '15') + records(s) + item(s, 'media', 'Media', '312')
    + '</div></div>'
    + '<div class="sidebar__divider"></div>'
    + '<div class="sidebar__section"><div class="sidebar__nav">'
    + item(s, 'team', 'Team', '8') + item(s, 'settings', 'Settings')
    + '</div></div></nav>'
    + footer
    + `<button type="button" class="sidebar__toggle" aria-label="${collapsed ? 'Expand' : 'Collapse'} sidebar" aria-controls="${SIDEBAR_ID}" aria-expanded="${!collapsed}">`
    + `${svg('icon', collapsed ? PATHS.chevronRight : PATHS.chevronLeft)}</button>`
    + '</aside>';
}

export default {
  id: 'sidebar',
  name: 'Sidebar',
  description: 'Collapsible side navigation.',
  sources: ['components/_sidebar.scss'],
  target: '.sidebar',
  matrix: { rows: 'width', cols: 'submenu' },
  layout: 'full',
  controls: [
    {
      key: 'width',
      label: 'Width',
      type: 'select',
      options: [{ value: '', label: 'Expanded' }, { value: 'collapsed', label: 'Collapsed (icons)' }],
    },
    { key: 'side', label: 'Side', type: 'select', options: [{ value: '', label: 'Left' }, { value: 'right', label: 'Right' }] },
    {
      key: 'current',
      label: 'Current page',
      type: 'select',
      default: 'home',
      options: [
        { value: '', label: 'None' },
        { value: 'home', label: 'Dashboard' },
        { value: 'pages', label: 'Pages' },
        { value: 'records', label: 'Records' },
        { value: 'settings', label: 'Settings' },
      ],
    },
    {
      key: 'submenu',
      label: 'Records submenu',
      type: 'select',
      default: 'closed',
      options: [
        { value: '', label: 'None' },
        { value: 'closed', label: 'Collapsed' },
        { value: 'open', label: 'Expanded' },
      ],
    },
    { key: 'brand', label: 'Brand', type: 'text', default: 'Parallelogram' },
    { key: 'badges', label: 'Badges', type: 'toggle', default: true },
    { key: 'disabled', label: 'Disabled item', type: 'toggle' },
    { key: 'footer', label: 'Footer', type: 'toggle', default: true },
    { key: 'open', label: 'Open on mobile', type: 'toggle' },
  ],
  presets: [
    { name: 'App sidebar', state: {} },
    { name: 'Collapsed rail', state: { width: 'collapsed', footer: false } },
    { name: 'Records expanded', state: { submenu: 'open', current: 'records' } },
    { name: 'Right side', state: { side: 'right', submenu: '' } },
    { name: 'Restricted item', state: { disabled: true, current: 'pages', badges: false } },
    { name: 'Mobile drawer open', state: { open: true } },
  ],
  render(s) {
    const collapsed = s.width === 'collapsed';
    const mainClass = bem('sidebarlayout__main', collapsed && 'collapsed');
    return '<div class="sidebarlayout">'
      + sidebar(s)
      + `<div class="${cx('sidebaroverlay', s.open && 'sidebaroverlay--visible')}" aria-hidden="true"></div>`
      + `<main class="${mainClass}"><div class="center center--md my--lg">`
      + `<button type="button" class="btn btn--outline btn--sm mb--md" aria-controls="${SIDEBAR_ID}" aria-expanded="${s.open}">${svg('icon btn__icon', PATHS.menu)}Menu</button>`
      + '<h1 class="text--lg text--semibold">Dashboard</h1>'
      + '<p class="text--sm text--muted">Welcome back! Here’s an overview of your workspace.</p>'
      + '</div></main></div>';
  },
};
