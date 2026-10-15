import { bem, cx, escape, icon, ICONS } from '../lib.js';

const FOLDER = '<path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2"/>';

const CONTEXT_ICONS = { '': FOLDER, search: ICONS.search, info: ICONS.info, warning: ICONS.warning, error: ICONS.error, success: ICONS.success };

const ILLUSTRATION = '<svg viewBox="0 0 240 140" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">'
  + '<rect x="40" y="30" width="160" height="96" rx="10" opacity=".35"/>'
  + '<rect x="60" y="14" width="120" height="96" rx="10" fill="var(--card)"/>'
  + '<path d="M80 44h80M80 62h56M80 80h68" stroke-linecap="round" opacity=".5"/>'
  + '<circle cx="186" cy="104" r="18" fill="var(--card)"/><path d="M199 117l14 14" stroke-linecap="round"/></svg>';

function media(s, path) {
  if (s.media === 'none') {
    return '';
  }
  if (s.media === 'illustration') {
    return `<div class="empty__illustration">${ILLUSTRATION}</div>`;
  }
  const size = s.size === 'sm' ? 'icon--lg' : 'icon--xl';
  return `<div class="${bem('empty__icon', s.iconTone)}"><svg class="icon ${size}" viewBox="0 0 24 24" aria-hidden="true">${path}</svg></div>`;
}

function actions(s) {
  const sm = s.size === 'sm' ? ' btn--sm' : '';
  if (s.actions === 'two') {
    return `<div class="empty__actions"><button type="button" class="btn btn--primary${sm}">${icon('plus', 'btn__icon')}Upload file</button>`
      + `<button type="button" class="btn btn--outline${sm}">Create folder</button></div>`;
  }
  if (s.actions === 'one') {
    return `<div class="empty__actions"><button type="button" class="btn btn--outline${sm}">Clear filters</button></div>`;
  }
  return '';
}

function noResults(s) {
  return `<div class="${cx('noresults', s.size && `empty--${s.size}`)}">${media(s, ICONS.search)}`
    + `<h3 class="empty__title">No results for <span class="noresults__query">“${escape(s.query)}”</span></h3>`
    + `<p class="empty__description">${escape(s.description)}</p>${actions(s)}`
    + '<div class="noresults__suggestions">Suggestions:<ul><li>Check the spelling of your search</li>'
    + '<li>Try more general keywords</li><li>Remove some filters</li></ul></div></div>';
}

export default {
  id: 'empty',
  name: 'Empty State',
  description: 'Placeholder content for empty views.',
  sources: ['components/_empty.scss'],
  target: '.empty, .noresults',
  matrix: { rows: 'context', cols: 'size' },
  layout: 'block',
  controls: [
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [{ value: 'empty', label: 'Empty state' }, { value: 'noresults', label: 'No results (.noresults)' }],
    },
    { key: 'context', label: 'Context', type: 'select', options: ['', 'search', 'info', 'warning', 'error', 'success'], when: s => s.type === 'empty' },
    { key: 'size', label: 'Size', type: 'select', options: ['', 'sm', 'lg'] },
    {
      key: 'media',
      label: 'Media',
      type: 'select',
      options: [
        { value: 'icon', label: 'Icon' },
        { value: 'illustration', label: 'Illustration' },
        { value: 'none', label: 'None' },
      ],
    },
    { key: 'iconTone', label: 'Icon colour', type: 'select', options: ['', 'info', 'success', 'warning', 'destructive'], when: s => s.media === 'icon' },
    { key: 'title', label: 'Title', type: 'text', default: 'No files found', when: s => s.type === 'empty' },
    { key: 'query', label: 'Search query', type: 'text', default: 'quarterly report', when: s => s.type === 'noresults' },
    { key: 'description', label: 'Description', type: 'text', default: 'Get started by uploading your first file or creating a new folder.' },
    {
      key: 'actions',
      label: 'Actions',
      type: 'select',
      default: 'two',
      options: [{ value: '', label: 'None' }, { value: 'one', label: 'One' }, { value: 'two', label: 'Two' }],
    },
    { key: 'inline', label: 'Inline', type: 'toggle', when: s => s.type === 'empty' && s.media !== 'illustration' },
  ],
  presets: [
    { name: 'No files', state: {} },
    {
      name: 'No search results',
      state: { context: 'search', size: 'sm', title: 'No results found', description: "Try adjusting your search or filter to find what you're looking for.", actions: 'one' },
    },
    { name: 'Error', state: { context: 'error', title: 'Could not load invoices', description: 'The server did not respond. Check your connection and try again.', actions: 'one' } },
    { name: 'All caught up', state: { context: 'success', size: 'lg', title: 'All caught up', description: 'You have no unread notifications.', actions: '' } },
    { name: 'Illustrated', state: { media: 'illustration', size: 'lg', title: 'No projects yet', description: 'Projects group your pages, media and team in one place.' } },
    { name: 'Inline warning', state: { inline: true, iconTone: 'warning', title: 'No billing address', description: 'Add one before your next invoice is issued.', actions: 'one' } },
    { name: 'No results with suggestions', state: { type: 'noresults', description: 'We searched page titles, content and tags.', actions: '' } },
  ],
  render(s) {
    if (s.type === 'noresults') {
      return noResults(s);
    }
    const inline = s.inline && s.media !== 'illustration';
    const text = `<h3 class="empty__title">${escape(s.title)}</h3><p class="empty__description">${escape(s.description)}</p>${actions(s)}`;
    const body = inline ? `<div class="empty__content">${text}</div>` : text;
    const className = bem('empty', s.context, s.size, inline && 'inline');
    return `<div class="${className}">${media(s, CONTEXT_ICONS[s.context])}${body}</div>`;
  },
};
