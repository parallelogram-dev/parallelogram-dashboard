import { bem, escape, icon } from '../lib.js';

function badge(s, label = s.label) {
  const className = bem('badge', s.variant, s.size, s.pill && 'pill', s.dot && 'dot');
  if (s.dot) {
    return `<span class="${className}" aria-label="${escape(label)}"></span>`;
  }

  let inner = escape(label);
  if (s.icon === 'only') {
    return `<span class="${className}" aria-label="${escape(label)}">${icon('star', 'badge__icon badge__icon--only')}</span>`;
  }
  if (s.icon === 'leading') {
    inner = `${icon('star', 'badge__icon')}${inner}`;
  }
  if (s.removable) {
    inner += `<button type="button" class="badge__remove" aria-label="Remove ${escape(label)}">${icon('x')}</button>`;
  }
  return `<span class="${className}">${inner}</span>`;
}

export default {
  id: 'badge',
  name: 'Badge',
  description: 'Small status labels, counts and removable tags.',
  sources: ['components/_badge.scss'],
  target: '.badge',
  matrix: { rows: 'variant', cols: 'size' },
  controls: [
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      default: 'primary',
      options: [
        { value: '', label: 'None (implicit primary)' },
        'primary', 'secondary', 'outline',
        'destructive', 'destructive-muted',
        'success', 'success-muted',
        'warning', 'warning-muted',
        'info', 'info-muted',
      ],
    },
    { key: 'size', label: 'Size', type: 'select', options: ['', 'sm', 'lg'] },
    { key: 'label', label: 'Label', type: 'text', default: 'Badge' },
    {
      key: 'icon',
      label: 'Icon',
      type: 'select',
      options: [
        { value: '', label: 'None' },
        { value: 'leading', label: 'Leading' },
        { value: 'only', label: 'Icon only' },
      ],
    },
    { key: 'pill', label: 'Pill', type: 'toggle' },
    { key: 'removable', label: 'Removable', type: 'toggle', when: s => s.icon !== 'only' && !s.dot },
    { key: 'dot', label: 'Dot', type: 'toggle' },
    { key: 'group', label: 'Group', type: 'toggle' },
  ],
  presets: [
    { name: 'Status', state: { variant: 'success-muted', label: 'Active', pill: true } },
    { name: 'Removable tag', state: { variant: 'secondary', label: 'design', removable: true } },
    { name: 'Count', state: { variant: 'destructive', label: '12', pill: true, size: 'sm' } },
    { name: 'Status dot', state: { variant: 'success', dot: true, label: 'Online' } },
    { name: 'Tag group', state: { variant: 'outline', group: true, removable: true } },
  ],
  render(s) {
    if (!s.group) {
      return badge(s);
    }
    return `<div class="badge__group">${['Design', 'Frontend', 'Backend'].map(l => badge(s, l)).join('')}</div>`;
  },
};
