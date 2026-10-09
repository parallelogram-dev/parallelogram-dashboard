import { bem, cx, escape, icon } from '../lib.js';

function control(s) {
  const disabled = s.state === 'disabled' ? ' disabled' : '';
  const invalid = s.state === 'error' ? ' aria-invalid="true"' : '';
  const readonly = s.state === 'readonly' && !['select', 'checkbox', 'radio', 'switch'].includes(s.type) ? ' readonly' : '';
  const placeholder = s.placeholder ? ` placeholder="${escape(s.placeholder)}"` : '';
  const id = `field-${s.type}`;

  switch (s.type) {
    case 'textarea':
      return { id, html: `<textarea id="${id}" class="${cx('textarea', s.size && `input--${s.size}`, s.grouped && 'form__control')}" rows="3"${placeholder}${invalid}${readonly}${disabled}></textarea>` };

    case 'select':
      return {
        id,
        html: `<select id="${id}" class="${cx(bem('select', s.autoWidth && 'auto'), s.size && `input--${s.size}`, s.grouped && 'form__control')}"${invalid}${disabled}>`
          + '<option>Select a framework</option><option>Laminas</option><option>Mezzio</option><option>Symfony</option></select>',
      };

    case 'checkbox':
    case 'radio':
    case 'switch': {
      const wrapper = cx(s.type, s.type === 'switch' && s.size && `switch--${s.size}`);
      const inputType = s.type === 'radio' ? 'radio' : 'checkbox';
      const role = s.type === 'switch' ? ' role="switch"' : '';
      const checked = s.checked ? ' checked' : '';
      return {
        id,
        inline: true,
        html: `<label class="${wrapper}"><input type="${inputType}" class="${s.type}__input"${role}${checked}${disabled}>`
          + `<span class="${s.type}__label">${escape(s.label)}</span></label>`,
      };
    }

    default: {
      const className = cx(bem('input', s.size, s.icon && `icon-${s.icon}`), s.grouped && 'form__control');
      const input = `<input id="${id}" type="${s.type === 'email' ? 'email' : 'text'}" class="${className}"${placeholder}${invalid}${readonly}${disabled}>`;
      if (!s.icon) {
        return { id, html: input };
      }
      const iconHtml = icon(s.type === 'email' ? 'mail' : 'search', bem('inputwrapper__icon', s.icon === 'right' && 'right'));
      return { id, html: `<div class="inputwrapper">${iconHtml}${input}</div>` };
    }
  }
}

export default {
  id: 'input',
  name: 'Input',
  description: 'Text inputs, textareas, selects, checkboxes, radios and switches.',
  sources: ['components/_input.scss'],
  target: '.input, .textarea, .select, .checkbox, .radio, .switch',
  matrix: { rows: 'type', cols: 'state' },
  layout: 'block',
  controls: [
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'text', label: 'Text' },
        { value: 'email', label: 'Email' },
        { value: 'textarea', label: 'Textarea' },
        { value: 'select', label: 'Select' },
        { value: 'checkbox', label: 'Checkbox' },
        { value: 'radio', label: 'Radio' },
        { value: 'switch', label: 'Switch' },
      ],
    },
    {
      key: 'state',
      label: 'State',
      type: 'select',
      options: [
        { value: '', label: 'Default' },
        { value: 'error', label: 'Error' },
        { value: 'disabled', label: 'Disabled' },
        { value: 'readonly', label: 'Read-only' },
      ],
    },
    { key: 'size', label: 'Size', type: 'select', options: ['', 'sm', 'lg'], when: s => ['text', 'email', 'textarea', 'select', 'switch'].includes(s.type) },
    {
      key: 'icon',
      label: 'Icon',
      type: 'select',
      options: [{ value: '', label: 'None' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }],
      when: s => ['text', 'email'].includes(s.type),
    },
    { key: 'autoWidth', label: 'Auto width', type: 'toggle', when: s => s.type === 'select' },
    { key: 'checked', label: 'Checked', type: 'toggle', default: true, when: s => ['checkbox', 'radio', 'switch'].includes(s.type) },
    { key: 'label', label: 'Label', type: 'text', default: 'Email address' },
    { key: 'placeholder', label: 'Placeholder', type: 'text', default: 'you@example.com', when: s => ['text', 'email', 'textarea'].includes(s.type) },
    { key: 'grouped', label: 'Form field', type: 'toggle', default: true, when: s => !['checkbox', 'radio', 'switch'].includes(s.type) },
    { key: 'hint', label: 'Hint text', type: 'text', default: "We'll never share your email.", when: s => s.grouped && !['checkbox', 'radio', 'switch'].includes(s.type) },
  ],
  presets: [
    { name: 'Email with icon', state: { type: 'email', icon: 'left' } },
    { name: 'Search', state: { icon: 'left', label: 'Search', placeholder: 'Search records…', grouped: false } },
    { name: 'Validation error', state: { state: 'error', hint: 'Please enter a valid email address.' } },
    { name: 'Textarea', state: { type: 'textarea', label: 'Message', placeholder: 'Type your message…', hint: '' } },
    { name: 'Select', state: { type: 'select', label: 'Framework', hint: '' } },
    { name: 'Switch', state: { type: 'switch', label: 'Enable notifications' } },
    { name: 'Disabled checkbox', state: { type: 'checkbox', state: 'disabled', label: 'Remember me' } },
  ],
  render(s) {
    const field = control(s);
    if (field.inline || !s.grouped) {
      return field.html;
    }
    const error = s.state === 'error';
    const hint = s.hint ? `<p class="${error ? 'form__error' : 'form__description'}">${escape(s.hint)}</p>` : '';
    return `<div class="${bem('form__field', error && 'error')}"><label class="form__label" for="${field.id}">${escape(s.label)}</label>${field.html}${hint}</div>`;
  },
};
