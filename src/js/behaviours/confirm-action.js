/**
 * Points one shared confirmation at whichever of many buttons opened it.
 *
 * A page with a Delete on every row needs one .alertdialog, not one per row. Each button opens it
 * as usual (commandfor and command="show-modal") and says what confirming does:
 *
 * - data-confirm-action is the address the dialog's own form posts to;
 * - data-confirm-form instead submits the button's own form, with its fields, when the row's
 *   action posts more than an address can carry (or names a form by id, data-confirm-form="id").
 *
 * data-confirm-title, if given, replaces the dialog's .alertdialog__title. The click sets these
 * before the dialog opens.
 */
export class ConfirmAction {
  /**
   * The form each open dialog will submit in place of its own
   *
   * @type {WeakMap<HTMLDialogElement, HTMLFormElement>}
   */
  static #pending = new WeakMap();

  static {
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-confirm-action], [data-confirm-form]');
      const dialog = button && document.getElementById(button.getAttribute('commandfor') || '');
      if (!dialog) return;

      if (button.hasAttribute('data-confirm-form')) {
        const id = button.dataset.confirmForm;
        const form = id ? document.getElementById(id) : (button.form ?? button.closest('form'));
        if (form instanceof HTMLFormElement) {
          ConfirmAction.#pending.set(dialog, form);
        }
      } else {
        ConfirmAction.#pending.delete(dialog);
        dialog.querySelector('form')?.setAttribute('action', button.dataset.confirmAction);
      }

      const title = dialog.querySelector('.alertdialog__title');
      if (title && button.dataset.confirmTitle) title.textContent = button.dataset.confirmTitle;
    }, true);

    document.addEventListener('submit', (event) => {
      const dialog = event.target.closest('dialog');
      const form = dialog && ConfirmAction.#pending.get(dialog);
      if (!form) return;

      event.preventDefault();
      ConfirmAction.#pending.delete(dialog);
      dialog.close();
      form.requestSubmit();
    }, true);
  }
}
