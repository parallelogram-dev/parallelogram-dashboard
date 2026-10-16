import { bem, escape } from '../lib.js';

const TRAIL = ['Home', 'Settings'];
const SEPARATOR = '<li class="breadcrumb__item" aria-hidden="true"><span class="breadcrumb__separator">'
  + '<svg class="icon" viewBox="0 0 24 24"><path d="M9 6l6 6l-6 6"/></svg></span></li>';

function breadcrumb(page) {
  const links = TRAIL.map(name => `<li class="breadcrumb__item"><a href="#" class="breadcrumb__link">${name}</a></li>`);
  const current = `<li class="breadcrumb__item"><span class="breadcrumb__page" aria-current="page">${escape(page)}</span></li>`;
  return `<nav class="breadcrumb" aria-label="Breadcrumb"><ol class="breadcrumb__list">${[...links, current].join(SEPARATOR)}</ol></nav>`;
}

export default {
  id: 'pageheader',
  name: 'Page Header',
  description: 'Page title with breadcrumb, description and actions.',
  sources: ['components/_pageheader.scss'],
  target: '.pageheader',
  layout: 'block',
  controls: [
    {
      key: 'layout',
      label: 'Layout',
      type: 'select',
      options: [
        { value: '', label: 'Stacked' },
        { value: 'row', label: 'Actions on the title row (--row)' },
        { value: 'sticky', label: 'Pinned title row (--row --sticky)' },
      ],
    },
    { key: 'title', label: 'Title', type: 'text', default: 'Profile' },
    { key: 'breadcrumb', label: 'Breadcrumb', type: 'toggle', default: true },
    { key: 'description', label: 'Description', type: 'toggle', default: true },
    { key: 'actions', label: 'Actions', type: 'toggle', default: true },
  ],
  presets: [
    { name: 'Settings page', state: {} },
    { name: 'Record header', state: { layout: 'row', title: 'Invoice INV-2024-089' } },
    { name: 'Pinned work page', state: { layout: 'sticky', title: 'All Records' } },
    { name: 'Title only', state: { breadcrumb: false, description: false, actions: false, title: 'Dashboard' } },
  ],
  render(s) {
    const title = `<h1 class="pageheader__title">${escape(s.title)}</h1>`;
    const description = s.description ? '<p class="pageheader__description">Update your name, photo and contact details.</p>' : '';
    const text = title + description;
    const actions = s.actions
      ? '<div class="pageheader__actions"><button type="button" class="btn btn--outline">Cancel</button>'
        + '<button type="button" class="btn btn--primary">Save</button></div>'
      : '';
    const nav = s.breadcrumb ? breadcrumb(s.title) : '';
    if (s.layout === 'sticky') {
      return `<div class="pageheader pageheader--row pageheader--sticky"><div class="pageheader__content">${nav}${title}</div>${actions}</div>${description}`;
    }
    if (s.layout === 'row') {
      return `<div class="${bem('pageheader', 'row')}"><div class="pageheader__content">${nav}${text}</div>${actions}</div>`;
    }
    return `<div class="pageheader">${nav}${text}${actions}</div>`;
  },
};
