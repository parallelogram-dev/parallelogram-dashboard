// ============================================================================
// Toggle Component
// ============================================================================

export class Toggle {
  /** Open capture-mode toggles across every instance, so opening one dropdown closes the others. */
  static open = new Map();

  constructor() {
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
    // Optional extra class on the target for markup that is not styled from aria-expanded
    const targetClass = element.dataset.toggleClass || '';

    // Optional backdrop shown with the target (e.g. .sidebaroverlay); clicking it closes
    const overlay = element.dataset.toggleOverlay ? document.querySelector(element.dataset.toggleOverlay) : null;

    const state = {
      target,
      targetSelector,
      capture,
      manual,
      targetClass,
      overlay,
      overlayClass: overlay ? `${overlay.classList[0]}--visible` : '',
      isOpen: element.getAttribute('aria-expanded') === 'true'
        || target.hasAttribute('open')
        || (targetClass !== '' && target.classList.contains(targetClass)),
    };

    overlay?.addEventListener('click', () => this.hide(element));

    // A [data-toggle-close] button inside the target closes it and hands focus back to the trigger
    target.querySelectorAll('[data-toggle-close]').forEach((close) => {
      close.addEventListener('click', () => {
        this.hide(element);
        element.focus();
      });
    });

    // Click handler
    element.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle(element);
    });

    // The stylesheet reads aria-expanded on the trigger, so it must always be present
    element.setAttribute('aria-expanded', String(state.isOpen));
    if (target.id) element.setAttribute('aria-controls', target.id);

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isOpen && !state.manual) {
        e.preventDefault();
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
    if (state.isOpen && capture && !manual) Toggle.open.set(element, this);
  }

  toggle(element) {
    const state = this.elements.get(element);
    if (!state) return;

    if (state.isOpen) {
      this.hide(element);
    } else {
      this.show(element);
    }
  }

  show(element) {
    const state = this.elements.get(element);
    if (state?.capture && !state.manual) {
      // The trigger's click doesn't reach the document, so other dropdowns never see it as outside
      for (const [other, owner] of Toggle.open) {
        const nested = owner.elements.get(other)?.target.contains(element) || state.target.contains(other);
        if (other !== element && !nested) owner.hide(other);
      }
    }
    this._set(element, true);
  }

  hide(element) {
    this._set(element, false);
  }

  _set(element, open) {
    const state = this.elements.get(element);
    if (!state) return;

    state.isOpen = open;
    element.setAttribute('aria-expanded', String(open));
    if (state.capture && !state.manual) {
      if (open) Toggle.open.set(element, this);
      else Toggle.open.delete(element);
    }

    if (state.targetClass) {
      state.target.classList.toggle(state.targetClass, open);
    }
    if (state.overlay) {
      state.overlay.classList.toggle(state.overlayClass, open);
    }

    // <dialog> and <details> targets carry their own native open state
    if (state.target instanceof HTMLDialogElement || state.target instanceof HTMLDetailsElement) {
      state.target.toggleAttribute('open', open);
    }

    if (state.target.hasAttribute('popover') && state.target.showPopover) {
      this._float(element, state, open);
    }
  }

  /** Show a [popover] menu in the top layer, pinned to its trigger while it is open. */
  _float(element, state, open) {
    const menu = state.target;
    if (state.reposition) {
      window.removeEventListener('scroll', state.reposition, true);
      window.removeEventListener('resize', state.reposition);
      state.reposition = null;
    }
    if (!open) {
      if (menu.matches(':popover-open')) menu.hidePopover();
      return;
    }
    if (!menu.matches(':popover-open')) menu.showPopover();
    state.reposition = () => Toggle._pin(element, menu);
    state.reposition();
    window.addEventListener('scroll', state.reposition, true);
    window.addEventListener('resize', state.reposition);
  }

  /** Place a floating menu under its trigger, flipping above or to the other side when there isn't room. */
  static _pin(trigger, menu) {
    const edge = 8;
    const t = trigger.getBoundingClientRect();
    const m = menu.getBoundingClientRect();
    const alignRight = menu.matches('.dropdown__menu--right') || Boolean(trigger.closest('.dropdown--right, .actionbar__more'));
    let left = alignRight ? t.right - m.width : t.left;
    if (left + m.width > window.innerWidth - edge) left = t.right - m.width;
    const above = t.bottom + m.height > window.innerHeight - edge && t.top - m.height > edge;
    menu.style.right = 'auto';
    menu.style.left = `${Math.max(edge, left)}px`;
    menu.style.top = `${above ? t.top - m.height - 8 : t.bottom}px`;
  }

  /** Close every open dropdown, e.g. when a modal takes over the page. */
  static closeAll() {
    for (const [element, owner] of Toggle.open) owner.hide(element);
  }

  static enhanceAll(selector = '[data-toggle]', root = document) {
    const instance = new Toggle();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}

document.addEventListener('p-modal:open', () => Toggle.closeAll());
