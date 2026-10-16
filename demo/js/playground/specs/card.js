import { bem, cx, escape, icon } from '../lib.js';

const IMAGE = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160">'
  + '<defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1">'
  + '<stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#22c55e"/></linearGradient></defs>'
  + '<rect width="400" height="160" fill="url(#g)"/></svg>'
);

function card(s, title = s.title) {
  const parts = [];

  if (s.image) {
    parts.push(`<img class="card__image card__image--top" src="${IMAGE}" alt="">`);
  }

  if (s.header) {
    const headerClass = bem('card__header', s.header === 'row' && 'row', s.header === 'center' && 'center');
    const text = `<h3 class="card__title">${escape(title)}</h3>`
      + (s.description ? `<p class="card__description">${escape(s.description)}</p>` : '');
    parts.push(s.header === 'row'
      ? `<div class="${headerClass}"><div>${text}</div>`
        + `<button type="button" class="btn btn--ghost btn--icon btn--sm" aria-label="More">${icon('dots', 'btn__icon')}</button></div>`
      : `<div class="${headerClass}">${text}</div>`);
  }

  const contentClass = bem('card__content', s.content === 'pt' && 'pt', s.content === 'flush' && 'flush');
  const body = s.content === 'flush'
    ? '<table class="table"><tbody><tr><td>Starter</td><td>$9</td></tr><tr><td>Pro</td><td>$29</td></tr><tr><td>Team</td><td>$99</td></tr></tbody></table>'
    : `<p>${escape(s.body)}</p>`;
  parts.push(`<div class="${contentClass}">${body}</div>`);

  if (s.footer) {
    const footerClass = cx('card__footer', s.footerBorder && 'card__footer--border', s.footer !== 'start' && `card__footer--${s.footer}`);
    const actions = s.footer === 'between'
      ? '<span class="text--sm text--muted">Updated 2h ago</span><button type="button" class="btn btn--primary">Save</button>'
      : '<button type="button" class="btn btn--outline">Cancel</button><button type="button" class="btn btn--primary">Save</button>';
    parts.push(`<div class="${footerClass}">${actions}</div>`);
  }

  const className = bem('card', s.variant, s.size);
  const focus = s.variant === 'interactive' ? ' tabindex="0"' : '';
  return `<div class="${className}"${focus}>${parts.join('')}</div>`;
}

export default {
  id: 'card',
  name: 'Card',
  description: 'Container for grouped content with optional header, image and footer.',
  sources: ['components/_card.scss'],
  // Flush content rounds a table wrapper's corners; the table itself belongs to the Table spec
  ignore: ['table__wrapper'],
  target: '.card',
  matrix: { rows: 'variant', cols: 'size' },
  layout: 'block',
  controls: [
    { key: 'variant', label: 'Variant', type: 'select', options: ['', 'elevated', 'ghost', 'interactive', 'destructive'] },
    { key: 'size', label: 'Padding', type: 'select', options: ['', 'sm', 'lg'] },
    {
      key: 'header',
      label: 'Header',
      type: 'select',
      default: 'default',
      options: [
        { value: '', label: 'None' },
        { value: 'default', label: 'Default' },
        { value: 'row', label: 'Row (with action)' },
        { value: 'center', label: 'Centered' },
      ],
    },
    { key: 'title', label: 'Title', type: 'text', default: 'Card title', when: s => s.header },
    { key: 'description', label: 'Description', type: 'text', default: 'Card description goes here.', when: s => s.header },
    {
      key: 'content',
      label: 'Content',
      type: 'select',
      options: [
        { value: '', label: 'Default' },
        { value: 'pt', label: 'Top padding (--pt)' },
        { value: 'flush', label: 'Flush (--flush)' },
      ],
    },
    { key: 'body', label: 'Body text', type: 'text', default: 'This is the card content area.', when: s => s.content !== 'flush' },
    {
      key: 'footer',
      label: 'Footer',
      type: 'select',
      default: 'end',
      options: [
        { value: '', label: 'None' },
        { value: 'start', label: 'Start' },
        { value: 'end', label: 'End' },
        { value: 'between', label: 'Space between' },
      ],
    },
    { key: 'footerBorder', label: 'Footer border', type: 'toggle', when: s => s.footer },
    { key: 'image', label: 'Top image', type: 'toggle' },
    {
      key: 'grid',
      label: 'Grid',
      type: 'select',
      options: [
        { value: '', label: 'Single card' },
        { value: 'auto', label: 'Grid (responsive 1–3)' },
        { value: '2', label: 'Grid of 2' },
        { value: '4', label: 'Grid of 4' },
      ],
    },
  ],
  presets: [
    { name: 'Form card', state: { footerBorder: true } },
    { name: 'Stat row header', state: { header: 'row', footer: '', description: 'Last 30 days', title: 'Revenue', body: '$45,231.89' } },
    { name: 'Media card', state: { image: true, variant: 'interactive', footer: '' } },
    { name: 'Danger zone', state: { variant: 'destructive', title: 'Delete account', description: 'This cannot be undone.', footer: 'between' } },
    { name: 'Login', state: { header: 'center', title: 'Welcome back', description: 'Sign in to continue', content: 'pt', footer: '' } },
    { name: 'Grid of 4', state: { grid: '4', footer: '' } },
  ],
  render(s) {
    if (!s.grid) {
      return card(s);
    }
    const count = s.grid === '4' ? 4 : 3;
    const gridClass = bem('card__grid', s.grid !== 'auto' && s.grid);
    const cards = Array.from({ length: count }, (_, i) => card(s, `${s.title} ${i + 1}`)).join('');
    return `<div class="${gridClass}">${cards}</div>`;
  },
};
