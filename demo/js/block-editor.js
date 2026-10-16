/**
 * Mock-up of a block editor for a page's Content field.
 *
 * Each block shows as a compact card that summarises it: type, a preview, its heading and its
 * layout as chips, with a show/hide switch and a menu (duplicate, move, delete). Clicking a card
 * opens the block in a stacked sheet with Content and Layout tabs; layout options are visual
 * controls rather than long selects. A + between cards opens a block-type picker in the same
 * sheet. Blocks belong to the page, so the sheet ends in Done and "Save page" keeps everything;
 * a block's own lookups (images, a carousel's projects) open one level deeper. Escape and Back go
 * up a level and ask before discarding changes. All data is in memory and resets on reload.
 */
(() => {
  const list = document.getElementById('blocks');
  if (!list) return;

  const icon = path => `<svg class="icon" viewBox="0 0 24 24">${path}</svg>`;
  const ICONS = {
    grip: icon('<path d="M9 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M9 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M9 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M15 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M15 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M15 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>'),
    plus: icon('<path d="M12 5l0 14"/><path d="M5 12l14 0"/>'),
    dots: icon('<path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>'),
    check: icon('<path d="M5 12l5 5l10 -10"/>'),
    remove: icon('<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>'),
    back: icon('<path d="M15 6l-6 6l6 6"/>'),
    undo: icon('<path d="M9 14l-4 -4l4 -4"/><path d="M5 10h11a4 4 0 1 1 0 8h-1"/>'),
    chevron: icon('<path d="M9 6l6 6l-6 6"/>'),
    copy: icon('<path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"/><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"/>'),
    up: icon('<path d="M12 5l0 14"/><path d="M18 11l-6 -6"/><path d="M6 11l6 -6"/>'),
    down: icon('<path d="M12 5l0 14"/><path d="M18 13l-6 6"/><path d="M6 13l6 6"/>'),
    trash: icon('<path d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>'),
    alert: icon('<path d="M12 9v4"/><path d="M10.363 3.591l-8.106 13.536a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"/><path d="M12 16h.01"/>'),
    photo: icon('<path d="M15 8h.01"/><path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z"/><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"/><path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"/>'),
    textImage: icon('<path d="M3 5m0 2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2z"/><path d="M14 7h7"/><path d="M14 11h7"/><path d="M14 15h5"/>'),
    text: icon('<path d="M4 6h16"/><path d="M4 10h16"/><path d="M4 14h16"/><path d="M4 18h10"/>'),
    quote: icon('<path d="M10 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"/><path d="M19 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"/>'),
    carousel: icon('<path d="M7 5m0 1a1 1 0 0 1 1 -1h8a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-8a1 1 0 0 1 -1 -1z"/><path d="M22 17h-1a1 1 0 0 1 -1 -1v-8a1 1 0 0 1 1 -1h1"/><path d="M2 17h1a1 1 0 0 0 1 -1v-8a1 1 0 0 0 -1 -1h-1"/>'),
    left: icon('<path d="M4 5h6v14h-6z"/><path d="M14 8h6"/><path d="M14 12h6"/><path d="M14 16h4"/>'),
    right: icon('<path d="M14 5h6v14h-6z"/><path d="M4 8h6"/><path d="M4 12h6"/><path d="M4 16h4"/>'),
    eye: icon('<path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"/>'),
    eyeOff: icon('<path d="M10.585 10.587a2 2 0 0 0 2.829 2.828"/><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87"/><path d="M3 3l18 18"/>'),
    center: icon('<path d="M7 5h10v10h-10z"/><path d="M6 19h12"/>'),
  };

  const escape = value => String(value ?? '').replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);
  const gradient = (a, b) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#${a}"/><stop offset="1" stop-color="#${b}"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><circle cx="200" cy="150" r="60" fill="white" fill-opacity=".22"/></svg>`)}`;
  const IMAGES = [['6366f1', '22c55e'], ['f97316', 'ec4899'], ['0ea5e9', '6366f1'], ['a855f7', '6366f1'], ['eab308', 'f97316'], ['22c55e', '0ea5e9'], ['ef4444', 'f97316'], ['64748b', '0f172a']]
    .map((pair, i) => ({ id: `img${i + 1}`, src: gradient(...pair), name: `Photo ${i + 1}` }));
  const PROJECTS = ['Harbour View House', 'Laneway Studio', 'Hillside Cabin', 'Corner Cafe', 'Riverside Library', 'Garden Pavilion']
    .map((title, i) => ({ id: `p${i + 1}`, title, meta: ['Residential', 'Workplace', 'Residential', 'Hospitality', 'Public', 'Public'][i], image: IMAGES[(i + 2) % IMAGES.length].src }));
  const find = (items, id) => items.find(item => item.id === id);

  // ---------------------------------------------------------------------------
  // Block types: their fields, layout options and how a card summarises them
  // ---------------------------------------------------------------------------

  const THEMES = [['default', 'Default', 'var(--card)'], ['light', 'Light', '#f8fafc'], ['dark', 'Dark', '#0f172a']];
  const SHAPES = [['original', 'Original'], ['square', 'Square'], ['landscape', 'Landscape'], ['portrait', 'Portrait']];

  const TYPES = {
    textImage: {
      name: 'Text + image',
      text: 'A heading and copy beside a photo.',
      icon: ICONS.textImage,
      content: [
        { key: 'image', label: 'Image', type: 'image' },
        { key: 'heading', label: 'Heading', type: 'text', required: true },
        { key: 'body', label: 'Description', type: 'textarea', hint: 'Use the column splitter (COL) to split the copy into columns.' },
        { key: 'link', label: 'Linked URL', type: 'text', placeholder: '/projects' },
        { key: 'cta', label: 'Call to action', type: 'text', placeholder: 'See our work' },
      ],
      layout: [
        { key: 'align', label: 'Image side', type: 'segment', options: [['left', 'Left', ICONS.left], ['right', 'Right', ICONS.right]] },
        { key: 'width', label: 'Image width', type: 'segment', options: [['4', 'Narrow'], ['6', 'Half'], ['8', 'Wide'], ['12', 'Full']], hint: 'Columns the image takes at desktop. Smaller screens stack.' },
        { key: 'shape', label: 'Image shape', type: 'segment', options: SHAPES },
        { key: 'position', label: 'Text position', type: 'segment', options: [['top', 'Top'], ['middle', 'Middle'], ['bottom', 'Bottom']] },
        { key: 'headingTag', label: 'Heading level', type: 'segment', options: [['h1', 'H1'], ['h2', 'H2'], ['h3', 'H3'], ['h4', 'H4']], hint: 'For page structure; doesn’t change the size.' },
        { key: 'headingStyle', label: 'Heading style', type: 'segment', options: [['medium', 'Medium'], ['large', 'Large'], ['offset', 'Large & offset']] },
        { key: 'theme', label: 'Theme', type: 'swatch', options: THEMES },
      ],
      defaults: { image: null, heading: '', body: '', link: '', cta: '', align: 'left', width: '6', shape: 'original', position: 'top', headingTag: 'h2', headingStyle: 'medium', theme: 'default' },
      chips: b => [`Image ${b.align}`, { 4: 'Narrow', 6: 'Half', 8: 'Wide', 12: 'Full width' }[b.width], b.theme !== 'default' && `${b.theme[0].toUpperCase()}${b.theme.slice(1)}`],
    },
    image: {
      name: 'Image',
      text: 'One photo with an optional caption.',
      icon: ICONS.photo,
      content: [
        { key: 'image', label: 'Image', type: 'image' },
        { key: 'caption', label: 'Caption', type: 'text' },
      ],
      layout: [
        { key: 'align', label: 'Alignment', type: 'segment', options: [['left', 'Left', ICONS.left], ['center', 'Centre', ICONS.center], ['right', 'Right', ICONS.right]] },
        { key: 'size', label: 'Size', type: 'segment', options: [['regular', 'Regular'], ['medium', 'Medium'], ['large', 'Large'], ['full', 'Full screen']] },
        { key: 'shape', label: 'Shape', type: 'segment', options: SHAPES },
        { key: 'theme', label: 'Theme', type: 'swatch', options: THEMES },
      ],
      defaults: { image: null, caption: '', align: 'center', size: 'large', shape: 'original', theme: 'default' },
      chips: b => [{ regular: 'Regular', medium: 'Medium', large: 'Large', full: 'Full screen' }[b.size], b.align !== 'center' && `Aligned ${b.align}`],
      title: b => b.caption,
    },
    text: {
      name: 'Text',
      text: 'A heading and a few paragraphs.',
      icon: ICONS.text,
      content: [
        { key: 'heading', label: 'Heading', type: 'text', required: true },
        { key: 'body', label: 'Copy', type: 'textarea' },
      ],
      layout: [
        { key: 'width', label: 'Width', type: 'segment', options: [['narrow', 'Narrow'], ['regular', 'Regular'], ['wide', 'Wide']] },
        { key: 'theme', label: 'Theme', type: 'swatch', options: THEMES },
      ],
      defaults: { heading: '', body: '', width: 'regular', theme: 'default' },
      chips: b => [`${b.width[0].toUpperCase()}${b.width.slice(1)}`],
    },
    quote: {
      name: 'Quote',
      text: 'A pull quote with who said it.',
      icon: ICONS.quote,
      content: [
        { key: 'quote', label: 'Quote', type: 'textarea', required: true },
        { key: 'cite', label: 'Who said it', type: 'text' },
      ],
      layout: [{ key: 'theme', label: 'Theme', type: 'swatch', options: THEMES }],
      defaults: { quote: '', cite: '', theme: 'default' },
      chips: b => [b.cite && `— ${b.cite}`],
      title: b => b.quote,
    },
    projects: {
      name: 'Project carousel',
      text: 'A row of chosen projects that link to their pages.',
      icon: ICONS.carousel,
      content: [
        { key: 'heading', label: 'Heading', type: 'text' },
        { key: 'projects', label: 'Projects', type: 'lookup' },
        { key: 'viewAll', label: '“View all” link', type: 'text', placeholder: '/projects' },
      ],
      layout: [{ key: 'theme', label: 'Theme', type: 'swatch', options: THEMES }],
      defaults: { heading: '', projects: [], viewAll: '', theme: 'default' },
      chips: b => [`${b.projects.length} ${b.projects.length === 1 ? 'project' : 'projects'}`],
    },
  };

  const required = (block) => {
    const type = TYPES[block.type];
    return type.content.filter(f => f.required && !String(block.data[f.key] ?? '').trim()).map(f => f.label);
  };

  // ---------------------------------------------------------------------------
  // The page's blocks
  // ---------------------------------------------------------------------------

  let nextId = 1;
  const make = (type, data = {}, hidden = false) => ({ id: `b${nextId++}`, type, hidden, data: { ...structuredClone(TYPES[type].defaults), ...data } });
  let blocks = [
    make('textImage', { image: 'img1', heading: 'Made to last', body: 'Every piece starts as a sketch on the workshop bench.', align: 'left', width: '6', theme: 'default' }),
    make('image', { image: 'img3', caption: 'The workshop floor, early morning', size: 'full' }),
    make('textImage', { image: 'img5', heading: 'Small batches, careful hands', body: 'We make a few of each design at a time.', align: 'right', width: '8', theme: 'dark', cta: 'Meet the team', link: '/team' }),
    make('quote', { quote: 'Good design is as little design as possible.', cite: 'A designer we admire' }, true),
    make('projects', { heading: 'Recent projects', projects: ['p1', 'p3', 'p5'], viewAll: '/projects' }),
    make('textImage', { image: 'img7', heading: '', body: 'Visit the showroom any weekday.', align: 'left', width: '4' }),
  ];
  let saved = JSON.stringify(blocks);

  /**
   * A small wireframe of how the block lays out: the image on its side at its width, text lines
   * beside it, dark when the theme is dark. It redraws whenever the block's layout changes.
   */
  function wireframe(block) {
    const d = block.data;
    const img = id => (id ? `<span class="blk-wire__img" style="background-image: url('${find(IMAGES, id)?.src}');"></span>` : '<span class="blk-wire__img"></span>');
    const lines = (n = 3) => `<span class="blk-wire__text"><span class="blk-wire__line blk-wire__line--head"></span>${'<span class="blk-wire__line"></span>'.repeat(n)}</span>`;
    let inner = '';
    let mod = '';
    if (block.type === 'textImage') {
      mod = d.width === '12' ? 'stack' : d.align === 'right' ? 'row-reverse' : 'row';
      inner = `<span class="blk-wire__media" style="--span: ${Number(d.width) / 12};">${img(d.image)}</span>${lines()}`;
    } else if (block.type === 'image') {
      mod = `align-${d.align}`;
      inner = `<span class="blk-wire__media" style="--span: ${{ regular: 0.5, medium: 0.65, large: 0.8, full: 1 }[d.size]};">${img(d.image)}</span>`;
    } else if (block.type === 'text') {
      mod = `measure-${d.width}`;
      inner = lines(4);
    } else if (block.type === 'quote') {
      mod = 'quote';
      inner = `<span class="blk-wire__mark">“</span>${lines(1)}`;
    } else if (block.type === 'projects') {
      mod = 'tiles';
      inner = d.projects.slice(0, 3).map(id => `<span class="blk-wire__img" style="background-image: url('${find(PROJECTS, id)?.image}');"></span>`).join('') || '<span class="blk-wire__img"></span><span class="blk-wire__img"></span><span class="blk-wire__img"></span>';
    }
    return `<span class="blk-wire blk-wire--${mod}" data-theme-preview="${d.theme || 'default'}" aria-hidden="true">${inner}</span>`;
  }

  function card(block, index) {
    const type = TYPES[block.type];
    const title = (type.title ? type.title(block.data) : block.data.heading) || '';
    const missing = required(block);
    const chips = type.chips(block.data).filter(Boolean).map(chip => `<span class="badge badge--sm badge--outline">${escape(chip)}</span>`).join('');
    const menu = `block-menu-${block.id}`;
    return `
      <li class="blk-insert"><button type="button" data-insert="${index}" aria-label="Add a block here" data-tooltip="Add a block" data-tooltip-position="right">${ICONS.plus}</button></li>
      <li class="blk-card" data-block="${block.id}" tabindex="0" role="button" aria-label="Edit ${escape(type.name)} block${title ? `: ${escape(title)}` : ''}"${block.hidden ? ' data-hidden' : ''}>
        <button type="button" class="blk-card__handle" data-reorder aria-label="Reorder block" tabindex="-1">${ICONS.grip}</button>
        ${wireframe(block)}
        <span class="blk-card__body">
          <span class="blk-card__type">${type.icon}${escape(type.name)}${block.hidden ? '<span class="badge badge--sm badge--secondary">Hidden</span>' : ''}</span>
          <span class="blk-card__title">${escape(title)}</span>
          <span class="blk-card__chips">${chips}${missing.length ? `<span class="badge badge--sm badge--warning-muted">${ICONS.alert.replace('class="icon"', 'class="icon badge__icon"')}${escape(missing.join(', '))} needed</span>` : ''}</span>
        </span>
        <span class="blk-card__actions">
          <button type="button" class="btn btn--ghost btn--icon btn--sm" data-stop data-visible="${block.id}" aria-pressed="${!block.hidden}" aria-label="${block.hidden ? 'Hidden from the page. Show it' : 'Visible on the page. Hide it'}" data-tooltip="${block.hidden ? 'Hidden · click to show' : 'Visible · click to hide'}" data-tooltip-position="left">${block.hidden ? ICONS.eyeOff : ICONS.eye}</button>
          <span class="dropdown dropdown--right" data-stop>
            <button type="button" class="btn btn--ghost btn--icon btn--sm dropdown__trigger" aria-label="Block actions" aria-haspopup="menu" data-toggle data-toggle-target="#${menu}" data-toggle-capture="true">${ICONS.dots}</button>
            <span class="dropdown__menu" id="${menu}" role="menu" popover="manual">
              <button type="button" class="dropdown__item" role="menuitem" data-action="duplicate" data-id="${block.id}">${ICONS.copy.replace('class="icon"', 'class="icon dropdown__item-icon"')}<span class="dropdown__item-text">Duplicate</span></button>
              <button type="button" class="dropdown__item" role="menuitem" data-action="up" data-id="${block.id}"${index === 0 ? ' disabled' : ''}>${ICONS.up.replace('class="icon"', 'class="icon dropdown__item-icon"')}<span class="dropdown__item-text">Move up</span></button>
              <button type="button" class="dropdown__item" role="menuitem" data-action="down" data-id="${block.id}"${index === blocks.length - 1 ? ' disabled' : ''}>${ICONS.down.replace('class="icon"', 'class="icon dropdown__item-icon"')}<span class="dropdown__item-text">Move down</span></button>
              <button type="button" class="dropdown__item dropdown__item--destructive" role="menuitem" data-action="delete" data-id="${block.id}">${ICONS.trash.replace('class="icon"', 'class="icon dropdown__item-icon"')}<span class="dropdown__item-text">Delete</span></button>
            </span>
          </span>
        </span>
      </li>`;
  }

  function renderList() {
    const editing = stack[0]?.blockId;
    list.innerHTML = blocks.map(card).join('')
      + `<li class="blk-insert" style="height: auto; margin-top: 0.5rem;"><button type="button" class="btn btn--outline btn--sm" data-insert="${blocks.length}" style="opacity: 1; transform: none; width: auto; height: auto; padding: 0.25rem 0.75rem; color: inherit; background: var(--card); border: 1px solid var(--border);">${ICONS.plus}Add block</button></li>`;
    if (editing) list.querySelector(`[data-block="${editing}"]`)?.setAttribute('data-editing', '');
    document.getElementById('pageUnsaved').hidden = JSON.stringify(blocks) === saved;
    window.Parallelogram?.init(list);
  }

  function undoToast(message, restore) {
    window.toast?.show({ type: 'success', message, duration: 6000, actions: [{ label: 'Undo', icon: ICONS.undo, onClick: () => { restore(); renderList(); } }] });
  }

  list.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]');
    if (action) {
      window.Parallelogram?.Toggle?.closeAll?.();
      const index = blocks.findIndex(b => b.id === action.dataset.id);
      const before = structuredClone(blocks);
      const block = blocks[index];
      if (action.dataset.action === 'duplicate') {
        blocks.splice(index + 1, 0, { ...structuredClone(block), id: `b${nextId++}` });
        undoToast(`${TYPES[block.type].name} block duplicated`, () => { blocks = before; });
      } else if (action.dataset.action === 'up' || action.dataset.action === 'down') {
        const to = index + (action.dataset.action === 'up' ? -1 : 1);
        [blocks[index], blocks[to]] = [blocks[to], blocks[index]];
      } else if (action.dataset.action === 'delete') {
        blocks.splice(index, 1);
        undoToast(`${TYPES[block.type].name} block deleted`, () => { blocks = before; });
      }
      renderList();
      return;
    }
    const insert = e.target.closest('[data-insert]');
    if (insert) {
      open([typePicker(Number(insert.dataset.insert))]);
      return;
    }
    if (e.target.closest('[data-stop], [data-reorder]')) return;
    const cardEl = e.target.closest('[data-block]');
    if (cardEl) open([blockFrame(cardEl.dataset.block)]);
  });

  list.addEventListener('keydown', (e) => {
    const cardEl = e.target.closest('[data-block]');
    if (cardEl && e.target === cardEl && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      open([blockFrame(cardEl.dataset.block)]);
    }
  });

  list.addEventListener('click', (e) => {
    const toggle = e.target.closest('[data-visible]');
    if (!toggle) return;
    const block = find(blocks, toggle.dataset.visible);
    block.hidden = !block.hidden;
    renderList();
    list.querySelector(`[data-visible="${block.id}"]`)?.focus();
  });

  /**
   * Drag a card's handle to reorder. Each card moves together with the "add block" row above it,
   * so the gaps stay even; while dragging those rows are hidden, the card follows the pointer and
   * the others slide out of the way. Escape puts it back.
   */
  list.addEventListener('pointerdown', (e) => {
    const handle = e.target.closest('[data-reorder]');
    if (!handle || e.button !== 0) return;
    e.preventDefault();
    const item = handle.closest('[data-block]');
    const pair = () => [item.previousElementSibling, item];
    const grab = e.clientY - item.getBoundingClientRect().top;
    let pointerY = e.clientY;
    list.setAttribute('data-reordering', '');
    item.setAttribute('data-dragging', '');

    const follow = () => {
      item.style.transform = '';
      item.style.transform = `translateY(${pointerY - grab - item.getBoundingClientRect().top}px)`;
    };

    /** Move the card (and its row) before another card's row, sliding the others into place. */
    const place = (beforeEl) => {
      const others = [...list.querySelectorAll('[data-block]')].filter(el => el !== item);
      const tops = new Map(others.map(el => [el, el.getBoundingClientRect().top]));
      list.insertBefore(pair()[0], beforeEl);
      list.insertBefore(item, beforeEl);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      tops.forEach((top, el) => {
        const delta = top - el.getBoundingClientRect().top;
        if (delta) el.animate([{ transform: `translateY(${delta}px)` }, { transform: 'none' }], { duration: 150, easing: 'ease-out' });
      });
    };

    const move = (ev) => {
      pointerY = ev.clientY;
      const others = [...list.querySelectorAll('[data-block]')].filter(el => el !== item);
      const next = others.find((el) => {
        const r = el.getBoundingClientRect();
        const shift = new DOMMatrixReadOnly(getComputedStyle(el).transform).m42;
        return pointerY < r.top - shift + r.height / 2;
      });
      // The row above the next card, or the closing "Add block" row when dropping at the end
      const beforeEl = next ? next.previousElementSibling : list.lastElementChild;
      const already = item.nextElementSibling === beforeEl;
      if (!already) place(beforeEl);
      follow();
    };

    const finish = (commit) => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('keydown', escape, true);
      // Cancelling just redraws from the order the blocks had before the drag
      if (commit) blocks = [...list.querySelectorAll('[data-block]')].map(el => find(blocks, el.dataset.block));
      list.removeAttribute('data-reordering');
      renderList();
    };
    const up = () => finish(true);
    const escape = (ev) => {
      if (ev.key !== 'Escape') return;
      ev.preventDefault();
      ev.stopPropagation();
      finish(false);
    };

    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('keydown', escape, true);
  });

  document.getElementById('savePage').addEventListener('click', () => {
    saved = JSON.stringify(blocks);
    renderList();
    window.toast?.success('About saved');
  });

  // ---------------------------------------------------------------------------
  // The stacked sheet
  // ---------------------------------------------------------------------------

  const sheet = document.getElementById('blockSheet');
  const header = document.getElementById('blockSheetHeader');
  const body = document.getElementById('blockSheetBody');
  const footer = document.getElementById('blockSheetFooter');
  let stack = [];
  let confirming = null;

  function blockFrame(id) {
    const block = find(blocks, id);
    return { kind: 'block', blockId: id, type: block.type, label: TYPES[block.type].name, draft: structuredClone(block.data), initial: JSON.stringify(block.data), tab: 'content' };
  }

  function newBlockFrame(type, at) {
    const data = structuredClone(TYPES[type].defaults);
    return { kind: 'block', isNew: true, at, type, label: `New ${TYPES[type].name.toLowerCase()} block`, draft: data, initial: JSON.stringify(data), tab: 'content' };
  }

  function typePicker(at) {
    return { kind: 'types', at, label: 'Add a block', initial: '', draft: null };
  }

  function lookupFrame(key, owner) {
    const multiple = key === 'projects';
    const selected = multiple ? [...owner.draft.projects] : [owner.draft.image].filter(Boolean);
    return { kind: key === 'projects' ? 'projects' : 'images', label: multiple ? 'Choose projects' : 'Choose an image', multiple, selected, initial: JSON.stringify(selected), owner, key };
  }

  const dirty = frame => (frame.kind === 'types' ? false
    : frame.kind === 'block' ? JSON.stringify(frame.draft) !== frame.initial
      : JSON.stringify(frame.selected) !== frame.initial);

  const top = () => stack[stack.length - 1];

  function open(frames) {
    stack = frames;
    confirming = null;
    render('forward');
    if (!sheet.open) sheet.showModal();
    renderList();
  }

  function push(frame) {
    stack.push(frame);
    confirming = null;
    render('forward');
  }

  function back(toDepth = stack.length - 1, confirmed = false) {
    const changed = stack.slice(toDepth).filter(dirty);
    if (changed.length && !confirmed) {
      confirming = { toDepth, names: changed.map(f => f.label) };
      renderFooter();
      footer.querySelector('[data-keep]')?.focus();
      return;
    }
    stack = stack.slice(0, toDepth);
    confirming = null;
    if (!stack.length) {
      sheet.close();
      renderList();
      return;
    }
    render('back');
  }

  function render(direction) {
    renderHeader();
    const frame = top();
    const view = frame.kind === 'block' ? blockView(frame) : frame.kind === 'types' ? typesView() : lookupView(frame);
    body.innerHTML = `<div class="blk-view" data-from="${direction}">${view}</div>`;
    renderFooter();
    window.Parallelogram?.init(body);
    body.querySelector('[data-autofocus]')?.focus();
  }

  function renderHeader() {
    const frame = top();
    const trail = ['About', 'Content', ...stack.slice(0, -1).map(f => f.label)];
    const crumbs = trail.map((label, i) => {
      const depth = i - 1;
      const link = depth >= 1 ? `<button type="button" class="breadcrumb__link" data-crumb="${depth}">${escape(label)}</button>` : `<span class="breadcrumb__link">${escape(label)}</span>`;
      return `${i ? `<li class="breadcrumb__item" aria-hidden="true"><span class="breadcrumb__separator">${ICONS.chevron}</span></li>` : ''}<li class="breadcrumb__item">${link}</li>`;
    }).join('');
    const title = frame.kind === 'block' && !frame.isNew ? (TYPES[frame.type].title ? TYPES[frame.type].title(frame.draft) : frame.draft.heading) || frame.label : frame.label;
    const description = frame.kind === 'block' && !frame.isNew ? `<p class="sheet__description">${escape(TYPES[frame.type].name)} block</p>` : '';
    header.innerHTML = `
      <div class="blk-head">
        ${stack.length > 1 ? `<button type="button" class="btn btn--ghost btn--icon btn--sm" data-back aria-label="Back to ${escape(stack[stack.length - 2].label)}" data-tooltip="Back" data-tooltip-position="bottom">${ICONS.back}</button>` : ''}
        <div style="min-width: 0;">
          <nav class="breadcrumb" aria-label="Where you are"><ol class="breadcrumb__list">${crumbs}</ol></nav>
          <h3 class="sheet__title" id="blockSheetTitle">${escape(title)}</h3>
          ${description}
        </div>
      </div>
      <button type="button" class="sheet__close" data-sheet-close aria-label="Close">${ICONS.remove}</button>`;
  }

  function renderFooter() {
    const frame = top();
    if (confirming) {
      footer.innerHTML = `
        <div class="blk-confirm" role="alert">
          <span>Discard your changes to ${escape(confirming.names.join(' and '))}?</span>
          <button type="button" class="btn btn--ghost btn--sm" data-keep>Keep editing</button>
          <button type="button" class="btn btn--destructive btn--sm" data-discard>${ICONS.remove}Discard</button>
        </div>`;
      return;
    }
    if (frame.kind === 'types') {
      footer.innerHTML = `<div class="cluster cluster--sm" style="margin-left: auto;"><button type="button" class="btn btn--outline" data-cancel>${ICONS.remove}Cancel</button></div>`;
      return;
    }
    const note = frame.kind === 'block'
      ? (dirty(frame) ? '<span class="badge badge--warning-muted">Unsaved changes</span>' : '')
      : `<span class="text--sm text--muted">${frame.selected.length} selected</span>`;
    const primary = frame.kind === 'block' && frame.isNew ? 'Add block' : 'Done';
    footer.innerHTML = `
      ${note}
      <div class="cluster cluster--sm" style="margin-left: auto;">
        <button type="button" class="btn btn--outline" data-cancel>${ICONS.remove}Cancel</button>
        <button type="button" class="btn btn--primary" data-done>${ICONS.check}${primary}</button>
      </div>`;
  }

  // ---------------------------------------------------------------------------
  // Views
  // ---------------------------------------------------------------------------

  function field(f, value, frame) {
    const id = `f-${f.key}`;
    const required = f.required ? ' <span class="text--destructive" aria-hidden="true">*</span>' : '';
    const hint = f.hint ? `<p class="blk-field-hint">${escape(f.hint)}</p>` : '';
    if (f.type === 'image') {
      const image = value && find(IMAGES, value);
      return `
        <div class="form__field">
          <span class="form__label">${f.label}</span>
          <div class="blk-image">
            <span class="blk-image__preview">${image ? `<img src="${image.src}" alt="">` : ICONS.photo}</span>
            <div class="cluster cluster--xs">
              <button type="button" class="btn btn--outline btn--sm" data-lookup="image">${ICONS.photo}${image ? 'Change' : 'Choose image'}</button>
              ${image ? `<button type="button" class="btn btn--ghost btn--sm" data-clear="image">${ICONS.remove}Remove</button>` : ''}
            </div>
          </div>
        </div>`;
    }
    if (f.type === 'lookup') {
      const rows = frame.draft.projects.map((id) => {
        const p = find(PROJECTS, id);
        return `<li class="blk-pick"><img src="${p.image}" alt=""><span><strong class="text--sm">${escape(p.title)}</strong><br><span class="text--xs text--muted">${escape(p.meta)}</span></span><button type="button" class="btn btn--ghost btn--icon btn--sm" data-unpick="${id}" aria-label="Remove ${escape(p.title)}" data-tooltip="Remove" data-tooltip-position="left">${ICONS.remove}</button></li>`;
      }).join('');
      return `
        <div class="form__field">
          <span class="form__label">${f.label}</span>
          ${rows ? `<ul class="blk-picks">${rows}</ul>` : '<p class="blk-field-hint">No projects chosen yet.</p>'}
          <div><button type="button" class="btn btn--outline btn--sm" data-lookup="projects">${ICONS.plus}Choose projects</button></div>
        </div>`;
    }
    if (f.type === 'textarea') {
      return `<div class="form__field"><label class="form__label" for="${id}">${f.label}${required}</label><textarea class="textarea form__control" id="${id}" rows="4" data-field="${f.key}">${escape(value)}</textarea>${hint}</div>`;
    }
    if (f.type === 'segment') {
      return `
        <div class="form__field">
          <span class="form__label" id="${id}">${f.label}</span>
          <div class="segmented-control" data-segment="${f.key}">
            <div class="segmented-control__list" role="radiogroup" aria-labelledby="${id}">
              ${f.options.map(([v, label, ic]) => `<button type="button" class="segmented-control__item" role="radio" aria-checked="${v === value}" data-value="${v}">${ic || ''}${label}</button>`).join('')}
            </div>
          </div>
          ${hint}
        </div>`;
    }
    if (f.type === 'swatch') {
      return `
        <div class="form__field">
          <span class="form__label" id="${id}">${f.label}</span>
          <div class="blk-swatches" role="radiogroup" aria-labelledby="${id}" data-swatch="${f.key}">
            ${f.options.map(([v, label, color]) => `<button type="button" class="blk-swatch" role="radio" aria-checked="${v === value}" data-value="${v}"><span style="background: ${color};"></span><span>${label}</span></button>`).join('')}
          </div>
        </div>`;
    }
    return `<div class="form__field"><label class="form__label" for="${id}">${f.label}${required}</label><input type="text" class="input form__control" id="${id}" data-field="${f.key}" value="${escape(value)}" placeholder="${escape(f.placeholder || '')}">${hint}</div>`;
  }

  function blockView(frame) {
    const type = TYPES[frame.type];
    const tab = (name, label) => `<button type="button" class="tabs__trigger" data-tab="blk-${name}" aria-selected="${frame.tab === name}">${label}</button>`;
    const panel = (name, fields) => `<div id="blk-${name}" data-tab-panel class="stack stack--md"${frame.tab === name ? '' : ' hidden'}>${fields.map(f => field(f, frame.draft[f.key], frame)).join('')}</div>`;
    return `
      <div class="tabs tabs--underline" data-tabs>
        <div class="tabs__list" data-tabs-list>${tab('content', 'Content')}${tab('layout', 'Layout')}</div>
        <div class="tabs__content mt--md" data-tabs-panels>${panel('content', type.content)}${panel('layout', type.layout)}</div>
      </div>`;
  }

  function typesView() {
    return `
      <div class="blk-types">
        ${Object.entries(TYPES).map(([key, t]) => `
          <button type="button" class="blk-type" data-type="${key}">
            <span class="blk-type__icon">${t.icon}</span>
            <span class="blk-type__name">${escape(t.name)}</span>
            <span class="blk-type__text">${escape(t.text)}</span>
          </button>`).join('')}
      </div>`;
  }

  function lookupView(frame) {
    if (frame.kind === 'images') {
      return `<div class="blk-images" role="radiogroup" aria-label="Images">${IMAGES.map(img => `<button type="button" role="radio" aria-checked="${frame.selected.includes(img.id)}" data-pick="${img.id}" aria-label="${escape(img.name)}"><img src="${img.src}" alt=""></button>`).join('')}</div>`;
    }
    return `<div class="blk-images" role="group" aria-label="Projects">${PROJECTS.map(p => `<button type="button" role="checkbox" aria-checked="${frame.selected.includes(p.id)}" data-pick="${p.id}" aria-label="${escape(p.title)}" data-tooltip="${escape(p.title)}" data-tooltip-position="bottom"><img src="${p.image}" alt=""></button>`).join('')}</div>`;
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
    if (t.closest('[data-sheet-close]')) return back(0);
    if (t.closest('[data-back]')) return back();
    const crumb = t.closest('[data-crumb]');
    if (crumb) return back(Number(crumb.dataset.crumb));
    if (t.closest('[data-cancel]')) return back();
    if (t.closest('[data-keep]')) {
      confirming = null;
      renderFooter();
      return undefined;
    }
    if (t.closest('[data-discard]')) return back(confirming.toDepth, true);

    const frame = top();
    const tabBtn = t.closest('[data-tab]');
    if (tabBtn) frame.tab = tabBtn.dataset.tab.replace('blk-', '');

    if (t.closest('[data-done]')) return done(frame);

    const type = t.closest('[data-type]');
    if (type) {
      const at = frame.at;
      stack.pop();
      return push(newBlockFrame(type.dataset.type, at));
    }
    const lookup = t.closest('[data-lookup]');
    if (lookup) return push(lookupFrame(lookup.dataset.lookup, frame));
    const clear = t.closest('[data-clear]');
    if (clear) {
      frame.draft[clear.dataset.clear] = null;
      return render('same');
    }
    const unpick = t.closest('[data-unpick]');
    if (unpick) {
      frame.draft.projects = frame.draft.projects.filter(id => id !== unpick.dataset.unpick);
      return render('same');
    }
    const pick = t.closest('[data-pick]');
    if (pick) {
      const id = pick.dataset.pick;
      frame.selected = frame.multiple ? (frame.selected.includes(id) ? frame.selected.filter(s => s !== id) : [...frame.selected, id]) : [id];
      body.querySelectorAll('[data-pick]').forEach((el) => { el.setAttribute('aria-checked', String(frame.selected.includes(el.dataset.pick))); });
      renderFooter();
      return undefined;
    }
    const swatch = t.closest('[data-swatch] [data-value]');
    if (swatch) {
      const key = swatch.closest('[data-swatch]').dataset.swatch;
      frame.draft[key] = swatch.dataset.value;
      swatch.parentElement.querySelectorAll('[data-value]').forEach((el) => { el.setAttribute('aria-checked', String(el === swatch)); });
      renderFooter();
    }
    return undefined;
  });

  // Segmented controls report their choice through the library's event
  sheet.addEventListener('segmented-control:change', (e) => {
    const control = e.target.closest('[data-segment]');
    if (!control) return;
    top().draft[control.dataset.segment] = e.detail.item.dataset.value;
    renderFooter();
  });

  sheet.addEventListener('input', (e) => {
    const key = e.target.dataset.field;
    if (!key) return;
    top().draft[key] = e.target.value;
    renderFooter();
  });

  /** Done hands a picker's choice back to the block, or a block's changes back to the page. */
  function done(frame) {
    if (frame.kind === 'images' || frame.kind === 'projects') {
      if (frame.key === 'image') frame.owner.draft.image = frame.selected[0] || null;
      else frame.owner.draft.projects = frame.selected;
      stack.pop();
      return render('back');
    }
    if (frame.isNew) {
      const block = { id: `b${nextId++}`, type: frame.type, hidden: false, data: frame.draft };
      blocks.splice(frame.at, 0, block);
    } else {
      find(blocks, frame.blockId).data = frame.draft;
    }
    stack = [];
    sheet.close();
    renderList();
    return undefined;
  }

  renderList();
})();
