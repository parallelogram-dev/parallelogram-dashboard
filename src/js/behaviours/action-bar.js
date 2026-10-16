import { OverflowActions } from './overflow-actions.js';

/**
 * Folds an action bar's lower-priority segments into a "more" menu before its label is cut off,
 * using OverflowActions with action bar styling for the menu. Bars in a list (and its nested
 * lists) fold together, so a tree's columns stay aligned.
 */
export class ActionBar {
  constructor() {
    this.overflow = new OverflowActions();
  }

  mount(bar) {
    let list = bar.closest('.actionbar__list');
    while (list?.parentElement?.closest('.actionbar__list')) list = list.parentElement.closest('.actionbar__list');
    this.overflow.mount(bar, {
      boundary: list || bar,
      protect: '.actionbar__label',
      moreClass: 'actionbar__segment actionbar__more dropdown',
      triggerClass: 'actionbar__trigger dropdown__trigger',
    });
  }

  static enhanceAll(selector = '.actionbar', root = document) {
    const instance = new ActionBar();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}
