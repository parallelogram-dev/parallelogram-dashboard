import { bem, cx, escape } from '../lib.js';

const SORT_ICON = '<path data-sort="ascending" d="M8 9l4 -4l4 4"/><path data-sort="descending" d="M16 15l-4 4l-4 -4"/>';

const STATUS = { Active: 'badge--success-muted', Pending: 'badge--warning-muted', Inactive: 'badge--destructive-muted' };

const ROWS = [
  { name: 'John Doe', email: 'john@example.com', status: 'Active', spend: '$1,250.00' },
  { name: 'Jane Smith', email: 'jane@example.com', status: 'Pending', spend: '$830.50' },
  { name: 'Bob Wilson', email: 'bob@example.com', status: 'Inactive', spend: '$0.00' },
  { name: 'Alice Brown', email: 'alice@example.com', status: 'Active', spend: '$2,410.75' },
];

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
  { key: 'spend', label: 'Spend', right: true },
];

function checkbox(label) {
  return `<label class="checkbox"><input type="checkbox" class="checkbox__input" aria-label="${escape(label)}"></label>`;
}

function head(s, column) {
  const align = column.right ? ' text--right' : '';
  if (!s.sortable) {
    return `<th class="table__head${align}" scope="col">${column.label}</th>`;
  }
  const sorted = column.key === 'name' && s.sort;
  const aria = sorted ? ` aria-sort="${s.sort}"` : '';
  const icon = `<svg class="${cx('icon table__sort-icon', column.right && 'table__sort-icon--start')}" viewBox="0 0 24 24" aria-hidden="true">${SORT_ICON}</svg>`;
  return `<th class="table__head table__head--sortable${align}" scope="col"${aria}>`
    + (column.right ? `${icon}${column.label}` : `${column.label}${icon}`) + '</th>';
}

function control(column, row) {
  const label = `aria-label="${column.label}"`;
  if (column.key === 'status') {
    const options = Object.keys(STATUS).map(v => `<option${v === row.status ? ' selected' : ''}>${v}</option>`).join('');
    return `<select class="table__control" ${label}>${options}</select>`;
  }
  const modifier = { spend: ' table__control--number', email: ' table__control--wide' }[column.key] || '';
  return `<input type="text" class="table__control${modifier}" value="${escape(row[column.key])}" ${label}>`;
}

function cell(s, column, row) {
  const label = s.responsive ? ` data-label="${column.label}"` : '';
  let value = escape(row[column.key]);
  if (s.editable) value = control(column, row);
  else if (column.key === 'status') value = `<span class="badge ${STATUS[row.status]}">${row.status}</span>`;
  return `<td class="${cx('table__cell', column.right && 'text--right')}"${label}>${value}</td>`;
}

// In the editable table, one row shows unsaved edits and one is newly added
const ROW_STATE = { 'Jane Smith': 'changed', 'Alice Brown': 'new' };

export default {
  id: 'table',
  name: 'Table',
  description: 'Data display in rows and columns.',
  sources: ['components/_table.scss'],
  target: '.table',
  matrix: { rows: 'variant', cols: 'density' },
  layout: 'block',
  controls: [
    { key: 'variant', label: 'Variant', type: 'select', default: 'hoverable', options: ['', 'striped', 'hoverable', 'bordered'] },
    {
      key: 'density',
      label: 'Density',
      type: 'select',
      options: [
        { value: '', label: 'Default' },
        { value: 'compact', label: 'Compact' },
        { value: 'card', label: 'Card padding' },
      ],
    },
    {
      key: 'wrapper',
      label: 'Wrapper',
      type: 'select',
      default: 'border',
      options: [
        { value: '', label: 'None' },
        { value: 'border', label: 'Bordered scroll wrapper' },
        { value: 'borderless', label: 'Borderless scroll wrapper' },
      ],
    },
    { key: 'sortable', label: 'Sortable headers', type: 'toggle', default: true },
    {
      key: 'sort',
      label: 'Sort by name',
      type: 'select',
      default: 'ascending',
      options: [{ value: '', label: 'Unsorted' }, { value: 'ascending', label: 'Ascending' }, { value: 'descending', label: 'Descending' }],
      when: s => s.sortable,
    },
    { key: 'selectable', label: 'Checkbox column', type: 'toggle' },
    { key: 'actions', label: 'Actions column', type: 'toggle', default: true },
    { key: 'footer', label: 'Footer row', type: 'toggle' },
    { key: 'caption', label: 'Caption', type: 'text', default: '' },
    { key: 'empty', label: 'Empty state', type: 'toggle' },
    { key: 'fixed', label: 'Fixed layout', type: 'toggle' },
    { key: 'responsive', label: 'Stack on mobile', type: 'toggle' },
    { key: 'editable', label: 'Editable cells', type: 'toggle' },
    { key: 'stickyActions', label: 'Pin actions column', type: 'toggle', when: s => s.actions },
    { key: 'stickyStart', label: 'Pin first column', type: 'toggle' },
    { key: 'stickyHeader', label: 'Pin header row', type: 'toggle' },
  ],
  presets: [
    { name: 'Users', state: {} },
    { name: 'Selectable, striped', state: { variant: 'striped', selectable: true, sortable: false } },
    { name: 'Compact, bordered', state: { variant: 'bordered', density: 'compact', actions: false, wrapper: 'borderless' } },
    { name: 'Report with totals', state: { variant: '', sort: 'descending', actions: false, footer: true, fixed: true, caption: 'Customer spend, last 30 days' } },
    { name: 'Inside a card', state: { density: 'card', wrapper: 'borderless', sortable: false } },
    { name: 'Responsive', state: { responsive: true, actions: false } },
    { name: 'Empty', state: { empty: true, sortable: false } },
    { name: 'Editable', state: { editable: true, variant: '', sortable: false, selectable: true, wrapper: 'borderless', stickyActions: true, stickyStart: true, stickyHeader: true } },
  ],
  render(s) {
    const span = COLUMNS.length + (s.selectable ? 1 : 0) + (s.actions ? 1 : 0);
    const headCells = [
      s.selectable ? `<th class="table__head table__checkbox" scope="col">${checkbox('Select all')}</th>` : '',
      ...COLUMNS.map(c => head(s, c)),
      s.actions ? '<th class="table__head table__actions" scope="col">Actions</th>' : '',
    ].join('');

    const rows = s.empty
      ? [`<tr class="table__row"><td class="table__empty" colspan="${span}">No customers match your filters.</td></tr>`]
      : ROWS.map(row => `<tr class="${bem('table__row', s.editable && ROW_STATE[row.name])}">`
        + (s.selectable ? `<td class="table__cell table__checkbox">${checkbox(`Select ${row.name}`)}</td>` : '')
        + COLUMNS.map(c => cell(s, c, row)).join('')
        + (s.actions
          ? `<td class="table__cell table__actions"${s.responsive ? ' data-label="Actions"' : ''}>`
            + `<button type="button" class="btn btn--ghost btn--sm" aria-label="Edit ${escape(row.name)}">Edit</button>`
            + `<button type="button" class="btn btn--ghost btn--sm" aria-label="Delete ${escape(row.name)}">Delete</button></td>`
          : '')
        + '</tr>');

    const footer = s.footer && !s.empty
      ? '<tfoot class="table__footer"><tr class="table__row">'
        + `<td class="table__cell" colspan="${span - 1 - (s.actions ? 1 : 0)}">Total</td>`
        + '<td class="table__cell text--right">$4,491.25</td>'
        + (s.actions ? '<td class="table__cell"></td>' : '')
        + '</tr></tfoot>'
      : '';

    const caption = s.caption ? `<caption class="table__caption">${escape(s.caption)}</caption>` : '';
    const className = bem('table', s.variant, s.density, s.fixed && 'fixed', s.responsive && 'responsive', s.editable && 'editable', s.actions && s.stickyActions && 'sticky-actions', s.stickyHeader && 'sticky-header', s.stickyStart && 'sticky-start');
    const table = `<table class="${className}">${caption}<thead class="table__header"><tr class="table__row">${headCells}</tr></thead>`
      + `<tbody class="table__body">${rows.join('')}</tbody>${footer}</table>`;

    if (!s.wrapper) {
      return table;
    }
    return `<div class="${cx('table__wrapper', s.wrapper === 'borderless' && 'table__wrapper--borderless')}">${table}</div>`;
  },
};
