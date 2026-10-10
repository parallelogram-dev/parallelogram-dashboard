import { bem, escape, icon } from '../lib.js';

const ROCKET = '<svg class="icon banner__icon" viewBox="0 0 24 24"><path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3"/><path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3"/></svg>';
const ARROW = '<svg class="icon announcement__arrow" viewBox="0 0 24 24"><path d="M5 12l14 0"/><path d="M13 18l6 -6"/><path d="M13 6l6 6"/></svg>';

const VARIANT_ICONS = {
  '': 'info',
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
  dark: 'info',
};

const ACTION_STYLES = { primary: 'btn--ghost', dark: 'btn--ghost' };

function dismiss(className) {
  return `<button type="button" class="${className}" aria-label="Dismiss">${icon('x')}</button>`;
}

function banner(s) {
  const className = bem(
    'banner',
    s.variant,
    s.density,
    s.position,
    s.centered && 'centered',
    s.borderless && 'borderless'
  );
  const parts = [];
  if (s.icon) {
    parts.push(s.variant === 'primary' ? ROCKET : icon(VARIANT_ICONS[s.variant], 'banner__icon'));
  }
  const strong = s.strong ? `<strong>${escape(s.strong)}</strong> ` : '';
  const link = s.link ? ` <a href="#">${escape(s.link)}</a>` : '';
  parts.push(`<div class="banner__content"><span class="banner__text">${strong}${escape(s.text)}${link}</span></div>`);
  if (s.action) {
    const style = ACTION_STYLES[s.variant] || 'btn--outline';
    parts.push(`<div class="banner__actions"><button type="button" class="btn btn--sm ${style}">${escape(s.action)}</button></div>`);
  }
  if (s.dismissible) {
    parts.push(dismiss('banner__dismiss'));
  }
  const role = ['warning', 'error'].includes(s.variant) ? 'alert' : 'status';
  return `<div class="${className}" role="${role}">${parts.join('')}</div>`;
}

function announcement(s) {
  const badge = s.strong ? `<span class="announcement__badge">${escape(s.strong)}</span>` : '';
  const link = s.link ? ` <a href="#">${escape(s.link)}</a>` : '';
  const arrow = s.icon ? ARROW : '';
  const close = s.dismissible ? dismiss('announcement__dismiss') : '';
  return `<div class="announcement" role="status">${badge}<span class="announcement__text">${escape(s.text)}${link}</span>${arrow}${close}</div>`;
}

function consent(s) {
  const title = s.strong ? `<p class="consent__title">${escape(s.strong)}</p>` : '';
  const link = s.link ? ` <a href="#">${escape(s.link)}</a>` : '';
  const actions = `<div class="consent__actions"><button type="button" class="btn btn--outline btn--sm">Decline</button>`
    + `<button type="button" class="btn btn--primary btn--sm">${escape(s.action || 'Accept')}</button></div>`;
  return `<div class="consent" role="region" aria-label="Cookie consent"><div class="consent__content">${title}`
    + `<p class="consent__text">${escape(s.text)}${link}</p></div>${actions}</div>`;
}

export default {
  id: 'banner',
  name: 'Banner',
  description: 'Full-width notification banners.',
  sources: ['components/_banner.scss'],
  target: '.banner, .announcement, .consent',
  matrix: { rows: 'variant', cols: 'density' },
  layout: 'block',
  controls: [
    {
      key: 'kind',
      label: 'Kind',
      type: 'select',
      options: [
        { value: 'banner', label: 'Banner' },
        { value: 'announcement', label: 'Announcement' },
        { value: 'consent', label: 'Cookie consent' },
      ],
    },
    { key: 'variant', label: 'Variant', type: 'select', options: ['', 'info', 'success', 'warning', 'error', 'primary', 'dark'], when: s => s.kind === 'banner' },
    {
      key: 'density',
      label: 'Density',
      type: 'select',
      options: [{ value: '', label: 'Default' }, { value: 'compact', label: 'Compact' }],
      when: s => s.kind === 'banner',
    },
    {
      key: 'position',
      label: 'Position',
      type: 'select',
      options: [
        { value: '', label: 'In flow' },
        { value: 'sticky', label: 'Sticky (--sticky)' },
        { value: 'fixed', label: 'Fixed to top (--fixed)' },
      ],
      when: s => s.kind === 'banner',
    },
    { key: 'strong', label: 'Lead / badge / title', type: 'text', default: 'New feature!' },
    { key: 'text', label: 'Text', type: 'text', default: 'Check out our latest updates in the dashboard.' },
    { key: 'link', label: 'Link text', type: 'text', default: '' },
    { key: 'action', label: 'Action button', type: 'text', default: 'Learn more', when: s => s.kind !== 'announcement' },
    { key: 'icon', label: 'Icon', type: 'toggle', default: true, when: s => s.kind !== 'consent' },
    { key: 'dismissible', label: 'Dismissible', type: 'toggle', default: true, when: s => s.kind !== 'consent' },
    { key: 'centered', label: 'Centered', type: 'toggle', when: s => s.kind === 'banner' },
    { key: 'borderless', label: 'Borderless', type: 'toggle', when: s => s.kind === 'banner' },
  ],
  presets: [
    { name: 'New feature', state: { variant: 'info' } },
    { name: 'Expiring subscription', state: { variant: 'warning', strong: '', text: 'Your subscription is expiring soon.', link: 'Renew now', action: '', dismissible: false } },
    { name: 'Promo code', state: { variant: 'primary', strong: '', text: 'Get 20% off your next purchase with code SAVE20', action: 'Copy code', dismissible: false } },
    { name: 'Compact, centered', state: { variant: 'dark', density: 'compact', centered: true, borderless: true, strong: '', text: 'Scheduled maintenance on Sunday at 02:00 UTC.', action: '' } },
    { name: 'Sticky error', state: { variant: 'error', position: 'sticky', strong: 'Payment failed.', text: 'Update your billing details to keep your workspace active.', action: 'Update billing' } },
    { name: 'Announcement', state: { kind: 'announcement', strong: 'New', text: 'Analytics dashboards are now available on every plan.', link: 'Read more' } },
    { name: 'Cookie consent', state: { kind: 'consent', strong: 'We use cookies', text: 'We use cookies to improve your experience and analyse site traffic.', link: 'Privacy policy', action: 'Accept all' } },
  ],
  render(s) {
    if (s.kind === 'announcement') {
      return announcement(s);
    }
    if (s.kind === 'consent') {
      return consent(s);
    }
    return banner(s);
  },
};
