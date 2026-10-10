import { bem, escape, icon } from '../lib.js';

const COPY = '<svg class="icon btn__icon" viewBox="0 0 24 24"><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"/><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"/></svg>';

function trigger(s, tipId) {
  const label = escape(s.text);
  if (s.trigger === 'icon') {
    const a11y = tipId ? `aria-labelledby="${tipId}"` : `aria-label="${label}"`;
    return { open: `<button type="button" class="btn btn--ghost btn--icon" ${a11y}`, close: `>${COPY}</button>` };
  }
  if (s.trigger === 'text') {
    const a11y = tipId ? ` aria-describedby="${tipId}"` : '';
    return { open: `<abbr tabindex="0"${a11y}`, close: '>SLA</abbr>' };
  }
  const a11y = tipId ? ` aria-describedby="${tipId}"` : '';
  return { open: `<button type="button" class="btn btn--outline"${a11y}`, close: `>${icon('info', 'btn__icon')}Billing details</button>` };
}

export default {
  id: 'tooltip',
  name: 'Tooltip',
  description: 'Hover hints and contextual information.',
  sources: ['components/_tooltip.scss'],
  target: '.tooltip__content, [data-tooltip]',
  matrix: { rows: 'position', cols: 'variant' },
  controls: [
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'component', label: '.tooltip + .tooltip__content' },
        { value: 'attribute', label: 'data-tooltip attribute (CSS only)' },
      ],
    },
    {
      key: 'position',
      label: 'Position',
      type: 'select',
      options: [{ value: '', label: 'Top (default)' }, 'top', 'bottom', 'left', 'right'],
    },
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      options: [{ value: '', label: 'Default' }, { value: 'light', label: 'Light' }],
      when: s => s.type === 'component',
    },
    {
      key: 'trigger',
      label: 'Trigger',
      type: 'select',
      options: [
        { value: 'button', label: 'Button' },
        { value: 'icon', label: 'Icon button' },
        { value: 'text', label: 'Inline text' },
      ],
    },
    { key: 'text', label: 'Text', type: 'text', default: 'Copy to clipboard' },
    { key: 'visible', label: 'Always visible', type: 'toggle', default: true, when: s => s.type === 'component' },
  ],
  presets: [
    { name: 'Icon button', state: { trigger: 'icon' } },
    { name: 'Below', state: { position: 'bottom', text: 'Invoices are sent on the 1st' } },
    { name: 'Light, right', state: { variant: 'light', position: 'right', text: 'Includes tax and fees' } },
    { name: 'Inline abbreviation', state: { trigger: 'text', position: 'left', text: 'Service level agreement' } },
    { name: 'Hover only', state: { visible: false, trigger: 'icon' } },
    { name: 'Data attribute', state: { type: 'attribute', trigger: 'icon', position: 'bottom' } },
  ],
  render(s) {
    if (s.type === 'attribute') {
      const t = trigger(s);
      const position = s.position && s.position !== 'top' ? ` data-tooltip-position="${s.position}"` : '';
      return `${t.open} data-tooltip="${escape(s.text)}"${position}${t.close}`;
    }
    const id = `tooltip-${s.position || 'default'}-${s.variant || 'default'}-${s.trigger}`;
    const t = trigger(s, id);
    const content = bem('tooltip__content', s.position, s.variant, s.visible && 'visible');
    return `<span class="tooltip">${t.open}${t.close}<span class="${content}" id="${id}" role="tooltip">${escape(s.text)}</span></span>`;
  },
};
