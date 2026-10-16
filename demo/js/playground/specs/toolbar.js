import { bem, escape, icon } from '../lib.js';

const STATUSES = ['All', 'Published', 'Draft', 'Archived'];
const APPLIED = ['Status: Published', 'Author: Jane Cooper', 'Updated: Last 30 days'];

function filters(s, compact) {
  if (s.filters === 'select') {
    const options = STATUSES.map(o => `<option>${o === 'All' ? 'All statuses' : o}</option>`).join('');
    const size = compact ? ' input--sm' : '';
    return `<div class="toolbar__filters"><select class="select select--auto${size}" aria-label="Status">${options}</select>`
      + `<select class="select select--auto${size}" aria-label="Author"><option>Any author</option><option>Jane Cooper</option><option>Wade Warren</option></select></div>`;
  }
  if (s.filters === 'chips') {
    const chips = STATUSES.map((label, i) => `<button type="button" class="filter__label" aria-pressed="${i === 1}">${label}</button>`).join('');
    return `<div class="toolbar__filters" role="group" aria-label="Status">${chips}</div>`;
  }
  return '';
}

function actions(s, compact) {
  const size = compact ? ' btn--sm' : '';
  if (s.actions === 'search') {
    return `<div class="toolbar__actions"><button type="button" class="btn btn--primary${size}">Search</button></div>`;
  }
  if (s.actions === 'buttons') {
    return `<div class="toolbar__actions"><button type="button" class="btn btn--outline${size}">${icon('download', 'btn__icon')}Export</button>`
      + `<button type="button" class="btn btn--primary${size}">${icon('plus', 'btn__icon')}New page</button></div>`;
  }
  return '';
}

function activeFilters(s) {
  const chips = APPLIED.map(label => `<span class="filter__label filter__label--active">${escape(label)}`
    + `<button type="button" class="filter__remove" aria-label="Remove filter ${escape(label)}">${icon('x', 'icon--sm')}</button></span>`).join('');
  return `<div class="activefilters"><span class="activefilters__label">Filters:</span>${chips}`
    + '<button type="button" class="activefilters__clear">Clear all</button></div>';
}

export default {
  id: 'toolbar',
  name: 'Toolbar',
  description: 'Search input with filters and actions.',
  sources: ['components/_toolbar.scss'],
  target: '.toolbar',
  matrix: { rows: 'variant', cols: 'filters' },
  layout: 'block',
  controls: [
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      options: [
        { value: '', label: 'Default' },
        { value: 'compact', label: 'Compact' },
        { value: 'full', label: 'Full-width search' },
      ],
    },
    { key: 'size', label: 'Size', type: 'select', options: ['', 'sm'], when: s => s.variant !== 'compact' },
    {
      key: 'filters',
      label: 'Filters',
      type: 'select',
      default: 'select',
      options: [
        { value: '', label: 'None' },
        { value: 'select', label: 'Selects' },
        { value: 'chips', label: 'Toggle chips (aria-pressed)' },
      ],
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'select',
      default: 'buttons',
      options: [
        { value: '', label: 'None' },
        { value: 'search', label: 'Search button' },
        { value: 'buttons', label: 'Export + New' },
      ],
    },
    { key: 'placeholder', label: 'Placeholder', type: 'text', default: 'Search pages…' },
    { key: 'query', label: 'Search text', type: 'text', default: '' },
    { key: 'clear', label: 'Clear button', type: 'toggle', default: true },
    { key: 'applied', label: 'Applied filters bar', type: 'toggle' },
  ],
  presets: [
    { name: 'Records index', state: {} },
    { name: 'Searching', state: { query: 'pricing', applied: true } },
    { name: 'Status chips', state: { filters: 'chips', actions: '' } },
    { name: 'Compact', state: { variant: 'compact', actions: 'search' } },
    { name: 'Small, full width', state: { variant: 'full', size: 'sm', filters: 'chips' } },
    { name: 'Full-width search', state: { variant: 'full', filters: '', actions: 'search', placeholder: 'Search everything…' } },
    { name: 'Applied filters', state: { filters: '', actions: '', applied: true, query: 'launch' } },
  ],
  render(s) {
    const compact = s.variant === 'compact' || s.size === 'sm';
    const clear = s.clear
      ? `<button type="button" class="toolbar__clear" aria-label="Clear search">${icon('x')}</button>`
      : '';
    const search = `<div class="toolbar__group">${icon('search', 'toolbar__icon')}`
      + `<input type="search" class="toolbar__input" aria-label="Search" placeholder="${escape(s.placeholder || ' ')}" value="${escape(s.query)}">${clear}</div>`;
    const bar = `<div class="${bem('toolbar', s.variant, s.variant !== 'compact' && s.size)}" role="search">${search}${filters(s, compact)}${actions(s, compact)}</div>`;
    return s.applied ? `<div>${bar}${activeFilters(s)}</div>` : bar;
  },
};
