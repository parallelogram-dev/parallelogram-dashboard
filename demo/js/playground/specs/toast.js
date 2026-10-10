import { bem, escape, icon } from '../lib.js';

const VARIANT_ICONS = {
  '': 'info',
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

export default {
  id: 'toast',
  name: 'Toast',
  description: 'Temporary notification messages.',
  sources: ['components/_toast.scss'],
  target: '.toast',
  matrix: { rows: 'variant', cols: 'density' },
  controls: [
    { key: 'variant', label: 'Variant', type: 'select', default: 'success', options: ['', 'info', 'success', 'warning', 'error'] },
    {
      key: 'density',
      label: 'Density',
      type: 'select',
      options: [{ value: '', label: 'Default' }, { value: 'compact', label: 'Compact' }],
    },
    {
      key: 'layout',
      label: 'Layout',
      type: 'select',
      options: [
        { value: '', label: 'Stacked' },
        { value: 'action', label: 'Inline action' },
      ],
    },
    { key: 'title', label: 'Title', type: 'text', default: 'Changes saved' },
    { key: 'description', label: 'Description', type: 'text', default: 'Your page “About us” has been published.' },
    { key: 'icon', label: 'Icon', type: 'toggle', default: true },
    { key: 'actions', label: 'Actions', type: 'toggle' },
    { key: 'closable', label: 'Close button', type: 'toggle', default: true },
    { key: 'progress', label: 'Auto-dismiss progress', type: 'toggle' },
    {
      key: 'container',
      label: 'Container',
      type: 'select',
      options: [
        { value: '', label: 'None (inline)' },
        'top-right', 'top-left', 'top-center', 'bottom-right', 'bottom-left', 'bottom-center',
      ],
    },
  ],
  presets: [
    { name: 'Saved', state: {} },
    { name: 'Error', state: { variant: 'error', title: 'Upload failed', description: 'hero-banner.png is larger than the 10 MB limit.' } },
    { name: 'Undo action', state: { variant: '', layout: 'action', density: 'compact', icon: false, closable: false, actions: true, title: 'Page moved to trash', description: '' } },
    { name: 'Warning with actions', state: { variant: 'warning', actions: true, title: 'Session expiring', description: 'You will be signed out in 2 minutes.' } },
    { name: 'Compact info', state: { variant: 'info', density: 'compact', title: '', description: 'Dark mode enabled.' } },
    { name: 'Bottom-right container', state: { container: 'bottom-right', progress: true } },
  ],
  render(s) {
    const parts = [];
    if (s.icon) {
      parts.push(icon(VARIANT_ICONS[s.variant], 'toast__icon'));
    }
    const content = [];
    if (s.title) {
      content.push(`<h4 class="toast__title">${escape(s.title)}</h4>`);
    }
    if (s.description) {
      content.push(`<p class="toast__description">${escape(s.description)}</p>`);
    }
    if (s.actions) {
      const [secondary, primary] = s.variant === 'warning' ? ['Sign out', 'Stay signed in'] : ['Undo', 'View'];
      content.push(`<div class="toast__actions"><button type="button" class="btn btn--ghost btn--sm">${secondary}</button>`
        + `<button type="button" class="btn btn--primary btn--sm">${primary}</button></div>`);
    }
    parts.push(`<div class="toast__content">${content.join('')}</div>`);
    if (s.closable) {
      parts.push(`<button type="button" class="toast__close" aria-label="Dismiss">${icon('x')}</button>`);
    }
    if (s.progress) {
      parts.push('<div class="toast__progress" aria-hidden="true"></div>');
    }
    const role = ['error', 'warning'].includes(s.variant) ? 'alert' : 'status';
    const toast = `<div class="${bem('toast', s.variant, s.density, s.layout)}" role="${role}">${parts.join('')}</div>`;
    if (!s.container) {
      return toast;
    }
    return `<section class="${bem('toast__container', s.container)}" aria-label="Notifications">${toast}</section>`;
  },
};
