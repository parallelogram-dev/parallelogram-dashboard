/**
 * Parallelogram Dashboard - Main JavaScript
 *
 * Standalone browser script for dashboard component interactivity.
 * Uses progressive enhancement - components work without JS but are enhanced when loaded.
 */

// ============================================================================
// Accordion Component
// ============================================================================

class Accordion {
  constructor(options = {}) {
    this.openClass = options.openClass || 'accordion__item--open';
    this.multiple = options.multiple || false;
    this.elements = new WeakMap();
  }

  mount(element) {
    if (this.elements.has(element)) return;

    const items = element.querySelectorAll('.accordion__item');
    const triggers = element.querySelectorAll('.accordion__trigger');
    const multiple = element.dataset.accordionMultiple === 'true';

    const state = {
      items: [...items],
      triggers: [...triggers],
      multiple: multiple,
    };

    // Set up click handlers
    triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => this._handleTriggerClick(e, element, state));
    });

    element.setAttribute('data-accordion-enhanced', 'true');
    this.elements.set(element, state);
  }

  _handleTriggerClick(event, element, state) {
    event.preventDefault();
    const trigger = event.currentTarget;
    const item = trigger.closest('.accordion__item');

    if (!item) return;

    const isOpen = item.classList.contains(this.openClass);

    // Close other items if multiple is not allowed
    if (!state.multiple && !isOpen) {
      state.items.forEach(i => {
        i.classList.remove(this.openClass);
        const t = i.querySelector('.accordion__trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }

    // Toggle current item
    item.classList.toggle(this.openClass);
    trigger.setAttribute('aria-expanded', String(!isOpen));
  }

  static enhanceAll(selector = '[data-accordion]', root = document) {
    const instance = new Accordion();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

// ============================================================================
// Tabs Component
// ============================================================================

class Tabs {
  constructor(options = {}) {
    this.activeClass = options.activeClass || 'tabs__trigger--active';
    this.panelActiveClass = options.panelActiveClass || 'tab-panel--active';
    this.elements = new WeakMap();
  }

  mount(element) {
    if (this.elements.has(element)) return;

    const tabsList = element.querySelector('[data-tabs-list]');
    const tabsContainer = element.querySelector('[data-tabs-panels]');

    if (!tabsList || !tabsContainer) return;

    const tabs = [...tabsList.querySelectorAll('[data-tab]')];
    const panels = [...tabsContainer.querySelectorAll('[data-tab-panel]')];

    if (tabs.length === 0 || panels.length === 0) return;

    const state = {
      tabsList,
      tabsContainer,
      tabs,
      panels,
      activeTab: null,
    };

    // Setup ARIA
    tabsList.setAttribute('role', 'tablist');
    tabs.forEach(tab => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('tabindex', tab.getAttribute('aria-selected') === 'true' ? '0' : '-1');
    });
    panels.forEach(panel => {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('tabindex', '0');
    });

    // Set up click handlers
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => this._handleTabClick(e, element, state));
      tab.addEventListener('keydown', (e) => this._handleKeyDown(e, element, state));
    });

    // Find and activate initial tab
    const activeTab = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
    if (activeTab) {
      this._activateTab(element, activeTab.dataset.tab, state, false);
    }

    element.setAttribute('data-tabs-enhanced', 'true');
    this.elements.set(element, state);
  }

  _handleTabClick(event, element, state) {
    event.preventDefault();
    const tab = event.currentTarget;
    const panelId = tab.dataset.tab;
    if (panelId) {
      this._activateTab(element, panelId, state, true);
    }
  }

  _handleKeyDown(event, element, state) {
    const currentIndex = state.tabs.findIndex(tab => tab === event.currentTarget);
    let targetIndex = -1;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        targetIndex = (currentIndex + 1) % state.tabs.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        targetIndex = (currentIndex - 1 + state.tabs.length) % state.tabs.length;
        break;
      case 'Home':
        event.preventDefault();
        targetIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        targetIndex = state.tabs.length - 1;
        break;
    }

    if (targetIndex >= 0) {
      const targetTab = state.tabs[targetIndex];
      targetTab.focus();
      this._activateTab(element, targetTab.dataset.tab, state, true);
    }
  }

  _activateTab(element, panelId, state, animate = true) {
    // Update tab states
    state.tabs.forEach(tab => {
      const isActive = tab.dataset.tab === panelId;
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
      tab.classList.toggle(this.activeClass, isActive);
    });

    // Update panel visibility
    state.panels.forEach(panel => {
      const shouldShow = panel.id === panelId;
      panel.style.display = shouldShow ? '' : 'none';
      panel.classList.toggle(this.panelActiveClass, shouldShow);
    });

    state.activeTab = panelId;
  }

  static enhanceAll(selector = '[data-tabs]', root = document) {
    const instance = new Tabs();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

// ============================================================================
// Toggle Component
// ============================================================================

class Toggle {
  constructor(options = {}) {
    this.openClass = options.openClass || 'open';
    this.elements = new WeakMap();
  }

  mount(element) {
    if (this.elements.has(element)) return;

    const targetSelector = element.dataset.toggleTarget;
    if (!targetSelector) return;

    const target = document.querySelector(targetSelector);
    if (!target) return;

    const capture = element.dataset.toggleCapture === 'true';
    const manual = element.dataset.toggleManual === 'true';

    const state = {
      target,
      targetSelector,
      capture,
      manual,
      isOpen: target.classList.contains(this.openClass),
    };

    // Click handler
    element.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle(element);
    });

    // Setup ARIA
    element.setAttribute('aria-expanded', String(state.isOpen));

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isOpen && !state.manual) {
        this.hide(element);
      }
    });

    // Outside click for capture mode
    if (capture) {
      document.addEventListener('click', (e) => {
        if (state.isOpen && !state.manual && !element.contains(e.target) && !target.contains(e.target)) {
          this.hide(element);
        }
      });
    }

    element.setAttribute('data-toggle-enhanced', 'true');
    this.elements.set(element, state);
  }

  toggle(element) {
    const state = this.elements.get(element);
    if (!state) return;

    if (state.target.classList.contains(this.openClass)) {
      this.hide(element);
    } else {
      this.show(element);
    }
  }

  show(element) {
    const state = this.elements.get(element);
    if (!state) return;

    state.isOpen = true;
    state.target.classList.add(this.openClass);
    element.setAttribute('aria-expanded', 'true');
    element.classList.add(this.openClass);
  }

  hide(element) {
    const state = this.elements.get(element);
    if (!state) return;

    state.isOpen = false;
    state.target.classList.remove(this.openClass);
    element.setAttribute('aria-expanded', 'false');
    element.classList.remove(this.openClass);
  }

  static enhanceAll(selector = '[data-toggle]', root = document) {
    const instance = new Toggle();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

// ============================================================================
// Toast Manager
// ============================================================================

class ToastManager {
  constructor(options = {}) {
    this.container = null;
    this.position = options.position || 'top-right';
    this.defaultDuration = options.duration || 5000;
    this._ensureContainer();
  }

  _ensureContainer() {
    this.container = document.querySelector(`.toast-container--${this.position}`);
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = `toast-container toast-container--${this.position}`;
      document.body.appendChild(this.container);
    }
  }

  show({ message, title, type = 'info', duration = this.defaultDuration, actions = [] }) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    const icons = {
      info: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 9h.01"/><path d="M11 12h1v4h1"/>',
      success: '<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M9 12l2 2l4 -4"/>',
      warning: '<path d="M12 9v4"/><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"/><path d="M12 16h.01"/>',
      error: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 9v4"/><path d="M12 16h.01"/>',
    };

    toast.innerHTML = `
      <svg class="icon toast__icon" viewBox="0 0 24 24">${icons[type] || icons.info}</svg>
      <div class="toast__content">
        ${title ? `<h4 class="toast__title">${title}</h4>` : ''}
        <p class="toast__description">${message}</p>
      </div>
      <button class="toast__close">
        <svg class="icon" viewBox="0 0 24 24"><path d="M18 6l-12 12"/><path d="M6 6l12 12"/></svg>
      </button>
    `;

    // Add close handler
    const closeBtn = toast.querySelector('.toast__close');
    closeBtn?.addEventListener('click', () => this.dismiss(toast));

    this.container.appendChild(toast);

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }

    return toast;
  }

  dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    toast.style.animation = 'toast-slide-out 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  }

  info(message, options = {}) {
    return this.show({ ...options, message, type: 'info' });
  }

  success(message, options = {}) {
    return this.show({ ...options, message, type: 'success' });
  }

  warning(message, options = {}) {
    return this.show({ ...options, message, type: 'warning' });
  }

  error(message, options = {}) {
    return this.show({ ...options, message, type: 'error' });
  }
}

// ============================================================================
// Demo Navigation - Floating menu to navigate between demo pages
// ============================================================================

class DemoNav {
  constructor() {
    this.isOpen = false;
    this.pages = [
      { name: 'Components', href: 'index.html', icon: 'grid' },
      { name: 'Dashboard', href: 'dashboard.html', icon: 'home' },
      { name: 'Records List', href: 'records.html', icon: 'database' },
      { name: 'Record Form', href: 'record-form.html', icon: 'edit' },
      { name: 'Record Delete', href: 'record-delete.html', icon: 'trash' },
      { name: 'Settings', href: 'settings.html', icon: 'settings' },
      { name: 'Account Settings', href: 'settings-account.html', icon: 'user' },
      { name: 'Login', href: 'login.html', icon: 'login' },
      { name: 'Forgot Password', href: 'forgot-password.html', icon: 'key' },
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
        </div>
        <nav class="demonav__list">
          ${this.pages.map(page => this.createPageLink(page)).join('')}
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
      currentLink.classList.add('demonav__link--active');
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
    this.container.classList.add('demonav--open');
    this.trigger.setAttribute('aria-expanded', 'true');
  }

  close() {
    this.isOpen = false;
    this.container.classList.remove('demonav--open');
    this.trigger.setAttribute('aria-expanded', 'false');
  }
}

// ============================================================================
// Initialize on DOM Ready
// ============================================================================

const VENDOR = new URL('../vendor/parallelogram-js/', import.meta.url);

const WEB_COMPONENTS = {
  'p-modal': 'components/PModal.js',
  'p-datetime': 'components/PDatetime.js',
};

/**
 * Load the @parallelogram-js/core pieces that markup inside root relies on.
 *
 * The package is copied into demo/vendor by `npm run build`; nothing is fetched when a page
 * does not use these components.
 */
async function loadParallelogramJs(root) {
  const loads = Object.entries(WEB_COMPONENTS)
    .filter(([tag]) => root.querySelector(tag) && !customElements.get(tag))
    .map(([, path]) => import(new URL(path, VENDOR).href));

  if (root.querySelector('[data-modal][data-modal-target]')) {
    loads.push(import(new URL('components/Modal.js', VENDOR).href).then(({ default: Modal }) => Modal.enhanceAll()));
  }

  try {
    await Promise.all(loads);
  } catch (error) {
    console.error('Could not load @parallelogram-js/core. Run `npm run build` to copy it into demo/vendor.', error);
  }
}

/**
 * Enhance every interactive component inside root.
 *
 * Safe to call repeatedly on freshly rendered markup, e.g. from the playground preview.
 */
function init(root = document) {
  loadParallelogramJs(root);

  return {
    accordion: Accordion.enhanceAll('[data-accordion]', root),
    tabs: Tabs.enhanceAll('[data-tabs]', root),
    toggle: Toggle.enhanceAll('[data-toggle]', root),
  };
}

window.Parallelogram = { init, Accordion, Tabs, Toggle, ToastManager };

document.addEventListener('DOMContentLoaded', () => {
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
    const current = html.getAttribute('data-theme');
    html.setAttribute('data-theme', current === 'dark' ? '' : 'dark');

    window.toast.info(current === 'dark' ? 'Light mode enabled' : 'Dark mode enabled', {
      duration: 2000,
    });
  };

  console.log('Parallelogram Dashboard initialized');
});
