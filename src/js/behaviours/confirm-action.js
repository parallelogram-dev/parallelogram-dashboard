/**
 * Points one shared confirmation at whichever of many buttons opened it.
 *
 * A page with a Delete on every row needs one .alertdialog, not one per row. Each button opens it
 * as usual (commandfor and command="show-modal") and carries data-confirm-action, the address its
 * form should post to; data-confirm-title, if given, replaces the dialog's .alertdialog__title.
 * The click sets both before the dialog opens.
 */
export class ConfirmAction {
  static {
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-confirm-action]');
      const dialog = button && document.getElementById(button.getAttribute('commandfor') || '');
      if (!dialog) return;
      dialog.querySelector('form')?.setAttribute('action', button.dataset.confirmAction);
      const title = dialog.querySelector('.alertdialog__title');
      if (title && button.dataset.confirmTitle) title.textContent = button.dataset.confirmTitle;
    }, true);
  }
}
