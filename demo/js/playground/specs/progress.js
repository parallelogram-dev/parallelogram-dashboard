import { bem, cx, escape, icon } from '../lib.js';

const VALUES = ['0', '10', '20', '25', '30', '40', '45', '50', '60', '70', '75', '80', '90', '100'];
const STEPS = ['Account', 'Profile', 'Billing', 'Confirm'];

function bar(s) {
  const className = cx(
    bem('progress', s.size, s.variant, s.stripes && 'striped', s.stripes === 'animated' && 'animated'),
    s.indeterminate && 'progress--indeterminate'
  );
  const aria = s.indeterminate
    ? ''
    : ` aria-valuenow="${s.value}" aria-valuemin="0" aria-valuemax="100"`;
  const barClass = bem('progress__bar', !s.indeterminate && s.value);
  const progress = `<div class="${className}" role="progressbar" aria-label="${escape(s.label)}"${aria}><div class="${barClass}"></div></div>`;
  if (!s.labeled) {
    return progress;
  }
  const value = s.indeterminate ? '' : `<span class="progress__labeled-value">${s.value}%</span>`;
  return '<div class="progress__labeled"><div class="progress__labeled-header">'
    + `<span class="progress__labeled-label">${escape(s.label)}</span>${value}</div>${progress}</div>`;
}

function circle(s) {
  const size = s.size === 'xs' ? '' : s.size;
  const variant = s.variant === 'info' ? '' : s.variant;
  const className = bem('progress__circle', size, variant, s.indeterminate && 'indeterminate');
  const value = s.indeterminate ? 25 : Number(s.value);
  const aria = s.indeterminate ? '' : ` aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100"`;
  const text = s.indeterminate ? '' : `<span class="progress__circle-value">${value}%</span>`;
  return `<div class="${className}" role="progressbar" aria-label="${escape(s.label)}"${aria}>`
    + '<svg class="progress__circle-svg" viewBox="0 0 36 36" aria-hidden="true">'
    + '<circle class="progress__circle-track" cx="18" cy="18" r="15"/>'
    + `<circle class="progress__circle-bar" cx="18" cy="18" r="15" pathLength="100" stroke-dasharray="100" stroke-dashoffset="${100 - value}"/>`
    + `</svg>${text}</div>`;
}

function steps(s) {
  const current = Number(s.step);
  const items = STEPS.map((label, i) => {
    const n = i + 1;
    const done = n < current;
    const indicator = done ? icon('check') : String(n);
    const connector = n < STEPS.length ? '<span class="steps__connector"></span>' : '';
    return `<li class="${bem('steps__item', done && 'completed')}"${n === current ? ' aria-current="step"' : ''}>`
      + `<span class="steps__indicator" title="${escape(label)}">${indicator}</span>${connector}</li>`;
  });
  return `<ol class="steps" aria-label="${escape(s.label)}">${items.join('')}</ol>`;
}

export default {
  id: 'progress',
  name: 'Progress',
  description: 'Progress indicators and loading states.',
  sources: ['components/_progress.scss'],
  target: '.progress, .progress__circle, .steps',
  matrix: { rows: 'variant', cols: 'size' },
  layout: 'block',
  controls: [
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'bar', label: 'Bar' },
        { value: 'circle', label: 'Circle' },
        { value: 'steps', label: 'Steps' },
      ],
    },
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      options: ['', 'success', 'warning', 'destructive', 'info'],
      when: s => s.type !== 'steps',
    },
    {
      key: 'size',
      label: 'Size',
      type: 'select',
      options: ['', 'xs', 'sm', 'lg', 'xl'],
      when: s => s.type !== 'steps',
    },
    {
      key: 'value',
      label: 'Value',
      type: 'select',
      default: '60',
      options: VALUES.map(v => ({ value: v, label: `${v}%` })),
      when: s => s.type !== 'steps' && !s.indeterminate,
    },
    { key: 'indeterminate', label: 'Indeterminate', type: 'toggle', when: s => s.type !== 'steps' },
    {
      key: 'stripes',
      label: 'Stripes',
      type: 'select',
      options: [
        { value: '', label: 'None' },
        { value: 'striped', label: 'Striped' },
        { value: 'animated', label: 'Striped, animated' },
      ],
      when: s => s.type === 'bar',
    },
    { key: 'labeled', label: 'Label row', type: 'toggle', default: true, when: s => s.type === 'bar' },
    { key: 'label', label: 'Label', type: 'text', default: 'Storage used' },
    {
      key: 'step',
      label: 'Current step',
      type: 'select',
      default: '2',
      options: STEPS.map((name, i) => ({ value: String(i + 1), label: `${i + 1}. ${name}` })),
      when: s => s.type === 'steps',
    },
  ],
  presets: [
    { name: 'Upload complete', state: { variant: 'success', value: '100', label: 'Upload complete' } },
    { name: 'Quota warning', state: { variant: 'warning', value: '90', size: 'lg', label: 'API quota' } },
    { name: 'Striped, animated', state: { variant: 'info', stripes: 'animated', size: 'xl', value: '75', label: 'Importing records' } },
    { name: 'Loading', state: { indeterminate: true, size: 'xs', labeled: false, label: 'Loading' } },
    { name: 'Circle', state: { type: 'circle', size: 'lg', value: '75', label: 'Profile complete' } },
    { name: 'Spinner circle', state: { type: 'circle', indeterminate: true, size: 'sm', label: 'Loading' } },
    { name: 'Checkout steps', state: { type: 'steps', step: '3', label: 'Checkout progress' } },
  ],
  render(s) {
    if (s.type === 'circle') {
      return circle(s);
    }
    if (s.type === 'steps') {
      return steps(s);
    }
    return bar(s);
  },
};
