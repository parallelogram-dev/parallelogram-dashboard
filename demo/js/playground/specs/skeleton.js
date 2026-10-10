import { bem } from '../lib.js';

function sk(s, ...modifiers) {
  return `<div class="${bem('skeleton', ...modifiers, !s.animated && 'static')}"></div>`;
}

function block(s, element) {
  return `<div class="${['skeleton__' + element, !s.animated && 'skeleton--static'].filter(Boolean).join(' ')}"></div>`;
}

function lines(s, count) {
  return Array.from({ length: count }, () => sk(s, 'text', s.size)).join('');
}

const PATTERNS = {
  shape: s => sk(s, s.shape, s.size, s.width),
  text: s => `<div class="skeleton__text">${lines(s, Number(s.lines))}</div>`,
  card: s => '<div class="skeleton__card">'
    + block(s, 'card-image')
    + `<div class="skeleton__card-content">${sk(s, 'heading')}${lines(s, Number(s.lines) - 1)}${sk(s, 'text', s.width || 'w-70')}</div>`
    + sk(s, 'button')
    + '</div>',
  list: s => `<div class="skeleton__list">${Array.from({ length: Number(s.lines) }, () => '<div class="skeleton__list-item">'
    + `${sk(s, 'avatar')}<div class="skeleton__text">${sk(s, 'text', 'sm', 'w-60')}${sk(s, 'text', 'xs', 'w-50')}</div>`
    + '</div>').join('')}</div>`,
  table: s => `<div class="skeleton__table">${Array.from({ length: Number(s.lines) }, () => '<div class="skeleton__table-row">'
    + block(s, 'table-cell').repeat(4)
    + '</div>').join('')}</div>`,
  dashboard: s => '<div class="skeleton__dashboard">'
    + `<div class="skeleton__dashboard-sidebar">${sk(s, 'heading', 'xl')}${lines(s, 6)}</div>`
    + '<div class="skeleton__dashboard-main">'
    + block(s, 'dashboard-header')
    + `<div class="skeleton__dashboard-grid">${block(s, 'dashboard-stat').repeat(3)}</div>`
    + block(s, 'dashboard-content')
    + '</div></div>',
};

export default {
  id: 'skeleton',
  name: 'Skeleton',
  description: 'Loading placeholder states.',
  sources: ['components/_skeleton.scss'],
  target: '.skeleton, .skeleton__text, .skeleton__card, .skeleton__list, .skeleton__table, .skeleton__dashboard',
  matrix: { rows: 'shape', cols: 'size' },
  layout: 'block',
  controls: [
    {
      key: 'pattern',
      label: 'Pattern',
      type: 'select',
      default: 'shape',
      options: [
        { value: 'shape', label: 'Single shape' },
        { value: 'text', label: 'Text block' },
        { value: 'card', label: 'Card' },
        { value: 'list', label: 'List' },
        { value: 'table', label: 'Table' },
        { value: 'dashboard', label: 'Dashboard' },
      ],
    },
    {
      key: 'shape',
      label: 'Shape',
      type: 'select',
      default: 'text',
      options: ['text', 'heading', 'circle', 'square', 'button', 'card', 'avatar'],
      when: s => s.pattern === 'shape',
    },
    {
      key: 'size',
      label: 'Height',
      type: 'select',
      options: [
        { value: '', label: 'Default' },
        'xs', 'sm', 'md', 'lg', 'xl',
        { value: 'h-lg', label: 'h-lg (8rem)' },
        { value: 'h-xl', label: 'h-xl (10rem)' },
      ],
      when: s => ['shape', 'text'].includes(s.pattern),
    },
    {
      key: 'width',
      label: 'Width',
      type: 'select',
      options: [
        { value: '', label: 'Default' },
        { value: 'w-50', label: '50%' },
        { value: 'w-60', label: '60%' },
        { value: 'w-70', label: '70%' },
        { value: 'w-80', label: '80%' },
      ],
      when: s => ['shape', 'card'].includes(s.pattern),
    },
    {
      key: 'lines',
      label: 'Rows',
      type: 'select',
      default: '3',
      options: ['2', '3', '4', '5'],
      when: s => ['text', 'card', 'list', 'table'].includes(s.pattern),
    },
    { key: 'animated', label: 'Shimmer', type: 'toggle', default: true },
  ],
  presets: [
    { name: 'Paragraph', state: { pattern: 'text', lines: '4' } },
    { name: 'Card', state: { pattern: 'card', lines: '2' } },
    { name: 'Avatar', state: { shape: 'avatar' } },
    { name: 'Thumbnail', state: { shape: 'square', size: 'h-lg' } },
    { name: 'User list', state: { pattern: 'list', lines: '4' } },
    { name: 'Table rows', state: { pattern: 'table', lines: '5' } },
    { name: 'Dashboard', state: { pattern: 'dashboard', animated: false } },
  ],
  render(s) {
    return `<div aria-busy="true" aria-label="Loading">${PATTERNS[s.pattern](s)}</div>`;
  },
};
