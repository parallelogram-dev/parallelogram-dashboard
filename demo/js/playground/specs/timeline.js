import { bem, escape } from '../lib.js';

const PATHS = {
  check: '<path d="M5 12l5 5l10 -10"/>',
  truck: '<path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M5 17h-2v-4m-1 -8h11v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5"/>',
  clock: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 7v5l3 3"/>',
  package: '<path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5"/><path d="M12 12l8 -4.5"/><path d="M12 12l0 9"/><path d="M12 12l-8 -4.5"/>',
  x: '<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>',
  clipboard: '<path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"/><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"/><path d="M9 12h6"/><path d="M9 16h6"/>',
};

const EVENTS = [
  { tone: 'success', icon: 'check', title: 'Order delivered', time: '2 hours ago', text: 'Order #12345 was signed for at the front door.' },
  { tone: 'info', icon: 'truck', title: 'Out for delivery', time: '5 hours ago', text: 'Package is on the way to your address.' },
  { tone: 'warning', icon: 'clock', title: 'Delivery delayed', time: 'Yesterday', text: 'Severe weather held the package at the depot overnight.' },
  { tone: '', icon: 'package', title: 'Package shipped', time: '2 days ago', text: 'Your order has been shipped via Express Delivery.' },
  { tone: 'error', icon: 'x', title: 'Payment declined', time: '3 days ago', text: 'The card ending 4242 was declined; a second card was used.' },
  { tone: 'primary', icon: 'clipboard', title: 'Order placed', time: '3 days ago', text: 'Order #12345 was placed successfully.' },
];

const ACTIVITY = [
  { initials: 'JD', html: '<strong>John Doe</strong> commented on <a href="#">Project Alpha</a>', time: '5 minutes ago', tag: 'Comment' },
  { initials: 'JS', html: '<strong>Jane Smith</strong> uploaded 3 files', time: '1 hour ago', tag: 'Files' },
  { initials: 'BW', html: '<strong>Bob Wilson</strong> completed task <a href="#">Update documentation</a>', time: '3 hours ago', tag: 'Task' },
  { initials: 'AB', html: '<strong>Alice Brown</strong> invited <strong>Sam Lee</strong> to the team', time: 'Yesterday', tag: 'Team' },
  { initials: 'JD', html: '<strong>John Doe</strong> archived <a href="#">Q3 Roadmap</a>', time: '2 days ago', tag: 'Archive' },
  { initials: 'JS', html: '<strong>Jane Smith</strong> changed the project status to <strong>On hold</strong>', time: '3 days ago', tag: 'Status' },
];

function marker(s, event) {
  if (s.marker === 'dot') {
    return '<div class="timeline__marker timeline__marker--dot"></div>';
  }
  const tone = s.marker === 'tone' && event.tone;
  const svg = s.layout === 'compact'
    ? ''
    : `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${PATHS[event.icon]}</svg>`;
  return `<div class="${bem('timeline__marker', tone)}">${svg}</div>`;
}

function timeline(s) {
  const items = EVENTS.slice(0, Number(s.items)).map((event, i) => {
    const time = s.time ? `<time class="timeline__time">${escape(event.time)}</time>` : '';
    const text = s.description ? `<p class="timeline__description">${escape(event.text)}</p>` : '';
    const card = s.card && i === 0
      ? '<div class="timeline__card">Signed for by <strong>M. Jones</strong> · Proof of delivery attached</div>'
      : '';
    return `<li class="timeline__item">${marker(s, event)}<div class="timeline__content">`
      + `<div class="timeline__header"><span class="timeline__title">${escape(event.title)}</span>${time}</div>`
      + `${text}${card}</div></li>`;
  });
  return `<ol class="${bem('timeline', s.layout)}">${items.join('')}</ol>`;
}

function feed(s) {
  const items = ACTIVITY.slice(0, Number(s.items)).map(item => {
    const time = s.time ? `<span class="activityfeed__time">${escape(item.time)}</span>` : '';
    const meta = s.card
      ? `<div class="activityfeed__meta"><span class="badge badge--secondary">${escape(item.tag)}</span>`
        + '<button type="button" class="btn btn--ghost btn--sm">Reply</button></div>'
      : '';
    return '<li class="activityfeed__item">'
      + `<span class="avatar avatar--sm activityfeed__avatar"><span class="avatar__fallback">${escape(item.initials)}</span></span>`
      + `<div class="activityfeed__content"><p class="activityfeed__text">${item.html}</p>${time}${meta}</div></li>`;
  });
  return `<ul class="activityfeed">${items.join('')}</ul>`;
}

export default {
  id: 'timeline',
  name: 'Timeline',
  description: 'Activity feeds and event history.',
  sources: ['components/_timeline.scss'],
  target: '.timeline, .activityfeed',
  matrix: { rows: 'layout', cols: 'marker' },
  layout: 'block',
  controls: [
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [{ value: 'timeline', label: 'Timeline' }, { value: 'feed', label: 'Activity feed' }],
    },
    {
      key: 'layout',
      label: 'Layout',
      type: 'select',
      options: [
        { value: '', label: 'Default' },
        { value: 'compact', label: 'Compact' },
        { value: 'alternating', label: 'Alternating' },
        { value: 'horizontal', label: 'Horizontal' },
      ],
      when: s => s.type === 'timeline',
    },
    {
      key: 'marker',
      label: 'Markers',
      type: 'select',
      options: [
        { value: 'tone', label: 'Coloured icons' },
        { value: 'plain', label: 'Plain icons' },
        { value: 'dot', label: 'Dots' },
      ],
      when: s => s.type === 'timeline',
    },
    { key: 'items', label: 'Items', type: 'select', default: '4', options: ['2', '3', '4', '5', '6'] },
    { key: 'time', label: 'Timestamps', type: 'toggle', default: true },
    { key: 'description', label: 'Descriptions', type: 'toggle', default: true, when: s => s.type === 'timeline' },
    { key: 'card', label: 'Attachment', type: 'toggle' },
  ],
  presets: [
    { name: 'Order tracking', state: {} },
    { name: 'Full history', state: { items: '6', card: true } },
    { name: 'Compact log', state: { layout: 'compact', items: '5', description: false } },
    { name: 'Alternating', state: { layout: 'alternating', marker: 'plain' } },
    { name: 'Horizontal milestones', state: { layout: 'horizontal', marker: 'dot', description: false } },
    { name: 'Activity feed', state: { type: 'feed' } },
    { name: 'Feed with tags', state: { type: 'feed', items: '3', card: true } },
  ],
  render(s) {
    return s.type === 'feed' ? feed(s) : timeline(s);
  },
};
