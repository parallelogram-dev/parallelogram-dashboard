/**
 * Demo behaviour for record-edit-tabs.html: an editable variants table backed by a sheet
 * that holds each variant's full record.
 *
 * Nothing is persisted. Edited rows get .table__row--changed, added rows .table__row--new,
 * and "Save changes" clears both, as a real save would.
 */
(() => {
  const rows = document.getElementById('variantRows');
  const template = document.getElementById('variantTemplate');
  const count = document.getElementById('variantCount');
  const unsaved = document.getElementById('unsavedBadge');
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

  function markChanged(row) {
    if (!row.classList.contains('table__row--new')) row.classList.add('table__row--changed');
    unsaved.hidden = false;
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
    unsaved.hidden = false;
    return copy;
  }

  function remove(list) {
    list.forEach(row => row.remove());
    unsaved.hidden = false;
    refresh();
    toast(list.length === 1 ? `${sku(list[0])} removed` : `${list.length} variants removed`);
  }

  rows.addEventListener('input', (e) => {
    const row = e.target.closest('[data-variant]');
    if (row && e.target.matches('.table__control')) markChanged(row);
  });

  rows.addEventListener('change', (e) => {
    if (e.target.matches('[data-variant-select]')) refresh();
    else if (e.target.matches('select.table__control')) markChanged(e.target.closest('[data-variant]'));
  });

  rows.addEventListener('click', (e) => {
    const row = e.target.closest('[data-variant]');
    if (!row) return;
    if (e.target.closest('[data-variant-edit]')) openSheet(row);
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
    unsaved.hidden = false;
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

  document.getElementById('saveProduct').addEventListener('click', () => {
    rows.querySelectorAll('.table__row--changed, .table__row--new').forEach((row) => {
      row.classList.remove('table__row--changed', 'table__row--new');
    });
    unsaved.hidden = true;
    toast('Desk Lamp saved');
  });

  document.querySelectorAll('#tab-details, #tab-media, #tab-seo').forEach((panel) => {
    panel.addEventListener('input', () => { unsaved.hidden = false; });
  });

  const metaTitle = document.getElementById('metaTitle');
  const metaDescription = document.getElementById('metaDescription');
  metaTitle.addEventListener('input', () => { document.getElementById('previewTitle').textContent = metaTitle.value; });
  metaDescription.addEventListener('input', () => { document.getElementById('previewDescription').textContent = metaDescription.value; });

  refresh();
})();
