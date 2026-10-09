import { bem, cx, escape, icon } from '../lib.js';

function button(s, label = s.label) {
  const iconOnly = s.content === 'icon-only';
  const asLink = s.element === 'a';
  const className = cx(
    bem('btn', s.variant, s.size, iconOnly && 'icon', s.full && 'full', s.full && s.start && 'start'),
    asLink && s.disabled && 'btn--disabled'
  );

  let inner = escape(label);
  if (s.loading) {
    inner = `${icon('loader', 'btn__icon btn__spinner')}${iconOnly ? '' : inner}`;
  } else if (iconOnly) {
    inner = icon('plus', 'btn__icon');
  } else if (s.content === 'icon-text') {
    inner = `${icon('plus', 'btn__icon')}${inner}`;
  }

  const a11y = iconOnly ? ` aria-label="${escape(label)}"` : '';
  if (asLink) {
    const disabled = s.disabled ? ' aria-disabled="true" tabindex="-1"' : '';
    return `<a href="#" class="${className}"${a11y}${disabled}>${inner}</a>`;
  }
  const disabled = s.disabled || s.loading ? ' disabled' : '';
  return `<button type="button" class="${className}"${a11y}${disabled}>${inner}</button>`;
}

export default {
  id: 'button',
  name: 'Button',
  description: 'Triggers an action. Works on <button> and <a> elements.',
  sources: ['components/_button.scss'],
  target: '.btn',
  matrix: { rows: 'variant', cols: 'size' },
  controls: [
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      default: 'primary',
      options: [
        { value: '', label: 'None (implicit primary)' },
        'primary', 'secondary', 'outline', 'ghost', 'destructive', 'link',
      ],
    },
    { key: 'size', label: 'Size', type: 'select', options: ['', 'sm', 'lg'] },
    {
      key: 'content',
      label: 'Content',
      type: 'select',
      options: [
        { value: 'text', label: 'Text' },
        { value: 'icon-text', label: 'Icon + text' },
        { value: 'icon-only', label: 'Icon only' },
      ],
    },
    { key: 'label', label: 'Label', type: 'text', default: 'Button' },
    {
      key: 'element',
      label: 'Element',
      type: 'select',
      options: [{ value: 'button', label: '<button>' }, { value: 'a', label: '<a>' }],
    },
    {
      key: 'group',
      label: 'Group',
      type: 'select',
      options: [
        { value: '', label: 'None' },
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' },
      ],
    },
    { key: 'full', label: 'Full width', type: 'toggle' },
    { key: 'start', label: 'Align start', type: 'toggle', when: s => s.full },
    { key: 'loading', label: 'Loading', type: 'toggle' },
    { key: 'disabled', label: 'Disabled', type: 'toggle' },
  ],
  presets: [
    { name: 'Primary', state: {} },
    { name: 'Destructive with icon', state: { variant: 'destructive', content: 'icon-text', label: 'Delete' } },
    { name: 'Icon only', state: { variant: 'outline', content: 'icon-only', label: 'Add item' } },
    { name: 'Loading', state: { loading: true, label: 'Saving…' } },
    { name: 'Full width, left aligned', state: { variant: 'ghost', content: 'icon-text', full: true, start: true } },
    { name: 'Disabled link', state: { element: 'a', variant: 'outline', disabled: true } },
    { name: 'Segmented group', state: { variant: 'outline', group: 'horizontal' } },
  ],
  render(s) {
    if (!s.group) {
      return button(s);
    }
    const groupClass = bem('btn__group', s.group === 'vertical' && 'vertical');
    return `<div class="${groupClass}">${['Day', 'Week', 'Month'].map(l => button(s, l)).join('')}</div>`;
  },
};
