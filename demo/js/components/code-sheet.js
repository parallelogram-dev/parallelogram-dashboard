/**
 * One shared sheet that shows an example's or the playground's formatted markup.
 *
 * Triggers are plain buttons with commandfor/command="show-modal", so the dialog opens the same
 * way as any other sheet; their click handler fills in the markup first. A trigger passes a
 * function rather than a string, so the playground can refresh an open sheet when its state
 * changes underneath it, e.g. through the URL hash.
 */
const ID = 'code-sheet';
const CODE_ICON = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8l-4 4l4 4"/><path d="M17 8l4 4l-4 4"/><path d="M14 4l-4 16"/></svg>';
const CLOSE_ICON = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6l-12 12"/><path d="M6 6l12 12"/></svg>';

let sheet;
let source = null;

function create() {
  sheet = document.createElement('dialog');
  sheet.className = 'sheet sheet--right sheet--xl';
  sheet.id = ID;
  sheet.setAttribute('aria-labelledby', `${ID}-title`);
  sheet.innerHTML = `
    <button type="button" class="sheet__backdrop" commandfor="${ID}" command="close" aria-label="Close" tabindex="-1"></button>
    <div class="sheet__panel">
      <div class="sheet__header">
        <div>
          <h2 class="sheet__title" id="${ID}-title"></h2>
          <p class="sheet__description" data-description></p>
        </div>
        <button type="button" class="sheet__close" commandfor="${ID}" command="close" aria-label="Close">${CLOSE_ICON}</button>
      </div>
      <div class="sheet__content docs__codesheet">
        <pre class="docs__pre"><code data-code></code></pre>
      </div>
      <div class="sheet__footer">
        <button type="button" class="btn btn--outline" commandfor="${ID}" command="close">Close</button>
        <button type="button" class="btn btn--primary" data-copy>Copy HTML</button>
      </div>
    </div>`;
  sheet.querySelector('[data-copy]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(sheet.querySelector('[data-code]').textContent);
      window.toast?.success('Markup copied to clipboard', { duration: 2000 });
    } catch {
      window.toast?.error('Copy failed. Select the code and copy it manually.');
    }
  });
  sheet.addEventListener('close', () => {
    source = null;
  });
  document.body.append(sheet);
}

/**
 * A button that opens the code sheet with the markup getCode() returns.
 */
export function codeButton({ title, description = '', getCode, className = 'btn btn--ghost btn--sm' }) {
  if (!sheet) {
    create();
  }
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('commandfor', ID);
  button.setAttribute('command', 'show-modal');
  button.innerHTML = `${CODE_ICON}<span>HTML</span>`;
  button.addEventListener('click', () => {
    source = getCode;
    sheet.querySelector('.sheet__title').textContent = title;
    sheet.querySelector('[data-description]').textContent = description;
    sheet.querySelector('[data-description]').hidden = !description;
    refreshCode();
  });
  return button;
}

/**
 * Re-read the markup while the sheet is open, e.g. after the playground re-renders.
 */
export function refreshCode() {
  if (source) {
    sheet.querySelector('[data-code]').textContent = source();
  }
}
