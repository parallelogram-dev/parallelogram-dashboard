import { bem, cx, escape } from '../lib.js';

const PATHS = {
  currency: '<path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2"/><path d="M12 3v3m0 12v3"/>',
  users: '<path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0 -3 -3.85"/>',
  up: '<path d="M3 17l6 -6l4 4l8 -8"/><path d="M14 7l7 0l0 7"/>',
  down: '<path d="M3 7l6 6l4 -4l8 8"/><path d="M21 10l0 7l-7 0"/>',
  neutral: '<path d="M5 12l14 0"/>',
};

const SPARKLINE = '<svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">'
  + '<path d="M0 32 L12 28 L24 30 L36 20 L48 24 L60 14 L72 18 L84 8 L100 4 L100 40 L0 40 Z" fill="currentColor"/></svg>';

function svg(name, className) {
  return `<svg class="${cx('icon', className)}" viewBox="0 0 24 24" aria-hidden="true">${PATHS[name]}</svg>`;
}

function description(s) {
  if (!s.trend && !s.description) {
    return '';
  }
  const trend = s.trend
    ? `<span class="${bem('stat__trend', s.trend)}">${s.trendIcon ? svg(s.trend, 'stat__trend-icon') : ''}${escape(s.change)}</span> `
    : '';
  return `<p class="stat__description">${trend}${escape(s.description)}</p>`;
}

function stat(s, label = s.label, value = s.value) {
  const modifiers = [s.variant, s.compact && 'compact'].filter(Boolean).map(m => `stat--${m}`);
  const valueHtml = `<div class="stat__value">${escape(value)}</div>`;
  const labelHtml = `<span class="stat__label">${escape(label)}</span>`;

  if (s.layout === 'horizontal') {
    const iconWrap = s.icon ? `<div class="stat__icon-wrapper">${svg('users')}</div>` : '';
    return `<div class="${cx('stat', 'stat--horizontal', ...modifiers)}">${iconWrap}`
      + `<div class="stat__content">${labelHtml}${valueHtml}${description(s)}</div></div>`;
  }

  const header = `<div class="stat__header">${labelHtml}${s.icon ? svg('currency', 'stat__icon') : ''}</div>`;
  const body = `${header}${valueHtml}${description(s)}`;
  if (s.layout === 'sparkline') {
    return `<div class="${cx('stat__sparkline', ...modifiers)}">${body}<div class="stat__sparkline-chart">${SPARKLINE}</div></div>`;
  }
  return `<div class="${cx('stat', ...modifiers)}">${body}</div>`;
}

function ministats(s) {
  const items = [[s.label, s.value], ['Clicks', '1,234'], ['CTR', '9.8%']]
    .map(([label, value]) => `<span class="ministat"><span class="ministat__label">${escape(label)}:</span><span class="ministat__value">${escape(value)}</span></span>`);
  return `<div class="cluster cluster--md">${items.join('<span class="ministat__divider"></span>')}</div>`;
}

const GRID = [['Total Revenue', '$45,231'], ['Active Users', '2,350'], ['Bounce Rate', '24.5%'], ['Conversion', '4.2%']];

export default {
  id: 'stat',
  name: 'Stat',
  description: 'Statistics and metric cards.',
  sources: ['components/_stat.scss'],
  target: '.stat, .stat__sparkline, .ministat',
  matrix: { rows: 'variant', cols: 'trend' },
  layout: 'block',
  controls: [
    {
      key: 'layout',
      label: 'Layout',
      type: 'select',
      options: [
        { value: 'default', label: 'Card' },
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'sparkline', label: 'With sparkline' },
        { value: 'mini', label: 'Mini (inline)' },
      ],
    },
    { key: 'variant', label: 'Variant', type: 'select', options: ['', 'elevated', 'primary'], when: s => s.layout !== 'mini' },
    { key: 'compact', label: 'Compact', type: 'toggle', when: s => s.layout !== 'mini' },
    { key: 'label', label: 'Label', type: 'text', default: 'Total Revenue' },
    { key: 'value', label: 'Value', type: 'text', default: '$45,231' },
    {
      key: 'trend',
      label: 'Trend',
      type: 'select',
      default: 'up',
      options: [{ value: '', label: 'None' }, 'up', 'down', 'neutral'],
      when: s => s.layout !== 'mini',
    },
    { key: 'change', label: 'Change', type: 'text', default: '12%', when: s => s.layout !== 'mini' && s.trend },
    { key: 'trendIcon', label: 'Trend icon', type: 'toggle', default: true, when: s => s.layout !== 'mini' && s.trend },
    { key: 'description', label: 'Description', type: 'text', default: 'from last month', when: s => s.layout !== 'mini' },
    { key: 'icon', label: 'Icon', type: 'toggle', default: true, when: s => s.layout !== 'mini' },
    {
      key: 'grid',
      label: 'Grid',
      type: 'select',
      options: [
        { value: '', label: 'Single stat' },
        { value: '4', label: 'Grid of 4' },
        { value: '3', label: 'Grid of 3' },
      ],
      when: s => s.layout !== 'mini',
    },
  ],
  presets: [
    { name: 'Revenue', state: {} },
    { name: 'Bounce rate down', state: { label: 'Bounce Rate', value: '24.5%', trend: 'down', change: '3%' } },
    { name: 'Primary', state: { variant: 'primary', label: 'Conversion', value: '4.2%', change: '+0.5%', trendIcon: false } },
    { name: 'Horizontal', state: { layout: 'horizontal', variant: 'elevated', label: 'Active Users', value: '2,350', trend: 'neutral', change: '0%' } },
    { name: 'Sparkline', state: { layout: 'sparkline', label: 'Page views', value: '128,430', change: '18%' } },
    { name: 'Dashboard row', state: { grid: '4', compact: true } },
    { name: 'Mini stats', state: { layout: 'mini', label: 'Views', value: '12,543' } },
  ],
  render(s) {
    if (s.layout === 'mini') {
      return ministats(s);
    }
    if (!s.grid) {
      return stat(s);
    }
    const count = Number(s.grid);
    const cards = GRID.slice(0, count).map(([label, value], i) => stat(s, i === 0 ? s.label : label, i === 0 ? s.value : value));
    return `<div class="${bem('stat__grid', s.grid === '3' && '3')}">${cards.join('')}</div>`;
  },
};
