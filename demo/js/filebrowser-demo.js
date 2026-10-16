/**
 * Demo behaviour for a Contenir media field and its file browser.
 *
 * Builds the same markup Contenir's FileBrowser renders (dialog.overlay > .overlay__wrap >
 * browser panel + upload panel) so the library styles can be seen working against it. Uploads
 * are simulated: dropped or chosen files appear as cards with progress at the top of the grid,
 * the footer status summarises them, and its Details button slides out the upload panel. Files
 * can also be dropped straight onto the field, where each becomes a tile with progress. Real
 * image files show their own previews; a file with "fail" in its name shows the error state.
 */
(() => {
  const field = document.querySelector('[data-filebrowser]');
  if (!field) return;

  const list = field.querySelector('.media__list');
  const addTile = field.querySelector('[data-filebrowser-add]');
  const scope = field.dataset.filebrowserScope || 'Products › Images';
  const icon = path => `<svg class="icon" viewBox="0 0 24 24">${path}</svg>`;
  const ICONS = {
    grid: icon('<path d="M4 4h6v6h-6z"/><path d="M14 4h6v6h-6z"/><path d="M4 14h6v6h-6z"/><path d="M14 14h6v6h-6z"/>'),
    list: icon('<path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"/><path d="M4 14m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"/>'),
    plus: icon('<path d="M12 5l0 14"/><path d="M5 12l14 0"/>'),
    check: icon('<path d="M5 12l5 5l10 -10"/>'),
    back: icon('<path d="M9 14l-4 -4l4 -4"/><path d="M5 10h11a4 4 0 1 1 0 8h-1"/>'),
    dots: icon('<path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>'),
    edit: icon('<path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"/><path d="M13.5 6.5l4 4"/>'),
    download: icon('<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"/><path d="M7 11l5 5l5 -5"/><path d="M12 4l0 12"/>'),
    trash: icon('<path d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>'),
    remove: icon('<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>'),
    upload: icon('<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"/><path d="M7 9l5 -5l5 5"/><path d="M12 4l0 12"/>'),
  };

  // Generated gradient "photos" so the demo needs no image files
  const gradient = (a, b) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#${a}"/><stop offset="1" stop-color="#${b}"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><circle cx="200" cy="200" r="80" fill="white" fill-opacity=".22"/></svg>`)}`;
  const palette = [['6366f1', '22c55e'], ['f97316', 'ec4899'], ['0ea5e9', '6366f1'], ['a855f7', '6366f1'], ['eab308', 'f97316'], ['22c55e', '0ea5e9'], ['ef4444', 'f97316'], ['64748b', '0f172a']];
  const names = ['Front', 'Side', 'Detail', 'Lit', 'Black finish', 'White finish', 'Brass finish', 'Dimensions', 'Lifestyle desk', 'Lifestyle shelf', 'Packaging', 'Base detail', 'Shade detail', 'Switch', 'Cable', 'Scale'];
  let nextId = 900;
  const assets = names.map((name, i) => ({
    id: nextId++,
    name: `Desk lamp — ${name}`,
    type: i % 5 === 4 ? 'JPG' : 'PNG',
    size: `${(120 + i * 37) % 900 + 80} KB`,
    time: `${(i % 9) + 1} Oct 2026`,
    src: gradient(...palette[i % palette.length]),
  }));

  let dialog;
  let state = { view: 'grid', sort: 'time', query: '' };
  const uploads = [];

  // ---------------------------------------------------------------------------
  // Field
  // ---------------------------------------------------------------------------

  function tile(asset) {
    const li = document.createElement('li');
    li.className = 'media editable';
    li.setAttribute('data-handle', '');
    li.setAttribute('data-filebrowser-item', '');
    li.dataset.assetId = asset.id;
    li.innerHTML = `<figure class="media__image"><picture><img src="${asset.src}" alt=""></picture>`
      + `<button type="button" class="media__remove" data-filebrowser-remove data-tooltip="Remove" aria-label="Remove ${asset.name}">${ICONS.remove}</button></figure>`;
    return li;
  }

  list.addEventListener('click', (e) => {
    const remove = e.target.closest('[data-filebrowser-remove]');
    if (remove) {
      const item = remove.closest('.media');
      const next = item.nextElementSibling;
      item.remove();
      window.toast?.show({
        type: 'success',
        message: 'Image removed from the gallery',
        duration: 6000,
        actions: [{ label: 'Undo', icon: ICONS.back, onClick: () => list.insertBefore(item, next) }],
      });
    } else if (e.target.closest('[data-filebrowser-browse]')) {
      open();
    }
  });

  // Files dropped straight onto the field upload into the same set of assets and become tiles
  const hasFiles = event => event.dataTransfer?.types.includes('Files');
  let fieldDepth = 0;
  field.addEventListener('dragenter', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    fieldDepth++;
    list.classList.add('media__list--dragover');
  });
  field.addEventListener('dragover', (e) => {
    if (hasFiles(e)) e.preventDefault();
  });
  field.addEventListener('dragleave', () => {
    fieldDepth = Math.max(0, fieldDepth - 1);
    if (!fieldDepth) list.classList.remove('media__list--dragover');
  });
  field.addEventListener('drop', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    fieldDepth = 0;
    list.classList.remove('media__list--dragover');
    [...e.dataTransfer.files].forEach((file, i) => uploadToField(file, i));
  });

  function uploadToField(file, i) {
    const asset = fileAsset(file, i);
    const li = tile(asset);
    li.classList.add('media--busy');
    li.querySelector('.media__image').insertAdjacentHTML('beforeend', '<span class="media__progress"><span class="media__progress-fill"></span></span>');
    list.insertBefore(li, addTile);
    const fails = /fail/i.test(asset.name);
    let value = 0;
    const tick = () => {
      value = Math.min(100, value + 10 + Math.random() * 20);
      li.style.setProperty('--progress', `${value}%`);
      if (fails && value > 55) {
        li.classList.replace('media--busy', 'media--error');
        li.title = 'Upload failed: the file type is not allowed';
        window.toast?.error(`${asset.name} could not be uploaded`);
        return;
      }
      if (value < 100) {
        setTimeout(tick, 250 + Math.random() * 250);
        return;
      }
      li.classList.remove('media--busy');
      li.querySelector('.media__progress').remove();
      assets.unshift(asset);
    };
    setTimeout(tick, 300);
  }

  /** An asset record for an uploaded file, previewing the file itself when it's an image. */
  function fileAsset(file, i) {
    return {
      id: nextId++,
      name: file.name.replace(/\.[^.]+$/, ''),
      type: (file.name.split('.').pop() || 'file').toUpperCase(),
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      time: 'Just now',
      src: file.type.startsWith('image/') ? URL.createObjectURL(file) : gradient(...palette[i % palette.length]),
    };
  }

  // ---------------------------------------------------------------------------
  // Browser
  // ---------------------------------------------------------------------------

  function chrome() {
    const sorts = [['time', 'Modified'], ['name', 'Filename'], ['type', 'Type'], ['size', 'File size']];
    return `
      <header class="overlay__header">
        <div class="filebrowser__header">
          <form class="filebrowser__search" role="search">
            <input type="search" class="form__control form__control--sm" placeholder="Search ${scope}" aria-label="Search ${scope}" data-filebrowser-search>
          </form>
          <div class="filebrowser__toolbar">
            <div class="filebrowser__sort btn__group" aria-label="Sort by">
              ${sorts.map(([key, label]) => `<button type="button" class="btn btn--sm${key === state.sort ? ' active' : ''}" data-sort="${key}">${label}</button>`).join('')}
            </div>
            <div class="filebrowser__view-toggle btn__group" aria-label="View">
              <button type="button" class="btn btn--sm active" data-filebrowser-view="grid" aria-label="Grid view" data-tooltip="Grid view">${ICONS.grid}</button>
              <button type="button" class="btn btn--sm" data-filebrowser-view="list" aria-label="List view" data-tooltip="List view">${ICONS.list}</button>
            </div>
          </div>
        </div>
        <button type="button" class="btn btn--ghost btn--icon btn--sm" data-filebrowser-close aria-label="Close" data-tooltip="Close">${ICONS.remove}</button>
      </header>
      <div class="overlay__body" data-filebrowser-body>
        <header class="filebrowser__banner filebrowser__banner--hidden">
          <div class="filebrowser__banner--select"></div>
          <div class="filebrowser__banner--preview"></div>
          <div class="filebrowser__banner--name">Filename</div>
          <div class="filebrowser__banner--type">Type</div>
          <div class="filebrowser__banner--size">File size</div>
          <div class="filebrowser__banner--time">Modified</div>
          <div class="filebrowser__banner--options"></div>
        </header>
        <form class="filebrowser__form">
          <ul class="filebrowser__list filebrowser__list--image" data-filebrowser-list></ul>
        </form>
      </div>
      <footer class="overlay__footer">
        <div class="overlay__action">
          <div class="btn__group">
            <button type="button" class="btn btn--outline" data-upload>${ICONS.upload}<span>Upload</span></button>
          </div>
          <div class="filebrowser__status" data-filebrowser-status hidden>
            <span data-filebrowser-status-text></span>
            <button type="button" class="btn btn--ghost btn--sm" data-upload-details>Details</button>
          </div>
          <div class="cluster cluster--sm">
            <button type="button" class="btn btn--ghost" data-filebrowser-close>${ICONS.remove}<span>Cancel</span></button>
            <button type="button" class="btn btn--primary" data-select disabled>${ICONS.check}<span data-select-label>Select</span></button>
          </div>
        </div>
      </footer>`;
  }

  function uploadPanel() {
    return `
      <form class="overlay__form" data-asset>
        <div class="overlay__header">
          <h2 class="overlay__title">${ICONS.upload}<span>Uploads to ${scope}</span></h2>
        </div>
        <div class="overlay__body">
          <input type="file" multiple accept="image/*" class="asset__fileinput" id="filebrowser-upload-input">
          <div class="asset" data-asset-container></div>
        </div>
        <footer class="overlay__footer">
          <div class="overlay__action">
            <div class="btn__group">
              <button type="button" class="btn btn--outline" data-back>${ICONS.back}<span>Done</span></button>
            </div>
            <div class="btn__group">
              <label class="btn btn--primary" for="filebrowser-upload-input">${ICONS.plus}<span>Add files</span></label>
            </div>
          </div>
        </footer>
      </form>`;
  }

  function item(asset) {
    const menu = `filebrowser-menu-${asset.id}`;
    const li = document.createElement('li');
    li.className = 'filebrowser__item';
    li.dataset.id = `asset-${asset.id}`;
    li.dataset.title = asset.name;
    li.innerHTML = `
      <input class="filebrowser__checkbox" type="checkbox" id="filebrowser-input-${asset.id}" value="asset-${asset.id}">
      <label class="filebrowser__label" for="filebrowser-input-${asset.id}">
        <span class="filebrowser__label--select"></span>
        <span class="filebrowser__label--preview">
          <figure class="filebrowser__asset"><picture class="filebrowser__media"><img class="filebrowser__image" src="${asset.src}" alt=""></picture></figure>
        </span>
        <h2 class="filebrowser__label--name">${asset.name}</h2>
        <p class="filebrowser__label--mime">${asset.type}</p>
        <span class="filebrowser__label--type">${asset.type}</span>
        <span class="filebrowser__label--size">${asset.size}</span>
        <span class="filebrowser__label--time">${asset.time}</span>
        <span class="filebrowser__label--options">
          <span class="dropdown dropdown--right">
            <button type="button" class="btn btn--ghost btn--icon btn--sm dropdown__trigger" aria-label="Actions for ${asset.name}" aria-haspopup="menu" data-toggle data-toggle-target="#${menu}" data-toggle-capture="true">${ICONS.dots}</button>
            <span class="dropdown__menu" id="${menu}" role="menu" popover="manual">
              <button type="button" class="dropdown__item" role="menuitem">${ICONS.edit.replace('class="icon"', 'class="icon dropdown__item-icon"')}<span class="dropdown__item-text">Rename</span></button>
              <button type="button" class="dropdown__item" role="menuitem">${ICONS.download.replace('class="icon"', 'class="icon dropdown__item-icon"')}<span class="dropdown__item-text">Download</span></button>
              <button type="button" class="dropdown__item dropdown__item--destructive" role="menuitem">${ICONS.trash.replace('class="icon"', 'class="icon dropdown__item-icon"')}<span class="dropdown__item-text">Delete</span></button>
            </span>
          </span>
        </span>
      </label>`;
    return li;
  }

  function render() {
    const listEl = dialog.querySelector('[data-filebrowser-list]');
    const order = {
      time: (a, b) => b.id - a.id,
      name: (a, b) => a.name.localeCompare(b.name),
      type: (a, b) => a.type.localeCompare(b.type),
      size: (a, b) => parseInt(a.size, 10) - parseInt(b.size, 10),
    }[state.sort];
    const chosen = new Set([...listEl.querySelectorAll('.filebrowser__checkbox:checked')].map(c => c.value));
    const visible = assets.filter(a => a.name.toLowerCase().includes(state.query)).sort(order);
    listEl.querySelectorAll('.filebrowser__item:not(.filebrowser__item--busy)').forEach(li => li.remove());
    visible.forEach((asset) => {
      const li = item(asset);
      li.querySelector('.filebrowser__checkbox').checked = chosen.has(`asset-${asset.id}`);
      listEl.append(li);
    });
    window.Parallelogram?.init(listEl);
    updateSelect();
  }

  function updateSelect() {
    const count = dialog.querySelectorAll('.filebrowser__checkbox:checked').length;
    const button = dialog.querySelector('[data-select]');
    button.disabled = count === 0;
    dialog.querySelector('[data-select-label]').textContent = count ? `Select ${count}` : 'Select';
  }

  function open() {
    if (!dialog) build();
    state = { view: state.view, sort: state.sort, query: '' };
    dialog.querySelector('[data-filebrowser-search]').value = '';
    render();
    dialog.showModal();
    requestAnimationFrame(() => {
      dialog.classList.add('show');
      dialog.querySelector('.overlay__wrap').classList.add('show');
    });
  }

  function close() {
    dialog.classList.remove('show');
    setTimeout(() => dialog.open && dialog.close(), 200);
  }

  function build() {
    dialog = document.createElement('dialog');
    dialog.className = 'overlay';
    dialog.setAttribute('aria-label', `File browser: ${scope}`);
    dialog.style.setProperty('--filebrowser-drop-label', `"Drop files to upload to ${scope}"`);
    dialog.innerHTML = `<div class="overlay__wrap"><div class="overlay__inner show">${chrome()}</div><div class="overlay__inner">${uploadPanel()}</div></div>`;
    document.body.append(dialog);
    window.Parallelogram?.init(dialog);

    const [browsePanel, panel] = dialog.querySelectorAll('.overlay__inner');
    const body = dialog.querySelector('[data-filebrowser-body]');
    const listEl = dialog.querySelector('[data-filebrowser-list]');
    const banner = dialog.querySelector('.filebrowser__banner');

    dialog.querySelectorAll('[data-filebrowser-close]').forEach(button => button.addEventListener('click', close));
    // A click on the dialog itself (not its contents) is a click on the backdrop
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) close();
    });

    dialog.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      if (panel.classList.contains('show')) panel.classList.remove('show');
      else close();
    });

    dialog.querySelector('[data-filebrowser-search]').addEventListener('input', (e) => {
      state.query = e.target.value.trim().toLowerCase();
      render();
    });
    dialog.querySelector('.filebrowser__search').addEventListener('submit', e => e.preventDefault());

    dialog.querySelector('.filebrowser__sort').addEventListener('click', (e) => {
      const button = e.target.closest('[data-sort]');
      if (!button) return;
      state.sort = button.dataset.sort;
      dialog.querySelectorAll('[data-sort]').forEach(b => b.classList.toggle('active', b === button));
      render();
    });

    dialog.querySelector('.filebrowser__view-toggle').addEventListener('click', (e) => {
      const button = e.target.closest('[data-filebrowser-view]');
      if (!button) return;
      state.view = button.dataset.filebrowserView;
      dialog.querySelectorAll('[data-filebrowser-view]').forEach(b => b.classList.toggle('active', b === button));
      listEl.classList.toggle('filebrowser__list--image', state.view === 'grid');
      banner.classList.toggle('filebrowser__banner--hidden', state.view === 'grid');
    });

    listEl.addEventListener('change', updateSelect);

    dialog.querySelector('[data-select]').addEventListener('click', () => {
      const picked = [...listEl.querySelectorAll('.filebrowser__checkbox:checked')]
        .map(c => assets.find(a => `asset-${a.id}` === c.value));
      picked.forEach(asset => list.insertBefore(tile(asset), addTile));
      close();
      window.toast?.success(`${picked.length} ${picked.length === 1 ? 'image' : 'images'} added to the gallery`);
    });

    // Upload panel slides out over the browser
    dialog.querySelector('[data-upload]').addEventListener('click', () => panel.classList.add('show'));
    dialog.querySelector('[data-upload-details]').addEventListener('click', () => panel.classList.add('show'));
    panel.querySelector('[data-back]').addEventListener('click', () => panel.classList.remove('show'));
    panel.querySelector('.asset__fileinput').addEventListener('change', (e) => {
      upload([...e.target.files]);
      e.target.value = '';
    });

    // Drop anywhere on the browser body
    let depth = 0;
    body.addEventListener('dragenter', (e) => {
      if (!e.dataTransfer?.types.includes('Files')) return;
      e.preventDefault();
      depth++;
      body.classList.add('overlay__body--dragover');
    });
    body.addEventListener('dragover', (e) => {
      if (e.dataTransfer?.types.includes('Files')) e.preventDefault();
    });
    body.addEventListener('dragleave', () => {
      depth = Math.max(0, depth - 1);
      if (!depth) body.classList.remove('overlay__body--dragover');
    });
    body.addEventListener('drop', (e) => {
      e.preventDefault();
      depth = 0;
      body.classList.remove('overlay__body--dragover');
      upload([...e.dataTransfer.files]);
    });

    // Keep the browser visible behind the panel; only the panel slides
    browsePanel.classList.add('show');
  }

  // ---------------------------------------------------------------------------
  // Uploads (simulated)
  // ---------------------------------------------------------------------------

  function upload(files) {
    if (!files.length) return;
    const listEl = dialog.querySelector('[data-filebrowser-list]');
    const container = dialog.querySelector('[data-asset-container]');
    files.forEach((file, i) => {
      const asset = fileAsset(file, i);
      const card = item(asset);
      card.classList.add('filebrowser__item--busy');
      card.querySelector('.filebrowser__asset').insertAdjacentHTML('beforeend',
        '<div class="filebrowser__upload-progress"><div class="filebrowser__upload-progress-bar"><div class="filebrowser__upload-progress-fill"></div></div></div>');
      listEl.prepend(card);
      window.Parallelogram?.init(card);

      const row = document.createElement('div');
      row.className = 'asset__file show';
      row.innerHTML = `
        <progress class="asset__progress show" max="100" value="0"></progress>
        <figure class="asset__preview show"><picture class="asset__preview--media"><img class="asset__preview--image" src="${asset.src}" alt=""></picture></figure>
        <div data-panel="info" class="asset__panel show">
          <div class="asset__body">
            <p class="asset__title">${asset.name}</p>
            <p class="asset__info">Uploading…</p>
          </div>
        </div>`;
      container.prepend(row);

      const job = { asset, card, row, done: false, failed: false };
      uploads.push(job);
      progress(job);
    });
    status();
  }

  function progress(job) {
    let value = 0;
    // A file called "*fail*" shows the error state
    const fails = /fail/i.test(job.asset.name);
    const tick = () => {
      value = Math.min(100, value + 8 + Math.random() * 18);
      job.card.style.setProperty('--progress', `${value}%`);
      job.row.querySelector('.asset__progress').value = value;
      if (fails && value > 55) {
        job.failed = true;
        job.card.classList.remove('filebrowser__item--busy');
        job.card.classList.add('filebrowser__item--error');
        job.row.querySelector('.asset__progress').classList.remove('show');
        job.row.querySelector('.asset__info').textContent = 'Upload failed: the file type is not allowed';
        job.row.querySelector('[data-panel="info"]').dataset.panel = 'error';
        status();
        return;
      }
      if (value < 100) {
        setTimeout(tick, 250 + Math.random() * 250);
        return;
      }
      job.done = true;
      assets.unshift(job.asset);
      job.card.classList.remove('filebrowser__item--busy');
      job.card.querySelector('.filebrowser__upload-progress').remove();
      job.card.querySelector('.filebrowser__checkbox').checked = true;
      job.row.querySelector('.asset__progress').classList.remove('show');
      job.row.querySelector('.asset__info').textContent = `${job.asset.type} · ${job.asset.size} · added to ${scope}`;
      updateSelect();
      status();
    };
    setTimeout(tick, 300);
  }

  function status() {
    const element = dialog.querySelector('[data-filebrowser-status]');
    const text = dialog.querySelector('[data-filebrowser-status-text]');
    const active = uploads.filter(u => !u.done && !u.failed).length;
    const failed = uploads.filter(u => u.failed).length;
    const total = uploads.length;
    element.hidden = total === 0;
    element.dataset.state = active ? 'uploading' : failed ? 'error' : 'done';
    const parts = [active ? `Uploading ${total - active} of ${total}` : `${total - failed} uploaded`];
    if (failed) parts.push(`${failed} failed`);
    text.textContent = parts.join(' · ');
  }
})();
