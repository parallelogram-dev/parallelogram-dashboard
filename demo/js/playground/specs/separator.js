import { bem, cx, escape } from '../lib.js';

function separator(s) {
  const vertical = s.orientation === 'vertical';
  const label = !vertical && s.label;
  const block = s.alias ? 'divider' : 'separator';
  const className = cx(
    block,
    bem('separator', s.orientation, s.tone, s.spacing, vertical && s.height, label && 'label').replace(/^separator ?/, '')
  );

  if (label) {
    return `<div class="${className}"><span class="separator__text">${escape(s.text)}</span></div>`;
  }
  const orientation = vertical ? ' aria-orientation="vertical"' : '';
  return `<div class="${className}" role="separator"${orientation}></div>`;
}

export default {
  id: 'separator',
  name: 'Separator',
  description: 'Visual dividers for content sections.',
  sources: ['components/_separator.scss'],
  target: '.separator, .divider',
  matrix: { rows: 'tone', cols: 'spacing' },
  layout: 'block',
  controls: [
    {
      key: 'orientation',
      label: 'Orientation',
      type: 'select',
      options: [
        { value: '', label: 'Horizontal (implicit)' },
        { value: 'horizontal', label: 'Horizontal (--horizontal)' },
        { value: 'vertical', label: 'Vertical' },
      ],
    },
    { key: 'tone', label: 'Tone', type: 'select', options: [{ value: '', label: 'Default' }, 'muted', 'strong'] },
    { key: 'spacing', label: 'Spacing', type: 'select', default: 'md', options: ['', 'sm', 'md', 'lg', 'xl'] },
    {
      key: 'height',
      label: 'Height',
      type: 'select',
      options: [{ value: '', label: 'Stretch' }, { value: 'h-sm', label: 'Small' }, { value: 'h-md', label: 'Medium' }, { value: 'h-lg', label: 'Large' }],
      when: s => s.orientation === 'vertical',
    },
    { key: 'label', label: 'With label', type: 'toggle', when: s => s.orientation !== 'vertical' },
    { key: 'text', label: 'Label text', type: 'text', default: 'Or continue with', when: s => s.label && s.orientation !== 'vertical' },
    { key: 'alias', label: 'Use .divider alias', type: 'toggle' },
  ],
  presets: [
    { name: 'Between paragraphs', state: {} },
    { name: 'Labelled', state: { label: true, spacing: 'lg' } },
    { name: 'Muted, tight', state: { tone: 'muted', spacing: 'sm' } },
    { name: 'Strong section break', state: { tone: 'strong', spacing: 'xl' } },
    { name: 'Vertical in a toolbar', state: { orientation: 'vertical', spacing: 'sm', height: 'h-md' } },
    { name: 'Divider alias', state: { alias: true } },
  ],
  render(s) {
    if (s.orientation === 'vertical') {
      return `<div class="cluster"><span>Blog</span>${separator(s)}<span>Docs</span>${separator(s)}<span>Source</span></div>`;
    }
    return `<div><p>Content above</p>${separator(s)}<p>Content below</p></div>`;
  },
};
