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

  // Drag a card's handle to reorder; the cards swap as the pointer passes their middle
  field.addEventListener('pointerdown', (e) => {
    const handle = e.target.closest('[data-reorder]');
    if (!handle || e.button !== 0) return;
    e.preventDefault();
    const itemEl = handle.closest('.nest-item');
    itemEl.setAttribute('data-dragging', '');
    const move = (ev) => {
      const others = [...field.children].filter(el => el !== itemEl);
      const after = others.find(el => ev.clientY < el.getBoundingClientRect().top + el.offsetHeight / 2);
      if (after !== itemEl.nextElementSibling) field.insertBefore(itemEl, after || null);
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      itemEl.removeAttribute('data-dragging');
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

  function recordFrame(kind, id) {
    const record = find(KINDS[kind].list, id);
    return { type: 'record', kind, id, label: KINDS[kind].name(record), draft: structuredClone(record), initial: JSON.stringify(record) };
  }

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
    const trail = ['Home', 'Project carousel', ...stack.map(f => f.label)];
    const crumbs = trail.map((label, i) => {
      const depth = i - 1;
      const current = i === trail.length - 1;
      const link = depth >= 1 && !current
        ? `<button type="button" class="breadcrumb__link" data-crumb="${depth}">${escape(label)}</button>`
        : current ? `<span class="breadcrumb__page">${escape(label)}</span>` : `<span class="breadcrumb__link">${escape(label)}</span>`;
      const separator = i ? `<li class="breadcrumb__item" aria-hidden="true"><span class="breadcrumb__separator">${ICONS.chevron}</span></li>` : '';
      return `${separator}<li class="breadcrumb__item">${link}</li>`;
    }).join('');
    const title = frame.type === 'picker' ? frame.label : `Edit ${KINDS[frame.kind].noun}`;
    header.innerHTML = `
      <div class="nest-head">
        ${stack.length > 1 ? `<button type="button" class="btn btn--ghost btn--icon btn--sm" data-back aria-label="Back to ${escape(stack[stack.length - 2].label)}" data-tooltip="Back" data-tooltip-position="bottom">${ICONS.back}</button>` : ''}
        <div>
          <nav class="breadcrumb" aria-label="Where you are"><ol class="breadcrumb__list">${crumbs}</ol></nav>
          <h3 class="sheet__title" id="nestTitle">${escape(title)}</h3>
        </div>
      </div>
      <button type="button" class="sheet__close" data-nest-close aria-label="Close">${ICONS.remove}</button>`;
  }

  function renderFooter() {
    const frame = top();
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
      : `<button type="button" class="btn btn--primary" data-save>${ICONS.check}Save ${KINDS[frame.kind].noun}</button>`;
    footer.innerHTML = `
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
        <input type="search" class="input form__control" placeholder="Search ${kind.noun}s" aria-label="Search ${kind.noun}s" data-picker-search value="${escape(frame.query)}" data-autofocus>
        <div class="nest-picker" role="${frame.multiple ? 'group' : 'radiogroup'}" aria-label="${escape(frame.label)}">
          ${options.map((r) => {
            const on = frame.selected.includes(r.id);
            const image = kind.image(r);
            return `
              <div class="nest-option" role="${frame.multiple ? 'checkbox' : 'radio'}" tabindex="0" aria-checked="${on}" data-pick="${r.id}"${frame.multiple ? '' : ' data-single'}>
                <span class="nest-option__mark">${ICONS.check}</span>
                ${image ? `<figure class="nest-item__image"><img src="${image}" alt=""></figure>` : ''}
                <span class="nest-item__title">${escape(kind.name(r))}</span>
                <span class="nest-item__meta">${escape(kind.meta(r))}</span>
                ${frame.kind === 'project' && r.status === 'Draft' ? '<span class="badge badge--sm badge--secondary">Draft</span>' : ''}
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
    const shared = frame.kind === 'project'
      ? `Shown on ${d.usedOn} ${d.usedOn === 1 ? 'page' : 'pages'}. Saving changes the project everywhere it appears.`
      : frame.kind === 'studio' ? `Credited on ${projects.filter(p => p.studio === d.id).length} projects. Saving changes the studio everywhere it appears.` : '';
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

  function save(frame) {
    const record = find(KINDS[frame.kind].list, frame.id);
    Object.assign(record, frame.draft);
    frame.initial = JSON.stringify(record);
    const name = KINDS[frame.kind].name(record);
    const where = frame.kind === 'project' ? ` Shown on ${record.usedOn} ${record.usedOn === 1 ? 'page' : 'pages'}.` : '';
    window.toast?.success(`${name} saved.${where}`);
    stack.pop();
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
