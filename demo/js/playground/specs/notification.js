import { bem, escape } from '../lib.js';

const SAMPLES = {
  info: ['Bob Wilson commented on Mobile App', '5 minutes ago'],
  success: ['Deploy succeeded for Website Redesign', '1 hour ago'],
  warning: ['Your trial ends in 3 days', '3 hours ago'],
  error: ['Payment failed for invoice INV-2024-089', '2 days ago'],
};

export default {
  id: 'notification',
  name: 'Notification Item',
  description: 'A single row for a header notifications dropdown, with an unread dot and read/unread state.',
  sources: ['components/_notification.scss'],
  target: '.notif__item, .notif__dot, .notif__body',
  matrix: { rows: 'tone', cols: 'read' },
  layout: 'block',
  controls: [
    { key: 'tone', label: 'Tone', type: 'select', default: 'info', options: ['info', 'success', 'warning', 'error'] },
    { key: 'read', label: 'Read', type: 'toggle' },
  ],
  presets: [
    { name: 'Unread comment', state: { tone: 'info' } },
    { name: 'Deploy succeeded', state: { tone: 'success' } },
    { name: 'Trial ending', state: { tone: 'warning' } },
    { name: 'Payment failed', state: { tone: 'error' } },
    { name: 'Read', state: { tone: 'info', read: true } },
  ],
  render(s) {
    const [text, time] = SAMPLES[s.tone];
    return `<a href="#" class="${bem('notif__item', s.read && 'read')}" role="menuitem">`
      + `<span class="${bem('notif__dot', s.tone)}" aria-hidden="true"></span>`
      + `<span class="notif__body"><span class="notif__text">${escape(text)}</span><span class="notif__time">${escape(time)}</span></span>`
      + '</a>';
  },
};
