import { ensureId, isDisabled } from '../util/dom.js';

// ============================================================================
// Tabs Component
// ============================================================================

export class Tabs {
  constructor() {
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
      const panel = panels.find(p => p.id === tab.dataset.tab);
      if (panel) {
        tab.setAttribute('aria-controls', panel.id);
        panel.setAttribute('aria-labelledby', ensureId(tab, 'tab'));
      }
    });
    panels.forEach(panel => {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('tabindex', '0');
    });

    // The animated variant slides one indicator under the selected tab
    if (element.classList.contains('tabs--animated')) {
      state.indicator = tabsList.querySelector('.tabs__indicator');
      if (!state.indicator) {
        state.indicator = document.createElement('span');
        state.indicator.className = 'tabs__indicator';
        state.indicator.setAttribute('aria-hidden', 'true');
        tabsList.append(state.indicator);
      }
      new ResizeObserver(() => this._moveIndicator(state)).observe(tabsList);
    }

    // Set up click handlers
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => this._handleTabClick(e, element, state));
      tab.addEventListener('keydown', (e) => this._handleKeyDown(e, element, state));
    });

    // Find and activate initial tab
    const activeTab = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs.find(t => !isDisabled(t));
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
    if (panelId && !isDisabled(tab)) {
      this._activateTab(element, panelId, state, true);
    }
  }

  _handleKeyDown(event, element, state) {
    // Disabled tabs are skipped rather than focused
    const enabled = state.tabs.filter(tab => !isDisabled(tab));
    const currentIndex = enabled.indexOf(event.currentTarget);
    let targetIndex = -1;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        targetIndex = (currentIndex + 1) % enabled.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        targetIndex = (currentIndex - 1 + enabled.length) % enabled.length;
        break;
      case 'Home':
        event.preventDefault();
        targetIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        targetIndex = enabled.length - 1;
        break;
    }

    if (targetIndex >= 0 && enabled[targetIndex]) {
      const targetTab = enabled[targetIndex];
      targetTab.focus();
      this._activateTab(element, targetTab.dataset.tab, state, true);
    }
  }

  _activateTab(element, panelId, state, animate = true) {
    state.tabs.forEach(tab => {
      const isActive = tab.dataset.tab === panelId;
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    state.panels.forEach(panel => {
      panel.hidden = panel.id !== panelId;
    });

    state.activeTab = panelId;
    this._moveIndicator(state);
  }

  _moveIndicator(state) {
    if (!state.indicator) return;
    const tab = state.tabs.find(t => t.dataset.tab === state.activeTab);
    if (!tab) return;
    state.tabsList.style.setProperty('--tabs-indicator-left', `${tab.offsetLeft}px`);
    state.tabsList.style.setProperty('--tabs-indicator-width', `${tab.offsetWidth}px`);
  }

  static enhanceAll(selector = '[data-tabs]', root = document) {
    const instance = new Tabs();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}
