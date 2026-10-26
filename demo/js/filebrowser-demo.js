/**
 * Demo behaviour for a Contenir media field and its file browser.
 *
 * Builds the same markup Contenir's FileBrowser renders (dialog.overlay > .overlay__wrap >
 * browser panel + upload panel) so the library styles can be seen working against it. Uploads
 * are simulated: dropped or chosen files appear as cards with progress at the top of the grid,
 * the footer status summarises them, and its Details button slides out the upload panel. Files
 * can also be dropped straight onto the field, where each becomes a tile with progress. Real
 * image files show their own previews; a file with "fail" in its name shows the error state.
 *
 * Each image's alt text is "missing", "suggested", "set" or "decorative" (data-alt on its card
 * and tile). "Edit details" in a card's menu, or the toolbar's "Needs alt text" button (which
 * steps through every image still to do), opens the details panel, where Suggest fills in a
 * suggestion to check. New uploads get a suggestion in the background. Suggestions are canned.
 * The menu and panel can also replace an image's file in place (keeping the asset, and flagging
 * its alt text to check) or copy its URL.
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
    dots: icon('<path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>'),
    edit: icon('<path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"/><path d="M13.5 6.5l4 4"/>'),
    download: icon('<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"/><path d="M7 11l5 5l5 -5"/><path d="M12 4l0 12"/>'),
    trash: icon('<path d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>'),
    remove: icon('<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>'),
    upload: icon('<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"/><path d="M7 9l5 -5l5 5"/><path d="M12 4l0 12"/>'),
    photo: icon('<path d="M15 8h.01"/><path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z"/><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"/><path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"/>'),
    sparkles: icon('<path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z"/>'),
    alert: icon('<path d="M12 9v4"/><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"/><path d="M12 16h.01"/>'),
    prev: icon('<path d="M15 6l-6 6l6 6"/>'),
    link: icon('<path d="M9 15l6 -6"/><path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464"/><path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463"/>'),
    replace: icon('<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/>'),
    next: icon('<path d="M9 6l6 6l-6 6"/>'),
  };

  // Generated gradient "photos" so the demo needs no image files
  const gradient = (a, b) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#${a}"/><stop offset="1" stop-color="#${b}"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><circle cx="200" cy="200" r="80" fill="white" fill-opacity=".22"/></svg>`)}`;
  const palette = [['6366f1', '22c55e'], ['f97316', 'ec4899'], ['0ea5e9', '6366f1'], ['a855f7', '6366f1'], ['eab308', 'f97316'], ['22c55e', '0ea5e9'], ['ef4444', 'f97316'], ['64748b', '0f172a']];
  const names = ['Front', 'Side', 'Detail', 'Lit', 'Black finish', 'White finish', 'Brass finish', 'Dimensions', 'Lifestyle desk', 'Lifestyle shelf', 'Packaging', 'Base detail', 'Shade detail', 'Switch', 'Cable', 'Scale'];
  // Canned stand-ins for what an image-description service would suggest
  const SUGGESTIONS = {
    Front: 'Black desk lamp with a weighted round base and an angled shade, seen from the front',
    Side: 'Side view of a black desk lamp showing its jointed arm and tilted shade',
    Detail: 'Close-up of the desk lamp’s hinge where the arm meets the shade',
    Lit: 'Desk lamp switched on, casting a warm pool of light onto a wooden desk',
    'Brass finish': 'Desk lamp in a brushed brass finish against a plain background',
    Dimensions: 'Line drawing of the desk lamp marked with its height, arm reach and base width',
    'Lifestyle desk': 'Desk lamp on a tidy home-office desk beside a laptop and notebook',
    'Lifestyle shelf': 'Desk lamp lighting a bookshelf of paperbacks and a small plant',
    Packaging: 'The desk lamp’s recycled cardboard box with the brand name printed on the side',
    'Base detail': 'Underside of the lamp’s round base showing its non-slip ring',
    'Shade detail': 'Inside of the lamp shade with its frosted diffuser',
    Switch: 'Close-up of the dimmer switch on the lamp’s cable',
    Scale: 'Desk lamp beside a coffee mug to show its size',
  };
  const suggestionFor = asset => SUGGESTIONS[asset.name.replace(/^Desk lamp — /, '')] || `Photo of ${asset.name.toLowerCase()}`;

  // A spread of alt text states: some done, one decorative, one suggestion waiting, the rest missing
  const DONE = ['Front', 'Side', 'Detail', 'Lit', 'Black finish', 'White finish'];
  let nextId = 900;
  const assets = names.map((name, i) => {
    const asset = {
      id: nextId++,
      name: `Desk lamp — ${name}`,
      type: i % 5 === 4 ? 'JPG' : 'PNG',
      size: `${(120 + i * 37) % 900 + 80} KB`,
      time: `${(i % 9) + 1} Oct 2026`,
      src: gradient(...palette[i % palette.length]),
      width: [1600, 1200, 2400, 1080][i % 4],
      height: [1200, 1200, 1600, 1350][i % 4],
      alt: '',
      altState: 'missing',
      suggestion: '',
    };
    if (DONE.includes(name)) Object.assign(asset, { alt: SUGGESTIONS[name] || `Desk lamp in a ${name.toLowerCase()}`, altState: 'set' });
    else if (name === 'Cable') asset.altState = 'decorative';
    else if (name === 'Brass finish') Object.assign(asset, { altState: 'suggested', suggestion: suggestionFor(asset) });
    return asset;
  });
  const needsAlt = asset => asset.altState === 'missing' || asset.altState === 'suggested';
  const dimensions = asset => (asset.width ? `${asset.width} × ${asset.height}` : '');
  // Where the site serves each file; the demo makes one up from the name
  const urlFor = asset => `https://example.com/assets/${scope.toLowerCase().replace(/\s*›\s*/g, '/').replace(/\s+/g, '-')}/${asset.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.${asset.type.toLowerCase()}`;

  function copyUrl(asset) {
    copyText(urlFor(asset));
  }

  async function copyText(url) {
    try {
      await navigator.clipboard.writeText(url);
      window.toast?.success('Image URL copied');
    } catch (err) {
      window.toast?.error(`Couldn’t copy the URL: ${url}`);
    }
  }

  const ALT_LABELS = { missing: 'No alt text', suggested: 'Check alt text', set: 'Has alt text', decorative: 'Decorative' };

  let dialog;
  let state = { view: 'grid', sort: 'time', query: '' };
  const uploads = [];

  const escape = value => String(value).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);

  // ---------------------------------------------------------------------------
  // Field
  // ---------------------------------------------------------------------------

  function tile(asset) {
    const li = document.createElement('li');
    li.className = 'media editable';
    li.setAttribute('data-handle', '');
    li.setAttribute('data-filebrowser-item', '');
    li.dataset.assetId = asset.id;
    li.dataset.alt = asset.altState;
    li.dataset.url = urlFor(asset);
    li.innerHTML = `<figure class="media__image"><picture><img src="${asset.src}" alt="${escape(asset.alt)}"></picture>`
      + `<button type="button" class="media__copy" data-filebrowser-copy data-tooltip="Copy URL" aria-label="Copy URL of ${escape(asset.name)}">${ICONS.link}</button>`
      + `<button type="button" class="media__remove" data-filebrowser-remove data-tooltip="Remove" aria-label="Remove ${asset.name}">${ICONS.remove}</button></figure>`;
    return li;
  }

  list.addEventListener('click', (e) => {
    const copy = e.target.closest('[data-filebrowser-copy]');
    if (copy) {
      copyText(copy.closest('.media').dataset.url);
      return;
    }
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
    return measure({
      id: nextId++,
      name: file.name.replace(/\.[^.]+$/, ''),
      type: (file.name.split('.').pop() || 'file').toUpperCase(),
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      time: 'Just now',
      src: file.type.startsWith('image/') ? URL.createObjectURL(file) : gradient(...palette[i % palette.length]),
      alt: '',
      altState: 'missing',
      suggestion: '',
    }, file);
  }

  /** Read an image file's real dimensions once it loads, and show them wherever the asset is. */
  function measure(asset, file) {
    if (!file.type.startsWith('image/')) return asset;
    const image = new Image();
    image.onload = () => {
      asset.width = image.naturalWidth;
      asset.height = image.naturalHeight;
      if (dialog) refreshAsset(asset);
    };
    image.src = asset.src;
    return asset;
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
            <button type="button" class="btn btn--outline btn--sm" data-alt-review hidden>${ICONS.alert}<span data-alt-review-label></span></button>
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
          <div class="filebrowser__banner--alt">Alt text</div>
          <div class="filebrowser__banner--type">Type</div>
          <div class="filebrowser__banner--dimensions">Dimensions</div>
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

  function detailsPanel() {
    return `
      <form class="overlay__form filebrowser__details" data-details>
        <div class="overlay__header">
          <h2 class="overlay__title">${ICONS.photo}<span>Image details</span></h2>
          <div class="cluster cluster--xs filebrowser__details-steps" data-details-steps>
            <span class="text--sm text--muted" data-details-position></span>
            <div class="btn__group">
              <button type="button" class="btn btn--outline btn--icon btn--sm" data-details-prev aria-label="Previous image" data-tooltip="Previous">${ICONS.prev}</button>
              <button type="button" class="btn btn--outline btn--icon btn--sm" data-details-next aria-label="Next image" data-tooltip="Next">${ICONS.next}</button>
            </div>
          </div>
        </div>
        <div class="overlay__body stack stack--md">
          <figure class="filebrowser__details-preview"><img src="" alt="" data-details-image></figure>
          <div class="cluster cluster--between">
            <div>
              <p class="text--medium" data-details-name></p>
              <p class="text--xs text--muted" data-details-info></p>
            </div>
            <div class="cluster cluster--xs">
              <button type="button" class="btn btn--outline btn--icon btn--sm" data-details-copy aria-label="Copy URL" data-tooltip="Copy URL">${ICONS.link}</button>
              <button type="button" class="btn btn--outline btn--sm" data-details-replace>${ICONS.replace}<span>Replace</span></button>
            </div>
          </div>
          <div class="form__field">
            <div class="cluster cluster--between">
              <div class="cluster cluster--xs">
                <label class="form__label" for="filebrowser-alt">Alt text</label>
                <span class="text--xs text--muted" data-details-count></span>
              </div>
              <button type="button" class="btn btn--ghost btn--sm" data-details-suggest>${ICONS.sparkles}<span>Suggest</span></button>
            </div>
            <textarea class="textarea form__control" id="filebrowser-alt" rows="3" data-details-alt aria-describedby="filebrowser-alt-hint"></textarea>
            <p class="form__description" id="filebrowser-alt-hint" data-details-hint></p>
          </div>
          <label class="checkbox"><input type="checkbox" class="checkbox__input" data-details-decorative><span class="checkbox__label">Decorative image, no alt text needed</span></label>
        </div>
        <footer class="overlay__footer">
          <div class="overlay__action">
            <div class="cluster cluster--sm">
              <button type="button" class="btn btn--ghost" data-details-close>${ICONS.remove}<span>Cancel</span></button>
              <button type="submit" class="btn btn--primary" data-details-save>${ICONS.check}<span data-details-save-label>Save</span></button>
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
    li.dataset.alt = asset.altState;
    li.innerHTML = `
      <input class="filebrowser__checkbox" type="checkbox" id="filebrowser-input-${asset.id}" value="asset-${asset.id}">
      <label class="filebrowser__label" for="filebrowser-input-${asset.id}">
        <span class="filebrowser__label--select"></span>
        <span class="filebrowser__label--preview">
          <figure class="filebrowser__asset"><picture class="filebrowser__media"><img class="filebrowser__image" src="${asset.src}" alt="${escape(asset.alt)}"></picture></figure>
        </span>
        <h2 class="filebrowser__label--name">${asset.name}</h2>
        <p class="filebrowser__label--mime">${[asset.type, dimensions(asset)].filter(Boolean).join(' · ')}</p>
        <span class="filebrowser__label--alt">${ALT_LABELS[asset.altState]}</span>
        <span class="filebrowser__label--type">${asset.type}</span>
        <span class="filebrowser__label--dimensions">${dimensions(asset)}</span>
        <span class="filebrowser__label--size">${asset.size}</span>
        <span class="filebrowser__label--time">${asset.time}</span>
        <span class="filebrowser__label--options">
          <span class="dropdown dropdown--right">
            <button type="button" class="btn btn--ghost btn--icon btn--sm dropdown__trigger" aria-label="Actions for ${asset.name}" aria-haspopup="menu" data-toggle data-toggle-target="#${menu}" data-toggle-capture="true">${ICONS.dots}</button>
            <span class="dropdown__menu" id="${menu}" role="menu" popover="manual">
              <button type="button" class="dropdown__item" role="menuitem" data-details-open="${asset.id}">${ICONS.photo.replace('class="icon"', 'class="icon dropdown__item-icon"')}<span class="dropdown__item-text">Edit details</span></button>
              <button type="button" class="dropdown__item" role="menuitem" data-replace="${asset.id}">${ICONS.replace.replace('class="icon"', 'class="icon dropdown__item-icon"')}<span class="dropdown__item-text">Replace image</span></button>
              <button type="button" class="dropdown__item" role="menuitem" data-copy-url="${asset.id}">${ICONS.link.replace('class="icon"', 'class="icon dropdown__item-icon"')}<span class="dropdown__item-text">Copy URL</span></button>
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
    updateReview();
  }

  function updateReview() {
    const count = assets.filter(needsAlt).length;
    const button = dialog.querySelector('[data-alt-review]');
    button.hidden = count === 0;
    dialog.querySelector('[data-alt-review-label]').textContent = `Needs alt text (${count})`;
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
    dialog.innerHTML = `<div class="overlay__wrap"><div class="overlay__inner show">${chrome()}</div><div class="overlay__inner">${uploadPanel()}</div><div class="overlay__inner">${detailsPanel()}</div></div>`;
    document.body.append(dialog);
    window.Parallelogram?.init(dialog);

    const [browsePanel, panel, detailsInner] = dialog.querySelectorAll('.overlay__inner');
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
      if (detailsInner.classList.contains('show')) closeDetails();
      else if (panel.classList.contains('show')) panel.classList.remove('show');
      else close();
    });

    setupDetails(detailsInner, listEl);

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
  // Image details and alt text
  // ---------------------------------------------------------------------------

  const ALT_LIMIT = 125;
  const HINT = 'Describe what matters in this image for someone who can’t see it.';
  const details = { panel: null, run: null, index: 0, drafts: new Map(), returnFocus: null };

  /** Open the details panel for one asset, or step through a list of them (a review run). */
  function openDetails(asset, run = null) {
    details.run = run;
    details.index = run ? run.indexOf(asset) : 0;
    details.returnFocus = document.activeElement;
    details.drafts.clear();
    show(asset);
    details.panel.classList.add('show');
    details.panel.querySelector('[data-details-alt]').focus();
  }

  function current() {
    return details.run ? details.run[details.index] : details.asset;
  }

  /** Fill the panel for an asset, from an unsaved draft if this run has one. */
  function show(asset) {
    details.asset = asset;
    const form = details.panel.querySelector('[data-details]');
    const draft = details.drafts.get(asset.id);
    const value = draft ? draft.value : asset.altState === 'suggested' ? asset.suggestion : asset.alt;
    const decorative = draft ? draft.decorative : asset.altState === 'decorative';
    const suggested = draft ? draft.suggested : asset.altState === 'suggested';
    form.querySelector('[data-details-image]').src = asset.src;
    form.querySelector('[data-details-name]').textContent = asset.name;
    form.querySelector('[data-details-info]').textContent = [asset.type, dimensions(asset), asset.size, asset.time].filter(Boolean).join(' · ');
    form.querySelector('[data-details-alt]').value = value;
    form.querySelector('[data-details-decorative]').checked = decorative;
    form.querySelector('[data-details-position]').textContent = details.run ? `${details.index + 1} of ${details.run.length}` : '';
    form.querySelector('[data-details-steps]').hidden = !details.run;
    form.querySelector('[data-details-prev]').disabled = !details.run || details.index === 0;
    form.querySelector('[data-details-next]').disabled = !details.run || details.index === details.run.length - 1;
    form.querySelector('[data-details-save-label]').textContent = details.run && details.index < details.run.length - 1 ? 'Save and next' : 'Save';
    setSuggested(suggested);
    sync();
  }

  function setSuggested(on) {
    const form = details.panel.querySelector('[data-details]');
    if (on) form.dataset.alt = 'suggested';
    else delete form.dataset.alt;
  }

  /** Keep the hint, count and decorative switch in step with the fields. */
  function sync() {
    const form = details.panel.querySelector('[data-details]');
    const field = form.querySelector('[data-details-alt]');
    const decorative = form.querySelector('[data-details-decorative]').checked;
    field.disabled = decorative;
    form.querySelector('[data-details-suggest]').disabled = decorative;
    const length = field.value.trim().length;
    const count = form.querySelector('[data-details-count]');
    count.textContent = decorative ? '' : `${length}/${ALT_LIMIT}`;
    count.classList.toggle('text--warning', length > ALT_LIMIT);
    form.querySelector('[data-details-hint]').textContent = decorative
      ? 'Screen readers will skip this image.'
      : form.dataset.alt === 'suggested' ? 'Suggested. Check it describes the image before saving.' : length > ALT_LIMIT ? 'Long alt text is tiring to listen to; keep it to what matters.' : HINT;
  }

  function remember() {
    const form = details.panel.querySelector('[data-details]');
    details.drafts.set(details.asset.id, {
      value: form.querySelector('[data-details-alt]').value,
      decorative: form.querySelector('[data-details-decorative]').checked,
      suggested: form.dataset.alt === 'suggested',
    });
  }

  function step(by) {
    remember();
    details.index = Math.max(0, Math.min(details.run.length - 1, details.index + by));
    show(details.run[details.index]);
    details.panel.querySelector('[data-details-alt]').focus();
  }

  function closeDetails() {
    details.panel.classList.remove('show');
    details.run = null;
    details.returnFocus?.focus?.();
  }

  /** Apply an asset's alt text to its card and any tile in the field. */
  function refreshAsset(asset) {
    dialog.querySelectorAll(`.filebrowser__item[data-id="asset-${asset.id}"]`).forEach((card) => {
      card.dataset.alt = asset.altState;
      card.querySelector('.filebrowser__image').alt = asset.alt;
      card.querySelector('.filebrowser__image').src = asset.src;
      card.querySelector('.filebrowser__label--alt').textContent = ALT_LABELS[asset.altState];
      card.querySelector('.filebrowser__label--mime').textContent = [asset.type, dimensions(asset)].filter(Boolean).join(' · ');
      card.querySelector('.filebrowser__label--type').textContent = asset.type;
      card.querySelector('.filebrowser__label--dimensions').textContent = dimensions(asset);
      card.querySelector('.filebrowser__label--size').textContent = asset.size;
      card.querySelector('.filebrowser__label--time').textContent = asset.time;
    });
    list.querySelectorAll(`.media[data-asset-id="${asset.id}"]`).forEach((tileEl) => {
      tileEl.dataset.alt = asset.altState;
      tileEl.querySelector('img').alt = asset.alt;
      tileEl.querySelector('img').src = asset.src;
    });
    updateReview();
  }

  function save() {
    const asset = details.asset;
    const form = details.panel.querySelector('[data-details]');
    const value = form.querySelector('[data-details-alt]').value.trim();
    const decorative = form.querySelector('[data-details-decorative]').checked;
    asset.alt = decorative ? '' : value;
    asset.altState = decorative ? 'decorative' : value ? 'set' : 'missing';
    asset.suggestion = '';
    details.drafts.delete(asset.id);
    refreshAsset(asset);

    if (details.run && details.index < details.run.length - 1) {
      details.index++;
      show(details.run[details.index]);
      details.panel.querySelector('[data-details-alt]').focus();
      return;
    }
    const left = assets.filter(needsAlt).length;
    closeDetails();
    window.toast?.success(left ? `Alt text saved. ${left} ${left === 1 ? 'image still needs' : 'images still need'} it.` : 'Every image has alt text');
  }

  function setupDetails(inner, listEl) {
    details.panel = inner;
    const form = inner.querySelector('[data-details]');
    const field = form.querySelector('[data-details-alt]');

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.hidden = true;
    input.dataset.replaceInput = '';
    dialog.append(input);
    input.addEventListener('change', () => {
      if (input.files[0] && replacing) replace(replacing, input.files[0]);
      input.value = '';
      replacing = null;
    });
    form.querySelector('[data-details-replace]').addEventListener('click', () => startReplace(details.asset));
    form.querySelector('[data-details-copy]').addEventListener('click', () => copyUrl(details.asset));

    listEl.addEventListener('click', (e) => {
      const copy = e.target.closest('[data-copy-url]');
      if (copy) {
        e.preventDefault();
        window.Parallelogram?.Toggle?.closeAll?.();
        copyUrl(assets.find(a => a.id === Number(copy.dataset.copyUrl)));
        return;
      }
      const swap = e.target.closest('[data-replace]');
      if (swap) {
        e.preventDefault();
        window.Parallelogram?.Toggle?.closeAll?.();
        startReplace(assets.find(a => a.id === Number(swap.dataset.replace)));
        return;
      }
      const open = e.target.closest('[data-details-open]');
      if (!open) return;
      e.preventDefault();
      window.Parallelogram?.Toggle?.closeAll?.();
      openDetails(assets.find(a => a.id === Number(open.dataset.detailsOpen)));
    });

    dialog.querySelector('[data-alt-review]').addEventListener('click', () => {
      const visible = [...listEl.querySelectorAll('.filebrowser__item:not(.filebrowser__item--busy)')]
        .map(card => assets.find(a => `asset-${a.id}` === card.dataset.id))
        .filter(asset => asset && needsAlt(asset));
      const run = visible.length ? visible : assets.filter(needsAlt);
      if (run.length) openDetails(run[0], run);
    });

    field.addEventListener('input', () => {
      setSuggested(false);
      sync();
    });
    form.querySelector('[data-details-decorative]').addEventListener('change', sync);
    form.querySelector('[data-details-prev]').addEventListener('click', () => step(-1));
    form.querySelector('[data-details-next]').addEventListener('click', () => step(1));
    form.querySelector('[data-details-close]').addEventListener('click', closeDetails);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      save();
    });

    const suggest = form.querySelector('[data-details-suggest]');
    suggest.addEventListener('click', () => {
      const asset = details.asset;
      suggest.setAttribute('aria-busy', 'true');
      suggest.disabled = true;
      setTimeout(() => {
        suggest.removeAttribute('aria-busy');
        suggest.disabled = false;
        if (details.asset !== asset) return;
        field.value = suggestionFor(asset);
        setSuggested(true);
        sync();
        field.focus();
      }, 900);
    });
  }

  // ---------------------------------------------------------------------------
  // Replace an image in place
  // ---------------------------------------------------------------------------

  /**
   * Swap an asset's file but keep the asset, so every field using it shows the new file. Existing
   * alt text is kept but flagged to check, since it described the old picture.
   */
  let replacing = null;

  function startReplace(asset) {
    replacing = asset;
    dialog.querySelector('[data-replace-input]').click();
  }

  function replace(asset, file) {
    const card = dialog.querySelector(`.filebrowser__item[data-id="asset-${asset.id}"]`);
    card?.classList.add('filebrowser__item--busy');
    card?.querySelector('.filebrowser__asset').insertAdjacentHTML('beforeend',
      '<div class="filebrowser__upload-progress"><div class="filebrowser__upload-progress-bar"><div class="filebrowser__upload-progress-fill"></div></div></div>');
    const fails = /fail/i.test(file.name);
    let value = 0;
    const tick = () => {
      value = Math.min(100, value + 12 + Math.random() * 20);
      card?.style.setProperty('--progress', `${value}%`);
      if (value < 100 && !(fails && value > 55)) {
        setTimeout(tick, 200 + Math.random() * 200);
        return;
      }
      card?.classList.remove('filebrowser__item--busy');
      card?.querySelector('.filebrowser__upload-progress')?.remove();
      if (fails) {
        window.toast?.error(`${asset.name} could not be replaced: the file type is not allowed`);
        return;
      }
      const before = { ...asset };
      const next = fileAsset(file, 0);
      Object.assign(asset, {
        src: next.src,
        type: next.type,
        size: next.size,
        time: 'Just now',
        width: null,
        height: null,
      });
      measure(asset, file);
      if (asset.altState === 'set') Object.assign(asset, { altState: 'suggested', suggestion: asset.alt });
      refreshAsset(asset);
      if (details.panel.classList.contains('show') && details.asset === asset) show(asset);
      window.toast?.show({
        type: 'success',
        message: `${asset.name} replaced wherever it’s used`,
        duration: 6000,
        actions: [{
          label: 'Undo',
          icon: ICONS.back,
          onClick: () => {
            Object.assign(asset, before);
            refreshAsset(asset);
            if (details.panel.classList.contains('show') && details.asset === asset) show(asset);
          },
        }],
      });
    };
    setTimeout(tick, 200);
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
      updateReview();
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
      // New images get a suggested alt text in the background, waiting for someone to check it
      setTimeout(() => {
        if (job.asset.altState !== 'missing') return;
        job.asset.suggestion = suggestionFor(job.asset);
        job.asset.altState = 'suggested';
        refreshAsset(job.asset);
      }, 1500);
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
