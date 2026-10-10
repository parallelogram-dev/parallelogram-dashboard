import { bem, cx, escape, icon } from '../lib.js';

const ID = 'pg-sheet';
const EDGE = { '': 'right', right: 'right', left: 'left', top: 'top', bottom: 'bottom' };
const NAV = ['Dashboard', 'Records', 'Pages', 'Media', 'Analytics', 'Settings'];

function field(name, label, type, value) {
  return `<div class="form__field spacer--md"><label class="form__label" for="${ID}-${name}">${label}</label>`
    + `<input type="${type}" id="${ID}-${name}" class="input form__control" value="${value}"></div>`;
}

function body(s) {
  if (s.body === 'nav') {
    return `<nav aria-label="Main"><ul class="stack stack--xs">${NAV.map(item => `<li><a href="#">${item}</a></li>`).join('')}</ul></nav>`;
  }
  if (s.body === 'text') {
    return '<p>Your export is being prepared. We will email you a download link when it is ready, usually within a few minutes.</p>';
  }
  return field('name', 'Name', 'text', 'John Doe') + field('email', 'Email', 'email', 'john@example.com');
}

export default {
  id: 'sheet',
  name: 'Sheet',
  description: 'Slide-out panels from screen edges.',
  sources: ['components/_sheet.scss'],
  target: '.sheet',
  layout: 'block',
  controls: [
    {
      key: 'side',
      label: 'Edge',
      type: 'select',
      options: [
        { value: '', label: 'Right (default)' },
        { value: 'right', label: 'Right (--right)' },
        { value: 'left', label: 'Left' },
        { value: 'top', label: 'Top' },
        { value: 'bottom', label: 'Bottom' },
      ],
    },
    {
      key: 'size',
      label: 'Width',
      type: 'select',
      options: [
        { value: '', label: 'Default (24rem)' },
        { value: 'sm', label: 'sm' },
        { value: 'lg', label: 'lg' },
        { value: 'xl', label: 'xl' },
        { value: 'full', label: 'Full' },
      ],
      when: s => !['top', 'bottom'].includes(s.side),
    },
    { key: 'title', label: 'Title', type: 'text', default: 'Edit profile' },
    { key: 'description', label: 'Description', type: 'text', default: 'Make changes to your profile here.' },
    {
      key: 'body',
      label: 'Body',
      type: 'select',
      options: [
        { value: 'form', label: 'Form' },
        { value: 'nav', label: 'Navigation' },
        { value: 'text', label: 'Text' },
      ],
    },
    { key: 'footer', label: 'Footer', type: 'toggle', default: true },
    { key: 'close', label: 'Close button', type: 'toggle', default: true },
    { key: 'backdrop', label: 'Backdrop', type: 'toggle', default: true },
    { key: 'handle', label: 'Drag handle', type: 'toggle', default: true, when: s => ['top', 'bottom'].includes(s.side) },
    { key: 'drawer', label: 'Bordered (.drawer)', type: 'toggle' },
    { key: 'open', label: 'Open', type: 'toggle', default: true },
  ],
  presets: [
    { name: 'Edit profile', state: {} },
    { name: 'Navigation drawer', state: { side: 'left', size: 'sm', title: 'Navigation', description: '', body: 'nav', footer: false, drawer: true } },
    { name: 'Wide details panel', state: { side: 'right', size: 'xl', title: 'Invoice INV-2024-089', description: 'Issued 12 January 2024', body: 'text' } },
    { name: 'Bottom share sheet', state: { side: 'bottom', title: 'Share', description: 'Anyone with the link can view.', footer: false } },
    { name: 'Top announcements', state: { side: 'top', title: 'Announcements', description: 'What changed this week.', body: 'text', footer: false, drawer: true } },
    { name: 'Full width', state: { size: 'full', title: 'Bulk edit', description: '24 records selected' } },
    { name: 'Closed (trigger only)', state: { open: false } },
  ],
  render(s) {
    const edge = EDGE[s.side];
    const vertical = edge === 'top' || edge === 'bottom';
    const className = cx(
      bem('sheet', s.side, !vertical && s.size),
      s.drawer && bem('drawer', edge !== 'right' && edge)
    );
    const command = `commandfor="${ID}" command="close"`;
    const backdrop = s.backdrop ? `<button type="button" class="sheet__backdrop" ${command} aria-label="Close" tabindex="-1"></button>` : '';
    const handle = vertical && s.handle ? '<div class="sheet__handle"></div>' : '';
    const text = `<h2 class="sheet__title" id="${ID}-title">${escape(s.title)}</h2>`
      + (s.description ? `<p class="sheet__description">${escape(s.description)}</p>` : '');
    const close = s.close ? `<button type="button" class="sheet__close" ${command} aria-label="Close">${icon('x')}</button>` : '';
    const footer = s.footer
      ? `<div class="sheet__footer"><button type="button" class="btn btn--outline" ${command}>Cancel</button>`
        + `<button type="button" class="btn btn--primary" ${command}>Save changes</button></div>`
      : '';
    const panel = `<div class="${cx('sheet__panel', s.drawer && 'drawer__panel')}">`
      + (edge === 'bottom' ? handle : '')
      + `<div class="sheet__header"><div>${text}</div>${close}</div>`
      + `<div class="sheet__content">${body(s)}</div>${footer}`
      + (edge === 'top' ? handle : '')
      + '</div>';
    const trigger = `<button type="button" class="btn btn--outline" commandfor="${ID}" command="show-modal">Open ${edge} sheet</button>`;
    return `${trigger}<dialog class="${className}" id="${ID}" aria-labelledby="${ID}-title"${s.open ? ' open' : ''}>${backdrop}${panel}</dialog>`;
  },
};
