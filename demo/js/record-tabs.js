/**
 * Demo behaviour for record-edit-tabs.html: an editable variants table backed by a sheet
 * that holds each variant's full record.
 *
 * Variant rows save themselves: a row saves shortly after an edit, or when focus leaves it,
 * showing data-row-state ("saving", "saved", "error") in its checkbox cell. Removing rows is
 * immediate with an Undo toast. The product's own fields use "Save changes", with the library's
 * unsaved-changes guard showing what's unsaved. Nothing is
 * persisted; saves are simulated, and a variant without a SKU fails to show the error state.
 */
(() => {
  const rows = document.getElementById('variantRows');
  const template = document.getElementById('variantTemplate');
  const count = document.getElementById('variantCount');
  const editor = document.getElementById('productEditor');
  const selectAll = document.getElementById('variantSelectAll');
  const bulk = document.getElementById('variantBulk');
  const hint = document.getElementById('variantHint');
  const defaultHint = hint.textContent;
  const sheet = document.getElementById('variantSheet');
  const position = document.getElementById('variantSheetPosition');
  const title = document.getElementById('variantSheetTitle');
  let editing = null;

  const variantRows = () => [...rows.querySelectorAll('[data-variant]')];
  const checked = () => variantRows().filter(row => row.querySelector('[data-variant-select]').checked);
  const sku = row => row.querySelector('[name="sku"]').value.trim() || 'New variant';
  const toast = message => window.toast?.success(message);
  const status = document.getElementById('variantStatus');
  const UNDO_ICON = '<svg class="icon" viewBox="0 0 24 24"><path d="M9 14l-4 -4l4 -4"/><path d="M5 10h11a4 4 0 1 1 0 8h-1"/></svg>';
  const timers = new WeakMap();
  const resave = new WeakSet();

  function markChanged(row) {
    if (!row.classList.contains('table__row--new')) row.classList.add('table__row--changed');
    clearTimeout(timers.get(row));
    timers.set(row, setTimeout(() => save(row), 600));
  }

  function setState(row, state, message = '') {
    const cell = row.querySelector('.table__checkbox');
    if (state) row.dataset.rowState = state;
    else delete row.dataset.rowState;
    row.toggleAttribute('aria-busy', state === 'saving');
    if (message) cell.title = message;
    else cell.removeAttribute('title');
  }

  /** Simulated save; a real one would send the row's values and handle the response. */
  function save(row) {
    clearTimeout(timers.get(row));
    timers.delete(row);
    if (!row.isConnected) return;
    if (row.dataset.rowState === 'saving') {
      resave.add(row);
      return;
    }
    const value = row.querySelector('[name="sku"]').value.trim();
    if (!value) {
      // A blank new row waits until it has a SKU; an existing one can't lose it
      if (row.classList.contains('table__row--new')) return;
      setState(row, 'error', 'SKU is required. Add one, or click here to try again.');
      status.textContent = 'A variant could not be saved: SKU is required.';
      return;
    }
    setState(row, 'saving');
    setTimeout(() => {
      if (resave.delete(row)) {
        setState(row, null);
        save(row);
        return;
      }
      row.classList.remove('table__row--changed', 'table__row--new');
      setState(row, 'saved');
      status.textContent = `${value} saved`;
      setTimeout(() => { if (row.dataset.rowState === 'saved') setState(row, null); }, 1500);
    }, 600 + Math.random() * 500);
  }

  function refresh() {
    const all = variantRows();
    const picked = checked();
    count.textContent = all.length;
    bulk.hidden = picked.length === 0;
    hint.textContent = picked.length ? `${picked.length} of ${all.length} variants selected` : defaultHint;
    selectAll.checked = all.length > 0 && picked.length === all.length;
    selectAll.indeterminate = picked.length > 0 && picked.length < all.length;
  }

  function insertCopy(row, after = row) {
    const copy = row.cloneNode(true);
    copy.classList.remove('table__row--changed');
    copy.classList.add('table__row--new');
    copy.querySelector('[data-variant-select]').checked = false;
    // cloneNode keeps attributes, not the live state of selects
    copy.querySelectorAll('select').forEach((select, i) => { select.selectedIndex = row.querySelectorAll('select')[i].selectedIndex; });
    copy.querySelector('[name="sku"]').value = `${sku(row)}-COPY`;
    after.after(copy);
    window.Parallelogram?.init(copy);
    save(copy);
    return copy;
  }

  /** Remove straight away and offer Undo, which puts each row back where it was. */
  function remove(list) {
    const removed = list.map(row => ({ row, next: row.nextElementSibling }));
    list.forEach((row) => {
      row.remove();
      row.querySelector('[data-variant-select]').checked = false;
    });
    refresh();
    window.toast?.show({
      type: 'success',
      message: list.length === 1 ? `${sku(list[0])} removed` : `${list.length} variants removed`,
      duration: 6000,
      actions: [{
        label: 'Undo',
        icon: UNDO_ICON,
        onClick: () => {
          // Last first, so each row's original next sibling is already back in place
          [...removed].reverse().forEach(({ row, next }) => {
            rows.insertBefore(row, next?.isConnected ? next : null);
          });
          refresh();
          status.textContent = `${list.length === 1 ? sku(list[0]) : `${list.length} variants`} restored`;
        },
      }],
    });
  }

  rows.addEventListener('input', (e) => {
    const row = e.target.closest('[data-variant]');
    if (row && e.target.matches('.table__control')) markChanged(row);
  });

  rows.addEventListener('change', (e) => {
    if (e.target.matches('[data-variant-select]')) refresh();
    else if (e.target.matches('select.table__control')) markChanged(e.target.closest('[data-variant]'));
  });

  // Leaving a row saves it straight away rather than waiting for the timer
  rows.addEventListener('focusout', (e) => {
    const row = e.target.closest('[data-variant]');
    if (row && timers.has(row) && !row.contains(e.relatedTarget)) save(row);
  });

  rows.addEventListener('click', (e) => {
    const row = e.target.closest('[data-variant]');
    if (!row) return;
    if (row.dataset.rowState === 'error' && e.target.closest('.table__checkbox')) save(row);
    else if (e.target.closest('[data-variant-edit]')) openSheet(row);
    else if (e.target.closest('[data-variant-duplicate]')) {
      insertCopy(row).querySelector('[name="sku"]').focus();
      refresh();
    } else if (e.target.closest('[data-variant-delete]')) remove([row]);
  });

  selectAll.addEventListener('change', () => {
    variantRows().forEach(row => { row.querySelector('[data-variant-select]').checked = selectAll.checked; });
    refresh();
  });

  document.getElementById('bulkDuplicate').addEventListener('click', () => {
    checked().forEach(row => insertCopy(row));
    variantRows().forEach(row => { row.querySelector('[data-variant-select]').checked = false; });
    refresh();
  });

  document.getElementById('bulkRemove').addEventListener('click', () => remove(checked()));

  document.getElementById('addVariant').addEventListener('click', () => {
    const row = template.content.querySelector('[data-variant]').cloneNode(true);
    row.classList.add('table__row--new');
    rows.append(row);
    window.Parallelogram?.init(row);
    refresh();
    row.querySelector('[name="sku"]').focus();
  });

  // ---------------------------------------------------------------------------
  // Sheet: the full variant record, stepping through rows without closing
  // ---------------------------------------------------------------------------

  const sheetField = name => sheet.querySelector(`[data-field="${name}"]`);
  const shared = ['sku', 'size', 'finish', 'price', 'stock', 'status'];

  function fillSheet(row) {
    editing = row;
    shared.forEach(name => { sheetField(name).value = row.querySelector(`[name="${name}"]`).value; });
    const all = variantRows();
    const index = all.indexOf(row);
    title.textContent = `Edit ${sku(row)}`;
    position.textContent = `Variant ${index + 1} of ${all.length}`;
    document.getElementById('variantPrev').disabled = index === 0;
    document.getElementById('variantNext').disabled = index === all.length - 1;
  }

  function applySheet() {
    if (!editing) return;
    let changed = false;
    shared.forEach((name) => {
      const control = editing.querySelector(`[name="${name}"]`);
      if (control.value !== sheetField(name).value) {
        control.value = sheetField(name).value;
        changed = true;
      }
    });
    if (changed) markChanged(editing);
  }

  function openSheet(row) {
    fillSheet(row);
    sheet.showModal();
    sheetField('sku').focus();
  }

  function step(offset) {
    applySheet();
    const all = variantRows();
    const next = all[all.indexOf(editing) + offset];
    if (next) fillSheet(next);
  }

  document.getElementById('variantPrev').addEventListener('click', () => step(-1));
  document.getElementById('variantNext').addEventListener('click', () => step(1));
  document.getElementById('variantApply').addEventListener('click', () => {
    applySheet();
    sheet.close();
  });

  sheet.addEventListener('close', () => {
    editing?.querySelector('[data-variant-edit]')?.focus();
    editing = null;
  });

  // ---------------------------------------------------------------------------
  // Save and the SEO preview
  // ---------------------------------------------------------------------------

  // The unsaved-changes guard tracks the product's own fields; saving makes their values the saved ones
  document.getElementById('saveProduct').addEventListener('click', () => {
    editor.dispatchEvent(new CustomEvent('unsaved:reset'));
    toast('Desk Lamp saved');
  });

  const metaTitle = document.getElementById('metaTitle');
  const metaDescription = document.getElementById('metaDescription');
  metaTitle.addEventListener('input', () => { document.getElementById('previewTitle').textContent = metaTitle.value; });
  metaDescription.addEventListener('input', () => { document.getElementById('previewDescription').textContent = metaDescription.value; });

  refresh();
})();
