import { bem, escape } from '../lib.js';

const PHOTO = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">'
  + '<defs><linearGradient id="a" x1="0" x2="1" y1="0" y2="1">'
  + '<stop offset="0" stop-color="#f59e0b"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs>'
  + '<rect width="80" height="80" fill="url(#a)"/>'
  + '<circle cx="40" cy="31" r="14" fill="#fde7d6"/><path d="M14 80c2-16 13-25 26-25s24 9 26 25z" fill="#1e293b"/></svg>'
);

const TEAM = ['Olivia Martin', 'Jackson Lee', 'Isabella Nguyen', 'William Kim'];

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('') || '?';
}

function avatar(s, name = s.name) {
  const label = s.status ? `${name} (${s.status})` : name;
  const status = s.status ? `<span class="avatar__status avatar__status--${s.status}"></span>` : '';
  const className = bem('avatar', s.size, s.shape);

  if (s.content === 'image') {
    return `<span class="${className}"><img class="avatar__image" src="${PHOTO}" alt="${escape(label)}">${status}</span>`;
  }
  return `<span class="${className}" role="img" aria-label="${escape(label)}">`
    + `<span class="avatar__fallback" aria-hidden="true">${escape(initials(name))}</span>${status}</span>`;
}

export default {
  id: 'avatar',
  name: 'Avatar',
  description: 'User profile images with fallbacks.',
  sources: ['components/_avatar.scss'],
  target: '.avatar',
  matrix: { rows: 'size', cols: 'status' },
  controls: [
    {
      key: 'content',
      label: 'Content',
      type: 'select',
      options: [{ value: 'initials', label: 'Initials fallback' }, { value: 'image', label: 'Image' }],
    },
    { key: 'name', label: 'Name', type: 'text', default: 'Olivia Martin' },
    { key: 'size', label: 'Size', type: 'select', options: ['', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    { key: 'shape', label: 'Shape', type: 'select', options: [{ value: '', label: 'Circle' }, { value: 'square', label: 'Square' }] },
    { key: 'status', label: 'Status', type: 'select', options: ['', 'online', 'away', 'busy', 'offline'] },
    { key: 'group', label: 'Group', type: 'toggle' },
    {
      key: 'groupSpacing',
      label: 'Group overlap',
      type: 'select',
      options: [{ value: '', label: 'Default' }, { value: 'sm', label: 'Tight (--sm)' }, { value: 'lg', label: 'Wide (--lg)' }],
      when: s => s.group,
    },
    { key: 'overflow', label: 'Overflow count', type: 'toggle', default: true, when: s => s.group },
  ],
  presets: [
    { name: 'Initials', state: {} },
    { name: 'Photo, online', state: { content: 'image', status: 'online', size: 'lg' } },
    { name: 'Busy in a list', state: { size: 'sm', status: 'busy', name: 'Jackson Lee' } },
    { name: 'Square workspace', state: { shape: 'square', size: 'xl', name: 'Acme Inc' } },
    { name: 'Profile header', state: { content: 'image', size: '2xl', status: 'away' } },
    { name: 'Team stack', state: { group: true } },
    { name: 'Small team stack', state: { group: true, size: 'sm', groupSpacing: 'sm' } },
  ],
  render(s) {
    if (!s.group) {
      return avatar(s);
    }
    const people = [s.name, ...TEAM.filter(n => n !== s.name).slice(0, 3)];
    const overflow = s.overflow ? '<span class="avatar__group-overflow" role="img" aria-label="5 more">+5</span>' : '';
    return `<div class="${bem('avatar__group', s.groupSpacing)}">${people.map(n => avatar(s, n)).join('')}${overflow}</div>`;
  },
};
