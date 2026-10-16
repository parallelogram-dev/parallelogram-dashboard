/**
 * The clear button in a toolbar search.
 *
 * A .toolbar__clear empties the .toolbar__input in its .toolbar__group, fires "input" so
 * anything filtering on it updates, and puts focus back in the field. CSS shows the button only
 * while the field has a value (the field needs a placeholder for that).
 */
export class SearchClear {
  static {
    document.addEventListener('click', (e) => {
      const button = e.target.closest('.toolbar__clear');
      const input = button?.closest('.toolbar__group')?.querySelector('.toolbar__input');
      if (!input) return;
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    });
  }
}
