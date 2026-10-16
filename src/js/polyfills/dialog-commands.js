/**
 * Fallback for the Invoker Commands API (button commandfor/command) in browsers without it,
 * covering the dialog commands the overlay components use.
 */
export function polyfillDialogCommands() {
  if ('commandForElement' in HTMLButtonElement.prototype) return;

  document.addEventListener('click', (event) => {
    const button = event.target.closest('button[commandfor][command]');
    const target = button && document.getElementById(button.getAttribute('commandfor'));
    if (!(target instanceof HTMLDialogElement)) return;

    const command = button.getAttribute('command');
    if (command === 'show-modal' && !target.open) {
      target.showModal();
    } else if (command === 'close' && target.open) {
      target.close();
    }
  });
}
