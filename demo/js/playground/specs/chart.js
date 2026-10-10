import { bem, escape } from '../lib.js';

const DATA = {
  users: {
    format: 'number',
    columns: ['Month', 'Users'],
    rows: [['Jan', 1240], ['Feb', 1380], ['Mar', 1310], ['Apr', 1520], ['May', 1610], ['Jun', 1740]],
  },
  revenue: {
    format: 'currency',
    columns: ['Month', 'Revenue'],
    rows: [['Jan', 28400], ['Feb', 31250], ['Mar', 29800], ['Apr', 33600], ['May', 35900], ['Jun', 38200]],
  },
  conversion: {
    format: 'percent',
    columns: ['Month', 'Conversion'],
    rows: [['Jan', 2.4], ['Feb', 2.7], ['Mar', 2.6], ['Apr', 3.1], ['May', 3.3], ['Jun', 3.6]],
  },
  channels: {
    format: 'number',
    columns: ['Channel', 'Visitors'],
    rows: [['Search', 18420], ['Direct', 11230], ['Social', 7860], ['Referral', 4310], ['Email', 2980]],
  },
  sources: {
    format: 'number',
    columns: ['Month', 'Search', 'Direct', 'Social'],
    rows: [
      ['Jan', 4200, 2900, 1300], ['Feb', 4500, 3010, 1420], ['Mar', 4720, 3050, 1760],
      ['Apr', 5050, 3240, 1980], ['May', 5260, 3290, 2250], ['Jun', 5590, 3480, 2480],
    ],
  },
  regions: {
    format: 'number',
    columns: ['Region', 'Last quarter', 'This quarter'],
    rows: [['North', 420, 510], ['South', 380, 360], ['East', 290, 340], ['West', 460, 520]],
  },
  plans: {
    format: 'number',
    columns: ['Month', 'Free', 'Pro', 'Team'],
    rows: [
      ['Jan', 820, 210, 45], ['Feb', 860, 240, 52], ['Mar', 910, 255, 60],
      ['Apr', 990, 290, 66], ['May', 1040, 320, 74], ['Jun', 1120, 350, 85],
    ],
  },
};

const FORMATS = {
  number: v => v.toLocaleString('en-US'),
  currency: v => `$${v.toLocaleString('en-US')}`,
  percent: v => `${v}%`,
};

function table(data) {
  const show = FORMATS[data.format];
  const head = data.columns.map(c => `<th scope="col">${escape(c)}</th>`).join('');
  const body = data.rows.map(([label, ...values]) => `<tr><th scope="row">${escape(label)}</th>`
    + values.map(v => `<td data-value="${v}">${escape(show(v))}</td>`).join('') + '</tr>').join('');
  return `<table class="chart__table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function chart(s) {
  const data = DATA[s.data];
  const id = 'pg-chart-title';
  const header = s.header
    ? `<div class="chart__header"><div>`
      + `<h3 class="chart__title" id="${id}">${escape(s.title)}</h3>`
      + (s.description ? `<p class="chart__description">${escape(s.description)}</p>` : '')
      + (s.value ? `<p class="chart__value">${escape(s.value)}</p>` : '')
      + '</div></div>'
    : '';
  const label = s.header ? ` aria-labelledby="${id}"` : ` aria-label="${escape(s.title)}"`;
  return `<figure class="${bem('chart', s.size)}" data-chart="${s.type}" data-chart-format="${data.format}"${label}>`
    + `${header}${table(data)}</figure>`;
}

export default {
  id: 'chart',
  name: 'Chart',
  description: 'Line, area, bar and stacked bar charts drawn from a data table.',
  sources: ['components/_chart.scss'],
  target: '.chart',
  matrix: { rows: 'type', cols: 'size' },
  layout: 'block',
  ignore: [
    // Created by main.js at runtime when it draws the SVG plot, legend and tooltip from the table
    'chart__legend', 'chart__legend-item', 'chart__key', 'chart__key--box', 'chart__plot',
    'chart__grid', 'chart__baseline', 'chart__tick', 'chart__line', 'chart__area', 'chart__bar',
    'chart__bar--active', 'chart__dot', 'chart__label', 'chart__crosshair', 'chart__hit',
    'chart__tooltip', 'chart__tooltip-title', 'chart__tooltip-row',
  ],
  controls: [
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'line', label: 'Line' },
        { value: 'area', label: 'Area' },
        { value: 'bar', label: 'Bar' },
        { value: 'stacked-bar', label: 'Stacked bar' },
      ],
    },
    { key: 'size', label: 'Height', type: 'select', options: ['', 'sm', 'lg'] },
    {
      key: 'data',
      label: 'Data',
      type: 'select',
      options: [
        { value: 'users', label: 'Active users (number)' },
        { value: 'revenue', label: 'Revenue (currency)' },
        { value: 'conversion', label: 'Conversion rate (percent)' },
        { value: 'channels', label: 'Visitors by channel' },
        { value: 'sources', label: 'Visitors by source (3 series)' },
        { value: 'regions', label: 'Orders by region (2 series)' },
        { value: 'plans', label: 'Signups by plan (3 series)' },
      ],
    },
    { key: 'header', label: 'Header', type: 'toggle', default: true },
    { key: 'title', label: 'Title', type: 'text', default: 'Active users' },
    { key: 'description', label: 'Description', type: 'text', default: 'Daily average, last 6 months', when: s => s.header },
    { key: 'value', label: 'Headline value', type: 'text', when: s => s.header },
    { key: 'card', label: 'Inside a card', type: 'toggle', default: true },
  ],
  presets: [
    { name: 'Line', state: {} },
    { name: 'Revenue with headline', state: { type: 'area', data: 'revenue', title: 'Revenue', description: 'Monthly', value: '$38,200' } },
    { name: 'Visitors by source', state: { data: 'sources', title: 'Visitors by source', description: 'Last 6 months' } },
    { name: 'Bar', state: { type: 'bar', data: 'channels', title: 'Visitors by channel', description: 'Last 30 days' } },
    { name: 'Grouped bar', state: { type: 'bar', data: 'regions', title: 'Orders by region', description: 'This quarter vs last' } },
    { name: 'Stacked bar', state: { type: 'stacked-bar', data: 'plans', title: 'Signups by plan', description: 'Monthly', size: 'lg' } },
    { name: 'Compact conversion', state: { size: 'sm', data: 'conversion', title: 'Conversion rate', description: 'Last 6 months', value: '3.6%' } },
  ],
  render(s) {
    const figure = chart(s);
    return s.card
      ? `<div class="card"><div class="card__content card__content--pt">${figure}</div></div>`
      : figure;
  },
};
