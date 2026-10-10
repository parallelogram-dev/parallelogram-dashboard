import { bem, cx, escape, icon } from '../lib.js';

const LOGO = '<svg class="icon navbar__logo" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z"/></svg>';
const MENU = '<svg class="icon" viewBox="0 0 24 24"><path d="M4 6l16 0"/><path d="M4 12l16 0"/><path d="M4 18l16 0"/></svg>';
const BELL = '<svg class="icon" viewBox="0 0 24 24"><path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6"/><path d="M9 17v1a3 3 0 0 0 6 0v-1"/></svg>';
const LINKS = ['Dashboard', 'Pages', 'Records', 'Analytics'];
const MOBILE_ID = 'pg-navbar-mobile';

function links(s, className) {
  return LINKS.map(text => {
    const current = text === s.current ? ' aria-current="page"' : '';
    const disabled = s.disabled && text === 'Analytics' ? ' aria-disabled="true" tabindex="-1"' : '';
    return `<a href="#" class="${className}"${current}${disabled}>${escape(text)}</a>`;
  }).join('');
}

function brand(s) {
  return `<a href="#" class="navbar__brand">${s.logo ? LOGO : ''}${escape(s.brand)}</a>`;
}

function search(s) {
  if (!s.search) {
    return '';
  }
  const kbd = s.search === 'kbd' ? '<kbd class="navbar__search-kbd">⌘K</kbd>' : '';
  return `<div class="navbar__search" role="search">${icon('search', 'navbar__search-icon')}`
    + `<input type="search" class="navbar__search-input" placeholder="Search…" aria-label="Search">${kbd}</div>`;
}

function actions(s) {
  const toggle = `<button type="button" class="navbar__toggle" aria-label="Open menu" aria-expanded="${s.mobileOpen}" aria-controls="${MOBILE_ID}" data-toggle data-toggle-target="#${MOBILE_ID}">${MENU}</button>`;
  const extras = s.actions
    ? `<button type="button" class="btn btn--ghost btn--icon" aria-label="Notifications">${BELL}</button>`
      + '<a href="#" class="avatar avatar--sm" aria-label="Your account"><span class="avatar__fallback">JD</span></a>'
    : '';
  return `<div class="navbar__actions">${search(s)}${extras}${toggle}</div>`;
}

function mobileMenu(s) {
  return `<dialog class="navbarmobile" id="${MOBILE_ID}" aria-label="Menu"${s.mobileOpen ? ' open' : ''}>`
    + `<div class="navbarmobile__header">${brand(s)}`
    + `<button type="button" class="navbarmobile__close" aria-label="Close menu" data-toggle data-toggle-target="#${MOBILE_ID}">${icon('x')}</button></div>`
    + `<nav class="navbarmobile__nav" aria-label="Main">${links(s, 'navbarmobile__item')}</nav>`
    + '<div class="navbarmobile__footer"><a href="#" class="btn btn--outline btn--full">Sign out</a></div>'
    + '</dialog>';
}

export default {
  id: 'navbar',
  name: 'Navbar',
  description: 'Top navigation bar with brand, search and actions.',
  sources: ['components/_navbar.scss'],
  target: '.navbar',
  matrix: { rows: 'variant', cols: 'search' },
  layout: 'full',
  controls: [
    { key: 'variant', label: 'Variant', type: 'select', options: ['', 'elevated', 'transparent'] },
    {
      key: 'position',
      label: 'Position',
      type: 'select',
      options: [
        { value: '', label: 'Static' },
        { value: 'sticky', label: 'Sticky' },
        { value: 'fixed', label: 'Fixed' },
      ],
    },
    {
      key: 'search',
      label: 'Search',
      type: 'select',
      default: 'kbd',
      options: [
        { value: '', label: 'None' },
        { value: 'input', label: 'Input' },
        { value: 'kbd', label: 'Input + shortcut' },
      ],
    },
    { key: 'brand', label: 'Brand', type: 'text', default: 'Parallelogram' },
    { key: 'logo', label: 'Logo', type: 'toggle', default: true },
    {
      key: 'current',
      label: 'Current page',
      type: 'select',
      default: 'Dashboard',
      options: [{ value: '', label: 'None' }, ...LINKS],
    },
    { key: 'disabled', label: 'Disabled item', type: 'toggle' },
    { key: 'actions', label: 'Actions', type: 'toggle', default: true },
    { key: 'withSidebar', label: 'Offset for sidebar', type: 'toggle' },
    { key: 'mobileOpen', label: 'Mobile menu open', type: 'toggle' },
  ],
  presets: [
    { name: 'App header', state: {} },
    { name: 'Sticky, elevated', state: { variant: 'elevated', position: 'sticky' } },
    { name: 'Marketing (transparent)', state: { variant: 'transparent', search: '', actions: false, current: 'Pages' } },
    { name: 'Restricted section', state: { current: 'Records', disabled: true } },
    { name: 'Beside a sidebar', state: { withSidebar: true, logo: false, search: 'input' } },
    { name: 'Mobile menu open', state: { mobileOpen: true } },
  ],
  render(s) {
    const className = cx(bem('navbar', s.position, s.variant), s.withSidebar && 'navbar--with-sidebar');
    return `<header class="${className}">${brand(s)}`
      + `<nav class="navbar__nav" aria-label="Main">${links(s, 'navbar__item')}</nav>`
      + `${actions(s)}</header>${mobileMenu(s)}`;
  },
};
