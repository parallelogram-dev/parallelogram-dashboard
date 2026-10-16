/**
 * Mock-up of editing records nested inside a record.
 *
 * The page's Project carousel block holds a lookup of project records, shown as cards with a
 * preview, several fields and a caption that belongs to this page. Everything nested opens in one
 * side sheet that keeps a stack of views: pickers (choose records, ending in Done, which hands the
 * choice back to the form beneath) and records (a record's own form, ending in Save, which saves
 * that record). Going deeper replaces the sheet's contents, with Back and a breadcrumb; Escape
 * goes up one level and asks before losing changes. Past two levels, records open on their own
 * page instead. All data lives in memory and resets on reload.
 */
(() => {
  const field = document.getElementById('projectsField');
  if (!field) return;

  const icon = path => `<svg class="icon" viewBox="0 0 24 24">${path}</svg>`;
  const ICONS = {
    edit: icon('<path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"/><path d="M13.5 6.5l4 4"/>'),
    remove: icon('<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>'),
    check: icon('<path d="M5 12l5 5l10 -10"/>'),
    plus: icon('<path d="M12 5l0 14"/><path d="M5 12l14 0"/>'),
    back: icon('<path d="M15 6l-6 6l6 6"/>'),
    grip: icon('<path d="M9 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M9 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M9 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M15 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M15 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M15 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>'),
    swap: icon('<path d="M7 10h14l-4 -4"/><path d="M17 14h-14l4 4"/>'),
    external: icon('<path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"/><path d="M11 13l9 -9"/><path d="M15 4h5v5"/>'),
    chevron: icon('<path d="M9 6l6 6l-6 6"/>'),
    search: icon('<path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/><path d="M21 21l-6 -6"/>'),
    trash: icon('<path d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>'),
    share: icon('<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 9h.01"/><path d="M11 12h1v4h1"/>'),
  };

  const escape = value => String(value ?? '').replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);
  const gradient = (a, b) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#${a}"/><stop offset="1" stop-color="#${b}"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><rect x="120" y="110" width="160" height="110" fill="white" fill-opacity=".22"/><path d="M110 120l90 -60l90 60z" fill="white" fill-opacity=".3"/></svg>`)}`;

  // ---------------------------------------------------------------------------
  // Data (generic, in memory)
  // ---------------------------------------------------------------------------

  const studios = [
    { id: 's1', name: 'Northlight Studio', city: 'Melbourne', website: 'northlight.example', people: ['A. Chen', 'R. Okafor', 'L. Novak'] },
    { id: 's2', name: 'Field & Form', city: 'Sydney', website: 'fieldform.example', people: ['M. Patel', 'J. Rossi'] },
    { id: 's3', name: 'Lineworks', city: 'Brisbane', website: 'lineworks.example', people: ['S. Kim'] },
    { id: 's4', name: 'Common Ground Design', city: 'Hobart', website: 'commonground.example', people: ['T. Walsh', 'P. Dubois'] },
  ];
  const products = [
    { id: 'p1', name: 'Pendant light', meta: 'Lighting' },
    { id: 'p2', name: 'Wall sconce', meta: 'Lighting' },
    { id: 'p3', name: 'Desk lamp', meta: 'Lighting' },
    { id: 'p4', name: 'Track light', meta: 'Lighting' },
    { id: 'p5', name: 'Floor lamp', meta: 'Lighting' },
    { id: 'p6', name: 'Dimmer switch', meta: 'Controls' },
  ];
  const palette = [['6366f1', '22c55e'], ['f97316', 'ec4899'], ['0ea5e9', '6366f1'], ['a855f7', '6366f1'], ['eab308', 'f97316'], ['22c55e', '0ea5e9'], ['ef4444', 'f97316'], ['64748b', '0f172a']];
  const projects = [
    ['Harbour View House', 'Residential', 2024, 's1', ['p1', 'p2']],
    ['Laneway Studio', 'Workplace', 2023, 's2', ['p4']],
    ['Hillside Cabin', 'Residential', 2022, 's3', ['p3', 'p5']],
    ['Corner Cafe', 'Hospitality', 2024, 's2', ['p1', 'p6']],
    ['Courtyard Apartments', 'Residential', 2021, 's4', ['p2', 'p4']],
    ['Riverside Library', 'Public', 2023, 's1', ['p1', 'p4', 'p5']],
    ['Garden Pavilion', 'Public', 2022, 's3', []],
    ['Warehouse Offices', 'Workplace', 2024, 's4', ['p4', 'p6']],
  ].map(([title, type, year, studio, used], i) => ({
    id: `r${i + 1}`,
    title,
    type,
    year,
    studio,
    products: used,
    summary: `${title} is a ${type.toLowerCase()} project completed in ${year}.`,
    status: i === 6 ? 'Draft' : 'Published',
    usedOn: (i % 3) + 1,
    image: gradient(...palette[i % palette.length]),
  }));
  const find = (list, id) => list.find(item => item.id === id);

  // The page: which projects the block shows, in order, with a caption for each that belongs to the page
  const page = {
    items: ['r1', 'r3', 'r6'].map(id => ({ id, caption: '' })),
    saved: '',
  };
  const snapshot = () => JSON.stringify({ heading: document.getElementById('blockHeading').value, items: page.items });

  // ---------------------------------------------------------------------------
  // The page's lookup field
  // ---------------------------------------------------------------------------

  function card(project, index) {
    const studio = find(studios, project.studio);
    const item = page.items[index];
    return `
      <li class="nest-item" data-index="${index}">
        <button type="button" class="nest-item__handle" aria-label="Reorder ${escape(project.title)}" data-reorder>${ICONS.grip}</button>
        <figure class="nest-item__image"><img src="${project.image}" alt=""></figure>
        <div class="nest-item__body">
          <span class="nest-item__title">${escape(project.title)} ${project.status === 'Draft' ? '<span class="badge badge--sm badge--secondary">Draft</span>' : ''}</span>
          <span class="nest-item__meta">${escape(project.type)} &middot; ${project.year}</span>
          <span class="nest-item__meta">Architect: ${escape(studio?.name || 'None')}</span>
          <div class="form__field nest-item__fields">
            <label class="form__label" for="caption-${index}">Caption on this page</label>
            <input type="text" class="input input--sm form__control" id="caption-${index}" data-caption="${index}" value="${escape(item.caption)}" placeholder="${escape(project.title)}">
          </div>
        </div>
        <div class="nest-item__actions">
          <button type="button" class="btn btn--ghost btn--icon btn--sm" data-edit-project="${project.id}" aria-label="Edit ${escape(project.title)}" data-tooltip="Edit project">${ICONS.edit}</button>
          <button type="button" class="btn btn--ghost btn--icon btn--sm" data-remove="${index}" aria-label="Remove ${escape(project.title)} from this block" data-tooltip="Remove">${ICONS.remove}</button>
        </div>
      </li>`;
  }

  function renderField() {
    field.innerHTML = page.items.map((item, i) => card(find(projects, item.id), i)).join('')
      || '<li class="nest-note">No projects chosen yet.</li>';
    document.getElementById('projectsCount').textContent = `${page.items.length} ${page.items.length === 1 ? 'project' : 'projects'}`;
    markPage();
  }

  function markPage() {
    document.getElementById('pageUnsaved').hidden = snapshot() === page.saved;
  }

  field.addEventListener('input', (e) => {
    const index = e.target.dataset.caption;
    if (index === undefined) return;
    page.items[Number(index)].caption = e.target.value;
    markPage();
  });
  document.getElementById('blockHeading').addEventListener('input', markPage);

  field.addEventListener('click', (e) => {
    const remove = e.target.closest('[data-remove]');
    if (remove) {
      const [removed] = page.items.splice(Number(remove.dataset.remove), 1);
      renderField();
      window.toast?.show({
        type: 'success',
        message: `${find(projects, removed.id).title} removed from this block`,
        duration: 6000,
        actions: [{ label: 'Undo', icon: ICONS.back, onClick: () => { page.items.splice(Number(remove.dataset.remove), 0, removed); renderField(); } }],
      });
      return;
    }
    const edit = e.target.closest('[data-edit-project]');
    if (edit) open([recordFrame('project', edit.dataset.editProject)]);
  });

  /**
   * Drag a card's handle to reorder. The card follows the pointer and the others slide aside; a
   * neighbour gives way once the card's leading edge covers half of it.
   */
  field.addEventListener('pointerdown', (e) => {
    const handle = e.target.closest('[data-reorder]');
    if (!handle || e.button !== 0) return;
    e.preventDefault();
    const itemEl = handle.closest('.nest-item');
    const grab = e.clientY - itemEl.getBoundingClientRect().top;
    let pointerY = e.clientY;
    itemEl.setAttribute('data-dragging', '');

    const slotTop = () => itemEl.getBoundingClientRect().top - new DOMMatrixReadOnly(getComputedStyle(itemEl).transform).m42;
    const follow = () => { itemEl.style.transform = `translateY(${pointerY - grab - slotTop()}px)`; };
    const move = (ev) => {
      pointerY = ev.clientY;
      const top = pointerY - grab;
      const edge = top > slotTop() ? top + itemEl.offsetHeight : top;
      const others = [...field.children].filter(el => el !== itemEl);
      const after = others.find((el) => {
        const r = el.getBoundingClientRect();
        return edge < r.top - new DOMMatrixReadOnly(getComputedStyle(el).transform).m42 + r.height / 2;
      });
      if (after !== itemEl.nextElementSibling && !(after === undefined && !itemEl.nextElementSibling)) {
        const tops = new Map(others.map(el => [el, el.getBoundingClientRect().top]));
        field.insertBefore(itemEl, after || null);
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          tops.forEach((before, el) => {
            const delta = before - el.getBoundingClientRect().top;
            if (delta) el.animate([{ transform: `translateY(${delta}px)` }, { transform: 'none' }], { duration: 150, easing: 'ease-out' });
          });
        }
      }
      follow();
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      itemEl.removeAttribute('data-dragging');
      itemEl.style.transform = '';
      const order = [...field.children].map(el => page.items[Number(el.dataset.index)]);
      page.items = order;
      renderField();
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  });

  document.getElementById('chooseProjects').addEventListener('click', () => {
    open([pickerFrame({
      kind: 'project',
      label: 'Choose projects',
      multiple: true,
      selected: page.items.map(item => item.id),
      apply: (ids) => {
        page.items = ids.map(id => page.items.find(item => item.id === id) || { id, caption: '' });
        renderField();
      },
    })]);
  });

  document.getElementById('savePage').addEventListener('click', () => {
    page.saved = snapshot();
    markPage();
    window.toast?.success('Home saved');
  });

  // ---------------------------------------------------------------------------
  // The sheet and its stack of views
  // ---------------------------------------------------------------------------

  const MAX_DEPTH = 2;
  const sheet = document.getElementById('nestSheet');
  const header = document.getElementById('nestHeader');
  const body = document.getElementById('nestBody');
  const footer = document.getElementById('nestFooter');
  let stack = [];
  let confirming = null;

  const KINDS = {
    project: { list: projects, noun: 'project', name: r => r.title, meta: r => `${r.type} · ${r.year}`, image: r => r.image },
    studio: { list: studios, noun: 'architect', name: r => r.name, meta: r => r.city, image: () => null },
    product: { list: products, noun: 'product', name: r => r.name, meta: r => r.meta, image: () => null },
  };

  function pickerFrame({ kind, label, multiple, selected, apply }) {
    return { type: 'picker', kind, label, multiple, selected: [...selected], initial: [...selected], apply, query: '' };
  }

  /** A record's form, or a blank one for a new record when there's no id. */
  function recordFrame(kind, id) {
    const record = id ? find(KINDS[kind].list, id) : blank(kind);
    return {
      type: 'record',
      kind,
      id: record.id,
      isNew: !id,
      label: id ? KINDS[kind].name(record) : `New ${KINDS[kind].noun}`,
      draft: structuredClone(record),
      initial: JSON.stringify(record),
    };
  }

  let created = 0;
  function blank(kind) {
    created++;
    if (kind === 'project') {
      return { id: `new-r${created}`, title: '', type: 'Residential', year: 2026, studio: null, products: [], summary: '', status: 'Draft', usedOn: 0, image: gradient(...palette[created % palette.length]) };
    }
    return { id: `new-s${created}`, name: '', city: '', website: '', people: [] };
  }

  /** How many projects credit a studio. */
  const credits = id => projects.filter(p => p.studio === id).length;

  const dirty = frame => (frame.type === 'picker'
    ? JSON.stringify(frame.selected) !== JSON.stringify(frame.initial)
    : JSON.stringify(frame.draft) !== frame.initial);

  function open(frames) {
    stack = frames;
    confirming = null;
    render('forward');
    if (!sheet.open) sheet.showModal();
  }

  function push(frame) {
    stack.push(frame);
    confirming = null;
    render('forward');
  }

  /** Go up one level, or to a given depth, asking first if a level being left has changes. */
  function back(toDepth = stack.length - 1, confirmed = false) {
    const leaving = stack.slice(toDepth);
    const changed = leaving.filter(dirty);
    if (changed.length && !confirmed) {
      confirming = { toDepth, names: changed.map(f => f.label) };
      renderFooter();
      footer.querySelector('[data-confirm-keep]')?.focus();
      return;
    }
    stack = stack.slice(0, toDepth);
    confirming = null;
    if (!stack.length) {
      sheet.close();
      return;
    }
    render('back');
  }

  const top = () => stack[stack.length - 1];

  function render(direction) {
    renderHeader();
    const frame = top();
    body.innerHTML = `<div class="nest-view" data-from="${direction}">${frame.type === 'picker' ? pickerView(frame) : recordView(frame)}</div>`;
    renderFooter();
    window.Parallelogram?.init(body);
    body.querySelector('[data-autofocus]')?.focus();
  }

  function renderHeader() {
    const frame = top();
    // The trail is the levels above this one; the heading below names where you are
    const trail = ['Home', 'Project carousel', ...stack.slice(0, -1).map(f => f.label)];
    const crumbs = trail.map((label, i) => {
      const depth = i - 1;
      const link = depth >= 1
        ? `<button type="button" class="breadcrumb__link" data-crumb="${depth}">${escape(label)}</button>`
        : `<span class="breadcrumb__link">${escape(label)}</span>`;
      const separator = i ? `<li class="breadcrumb__item" aria-hidden="true"><span class="breadcrumb__separator">${ICONS.chevron}</span></li>` : '';
      return `${separator}<li class="breadcrumb__item">${link}</li>`;
    }).join('');
    const title = frame.label;
    const noun = KINDS[frame.kind].noun;
    const description = frame.type === 'record' ? `<p class="sheet__description">${noun[0].toUpperCase()}${noun.slice(1)}</p>` : '';
    header.innerHTML = `
      <div class="nest-head">
        ${stack.length > 1 ? `<button type="button" class="btn btn--ghost btn--icon btn--sm" data-back aria-label="Back to ${escape(stack[stack.length - 2].label)}" data-tooltip="Back" data-tooltip-position="bottom">${ICONS.back}</button>` : ''}
        <div>
          <nav class="breadcrumb" aria-label="Where you are"><ol class="breadcrumb__list">${crumbs}</ol></nav>
          <h3 class="sheet__title" id="nestTitle">${escape(title)}</h3>
          ${description}
        </div>
      </div>
      <button type="button" class="sheet__close" data-nest-close aria-label="Close">${ICONS.remove}</button>`;
  }

  function renderFooter() {
    const frame = top();
    if (confirming?.type === 'delete') {
      footer.innerHTML = `
        <div class="nest-confirm" role="alert">
          <span>${escape(confirming.message)}</span>
          <button type="button" class="btn btn--ghost btn--sm" data-confirm-keep>Keep it</button>
          <button type="button" class="btn btn--destructive btn--sm" data-confirm-delete>${ICONS.trash}Delete</button>
        </div>`;
      return;
    }
    if (confirming) {
      const names = confirming.names.join(' and ');
      footer.innerHTML = `
        <div class="nest-confirm" role="alert">
          <span>Discard your changes to ${escape(names)}?</span>
          <button type="button" class="btn btn--ghost btn--sm" data-confirm-keep>Keep editing</button>
          <button type="button" class="btn btn--destructive btn--sm" data-confirm-discard>${ICONS.remove}Discard</button>
        </div>`;
      return;
    }
    const count = frame.type === 'picker' ? `<span class="nest-note">${frame.selected.length} selected</span>` : (dirty(frame) ? '<span class="badge badge--warning-muted">Unsaved changes</span>' : '');
    const primary = frame.type === 'picker'
      ? `<button type="button" class="btn btn--primary" data-done>${ICONS.check}Done</button>`
      : `<button type="button" class="btn btn--primary" data-save>${ICONS.check}${frame.isNew ? 'Create' : 'Save'} ${KINDS[frame.kind].noun}</button>`;
    let remove = '';
    if (frame.type === 'record' && !frame.isNew && frame.kind !== 'product') {
      const inUse = frame.kind === 'studio' ? credits(frame.id) : 0;
      remove = inUse
        ? `<button type="button" class="btn btn--ghost btn--sm" aria-disabled="true" data-delete-blocked="${inUse}" data-tooltip="Credited on ${inUse} ${inUse === 1 ? 'project' : 'projects'}" data-tooltip-position="right">${ICONS.trash}Delete</button>`
        : `<button type="button" class="btn btn--ghost btn--sm text--destructive" data-delete>${ICONS.trash}Delete</button>`;
    }
    footer.innerHTML = `
      ${remove}
      ${count}
      <div class="cluster cluster--sm" style="margin-left: auto;">
        <button type="button" class="btn btn--outline" data-cancel>${ICONS.remove}Cancel</button>
        ${primary}
      </div>`;
  }

  // ---------------------------------------------------------------------------
  // Views
  // ---------------------------------------------------------------------------

  function pickerView(frame) {
    const kind = KINDS[frame.kind];
    const query = frame.query.toLowerCase();
    const options = kind.list.filter(r => kind.name(r).toLowerCase().includes(query));
    const canEdit = stack.length < MAX_DEPTH;
    return `
      <div class="stack stack--md">
        <div class="toolbar">
          <div class="toolbar__group" style="max-width: none;">
            ${ICONS.search.replace('class="icon"', 'class="icon toolbar__icon"')}
            <input type="search" class="toolbar__input" placeholder="Search ${kind.noun}s" aria-label="Search ${kind.noun}s" data-picker-search value="${escape(frame.query)}" data-autofocus>
            <button type="button" class="toolbar__clear" aria-label="Clear search">${ICONS.remove}</button>
          </div>
          ${canEdit
            ? `<button type="button" class="btn btn--outline" data-new="${frame.kind}">${ICONS.plus}New ${kind.noun}</button>`
            : `<a href="#" class="btn btn--outline" data-open-elsewhere="A new ${kind.noun}">${ICONS.external}New ${kind.noun}</a>`}
        </div>
        <div class="nest-picker" role="${frame.multiple ? 'group' : 'radiogroup'}" aria-label="${escape(frame.label)}">
          ${options.map((r) => {
            const on = frame.selected.includes(r.id);
            const image = kind.image(r);
            return `
              <div class="nest-option" role="${frame.multiple ? 'checkbox' : 'radio'}" tabindex="0" aria-checked="${on}" data-pick="${r.id}"${frame.multiple ? '' : ' data-single'}>
                ${image ? `<figure class="nest-item__image"><img src="${image}" alt=""></figure>` : ''}
                <div class="nest-option__row">
                  <div class="nest-item__body">
                    <span class="nest-item__title">${escape(kind.name(r))}</span>
                    <span class="nest-item__meta">${escape(kind.meta(r))}</span>
                    ${frame.kind === 'project' && r.status === 'Draft' ? '<span class="badge badge--sm badge--secondary" style="align-self: flex-start;">Draft</span>' : ''}
                  </div>
                  <span class="nest-option__mark">${ICONS.check}</span>
                </div>
                ${canEdit && frame.kind !== 'product' ? `<button type="button" class="btn btn--ghost btn--sm" data-edit-record="${r.id}" style="align-self: flex-start;">${ICONS.edit}Edit</button>` : ''}
              </div>`;
          }).join('') || '<p class="nest-note">Nothing matches.</p>'}
        </div>
      </div>`;
  }

  function lookupRows(kind, ids, { single, depth }) {
    const meta = KINDS[kind];
    const deeper = depth < MAX_DEPTH;
    return ids.map((id) => {
      const r = find(meta.list, id);
      const edit = kind === 'product'
        ? `<a href="#" class="btn btn--ghost btn--sm" data-open-elsewhere="${escape(meta.name(r))}">${ICONS.external}Open</a>`
        : deeper
          ? `<button type="button" class="btn btn--ghost btn--icon btn--sm" data-edit-nested="${kind}:${id}" aria-label="Edit ${escape(meta.name(r))}" data-tooltip="Edit">${ICONS.edit}</button>`
          : `<a href="#" class="btn btn--ghost btn--sm" data-open-elsewhere="${escape(meta.name(r))}">${ICONS.external}Open</a>`;
      const removeOrChange = single
        ? `<button type="button" class="btn btn--ghost btn--icon btn--sm" data-change="${kind}" aria-label="Change ${meta.noun}" data-tooltip="Change">${ICONS.swap}</button>`
        : `<button type="button" class="btn btn--ghost btn--icon btn--sm" data-unlink="${kind}:${id}" aria-label="Remove ${escape(meta.name(r))}" data-tooltip="Remove">${ICONS.remove}</button>`;
      return `
        <li class="nest-item nest-item--compact" style="grid-template-columns: minmax(0, 1fr) auto;">
          <div class="nest-item__body">
            <span class="nest-item__title">${escape(meta.name(r))}</span>
            <span class="nest-item__meta">${escape(meta.meta(r))}</span>
          </div>
          <div class="nest-item__actions">${edit}${removeOrChange}</div>
        </li>`;
    }).join('');
  }

  function recordView(frame) {
    const d = frame.draft;
    const depth = stack.length;
    // Only worth saying when the record also appears somewhere other than where you came from
    const others = frame.kind === 'project' ? d.usedOn - 1 : projects.filter(p => p.studio === d.id).length - 1;
    const plural = (n, word) => `${n} other ${word}${n === 1 ? '' : 's'}`;
    const shared = others < 1 ? '' : frame.kind === 'project'
      ? `Also shown on ${plural(others, 'page')}. Saving changes it there too.`
      : `Also credited on ${plural(others, 'project')}. Saving changes it there too.`;
    const banner = shared ? `
      <div class="alert alert--info">${ICONS.share}<div class="alert__content"><p class="alert__description">${escape(shared)}</p></div></div>` : '';

    if (frame.kind === 'project') {
      return `
        <div class="form stack stack--md">
          ${banner}
          <figure class="nest-item__image" style="width: 12rem;"><img src="${d.image}" alt=""></figure>
          <div class="form__field"><label class="form__label" for="f-title">Title</label><input class="input form__control" id="f-title" data-draft="title" value="${escape(d.title)}" data-autofocus></div>
          <div class="grid grid--2">
            <div class="form__field"><label class="form__label" for="f-type">Type</label><select class="select form__control" id="f-type" data-draft="type">${['Residential', 'Workplace', 'Hospitality', 'Public'].map(t => `<option${t === d.type ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
            <div class="form__field"><label class="form__label" for="f-year">Year</label><input class="input form__control" id="f-year" data-draft="year" inputmode="numeric" value="${d.year}"></div>
          </div>
          <div class="form__field"><label class="form__label" for="f-summary">Summary</label><textarea class="textarea form__control" id="f-summary" rows="3" data-draft="summary">${escape(d.summary)}</textarea></div>
          <div class="form__field">
            <span class="form__label">Architect</span>
            <ul class="nest-items">${d.studio ? lookupRows('studio', [d.studio], { single: true, depth }) : ''}</ul>
            ${d.studio ? '' : `<div><button type="button" class="btn btn--outline btn--sm" data-change="studio">${ICONS.plus}Choose architect</button></div>`}
          </div>
          <div class="form__field">
            <span class="form__label">Products used</span>
            <ul class="nest-items">${lookupRows('product', d.products, { single: false, depth })}</ul>
            <div><button type="button" class="btn btn--outline btn--sm" data-change="product">${ICONS.plus}Choose products</button></div>
          </div>
        </div>`;
    }

    return `
      <div class="form stack stack--md">
        ${banner}
        <div class="form__field"><label class="form__label" for="f-name">Name</label><input class="input form__control" id="f-name" data-draft="name" value="${escape(d.name)}" data-autofocus></div>
        <div class="grid grid--2">
          <div class="form__field"><label class="form__label" for="f-city">City</label><input class="input form__control" id="f-city" data-draft="city" value="${escape(d.city)}"></div>
          <div class="form__field"><label class="form__label" for="f-web">Website</label><input class="input form__control" id="f-web" data-draft="website" value="${escape(d.website)}"></div>
        </div>
        <div class="form__field">
          <span class="form__label">Team</span>
          <ul class="nest-items">${d.people.map(name => `
            <li class="nest-item nest-item--compact" style="grid-template-columns: minmax(0, 1fr) auto;">
              <div class="nest-item__body"><span class="nest-item__title">${escape(name)}</span></div>
              <div class="nest-item__actions"><a href="#" class="btn btn--ghost btn--sm" data-open-elsewhere="${escape(name)}">${ICONS.external}Open</a></div>
            </li>`).join('')}</ul>
          <p class="form__description">This is as deep as the sheet goes. People open on their own page, so you can come straight back here.</p>
        </div>
      </div>`;
  }

  // ---------------------------------------------------------------------------
  // Events in the sheet
  // ---------------------------------------------------------------------------

  sheet.addEventListener('cancel', (e) => {
    e.preventDefault();
    if (confirming) {
      confirming = null;
      renderFooter();
      return;
    }
    back();
  });

  sheet.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('[data-nest-close]')) return back(0);
    if (t.closest('[data-back]')) return back();
    const crumb = t.closest('[data-crumb]');
    if (crumb) return back(Number(crumb.dataset.crumb));
    if (t.closest('[data-cancel]')) return back();
    if (t.closest('[data-confirm-keep]')) {
      confirming = null;
      renderFooter();
      return undefined;
    }
    if (t.closest('[data-confirm-discard]')) return back(confirming.toDepth, true);
    if (t.closest('[data-confirm-delete]')) return destroy(top());

    const frame = top();
    if (t.closest('[data-done]')) {
      frame.apply(frame.multiple ? frame.selected : frame.selected.slice(0, 1));
      stack.pop();
      if (!stack.length) {
        sheet.close();
        return undefined;
      }
      render('back');
      return undefined;
    }
    if (t.closest('[data-save]')) return save(frame);
    if (t.closest('[data-delete]')) return askDelete(frame);
    const blocked = t.closest('[data-delete-blocked]');
    if (blocked) {
      window.toast?.info(`${frame.label} can't be deleted while ${blocked.dataset.deleteBlocked === '1' ? 'a project credits it' : `${blocked.dataset.deleteBlocked} projects credit it`}. Change their architect first.`);
      return undefined;
    }
    const create = t.closest('[data-new]');
    if (create) return push(recordFrame(create.dataset.new, null));

    const editRecord = t.closest('[data-edit-record]');
    if (editRecord) {
      e.stopPropagation();
      return push(recordFrame(frame.kind, editRecord.dataset.editRecord));
    }
    const pick = t.closest('[data-pick]');
    if (pick) return toggle(frame, pick.dataset.pick);

    const nested = t.closest('[data-edit-nested]');
    if (nested) {
      const [kind, id] = nested.dataset.editNested.split(':');
      return push(recordFrame(kind, id));
    }
    const change = t.closest('[data-change]');
    if (change) return choose(frame, change.dataset.change);
    const unlink = t.closest('[data-unlink]');
    if (unlink) {
      const [, id] = unlink.dataset.unlink.split(':');
      frame.draft.products = frame.draft.products.filter(p => p !== id);
      return render('same');
    }
    const elsewhere = t.closest('[data-open-elsewhere]');
    if (elsewhere) {
      e.preventDefault();
      window.toast?.info(`${elsewhere.dataset.openElsewhere} would open on its own page in a new tab`);
    }
    return undefined;
  });

  sheet.addEventListener('keydown', (e) => {
    const pick = e.target.closest('[data-pick]');
    if (pick && (e.key === ' ' || e.key === 'Enter') && e.target === pick) {
      e.preventDefault();
      toggle(top(), pick.dataset.pick);
    }
  });

  sheet.addEventListener('input', (e) => {
    const frame = top();
    if (e.target.matches('[data-picker-search]')) {
      frame.query = e.target.value;
      const caret = e.target.selectionStart;
      body.querySelector('.nest-picker').outerHTML = new DOMParser().parseFromString(pickerView(frame), 'text/html').querySelector('.nest-picker').outerHTML;
      e.target.setSelectionRange(caret, caret);
      return;
    }
    const key = e.target.dataset.draft;
    if (!key || frame.type !== 'record') return;
    frame.draft[key] = key === 'year' ? Number(e.target.value) || e.target.value : e.target.value;
    renderFooter();
  });
  sheet.addEventListener('change', (e) => {
    const frame = top();
    const key = e.target.dataset.draft;
    if (key && frame.type === 'record') {
      frame.draft[key] = e.target.value;
      renderFooter();
    }
  });

  function toggle(frame, id) {
    if (frame.multiple) {
      frame.selected = frame.selected.includes(id) ? frame.selected.filter(s => s !== id) : [...frame.selected, id];
    } else {
      frame.selected = [id];
    }
    body.querySelectorAll('[data-pick]').forEach((el) => { el.setAttribute('aria-checked', String(frame.selected.includes(el.dataset.pick))); });
    renderFooter();
  }

  /** Open a picker for one of a record's lookups; Done writes the choice into its draft. */
  function choose(frame, kind) {
    const single = kind === 'studio';
    push(pickerFrame({
      kind,
      label: single ? 'Choose architect' : 'Choose products',
      multiple: !single,
      selected: single ? [frame.draft.studio].filter(Boolean) : frame.draft.products,
      apply: (ids) => {
        if (single) frame.draft.studio = ids[0] || null;
        else frame.draft.products = ids;
      },
    }));
  }

  function askDelete(frame) {
    const record = find(KINDS[frame.kind].list, frame.id);
    const others = frame.kind === 'project' ? record.usedOn - 1 : 0;
    const onPage = page.items.some(item => item.id === record.id);
    const consequences = [onPage && 'it will come off this block', others > 0 && `it will also come off the ${others} other ${others === 1 ? 'page' : 'pages'} that show it`].filter(Boolean);
    confirming = { type: 'delete', message: `Delete ${KINDS[frame.kind].name(record)}?${consequences.length ? ` ${consequences.join(', and ')}.`.replace(/^ i/, ' I') : ''}` };
    renderFooter();
    footer.querySelector('[data-confirm-keep]')?.focus();
  }

  /** Delete a record, take it out of everything that points at it, and offer Undo. */
  function destroy(frame) {
    const meta = KINDS[frame.kind];
    const index = meta.list.findIndex(r => r.id === frame.id);
    const [record] = meta.list.splice(index, 1);
    const removedItems = page.items.map((item, i) => ({ item, i })).filter(({ item }) => item.id === record.id);
    page.items = page.items.filter(item => item.id !== record.id);
    const touched = [];
    projects.forEach((p) => {
      if (p.products.includes(record.id)) {
        touched.push([p, 'products', [...p.products]]);
        p.products = p.products.filter(id => id !== record.id);
      }
    });
    confirming = null;
    stack.pop();
    stack.forEach((f) => {
      if (f.type === 'picker') f.selected = f.selected.filter(id => id !== record.id);
      if (f.type === 'record' && f.kind === 'project') f.draft.products = f.draft.products.filter(id => id !== record.id);
    });
    renderField();
    if (stack.length) render('back');
    else sheet.close();
    window.toast?.show({
      type: 'success',
      message: `${meta.name(record)} deleted`,
      duration: 8000,
      actions: [{
        label: 'Undo',
        icon: ICONS.back,
        onClick: () => {
          meta.list.splice(index, 0, record);
          removedItems.forEach(({ item, i }) => page.items.splice(i, 0, item));
          touched.forEach(([p, key, value]) => { p[key] = value; });
          renderField();
          if (sheet.open && stack.length) render('same');
        },
      }],
    });
  }

  function save(frame) {
    const meta = KINDS[frame.kind];
    if (!meta.name(frame.draft).trim()) {
      body.querySelector('[data-autofocus]')?.focus();
      window.toast?.error(`Give the ${meta.noun} a ${frame.kind === 'project' ? 'title' : 'name'} first`);
      return;
    }
    let record = find(meta.list, frame.id);
    if (!record) {
      record = structuredClone(frame.draft);
      meta.list.push(record);
    } else {
      Object.assign(record, frame.draft);
    }
    frame.initial = JSON.stringify(record);
    const name = meta.name(record);
    const others = frame.kind === 'project' ? record.usedOn - 1 : 0;
    const where = others > 0 ? ` Updated on ${others} other ${others === 1 ? 'page' : 'pages'} too.` : '';
    window.toast?.success(frame.isNew ? `${name} created` : `${name} saved.${where}`);
    stack.pop();
    // A record created from a picker comes back already chosen
    const beneath = top();
    if (frame.isNew && beneath?.type === 'picker' && beneath.kind === frame.kind) {
      beneath.selected = beneath.multiple ? [...beneath.selected, record.id] : [record.id];
    }
    stack.forEach((f) => {
      if (f.type === 'record' && f.kind === frame.kind && f.id === frame.id) f.label = name;
    });
    renderField();
    if (!stack.length) {
      sheet.close();
      return;
    }
    render('back');
  }

  page.saved = snapshot();
  renderField();
})();
