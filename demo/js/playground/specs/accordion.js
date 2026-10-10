import { bem, escape, icon } from '../lib.js';

const CHEVRON = '<path d="M6 9l6 6l6 -6"/>';

const ITEMS = [
  ['info', 'Is it accessible?', 'Yes. It adheres to the WAI-ARIA design pattern and can be navigated using keyboard controls.'],
  ['star', 'Is it styled?', "Yes. It comes with default styles that match the other components' aesthetic."],
  ['mail', 'Is it animated?', "Yes. It's animated by default with smooth transitions for opening and closing."],
];

function chevron(className) {
  return `<svg class="icon ${className}" viewBox="0 0 24 24">${CHEVRON}</svg>`;
}

function items(s) {
  return ITEMS.map(([name, title, body], i) => (i === 0 ? [name, s.title, body] : [name, title, body]));
}

function accordion(s) {
  const id = `acc-${s.variant || 'default'}-${s.element}`;
  const native = s.element === 'details';
  const exclusive = native && !s.multiple ? ` name="${id}"` : '';

  const rows = items(s).map(([name, title, body], i) => {
    const open = s.open && i === 0;
    const label = s.icons
      ? `${icon(name, 'accordion__trigger-icon')}<span class="accordion__trigger-text">${escape(title)}</span>`
      : `<span>${escape(title)}</span>`;
    const content = `<div class="accordion__content" id="${id}-${i + 1}"><div class="accordion__body">${escape(body)}</div></div>`;

    if (native) {
      return `<details class="accordion__item"${exclusive}${open ? ' open' : ''}>`
        + `<summary class="accordion__trigger">${label}${chevron('accordion__icon')}</summary>${content}</details>`;
    }
    return '<div class="accordion__item">'
      + `<button type="button" class="accordion__trigger" aria-expanded="${open}" aria-controls="${id}-${i + 1}">${label}${chevron('accordion__icon')}</button>`
      + `${content}</div>`;
  });

  const className = bem('accordion', s.variant, s.icons && 'icons');
  const behaviour = native ? '' : ` data-accordion${s.multiple ? ' data-accordion-multiple="true"' : ''}`;
  return `<div class="${className}"${behaviour}>${rows.join('')}</div>`;
}

function collapsible(s) {
  const [, , body] = ITEMS[0];
  return `<details class="collapsible"${s.open ? ' open' : ''}>`
    + `<summary class="collapsible__trigger"><span>${escape(s.title)}</span>${chevron('collapsible__icon')}</summary>`
    + `<div class="collapsible__content"><div class="collapsible__body">${escape(body)}</div></div></details>`;
}

function nativeList(s) {
  return `<div>${items(s).map(([, title, body], i) => `<details class="accordion-native"${s.open && i === 0 ? ' open' : ''}>`
    + `<summary>${escape(title)}</summary><div class="accordion-native__content">${escape(body)}</div></details>`).join('')}</div>`;
}

export default {
  id: 'accordion',
  name: 'Accordion',
  description: 'Expandable content sections.',
  sources: ['components/_accordion.scss'],
  target: '.accordion, .collapsible, .accordion-native',
  matrix: { rows: 'variant', cols: 'element' },
  layout: 'block',
  controls: [
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'accordion', label: 'Accordion' },
        { value: 'collapsible', label: 'Collapsible (single item)' },
        { value: 'native', label: 'Plain <details> (.accordion-native)' },
      ],
    },
    { key: 'variant', label: 'Variant', type: 'select', options: ['', 'bordered', 'separated', 'flush'], when: s => s.type === 'accordion' },
    {
      key: 'element',
      label: 'Element',
      type: 'select',
      options: [
        { value: 'button', label: '<button> + aria-expanded' },
        { value: 'details', label: '<details> (no JS)' },
      ],
      when: s => s.type === 'accordion',
    },
    { key: 'title', label: 'First title', type: 'text', default: 'Is it accessible?' },
    { key: 'open', label: 'First item open', type: 'toggle', default: true },
    { key: 'multiple', label: 'Allow multiple open', type: 'toggle', when: s => s.type === 'accordion' },
    { key: 'icons', label: 'Leading icons', type: 'toggle', when: s => s.type === 'accordion' },
  ],
  presets: [
    { name: 'FAQ', state: {} },
    { name: 'Bordered, multiple open', state: { variant: 'bordered', multiple: true } },
    { name: 'Separated cards', state: { variant: 'separated', title: 'What payment methods do you accept?' } },
    { name: 'Settings with icons', state: { variant: 'flush', icons: true, open: false } },
    { name: 'No-JS details', state: { element: 'details' } },
    { name: 'Collapsible', state: { type: 'collapsible', title: 'Advanced options' } },
    { name: 'Plain details', state: { type: 'native' } },
  ],
  render(s) {
    if (s.type === 'collapsible') {
      return collapsible(s);
    }
    if (s.type === 'native') {
      return nativeList(s);
    }
    return accordion(s);
  },
};
