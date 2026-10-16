import { bem, escape } from '../lib.js';

const ROWS = [
  { tone: 'error', title: 'Payment gateway', description: 'Unable to reach the webhook endpoint.', badge: ['destructive-muted', 'Failing'] },
  { tone: 'warning', title: 'SSL certificate', description: 'Expires in 14 days.', badge: ['warning-muted', 'Expiring'] },
  { tone: 'success', title: 'Email delivery', description: 'All messages sent in the last 24 hours.', badge: ['success-muted', 'Healthy'] },
  { tone: 'info', title: 'Search index', description: 'Rebuilding after the last import.', badge: ['info-muted', 'Running'] },
];

const ALERT_ICON = '<svg class="icon" viewBox="0 0 24 24"><path d="M12 9v4"/><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"/><path d="M12 16h.01"/></svg>';
const EDIT_ICON = '<svg class="icon" viewBox="0 0 24 24"><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"/><path d="M13.5 6.5l4 4"/></svg>';

function row(r, s) {
  const status = s.status === 'none' ? ''
    : `<span class="${bem('list__status', r.tone)}" aria-hidden="true">${s.status === 'icon' ? ALERT_ICON : ''}</span>`;
  const description = s.description ? `<div class="list__description">${escape(r.description)}</div>` : '';
  const actions = s.actions
    ? `<div class="list__actions"><button type="button" class="btn btn--outline btn--sm">${EDIT_ICON}Review</button>`
      + `<span class="badge badge--${r.badge[0]}">${escape(r.badge[1])}</span></div>`
    : '';
  return `<div class="list__item">${status}<div class="list__body"><div class="list__title">${escape(r.title)}</div>${description}</div>${actions}</div>`;
}

export default {
  id: 'list',
  name: 'List',
  description: 'Rows with an optional status, title and description, and trailing actions.',
  sources: ['components/_list.scss'],
  target: '.list, .list__item, .list__status, .list__body, .list__actions',
  matrix: { rows: 'variant', cols: 'status' },
  layout: 'block',
  controls: [
    { key: 'variant', label: 'Variant', type: 'select', default: 'segment', options: ['segment', 'boxed', 'spaced', 'disc'] },
    { key: 'status', label: 'Status', type: 'select', default: 'dot', options: ['dot', 'icon', 'none'] },
    { key: 'center', label: 'Centre on row', type: 'toggle', when: s => s.variant !== 'disc' },
    { key: 'description', label: 'Description', type: 'toggle', default: true },
    { key: 'actions', label: 'Actions', type: 'toggle', default: true },
  ],
  presets: [
    { name: 'System check', state: { variant: 'segment', status: 'dot' } },
    { name: 'Boxed with icons', state: { variant: 'boxed', status: 'icon' } },
    { name: 'Plain rows', state: { variant: 'spaced', status: 'none', actions: false } },
    { name: 'Centred', state: { variant: 'segment', status: 'dot', center: true } },
    { name: 'Bulleted text', state: { variant: 'disc' } },
  ],
  render(s) {
    if (s.variant === 'disc') {
      return `<ul class="${bem('list', 'disc')}">${ROWS.map(r => `<li>${escape(r.title)}</li>`).join('')}</ul>`;
    }
    return `<div class="${bem('list', s.variant, s.center && 'center')}">${ROWS.map(r => row(r, s)).join('')}</div>`;
  },
};
