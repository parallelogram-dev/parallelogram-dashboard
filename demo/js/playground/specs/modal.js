import { bem, cx, escape, icon } from '../lib.js';

const ID = 'pg-modal';
const TONE_ICONS = { '': 'info', destructive: 'trash', warning: 'warning', success: 'success' };

function field(id, label, type, value) {
  return `<div class="form__field spacer--md"><label class="form__label" for="${id}">${label}</label>`
    + `<input type="${type}" id="${id}" class="input form__control" value="${value}"></div>`;
}

function body(s) {
  if (s.body === 'form') {
    return field(`${ID}-name`, 'Name', 'text', 'John Doe') + field(`${ID}-email`, 'Email', 'email', 'john@example.com');
  }
  const paragraph = '<p>Changes to your profile are visible to everyone in your workspace. Your email address is only shown to administrators.</p>';
  return s.body === 'long' ? Array.from({ length: 12 }, () => paragraph).join('') : paragraph;
}

function close(label) {
  return `<button type="button" class="modal__close" commandfor="${ID}" command="close" aria-label="${label}">${icon('x')}</button>`;
}

function buttons(confirm, confirmStyle) {
  return `<button type="button" class="btn btn--outline" commandfor="${ID}" command="close">Cancel</button>`
    + `<button type="button" class="btn ${confirmStyle}" commandfor="${ID}" command="close">${escape(confirm)}</button>`;
}

function modal(s) {
  const text = `<h2 class="modal__title" id="${ID}-title">${escape(s.title)}</h2>`
    + (s.description ? `<p class="modal__description">${escape(s.description)}</p>` : '');
  const header = `<div class="modal__header"><div>${text}</div>${s.close ? close('Close') : ''}</div>`;
  const content = `<div class="modal__content">${body(s)}</div>`;
  const extra = s.footer === 'between' ? '<button type="button" class="btn btn--ghost">Reset</button><div class="cluster cluster--sm">' : '';
  const actions = buttons(s.confirm, 'btn--primary');
  const footer = s.footer === 'none'
    ? ''
    : `<div class="${bem('modal__footer', s.footer !== 'end' && s.footer)}">${extra}${actions}${extra ? '</div>' : ''}</div>`;
  return `<div class="${bem('modal__dialog', s.size)}">${header}${content}${footer}</div>`;
}

function alertDialog(s) {
  const iconClass = cx('alertdialog__icon', s.tone && `alertdialog__icon--${s.tone}`);
  const header = `<div class="alertdialog__header">${icon(TONE_ICONS[s.tone], iconClass)}`
    + `<h2 class="alertdialog__title" id="${ID}-title">${escape(s.title)}</h2>`
    + (s.description ? `<p class="alertdialog__description" id="${ID}-description">${escape(s.description)}</p>` : '')
    + '</div>';
  const style = s.tone === 'destructive' ? 'btn--destructive' : 'btn--primary';
  const footer = s.footer === 'none' ? '' : `<div class="alertdialog__footer">${buttons(s.confirm, style)}</div>`;
  return `<div class="alertdialog__dialog">${header}${footer}</div>`;
}

export default {
  id: 'modal',
  name: 'Modal',
  description: 'Dialog overlays for focused interactions, using the <p-modal> web component from parallelogram-js.',
  sources: ['components/_modal.scss'],
  target: '.modal, .alertdialog',
  layout: 'block',
  controls: [
    {
      key: 'kind',
      label: 'Kind',
      type: 'select',
      options: [{ value: 'modal', label: 'Modal' }, { value: 'alertdialog', label: 'Alert dialog' }],
    },
    {
      key: 'size',
      label: 'Size',
      type: 'select',
      options: [
        { value: '', label: 'Default (32rem)' },
        { value: 'xs', label: 'xs' },
        { value: 'sm', label: 'sm' },
        { value: 'lg', label: 'lg' },
        { value: 'xl', label: 'xl' },
        { value: 'fullscreen', label: 'Fullscreen' },
      ],
      when: s => s.kind === 'modal',
    },
    {
      key: 'tone',
      label: 'Tone',
      type: 'select',
      options: [{ value: '', label: 'Neutral' }, 'destructive', 'warning', 'success'],
      when: s => s.kind === 'alertdialog',
    },
    { key: 'title', label: 'Title', type: 'text', default: 'Edit profile' },
    { key: 'description', label: 'Description', type: 'text', default: 'Make changes to your profile here.' },
    { key: 'confirm', label: 'Confirm label', type: 'text', default: 'Save changes' },
    {
      key: 'body',
      label: 'Body',
      type: 'select',
      options: [
        { value: 'form', label: 'Form' },
        { value: 'text', label: 'Text' },
        { value: 'long', label: 'Long text (scrolls)' },
      ],
      when: s => s.kind === 'modal',
    },
    {
      key: 'footer',
      label: 'Footer',
      type: 'select',
      default: 'end',
      options: [
        { value: 'end', label: 'End' },
        { value: 'start', label: 'Start' },
        { value: 'between', label: 'Space between' },
        { value: 'stacked', label: 'Stacked' },
        { value: 'none', label: 'None' },
      ],
    },
    { key: 'close', label: 'Close button', type: 'toggle', default: true, when: s => s.kind === 'modal' },
    { key: 'overlay', label: 'Backdrop (.modaloverlay)', type: 'toggle', default: true },
    { key: 'open', label: 'Open', type: 'toggle', default: true },
  ],
  presets: [
    { name: 'Edit profile', state: {} },
    { name: 'Small, stacked actions', state: { size: 'sm', title: 'Invite teammate', description: 'They will receive an email invitation.', body: 'text', footer: 'stacked', confirm: 'Send invite' } },
    { name: 'Terms (scrolling)', state: { size: 'lg', title: 'Terms of service', description: 'Last updated 1 March 2024.', body: 'long', footer: 'between', confirm: 'Accept' } },
    { name: 'Fullscreen', state: { size: 'fullscreen', title: 'Media library', description: '', body: 'long', footer: 'start', confirm: 'Insert' } },
    { name: 'Delete confirmation', state: { kind: 'alertdialog', tone: 'destructive', title: 'Delete project?', description: 'This permanently deletes the project and all of its records. This cannot be undone.', confirm: 'Delete' } },
    { name: 'Unsaved changes', state: { kind: 'alertdialog', tone: 'warning', title: 'Discard changes?', description: 'You have unsaved changes that will be lost.', confirm: 'Discard' } },
    { name: 'Closed (trigger only)', state: { open: false } },
  ],
  render(s) {
    const alert = s.kind === 'alertdialog';
    const open = s.open ? ' open' : '';
    const role = alert ? ' role="alertdialog"' : '';
    const described = alert && s.description ? ` aria-describedby="${ID}-description"` : '';
    const trigger = `<button type="button" class="btn ${alert && s.tone === 'destructive' ? 'btn--destructive' : 'btn--primary'}" commandfor="${ID}" command="show-modal">${escape(s.title)}</button>`;
    const overlay = s.overlay ? `<dialog class="modaloverlay"${open} aria-hidden="true"></dialog>` : '';
    const dialog = `<dialog class="${alert ? 'alertdialog' : 'modal'}" id="${ID}"${role} aria-labelledby="${ID}-title"${described}${open}>`
      + `${alert ? alertDialog(s) : modal(s)}</dialog>`;
    return trigger + overlay + dialog;
  },
};
