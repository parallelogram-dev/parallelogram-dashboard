// ============================================================================
// Chart Component
// ============================================================================

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs = {}, parent = null) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  parent?.append(el);
  return el;
}

/** Round up to a clean axis maximum: 1, 2, 2.5 or 5 times a power of ten. */
function niceMax(value) {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  return [1, 2, 2.5, 5, 10].find(step => step * power >= value) * power;
}

/**
 * Renders a data <table> inside <figure class="chart" data-chart="..."> as an SVG chart.
 *
 * Types: line, area, bar (grouped when there are several series) and stacked-bar.
 * The first column holds the x labels and every other column is a series. Cells may carry
 * data-value when their text is formatted. data-chart-format is "number", "currency" or
 * "percent". The table stays in the page as the accessible table view.
 */
export class Chart {
  constructor() {
    this.elements = new WeakMap();
  }

  mount(figure) {
    if (this.elements.has(figure)) return;
    const table = figure.querySelector('table');
    if (!table) return;

    const data = this._parse(table);
    if (!data.rows.length || !data.series.length) return;

    const state = {
      figure,
      table,
      data,
      type: figure.dataset.chart || 'line',
      format: this._formatter(figure.dataset.chartFormat),
      plot: document.createElement('div'),
      tooltip: document.createElement('div'),
      index: null,
    };

    table.classList.add('chart__table');
    table.hidden = true;

    state.plot.className = 'chart__plot';
    state.plot.tabIndex = 0;
    state.plot.setAttribute('role', 'group');
    const title = figure.querySelector('.chart__title')?.textContent.trim() || 'Chart';
    state.plot.setAttribute('aria-label', `${title}. Use the arrow keys to read values.`);

    state.tooltip.className = 'chart__tooltip';
    state.tooltip.hidden = true;
    state.tooltip.setAttribute('aria-live', 'polite');

    const legend = data.series.length > 1 ? this._legend(state) : null;
    table.before(...[legend, state.plot].filter(Boolean));
    this._addTableToggle(state, legend);

    state.plot.addEventListener('keydown', (e) => this._handleKey(e, state));
    state.plot.addEventListener('focus', () => this._show(state, state.index ?? data.rows.length - 1));
    state.plot.addEventListener('blur', () => this._hide(state));
    state.plot.addEventListener('pointerleave', () => this._hide(state));

    // Render now; the observer re-renders on resize (it may not fire in a background tab)
    this._render(state);
    new ResizeObserver(() => this._render(state)).observe(state.plot);
    figure.setAttribute('data-chart-enhanced', 'true');
    this.elements.set(figure, state);
  }

  _parse(table) {
    const headers = [...table.querySelectorAll('thead th')].map(th => th.textContent.trim());
    const rows = [...table.querySelectorAll('tbody tr')].map(tr => {
      const cells = [...tr.children];
      return {
        label: cells[0]?.textContent.trim() ?? '',
        values: cells.slice(1).map(cell => {
          const raw = cell.dataset.value ?? cell.textContent.replace(/[^0-9.\-]/g, '');
          return Number.parseFloat(raw) || 0;
        }),
      };
    });
    return { series: headers.slice(1), rows };
  }

  _formatter(kind) {
    const options = {
      currency: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
      percent: { style: 'percent', maximumFractionDigits: 1 },
    }[kind] || { maximumFractionDigits: 1 };
    const full = new Intl.NumberFormat('en-US', options);
    const compact = new Intl.NumberFormat('en-US', { ...options, notation: 'compact', maximumFractionDigits: 1 });
    const scale = kind === 'percent' ? 0.01 : 1;
    return {
      full: value => full.format(value * scale),
      compact: value => compact.format(value * scale),
    };
  }

  _legend(state) {
    const legend = document.createElement('ul');
    legend.className = 'chart__legend';
    const isBar = state.type.includes('bar');
    state.data.series.forEach((name, i) => {
      const item = document.createElement('li');
      item.className = 'chart__legend-item';
      const key = document.createElement('span');
      key.className = isBar ? 'chart__key chart__key--box' : 'chart__key';
      key.style.color = `var(--chart-${i + 1})`;
      item.append(key, document.createTextNode(name));
      legend.append(item);
    });
    return legend;
  }

  _addTableToggle(state, legend) {
    const header = state.figure.querySelector('.chart__header');
    if (!header) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn--ghost btn--sm';
    button.textContent = 'Table';
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      const showTable = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(showTable));
      state.table.hidden = !showTable;
      state.plot.hidden = showTable;
      if (legend) legend.hidden = showTable;
    });
    header.append(button);
  }

  _render(state) {
    const { plot, data, type, format } = state;
    const width = plot.clientWidth;
    const height = plot.clientHeight;
    if (!width || !height) return;

    const stacked = type === 'stacked-bar';
    const isBar = type.includes('bar');
    const n = data.rows.length;
    const peak = Math.max(...data.rows.map(r => (stacked ? r.values.reduce((a, b) => a + b, 0) : Math.max(...r.values))));
    const max = niceMax(peak);
    const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => t * max);

    const tickWidth = Math.max(...ticks.map(t => format.compact(t).length)) * 6.5 + 8;
    const endLabel = !isBar && data.series.length === 1 ? format.compact(data.rows[n - 1].values[0]).length * 6.5 + 10 : 8;
    const box = { left: tickWidth, right: width - endLabel, top: 8, bottom: height - 22 };
    const y = value => box.bottom - (value / max) * (box.bottom - box.top);
    const band = (box.right - box.left) / n;
    const x = isBar
      ? i => box.left + band * (i + 0.5)
      : i => box.left + (n === 1 ? 0 : (i * (box.right - box.left)) / (n - 1));
    state.geometry = { box, x, band, isBar };

    const root = svgEl('svg', { 'aria-hidden': 'true' });

    for (const t of ticks) {
      svgEl('line', { class: t ? 'chart__grid' : 'chart__baseline', x1: box.left, x2: box.right, y1: y(t), y2: y(t) }, root);
      svgEl('text', { class: 'chart__tick', x: box.left - 8, y: y(t), 'text-anchor': 'end', 'dominant-baseline': 'middle' }, root)
        .textContent = format.compact(t);
    }

    const labelWidth = Math.max(...data.rows.map(r => r.label.length)) * 6.5 + 12;
    const slot = (box.right - box.left) / (isBar ? n : Math.max(1, n - 1));
    const every = Math.max(1, Math.ceil(labelWidth / slot));
    data.rows.forEach((row, i) => {
      // Skip labels that would crowd their neighbours, keeping the last one and the space before it
      if (i % every !== 0 && i !== n - 1) return;
      if (i !== n - 1 && i % every === 0 && n - 1 - i < every) return;
      const anchor = isBar ? 'middle' : i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle';
      svgEl('text', { class: 'chart__tick', x: x(i), y: height - 6, 'text-anchor': anchor }, root).textContent = row.label;
    });

    if (isBar) {
      this._renderBars(state, root, y, stacked);
    } else {
      this._renderLines(state, root, y, type === 'area');
    }

    state.crosshair = svgEl('line', { class: 'chart__crosshair', y1: box.top, y2: box.bottom, visibility: 'hidden' }, root);
    state.hoverDots = data.series.map((_, s) => svgEl('circle', { class: 'chart__dot', r: 4, fill: `var(--chart-${s + 1})`, visibility: 'hidden' }, root));
    if (isBar) state.hoverDots.forEach(dot => dot.remove());

    const hit = svgEl('rect', { class: 'chart__hit', x: box.left, y: box.top, width: box.right - box.left, height: box.bottom - box.top }, root);
    hit.addEventListener('pointermove', (e) => {
      const bounds = plot.getBoundingClientRect();
      const px = e.clientX - bounds.left;
      const i = isBar
        ? Math.floor((px - box.left) / band)
        : Math.round(((px - box.left) / (box.right - box.left)) * (n - 1));
      this._show(state, Math.min(n - 1, Math.max(0, i)));
    });

    plot.replaceChildren(root, state.tooltip);
    if (state.index !== null && !state.tooltip.hidden) this._show(state, state.index);
  }

  _renderLines(state, root, y, area) {
    const { data, format } = state;
    const { box, x } = state.geometry;
    data.series.forEach((name, s) => {
      const color = `var(--chart-${s + 1})`;
      const points = data.rows.map((row, i) => [x(i), y(row.values[s])]);
      const line = points.map(([px, py], i) => `${i ? 'L' : 'M'}${px},${py}`).join(' ');
      if (area || data.series.length === 1) {
        svgEl('path', { class: 'chart__area', d: `${line} L${points.at(-1)[0]},${box.bottom} L${points[0][0]},${box.bottom} Z`, fill: color }, root);
      }
      svgEl('path', { class: 'chart__line', d: line, stroke: color }, root);
      const [ex, ey] = points.at(-1);
      svgEl('circle', { class: 'chart__dot', cx: ex, cy: ey, r: 4, fill: color }, root);
      if (data.series.length === 1) {
        svgEl('text', { class: 'chart__label', x: ex + 8, y: ey, 'dominant-baseline': 'middle' }, root)
          .textContent = format.compact(data.rows.at(-1).values[s]);
      }
    });
  }

  _renderBars(state, root, y, stacked) {
    const { data } = state;
    const { box, x, band } = state.geometry;
    const groups = stacked ? 1 : data.series.length;
    const gap = 2;
    const barWidth = Math.max(2, Math.min(24, (band * 0.7 - gap * (groups - 1)) / groups));
    const groupWidth = barWidth * groups + gap * (groups - 1);
    state.bars = data.rows.map(() => []);

    data.rows.forEach((row, i) => {
      let base = 0;
      row.values.forEach((value, s) => {
        if (value <= 0) return;
        const left = x(i) - groupWidth / 2 + (stacked ? 0 : s * (barWidth + gap));
        const bottom = y(base);
        const top = y(base + value);
        const isTop = !stacked || row.values.slice(s + 1).every(v => v <= 0);
        const r = isTop ? Math.min(4, barWidth / 2, bottom - top) : 0;
        const d = `M${left},${bottom} V${top + r} Q${left},${top} ${left + r},${top} H${left + barWidth - r} Q${left + barWidth},${top} ${left + barWidth},${top + r} V${bottom} Z`;
        state.bars[i].push(svgEl('path', { class: 'chart__bar', d, fill: `var(--chart-${s + 1})` }, root));
        if (stacked) base += value;
      });
    });
  }

  _show(state, index) {
    const { data, format, tooltip, geometry } = state;
    if (!geometry) return;
    state.index = index;
    const row = data.rows[index];
    const { box, x, isBar } = geometry;
    const px = x(index);

    if (isBar) {
      state.bars.flat().forEach(bar => bar.classList.remove('chart__bar--active'));
      state.bars[index].forEach(bar => bar.classList.add('chart__bar--active'));
    } else {
      state.crosshair.setAttribute('x1', px);
      state.crosshair.setAttribute('x2', px);
      state.crosshair.setAttribute('visibility', 'visible');
      const max = niceMax(Math.max(...data.rows.map(r => Math.max(...r.values))));
      state.hoverDots.forEach((dot, s) => {
        dot.setAttribute('cx', px);
        dot.setAttribute('cy', box.bottom - (row.values[s] / max) * (box.bottom - box.top));
        dot.setAttribute('visibility', 'visible');
      });
    }

    const heading = document.createElement('div');
    heading.className = 'chart__tooltip-title';
    heading.textContent = row.label;
    const rows = data.series.map((name, s) => {
      const line = document.createElement('div');
      line.className = 'chart__tooltip-row';
      const key = document.createElement('span');
      key.className = 'chart__key';
      key.style.color = `var(--chart-${s + 1})`;
      const value = document.createElement('strong');
      value.textContent = format.full(row.values[s]);
      const label = document.createElement('span');
      label.textContent = name;
      line.append(key, value, label);
      return line;
    });
    if (state.type === 'stacked-bar' && data.series.length > 1) {
      const total = document.createElement('div');
      total.className = 'chart__tooltip-row';
      const value = document.createElement('strong');
      value.textContent = format.full(row.values.reduce((a, b) => a + b, 0));
      const label = document.createElement('span');
      label.textContent = 'Total';
      total.append(document.createElement('span'), value, label);
      rows.push(total);
    }
    tooltip.replaceChildren(heading, ...rows);
    tooltip.hidden = false;

    const tipWidth = tooltip.offsetWidth;
    const left = px + 12 + tipWidth > state.plot.clientWidth ? px - 12 - tipWidth : px + 12;
    tooltip.style.left = `${Math.max(0, left)}px`;
    tooltip.style.top = `${box.top}px`;
  }

  _hide(state) {
    state.tooltip.hidden = true;
    state.crosshair?.setAttribute('visibility', 'hidden');
    state.hoverDots?.forEach(dot => dot.setAttribute('visibility', 'hidden'));
    state.bars?.flat().forEach(bar => bar.classList.remove('chart__bar--active'));
  }

  _handleKey(event, state) {
    const last = state.data.rows.length - 1;
    const current = state.index ?? last;
    const next = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: last }[event.key];
    if (event.key === 'Escape') {
      this._hide(state);
      return;
    }
    if (next === undefined) return;
    event.preventDefault();
    this._show(state, Math.min(last, Math.max(0, next)));
  }

  static enhanceAll(selector = '[data-chart]', root = document) {
    const instance = new Chart();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}
