/**
 * Parallelogram Dashboard - demo pages
 *
 * Enhances each demo page with @parallelogram-js/dashboard, which an import map in the page
 * resolves to demo/vendor. Everything below is demo-only: the floating page navigation, the
 * theme toggle, the global toast manager and window.Parallelogram for the classic demo scripts.
 */

import {
  init, SearchClear, ActionBar, OverflowActions, EditableTable, UnsavedGuard, Expandable, TableColumns,
  TableSort, TableReorder, TablePaste, PublishSchedule, ActionBarList, Accordion, Collapsible, Submenu, Tabs, SegmentedControl, Toggle, Chart, ToastManager,
  polyfillDialogCommands,
} from '@parallelogram-js/dashboard';

// ============================================================================
// Brand experiment - lays another product's colours over the theme tokens
// ============================================================================

const BRANDS = { contenir: 'css/brand-contenir.css' };

function applyBrand(name) {
  const root = document.documentElement;
  document.getElementById('demo-brand')?.remove();
  if (BRANDS[name]) {
    const link = document.createElement('link');
    link.id = 'demo-brand';
    link.rel = 'stylesheet';
    link.href = new URL(`../${BRANDS[name]}`, import.meta.url).href;
    document.head.append(link);
    root.dataset.brand = name;
  } else {
    delete root.dataset.brand;
  }
}

const storedBrand = (() => {
  try { return localStorage.getItem('demo-brand'); } catch { return null; }
})();
applyBrand(storedBrand);

// ============================================================================
// Demo Navigation - Floating menu to navigate between demo pages
// ============================================================================

class DemoNav {
  constructor() {
    this.isOpen = false;
    // Grouped so every demo page is one click away; component docs live behind Components
    this.sections = [
      { title: 'Start', pages: [
        { name: 'Components', href: 'index.html', icon: 'grid' },
        { name: 'Playground', href: 'playground.html', icon: 'play' },
      ] },
      { title: 'Dashboards', pages: [
        { name: 'Dashboard', href: 'dashboard.html', icon: 'home' },
        { name: 'CMS Dashboard', href: 'cms-dashboard.html', icon: 'home' },
        { name: 'CMS Dashboard (Admin)', href: 'cms-dashboard-admin.html', icon: 'settings' },
        { name: 'Analytics', href: 'analytics.html', icon: 'chart' },
      ] },
      { title: 'Content', pages: [
        { name: 'Pages', href: 'pages.html', icon: 'edit' },
        { name: 'Records List', href: 'records.html', icon: 'database' },
        { name: 'Record Form', href: 'record-form.html', icon: 'edit' },
        { name: 'Record with Tabs', href: 'record-edit-tabs.html', icon: 'edit' },
        { name: 'Nested Editing', href: 'nested-edit.html', icon: 'layers' },
        { name: 'Block Editor', href: 'block-editor.html', icon: 'layers' },
        { name: 'Record Delete', href: 'record-delete.html', icon: 'trash' },
      ] },
      { title: 'Media', pages: [
        { name: 'Media Library', href: 'media.html', icon: 'photo' },
        { name: 'File Browser', href: 'components/filebrowser.html', icon: 'photo' },
        { name: 'Media Field', href: 'components/media.html', icon: 'photo' },
      ] },
      { title: 'People & settings', pages: [
        { name: 'Team', href: 'team.html', icon: 'user' },
        { name: 'Settings', href: 'settings.html', icon: 'settings' },
        { name: 'Account Settings', href: 'settings-account.html', icon: 'user' },
        { name: 'Billing', href: 'billing.html', icon: 'card' },
      ] },
      { title: 'Access', pages: [
        { name: 'Login', href: 'login.html', icon: 'login' },
        { name: 'Forgot Password', href: 'forgot-password.html', icon: 'key' },
        { name: 'Onboarding', href: 'onboarding.html', icon: 'home' },
      ] },
      { title: 'System', pages: [
        { name: 'System Check', href: 'system-check.html', icon: 'check' },
        { name: 'Fixing Issues', href: 'fixing.html', icon: 'tool' },
        { name: '403', href: '403.html', icon: 'key' },
        { name: '404', href: '404.html', icon: 'alert' },
        { name: '500', href: '500.html', icon: 'alert' },
        { name: '500 (Debug)', href: '500-debug.html', icon: 'tool' },
      ] },
    ];
    this.icons = {
      grid: '<path d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M14 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/>',
      home: '<path d="M5 12l-2 0l9 -9l9 9l-2 0"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"/><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"/>',
      database: '<path d="M12 6m-8 0a8 3 0 1 0 16 0a8 3 0 1 0 -16 0"/><path d="M4 6v6a8 3 0 0 0 16 0v-6"/><path d="M4 12v6a8 3 0 0 0 16 0v-6"/>',
      edit: '<path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1"/><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z"/><path d="M16 5l3 3"/>',
      trash: '<path d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>',
      settings: '<path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>',
      user: '<path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"/><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>',
      login: '<path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"/><path d="M21 12h-13l3 -3"/><path d="M11 15l-3 -3"/>',
      key: '<path d="M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l6.558 -6.558l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0z"/><path d="M15 9h.01"/>',
      card: '<path d="M3 5m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z"/><path d="M3 10l18 0"/><path d="M7 15l.01 0"/><path d="M11 15l2 0"/>',
      check: '<path d="M5 12l5 5l10 -10"/>',
      tool: '<path d="M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5"/>',
      alert: '<path d="M12 9v4"/><path d="M10.363 3.591l-8.106 13.536a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"/><path d="M12 16h.01"/>',
      play: '<path d="M7 4v16l13 -8z"/>',
      chart: '<path d="M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/>',
      layers: '<path d="M12 4l-8 4l8 4l8 -4l-8 -4"/><path d="M4 12l8 4l8 -4"/><path d="M4 16l8 4l8 -4"/>',
      photo: '<path d="M15 8h.01"/><path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z"/><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"/><path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"/>',
      palette: '<path d="M12 21a9 9 0 0 1 0 -18c4.97 0 9 3.582 9 8c0 1.06 -.474 2.078 -1.318 2.828c-.844 .75 -1.989 1.172 -3.182 1.172h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25"/><path d="M8.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M12.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M16.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>',
      menu: '<path d="M4 6l16 0"/><path d="M4 12l16 0"/><path d="M4 18l16 0"/>',
      close: '<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>',
    };
    this.init();
  }

  init() {
    this.createElements();
    this.bindEvents();
  }

  createElements() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'demonav';
    this.container.innerHTML = `
      <button class="demonav__trigger" aria-label="Demo navigation" aria-expanded="false">
        <svg class="icon demonav__icon demonav__icon--menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${this.icons.menu}</svg>
        <svg class="icon demonav__icon demonav__icon--close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${this.icons.close}</svg>
      </button>
      <div class="demonav__menu">
        <div class="demonav__header">
          <span class="demonav__title">Demo Pages</span>
          <button type="button" class="btn btn--outline btn--sm" data-demo-brand aria-pressed="${document.documentElement.dataset.brand === 'contenir'}">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${this.icons.palette}</svg>Contenir
          </button>
        </div>
        <nav class="demonav__list">
          ${this.sections.map(section => `<p class="demonav__group">${section.title}</p>${section.pages.map(page => this.createPageLink(page)).join('')}`).join('')}
        </nav>
      </div>
    `;

    document.body.appendChild(this.container);
    this.trigger = this.container.querySelector('.demonav__trigger');
    this.menu = this.container.querySelector('.demonav__menu');

    // Mark current page
    const current = new URL(window.location.pathname.replace(/\/$/, '/index.html'), window.location.origin).href;
    const currentLink = [...this.container.querySelectorAll('a')].find(a => a.href === current);
    if (currentLink) {
      currentLink.setAttribute('aria-current', 'page');
    }
  }

  createPageLink(page) {
    return `
      <a href="${new URL(`../${page.href}`, import.meta.url).href}" class="demonav__link">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${this.icons[page.icon]}</svg>
        <span>${page.name}</span>
      </a>
    `;
  }

  bindEvents() {
    // Toggle menu
    this.trigger.addEventListener('click', () => this.toggle());

    this.container.querySelector('[data-demo-brand]').addEventListener('click', (e) => {
      const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
      e.currentTarget.setAttribute('aria-pressed', String(on));
      applyBrand(on ? 'contenir' : null);
      try { localStorage.setItem('demo-brand', on ? 'contenir' : ''); } catch { /* storage unavailable */ }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.container.contains(e.target)) {
        this.close();
      }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.trigger.setAttribute('aria-expanded', 'true');
  }

  close() {
    this.isOpen = false;
    this.trigger.setAttribute('aria-expanded', 'false');
  }
}

window.Parallelogram = { init, SearchClear, ActionBar, OverflowActions, EditableTable, UnsavedGuard, Expandable, TableColumns,
  TableSort, TableReorder, TablePaste, PublishSchedule, ActionBarList, Accordion, Collapsible, Submenu, Tabs, SegmentedControl, Toggle, Chart, ToastManager };

document.addEventListener('DOMContentLoaded', () => {
  polyfillDialogCommands();
  init();

  // Create global toast manager
  window.toast = new ToastManager({ position: 'top-right' });

  // The playground preview frame opts out of the floating demo navigation
  if (document.body.dataset.demonav !== 'off') {
    window.demoNav = new DemoNav();
  }

  // Theme toggle
  window.toggleTheme = () => {
    const html = document.documentElement;
    const theme = html.getAttribute('data-theme');
    const dark = !(theme === 'dark' || (theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches));
    html.setAttribute('data-theme', dark ? 'dark' : 'light');

    window.toast.info(dark ? 'Dark mode enabled' : 'Light mode enabled', {
      duration: 2000,
    });
  };

  console.log('Parallelogram Dashboard initialized');
});
