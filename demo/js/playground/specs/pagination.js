import { bem } from '../lib.js';

const PREV = '<svg class="icon" viewBox="0 0 24 24"><path d="M15 6l-6 6l6 6"/></svg>';
const NEXT = '<svg class="icon" viewBox="0 0 24 24"><path d="M9 6l6 6l-6 6"/></svg>';
const PER_PAGE = 10;

/** Page numbers to show, with null where a run of pages is collapsed into an ellipsis. */
function pages(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const start = Math.max(2, Math.min(current - 1, total - 4));
  const end = Math.min(total - 1, Math.max(current + 1, 5));
  const middle = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  return [1, start > 2 ? null : [], ...middle, end < total - 1 ? null : [], total].flat();
}

function control(s, className, label, content, disabled, page) {
  if (s.element === 'a') {
    const href = disabled ? ' aria-disabled="true"' : ` href="?page=${page}"`;
    return `<a class="${className}"${href} aria-label="${label}">${content}</a>`;
  }
  return `<button type="button" class="${className}" aria-label="${label}"${disabled ? ' disabled' : ''}>${content}</button>`;
}

function number(s, page, current) {
  const isCurrent = page === current ? ' aria-current="page"' : '';
  if (s.element === 'a') {
    return `<a class="pagination__item" href="?page=${page}"${isCurrent}>${page}</a>`;
  }
  return `<button type="button" class="pagination__item"${isCurrent}>${page}</button>`;
}

export default {
  id: 'pagination',
  name: 'Pagination',
  description: 'Page navigation controls.',
  sources: ['components/_pagination.scss'],
  target: '.pagination',
  matrix: { rows: 'variant', cols: 'size' },
  controls: [
    { key: 'variant', label: 'Variant', type: 'select', options: [{ value: '', label: 'Default' }, 'outline'] },
    { key: 'size', label: 'Size', type: 'select', options: ['', 'sm', 'lg'] },
    { key: 'total', label: 'Pages', type: 'select', default: '10', options: ['3', '7', '10', '125'] },
    {
      key: 'position',
      label: 'Current page',
      type: 'select',
      options: [
        { value: 'first', label: 'First' },
        { value: 'middle', label: 'Middle' },
        { value: 'last', label: 'Last' },
      ],
    },
    {
      key: 'element',
      label: 'Element',
      type: 'select',
      options: [{ value: 'button', label: '<button>' }, { value: 'a', label: '<a href>' }],
    },
    { key: 'labels', label: 'Previous/Next text', type: 'toggle' },
    { key: 'info', label: 'Results summary', type: 'toggle' },
    { key: 'perPage', label: 'Rows per page', type: 'toggle', when: s => s.info },
  ],
  presets: [
    { name: 'Default', state: {} },
    { name: 'Outline, middle page', state: { variant: 'outline', position: 'middle' } },
    { name: 'Long list', state: { total: '125', position: 'middle' } },
    { name: 'Links with labels', state: { element: 'a', labels: true, position: 'last', total: '7' } },
    { name: 'Table footer', state: { size: 'sm', total: '125', info: true, perPage: true } },
    { name: 'Large', state: { size: 'lg', total: '3', position: 'middle' } },
  ],
  render(s) {
    const total = Number(s.total);
    const current = { first: 1, middle: Math.ceil(total / 2), last: total }[s.position];
    const prevContent = s.labels ? `${PREV}<span>Previous</span>` : PREV;
    const nextContent = s.labels ? `<span>Next</span>${NEXT}` : NEXT;

    const items = [
      control(s, 'pagination__prev', 'Previous page', prevContent, current === 1, current - 1),
      ...pages(current, total).map(page => (page === null
        ? '<span class="pagination__ellipsis" aria-hidden="true">…</span>'
        : number(s, page, current))),
      control(s, 'pagination__next', 'Next page', nextContent, current === total, current + 1),
    ];
    const nav = `<nav class="${bem('pagination', s.variant, s.size)}" aria-label="Pagination">${items.join('')}</nav>`;
    if (!s.info) {
      return nav;
    }

    const first = (current - 1) * PER_PAGE + 1;
    const last = current * PER_PAGE;
    const count = total * PER_PAGE - 3;
    const text = `<div class="pagination__text">Showing <strong>${first}</strong> to <strong>${Math.min(last, count)}</strong> of <strong>${count.toLocaleString('en-US')}</strong> results</div>`;
    const select = s.perPage
      ? '<div class="pagination__select"><label for="pg-pagination-rows">Rows per page:</label>'
        + `<select id="pg-pagination-rows" class="select select--sm select--auto">${[10, 25, 50, 100].map(n => `<option>${n}</option>`).join('')}</select></div>`
      : '';
    return `<div class="pagination__info">${text}${select}${nav}</div>`;
  },
};
