import { cx, escape, icon } from '../lib.js';

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
  forms: '<path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"/><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"/>',
  chevronRight: '<path d="M9 6l6 6l-6 6"/>',
  layoutSidebar: '<path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"/><path d="M9 4v16"/>',
};

const SUBNAV_ID = 'pg-subnav';
const SUBMENU_ID = 'pg-subnav-records';

function navmenu() {
  const rail = [['home', 'Home'], ['pages', 'Pages'], ['records', 'Records'], ['media', 'Media'], ['analytics', 'Analytics'], ['team', 'Team']];
  const items = list => list.map(([key, text]) => `<a href="#" class="navmenu__item" aria-label="${text}"${key === 'home' ? ' aria-current="page"' : ''}>`
    + `${svg('icon', PATHS[key])}<span class="navmenu__tooltip" aria-hidden="true">${text}</span></a>`).join('');
  return '<nav class="navmenu" aria-label="Main">'
    + `<div class="navmenu__header"><a href="#" class="navmenu__logo" aria-label="Dashboard home">${svg('icon icon--lg', PATHS.logo)}</a></div>`
    + `<div class="navmenu__content"><div class="navmenu__section">${items(rail)}</div>`
    + `<div class="navmenu__section">${items([['settings', 'Settings']])}</div></div>`
    + '<div class="navmenu__footer"><a href="#" class="navmenu__avatar" aria-label="Your account"><span class="navmenu__avatar-fallback">JD</span></a></div>'
    + '</nav>';
}

function subitem(s, key, text, badge = '', extra = '') {
  const current = key === 'dashboard' && !s.submenu === 'open' ? ' aria-current="page"' : '';
  const badgeHtml = badge && s.badges ? `<span class="subnav__item-badge">${badge}</span>` : '';
  return `<a href="#" class="subnav__item"${current}${extra}>${svg('icon subnav__item-icon', PATHS[key === 'dashboard' ? 'home' : key])}`
    + `<span class="subnav__item-text">${escape(text)}</span>${badgeHtml}</a>`;
}

function records(s) {
  if (!s.submenu) {
    return subitem(s, 'records', 'Records', '1,248');
  }
  const open = s.submenu === 'open';
  const children = ['Products', 'Customers', 'Orders']
    .map((text, i) => `<a href="#" class="subnav__subitem"${open && i === 0 ? ' aria-current="page"' : ''}>`
      + `<span class="subnav__subitem-dot"></span>${text}</a>`)
    .join('');
  return `<button type="button" class="subnav__item" aria-expanded="${open}" aria-controls="${SUBMENU_ID}" data-toggle data-toggle-target="#${SUBMENU_ID}" data-toggle-manual="true">`
    + `${svg('icon subnav__item-icon', PATHS.records)}<span class="subnav__item-text">Records</span>`
    + `${s.badges ? '<span class="subnav__item-badge">1,248</span>' : ''}${svg('icon subnav__item-arrow', PATHS.chevronRight)}</button>`
    + `<div class="subnav__submenu" id="${SUBMENU_ID}">${children}</div>`;
}

function section(title, items, action = '') {
  return `<div class="subnav__section"><div class="subnav__section-header"><span class="subnav__section-title">${title}</span>${action}</div>`
    + `<div class="subnav__list">${items}</div></div>`;
}

function subnav(s) {
  const className = cx('subnav', s.subnav === 'collapsed' && 'subnav--collapsed', s.subnav === 'open' && 'subnav--open');
  const actions = s.actions
    ? `<div class="subnav__actions"><button type="button" class="subnav__action" aria-label="New page">${icon('plus')}</button>`
      + `<button type="button" class="subnav__action" aria-label="More options">${icon('dots')}</button></div>`
    : '';
  const search = s.search
    ? '<div class="subnav__search" role="search"><input type="search" class="subnav__search-input" placeholder="Filter…" aria-label="Filter navigation"></div>'
    : '';
  const sectionAction = s.sectionAction
    ? `<button type="button" class="subnav__section-action" aria-label="Add content type">${icon('plus')}</button>`
    : '';
  const disabled = s.disabled ? subitem(s, 'forms', 'Forms', '', ' aria-disabled="true" tabindex="-1"') : '';
  const footer = s.footer
    ? '<div class="subnav__footer"><a href="#" class="btn btn--outline btn--sm btn--full">'
      + `${icon('plus', 'btn__icon')}New record</a></div>`
    : '';
  return `<aside class="${className}" id="${SUBNAV_ID}" aria-label="${escape(s.title)}">`
    + `<div class="subnav__header"><h2 class="subnav__title">${escape(s.title)}</h2>${actions}</div>`
    + search
    + '<div class="subnav__content">'
    + section('Overview', subitem(s, 'dashboard', 'Dashboard') + subitem(s, 'analytics', 'Analytics'))
    + section('Content', subitem(s, 'pages', 'Pages', '15') + records(s) + subitem(s, 'media', 'Media', '312') + disabled, sectionAction)
    + section('People', subitem(s, 'team', 'Team', '8') + subitem(s, 'settings', 'Your account'))
    + `</div>${footer}</aside>`;
}

function main(s) {
  // Opens the section navigation off-canvas below the lg breakpoint
  const toggle = `<button type="button" class="btn btn--ghost btn--icon dashboard__subnav-toggle" aria-label="Toggle section navigation" aria-controls="${SUBNAV_ID}" aria-expanded="${s.subnav === 'open'}"`
    + ` data-toggle data-toggle-target="#${SUBNAV_ID}" data-toggle-class="subnav--open" data-toggle-overlay="#${SUBNAV_ID}-overlay">`
    + `${svg('icon', PATHS.layoutSidebar)}</button>`;
  const crumb = s.submenu === 'open' ? 'Products' : 'Dashboard';
  const stats = [['Total revenue', '$45,231.89'], ['Subscriptions', '+2,350'], ['Active now', '+573']]
    .map(([text, value]) => `<div class="stat"><div class="stat__header"><span class="stat__label">${text}</span></div><div class="stat__value">${value}</div></div>`)
    .join('');
  return '<main class="dashboard__main">'
    + `<header class="dashboard__header"><div class="dashboard__header-left">${toggle}`
    + '<nav class="breadcrumb" aria-label="Breadcrumb"><ol class="breadcrumb__list">'
    + '<li class="breadcrumb__item"><a href="#" class="breadcrumb__link">Home</a></li>'
    + `<li class="breadcrumb__item"><span class="breadcrumb__separator">${svg('icon icon--sm', PATHS.chevronRight)}</span></li>`
    + `<li class="breadcrumb__item"><span class="breadcrumb__page" aria-current="page">${crumb}</span></li></ol></nav></div>`
    + `<div class="dashboard__header-right"><button type="button" class="btn btn--ghost btn--icon" aria-label="Search">${icon('search')}</button>`
    + '<a href="#" class="avatar avatar--sm" aria-label="Your account"><span class="avatar__fallback">JD</span></a></div></header>'
    + '<div class="dashboard__content">'
    + `<div class="pageheader"><div class="pageheader__content"><h1 class="pageheader__title">${crumb}</h1>`
    + '<p class="pageheader__description">Welcome back! Here’s an overview of your workspace.</p></div></div>'
    + `<div class="stat__grid">${stats}</div>`
    + '</div></main>';
}

export default {
  id: 'dashboard',
  name: 'Dashboard Layout',
  description: 'Application shell combining sidebar, header and content.',
  sources: ['components/_dashboard.scss'],
  target: '.dashboard',
  matrix: { rows: 'subnav', cols: 'submenu' },
  layout: 'full',
  controls: [
    {
      key: 'subnav',
      label: 'Section nav',
      type: 'select',
      options: [
        { value: '', label: 'Shown' },
        { value: 'collapsed', label: 'Collapsed (--collapsed)' },
        { value: 'open', label: 'Open off-canvas (--open, below lg)' },
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
    { key: 'title', label: 'Section title', type: 'text', default: 'Home' },
    { key: 'actions', label: 'Header actions', type: 'toggle', default: true },
    { key: 'search', label: 'Filter input', type: 'toggle' },
    { key: 'sectionAction', label: 'Section action (on hover)', type: 'toggle', default: true },
    { key: 'badges', label: 'Badges', type: 'toggle', default: true },
    { key: 'disabled', label: 'Disabled item', type: 'toggle' },
    { key: 'footer', label: 'Footer', type: 'toggle' },
  ],
  presets: [
    { name: 'Home', state: {} },
    { name: 'Records expanded', state: { title: 'Content', submenu: 'open', search: true } },
    { name: 'Section nav collapsed', state: { subnav: 'collapsed' } },
    { name: 'Mobile section nav open', state: { subnav: 'open' } },
    { name: 'With footer action', state: { footer: true, actions: false, disabled: true } },
    { name: 'Minimal', state: { submenu: '', actions: false, sectionAction: false, badges: false } },
  ],
  render(s) {
    const overlay = `<div class="${cx('dashboard__overlay', s.subnav === 'open' && 'dashboard__overlay--visible')}" id="${SUBNAV_ID}-overlay" aria-hidden="true"></div>`;
    return `<div class="dashboard">${navmenu()}${subnav(s)}${overlay}${main(s)}</div>`;
  },
};
