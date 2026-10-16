// ============================================================================
// Toast Manager
// ============================================================================

export class ToastManager {
  constructor(options = {}) {
    this.container = null;
    this.position = options.position || 'top-right';
    this.defaultDuration = options.duration || 5000;
    this._ensureContainer();
  }

  _ensureContainer() {
    this.container = document.querySelector(`.toast__container--${this.position}`);
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = `toast__container toast__container--${this.position}`;
      this.container.setAttribute('aria-label', 'Notifications');
      document.body.appendChild(this.container);
    }
    // Announce toasts as they are added; error toasts interrupt via role="alert"
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-relevant', 'additions');
  }

  /**
   * Show a toast. actions is an optional list of { label, icon, onClick } buttons; clicking one
   * runs its handler and dismisses the toast (e.g. Undo after removing something).
   */
  show({ message, title, type = 'info', duration = this.defaultDuration, progress = false, actions = [] }) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    if (type === 'error') toast.setAttribute('role', 'alert');
    if (duration > 0) toast.style.setProperty('--toast-duration', `${duration}ms`);

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
        ${actions.length ? '<div class="toast__actions"></div>' : ''}
      </div>
      <button type="button" class="toast__close" aria-label="Dismiss notification">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6l-12 12"/><path d="M6 6l12 12"/></svg>
      </button>
      ${progress && duration > 0 ? '<div class="toast__progress" aria-hidden="true"></div>' : ''}
    `;

    const actionList = toast.querySelector('.toast__actions');
    actions.forEach(({ label, icon = '', onClick }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn--outline btn--sm';
      button.innerHTML = `${icon}<span></span>`;
      button.querySelector('span').textContent = label;
      button.addEventListener('click', () => {
        onClick?.();
        this.dismiss(toast);
      });
      actionList.append(button);
    });

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
    // Plays toast-slide-in's offsets in reverse, so it leaves the way it came in
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
