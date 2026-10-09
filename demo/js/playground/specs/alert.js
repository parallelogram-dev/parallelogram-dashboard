import { bem, cx, escape, icon } from '../lib.js';

const VARIANT_ICONS = {
  '': 'info',
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
  destructive: 'error',
};

export default {
  id: 'alert',
  name: 'Alert',
  description: 'Inline notification messages. Use the banner form for full-bleed page messages.',
  sources: ['components/_alert.scss'],
  target: '.alert, .alert-banner',
  matrix: { rows: 'variant', cols: 'density' },
  controls: [
    { key: 'variant', label: 'Variant', type: 'select', options: ['', 'info', 'success', 'warning', 'error', 'destructive'] },
    {
      key: 'density',
      label: 'Density',
      type: 'select',
      options: [{ value: '', label: 'Default' }, { value: 'compact', label: 'Compact' }],
    },
    { key: 'title', label: 'Title', type: 'text', default: 'Heads up!' },
    { key: 'description', label: 'Description', type: 'text', default: 'You can add components to your app using the CLI.' },
    { key: 'icon', label: 'Icon', type: 'toggle', default: true },
    { key: 'closable', label: 'Closable', type: 'toggle' },
    { key: 'centered', label: 'Centered', type: 'toggle' },
    { key: 'banner', label: 'Banner (edge to edge)', type: 'toggle' },
  ],
  presets: [
    { name: 'Info', state: { variant: 'info' } },
    { name: 'Success, closable', state: { variant: 'success', title: 'Saved', description: 'Your changes have been saved.', closable: true } },
    { name: 'Error', state: { variant: 'error', title: 'Something went wrong', description: 'Please try again in a few minutes.' } },
    { name: 'Compact warning', state: { variant: 'warning', density: 'compact', title: '', description: 'Your trial ends in 3 days.' } },
    { name: 'Banner', state: { variant: 'info', banner: true, title: '', description: 'Scheduled maintenance on Sunday at 02:00 UTC.' } },
  ],
  render(s) {
    const base = s.banner ? 'alert-banner' : 'alert';
    const className = cx(
      base,
      bem('alert', s.variant, s.density, s.closable && 'closable', s.centered && 'centered').replace(/^alert ?/, '')
    );
    const parts = [];
    if (s.icon) {
      parts.push(icon(VARIANT_ICONS[s.variant], 'alert__icon'));
    }
    const content = [];
    if (s.title) {
      content.push(`<h4 class="alert__title">${escape(s.title)}</h4>`);
    }
    if (s.description) {
      content.push(`<p class="alert__description">${escape(s.description)}</p>`);
    }
    parts.push(`<div class="alert__content">${content.join('')}</div>`);
    if (s.closable) {
      parts.push(`<button type="button" class="alert__close" aria-label="Dismiss">${icon('x')}</button>`);
    }
    const role = ['error', 'destructive', 'warning'].includes(s.variant) ? 'alert' : 'status';
    return `<div class="${className}" role="${role}">${parts.join('')}</div>`;
  },
};
