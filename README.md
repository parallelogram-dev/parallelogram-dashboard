# Parallelogram Dashboard

A BEM-style CSS dashboard component library inspired by shadcn/ui. Built with SCSS, vanilla JavaScript, and zero framework dependencies.

## Quick Start

```bash
# Install dependencies
npm install

# Build CSS
npm run build

# Watch for changes during development
npm run watch

# Serve the demo pages at http://localhost:8080 (no caching, so edits show on reload)
npm run serve
```

## Component Pages and Playground

`demo/index.html` links to one page per component in `demo/components/`, each with examples and,
where available, a live playground: controls for every variant, size and state, an "All variants"
grid, viewport widths and copyable markup. Each variant is labelled with its BEM classes, with
buttons to copy the class list (`btn btn--outline btn--sm`) or a CSS selector (`.btn.btn--outline.btn--sm`).
The playground state is kept in the URL hash, e.g. `components/button.html#variant=destructive&size=sm`.

- `demo/js/components/manifest.js` lists every page, its group and the SCSS partial it documents.
- `demo/js/playground/specs/` holds one spec per component: controls, presets, a `target` selector for
  the element the variants apply to, and a `render(state)` function returning HTML. Register specs in
  `specs/index.js` and set `spec` on the component's manifest entry.

`npm run playground:check` fails if a spec never renders a class its SCSS `sources` define, or if a
component partial has no page, and lists pages still without a playground. It runs in CI before the
demo is deployed to GitHub Pages.

### LLM references

`npm run build` generates [llms.txt](https://llmstxt.org) files (git-ignored, published with the demo):
`demo/llms.txt` lists every component with usage rules, `demo/llms/<slug>.md` holds each component's
classes, modifiers and example markup, and `demo/llms-full.txt` concatenates them all. Each component page
has a **Copy for LLM** button that copies its reference plus the current playground markup. Links use
`SITE_URL` (default: the GitHub Pages address).

`npm run build` also copies `@parallelogram-js/core` into `demo/vendor/` (git-ignored); the demo pages
load `<p-modal>`, `<p-datetime>` and the modal trigger from there. Pages must be served over HTTP
(`npm run serve`) because they use ES modules, which browsers block on `file://` URLs.

## File Structure

```
parallelogram-dashboard/
├── scss/                       # SCSS source files
│   ├── _variables.scss         # Design tokens (colors, spacing, etc.)
│   ├── _mixins.scss            # Reusable SCSS mixins
│   ├── _base.scss              # Reset & base styles
│   ├── _utilities.scss         # Utility classes
│   ├── _icon.scss              # Icon styles
│   ├── _demo.scss              # Demo-specific styles
│   ├── components/             # Component styles
│   │   ├── _accordion.scss
│   │   ├── _alert.scss
│   │   ├── _avatar.scss
│   │   ├── _badge.scss
│   │   ├── _banner.scss
│   │   ├── _breadcrumb.scss
│   │   ├── _button.scss
│   │   ├── _card.scss
│   │   ├── _command.scss
│   │   ├── _dashboard.scss
│   │   ├── _data-list.scss
│   │   ├── _dropdown.scss
│   │   ├── _empty.scss
│   │   ├── _form-layout.scss
│   │   ├── _input.scss
│   │   ├── _modal.scss
│   │   ├── _navbar.scss
│   │   ├── _pagination.scss
│   │   ├── _progress.scss
│   │   ├── _separator.scss
│   │   ├── _sheet.scss
│   │   ├── _sidebar.scss
│   │   ├── _skeleton.scss
│   │   ├── _stat.scss
│   │   ├── _table.scss
│   │   ├── _tabs.scss
│   │   ├── _timeline.scss
│   │   ├── _toast.scss
│   │   ├── _toolbar.scss
│   │   └── _tooltip.scss
│   └── main.scss               # Main entry point
├── demo/                       # Demo pages & assets
│   ├── css/                    # Built CSS (auto-copied on build)
│   ├── js/
│   │   └── main.js             # JavaScript components
│   └── *.html                  # Demo template pages
├── dist/                       # Distribution folder
└── package.json
```

---

## Design System

### Colors

Colors are defined as CSS custom properties for easy theming. Edit `scss/_variables.scss` to customize.

#### Semantic Colors

| Variable | Light | Dark | Usage |
|----------|-------|------|-------|
| `--bg` | zinc-50 | zinc-950 | Page background |
| `--fg` | zinc-950 | zinc-50 | Primary text |
| `--fg-muted` | zinc-500 | zinc-400 | Secondary text |
| `--border` | zinc-200 | zinc-800 | Borders |
| `--primary` | zinc-900 | zinc-50 | Primary actions |
| `--secondary` | zinc-100 | zinc-800 | Secondary actions |
| `--destructive` | red-500 | red-600 | Destructive actions |
| `--success` | green-500 | green-500 | Success states |
| `--warning` | amber-500 | amber-500 | Warning states |
| `--info` | blue-500 | blue-500 | Info states |

#### Component Colors

| Variable | Usage |
|----------|-------|
| `--card` | Card backgrounds |
| `--popover` | Dropdown/popover backgrounds |
| `--input` | Input borders |
| `--accent` | Hover highlights |
| `--ring` | Focus rings |

### Spacing Scale

Consistent spacing using size-based naming:

| Variable | Value | Pixels |
|----------|-------|--------|
| `$spacing-3xs` | 0.25rem | 4px |
| `$spacing-2xs` | 0.5rem | 8px |
| `$spacing-xs` | 0.75rem | 12px |
| `$spacing-sm` | 1rem | 16px |
| `$spacing-md` | 1.25rem | 20px |
| `$spacing-lg` | 1.5rem | 24px |
| `$spacing-xl` | 2rem | 32px |
| `$spacing-2xl` | 2.5rem | 40px |
| `$spacing-3xl` | 3rem | 48px |
| `$spacing-4xl` | 4rem | 64px |

### Typography

```scss
// Font families
$font-sans: ui-sans-serif, system-ui, -apple-system, ...;
$font-mono: ui-monospace, SFMono-Regular, ...;

// Font sizes
$font-size-xs: 0.75rem;    // 12px
$font-size-sm: 0.875rem;   // 14px
$font-size-base: 1rem;     // 16px
$font-size-lg: 1.125rem;   // 18px
$font-size-xl: 1.25rem;    // 20px
$font-size-2xl: 1.5rem;    // 24px
$font-size-3xl: 1.875rem;  // 30px
$font-size-4xl: 2.25rem;   // 36px

// Heading scale (h6 → h1): each level is the ratio times the one below, from 1rem.
// Below the md breakpoint the gentler ratio keeps h1 readable on phones.
$type-scale-ratio: 1.333;     // 16 / 21 / 28 / 38 / 50 / 67px
$type-scale-ratio-sm: 1.2;    // 16 / 19 / 23 / 28 / 33 / 40px

// Font weights
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
```

### Border Radius

```scss
$radius-sm: 0.25rem;   // 4px
$radius-md: 0.375rem;  // 6px
$radius-lg: 0.5rem;    // 8px (default)
$radius-xl: 0.75rem;   // 12px
$radius-full: 9999px;  // Pill/circle
```

### Shadows

```scss
$shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
$shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), ...;
$shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), ...;
$shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), ...;
```

### Breakpoints

```scss
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
$breakpoint-2xl: 1536px;

// Usage with mixins
@include sm { ... }     // min-width: 640px
@include md { ... }     // min-width: 768px
@include lg { ... }     // min-width: 1024px
@include max-sm { ... } // max-width: 639px
@include max-md { ... } // max-width: 767px
```

---

## BEM Naming Convention

This library follows strict BEM (Block Element Modifier) naming:

```
.block
.block__element
.block--modifier
.block__element--modifier
```

### Rules

1. **Blocks** use single words or camelCase: `.card`, `.navmenu`, `.datalist`
2. **Elements** use double underscore: `.card__header`, `.card__title`
3. **Modifiers** use double hyphen: `.card--elevated`, `.btn--primary`
4. **No nesting beyond one level**: Use `.card__title` not `.card__header__title`

### Examples

```html
<!-- Block with modifiers -->
<div class="card card--elevated">

  <!-- Elements -->
  <div class="card__header">
    <h3 class="card__title">Title</h3>
    <p class="card__description">Description</p>
  </div>

  <div class="card__content">
    Content here
  </div>

  <!-- Element with modifier -->
  <div class="card__footer card__footer--border">
    Footer
  </div>
</div>
```

---

## State Conventions

Classes describe what a component *looks like* (variant, size, layout). What a component *is
doing* — disabled, open, current, selected, invalid — is expressed with native HTML attributes,
pseudo-classes and ARIA states, and the stylesheet reads those directly. The markup that is
correct for assistive technology is then also the markup that gets styled, and scripts only
ever flip attributes.

| State | Markup | Applies to |
|---|---|---|
| Disabled | `disabled` on form controls; `aria-disabled="true"` on links and other non-form elements | `.btn`, `.input`, `.select`, `.textarea`, `.checkbox__input`, `.radio__input`, `.switch__input`, `.dropdown__item`, `.tabs__trigger`, `.pagination__item`, `.command__item`, nav items |
| Disabled wrapper | automatic via `:has(:disabled)` | `.checkbox`, `.radio`, `.switch` |
| Hidden | `hidden` (forced with `display: none !important`) | anything |
| Open (overlay) | `<dialog open>` (or `showModal()`) | `.modal`, `.modaloverlay`, `.sheet`, `.command`, `.navbarmobile` |
| Open (disclosure) | `aria-expanded="true"` on the trigger, or `<details open>` | `.accordion__item`, `.collapsible`, `.dropdown`, `.breadcrumb__dropdown`, `.sidebar__submenu`, `.subnav__submenu` |
| Current | `aria-current="page"` (navigation), `aria-current="step"` (steps) | `.navbar__item`, `.navbarmobile__item`, `.sidebar__item`, `.navmenu__item`, `.subnav__item`, `.subnav__subitem`, `.pagination__item`, `.breadcrumb__link`, `.steps__item` |
| Selected | `aria-selected="true"` | `.tabs__trigger` (`role="tab"`), `.command__item` (`role="option"`) |
| Pressed | `aria-pressed="true"` | `.btn` (toggle buttons), `.segmented-control__item`, `.filter__label` |
| Checked | `role="menuitemcheckbox" aria-checked="true"` | `.dropdown__item` (shows its `.dropdown__item-check`) |
| Invalid | `aria-invalid="true"`, or automatically via `:user-invalid` once the user has interacted | `.input`, `.select`, `.textarea`, `.checkbox__input`, `.radio__input` |
| Required | `required` on the control, plus an explicit `.formfield__required` marker in the label (not added automatically, so existing forms keep their look) | `.formfield` |
| Read-only | `readonly` | `.input`, `.textarea` |
| Busy | `aria-busy="true"` | `.btn` (pair with `disabled` and a `.btn__spinner`) |
| Sorted | `aria-sort="ascending"` / `"descending"` on the `<th>` | `.table__head`, `.table__sort-icon` |
| Search has value | automatic via `.toolbar__input:not(:placeholder-shown)` (the input needs a `placeholder`) | `.toolbar__clear` |

```html
<a class="btn btn--outline" href="#" aria-disabled="true" tabindex="-1">Archived</a>
<button class="btn" disabled aria-busy="true"><svg class="icon btn__icon btn__spinner">…</svg>Saving</button>

<input class="input" type="email" aria-invalid="true" aria-describedby="email-error">

<nav class="pagination">
  <button class="pagination__item" aria-current="page">1</button>
  <button class="pagination__item">2</button>
</nav>

<dialog class="sheet sheet--right" open>…</dialog>
```

**Content behind overlays.** When a `.modal`, `.sheet` or `.command` is open without
`showModal()`, mark the rest of the page `inert` so it cannot be focused or clicked, and remove
the attribute on close. `showModal()` does this for you.

```js
document.querySelector('.dashboard').inert = true;
```

**Still classes.** States with no native or ARIA equivalent remain modifiers for now:
`.sidebar--collapsed`, `.subnav--collapsed`, `.sidebar--open` / `.subnav--open` (mobile
off-canvas), `.sidebaroverlay--visible`, `.dashboard__overlay--visible`,
`.tooltip__content--visible`, `.steps__item--completed`, `.formfield__counter--warning` /
`--error`, and `.filter__label--active` (an applied-filter chip, not a toggle).

### Deprecated state classes

These classes still work for one release and will then be removed. `npm run playground:check`
warns when a playground spec or demo page renders one. The list lives in
`scripts/deprecated-states.mjs`.

| Deprecated class | Use instead |
|---|---|
| `.btn--disabled` | disabled, or aria-disabled="true" on <a> |
| `.input--disabled` | disabled |
| `.input--error` | aria-invalid="true" (or rely on :user-invalid) |
| `.checkbox--disabled` | disabled on the inner .checkbox__input |
| `.radio--disabled` | disabled on the inner .radio__input |
| `.formfield--error` | aria-invalid="true" on the control |
| `.accordion__item--open` | aria-expanded="true" on .accordion__trigger, or <details open> |
| `.collapsible--open` | aria-expanded="true" on .collapsible__trigger, or <details open> |
| `.dropdown--open` | aria-expanded="true" on .dropdown__trigger |
| `.dropdown__menu--open` | aria-expanded="true" on .dropdown__trigger |
| `.dropdown__item--active` | aria-current="true" |
| `.dropdown__item--disabled` | disabled, or aria-disabled="true" |
| `.dropdown__item-check--checked` | role="menuitemcheckbox" aria-checked="true" on .dropdown__item |
| `.tabs__trigger--active` | aria-selected="true" |
| `.tabs__trigger--disabled` | disabled, or aria-disabled="true" |
| `.segmented-control__item--active` | aria-pressed="true" |
| `.pagination__item--active` | aria-current="page" |
| `.pagination__item--disabled` | disabled, or aria-disabled="true" |
| `.breadcrumb__dropdown-menu--open` | aria-expanded="true" on .breadcrumb__dropdown-trigger |
| `.steps__item--active` | aria-current="step" |
| `.table__head--sorted` | aria-sort="ascending\|descending" on the <th> |
| `.table__sort-icon--asc` | aria-sort="ascending" on the <th> |
| `.table__sort-icon--desc` | aria-sort="descending" on the <th> |
| `.toolbar__clear--visible` | automatic: shown while .toolbar__input is not :placeholder-shown |
| `.command--open` | <dialog class="command" open> |
| `.command__item--selected` | role="option" aria-selected="true" |
| `.command__item--disabled` | aria-disabled="true" |
| `.modal--open` | <dialog class="modal" open> |
| `.modaloverlay--open` | [open] |
| `.sheet--open` | <dialog class="sheet" open> |
| `.navbar__item--active` | aria-current="page" |
| `.navbar__item--disabled` | aria-disabled="true" |
| `.navbarmobile--open` | <dialog class="navbarmobile" open> |
| `.navbarmobile__item--active` | aria-current="page" |
| `.sidebar__item--active` | aria-current="page" |
| `.sidebar__item--disabled` | aria-disabled="true" |
| `.sidebar__submenu--open` | aria-expanded="true" on the preceding .sidebar__item |
| `.navmenu__item--active` | aria-current="page" |
| `.subnav__item--active` | aria-current="page" |
| `.subnav__item--disabled` | aria-disabled="true" |
| `.subnav__subitem--active` | aria-current="page" |
| `.subnav__submenu--open` | aria-expanded="true" on the preceding .subnav__item |

---

## Components

### Button `.btn`

```html
<!-- Variants -->
<button class="btn btn--primary">Primary</button>
<button class="btn btn--secondary">Secondary</button>
<button class="btn btn--destructive">Destructive</button>
<button class="btn btn--outline">Outline</button>
<button class="btn btn--ghost">Ghost</button>
<button class="btn btn--link">Link</button>

<!-- Sizes -->
<button class="btn btn--sm">Small</button>
<button class="btn">Default</button>
<button class="btn btn--lg">Large</button>

<!-- Icon button -->
<button class="btn btn--icon">
  <svg class="icon">...</svg>
</button>

<!-- With icon -->
<button class="btn btn--primary">
  <svg class="icon">...</svg>
  Save Changes
</button>

<!-- Loading state -->
<button class="btn btn--primary btn--loading" disabled>
  <span class="btn__spinner"></span>
  Loading...
</button>

<!-- Full width -->
<button class="btn btn--primary w--full">Full Width</button>
```

### Card `.card`

```html
<div class="card">
  <div class="card__header">
    <h3 class="card__title">Card Title</h3>
    <p class="card__description">Optional description</p>
  </div>
  <div class="card__content">
    Card content goes here
  </div>
  <div class="card__footer">
    <button class="btn btn--outline">Cancel</button>
    <button class="btn btn--primary">Save</button>
  </div>
</div>

<!-- Variants -->
<div class="card card--elevated">...</div>  <!-- Drop shadow, no border -->
<div class="card card--ghost">...</div>     <!-- Transparent background -->
<div class="card card--interactive">...</div> <!-- Hover effects -->
<div class="card card--destructive">...</div> <!-- Red background -->

<!-- Padding sizes -->
<div class="card card--sm">...</div>  <!-- Smaller padding (0.75rem) -->
<div class="card card--lg">...</div>  <!-- Larger padding (1.5rem) -->

<!-- Header variants -->
<div class="card__header card__header--row">...</div>    <!-- Horizontal layout -->
<div class="card__header card__header--center">...</div> <!-- Centered -->

<!-- Content variants -->
<div class="card__content card__content--pt">...</div>   <!-- With top padding -->
<div class="card__content card__content--flush">...</div> <!-- No padding -->

<!-- Footer variants -->
<div class="card__footer card__footer--border">...</div>  <!-- Top border -->
<div class="card__footer card__footer--end">...</div>     <!-- Right aligned -->
<div class="card__footer card__footer--between">...</div> <!-- Space between -->
```

### Alert `.alert`

```html
<div class="alert">
  <svg class="icon alert__icon">...</svg>
  <div class="alert__content">
    <h4 class="alert__title">Heads up!</h4>
    <p class="alert__description">This is an alert message.</p>
  </div>
</div>

<!-- Variants -->
<div class="alert alert--destructive">...</div>
<div class="alert alert--success">...</div>
<div class="alert alert--warning">...</div>
<div class="alert alert--info">...</div>
```

### Badge `.badge`

```html
<span class="badge">Default</span>
<span class="badge badge--secondary">Secondary</span>
<span class="badge badge--outline">Outline</span>
<span class="badge badge--destructive">Destructive</span>

<!-- Muted variants (softer backgrounds) -->
<span class="badge badge--success-muted">Success</span>
<span class="badge badge--warning-muted">Warning</span>
<span class="badge badge--info-muted">Info</span>
<span class="badge badge--destructive-muted">Error</span>
```

### Avatar `.avatar`

```html
<!-- With image -->
<span class="avatar">
  <img src="user.jpg" alt="User" class="avatar__image">
</span>

<!-- With fallback initials -->
<span class="avatar">
  <span class="avatar__fallback">JD</span>
</span>

<!-- With status indicator -->
<span class="avatar">
  <span class="avatar__fallback">JD</span>
  <span class="avatar__status avatar__status--online"></span>
</span>

<!-- Sizes -->
<span class="avatar avatar--sm">...</span>
<span class="avatar">...</span>
<span class="avatar avatar--lg">...</span>

<!-- Colored fallbacks -->
<span class="avatar__fallback avatar__fallback--blue">AB</span>
<span class="avatar__fallback avatar__fallback--green">CD</span>
<span class="avatar__fallback avatar__fallback--red">EF</span>
```

### Input `.input`

```html
<!-- Basic input -->
<input type="text" class="input" placeholder="Enter text...">

<!-- Sizes -->
<input class="input input--sm">
<input class="input">
<input class="input input--lg">

<!-- With form field wrapper -->
<div class="formfield">
  <label class="formfield__label">Email</label>
  <input type="email" class="input" placeholder="name@example.com">
  <span class="formfield__hint">We'll never share your email.</span>
</div>

<!-- Error state -->
<div class="formfield">
  <label class="formfield__label" for="password">Password</label>
  <input type="password" id="password" class="input" required aria-invalid="true" aria-describedby="password-error">
  <span class="formfield__error" id="password-error">Password is required</span>
</div>

<!-- Select -->
<select class="select">
  <option>Option 1</option>
  <option>Option 2</option>
</select>

<!-- Textarea -->
<textarea class="textarea" rows="4"></textarea>

<!-- Checkbox -->
<label class="checkbox">
  <input type="checkbox" class="checkbox__input">
  <span class="checkbox__label">Accept terms</span>
</label>

<!-- Radio -->
<label class="radio">
  <input type="radio" name="choice" class="radio__input">
  <span class="radio__label">Option A</span>
</label>

<!-- Switch/Toggle -->
<label class="switch">
  <input type="checkbox" class="switch__input">
  <span class="switch__slider"></span>
</label>
```

### Table `.table`

```html
<div class="table__wrapper">
  <table class="table">
    <thead class="table__header">
      <tr class="table__row">
        <th class="table__head">Name</th>
        <th class="table__head">Status</th>
        <th class="table__head table__actions">Actions</th>
      </tr>
    </thead>
    <tbody class="table__body">
      <tr class="table__row">
        <td class="table__cell">John Doe</td>
        <td class="table__cell"><span class="badge badge--success-muted">Active</span></td>
        <td class="table__cell table__actions">
          <button class="btn btn--ghost btn--icon btn--sm">
            <svg class="icon">...</svg>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Variants -->
<table class="table table--striped">...</table>   <!-- Alternating row colors -->
<table class="table table--hoverable">...</table> <!-- Row hover effect -->
<table class="table table--compact">...</table>   <!-- Smaller padding -->
<table class="table table--card">...</table>      <!-- Card-compatible padding -->

<!-- Borderless wrapper (for use inside cards) -->
<div class="table__wrapper table__wrapper--borderless">...</div>

<!-- Checkbox column -->
<th class="table__head table__checkbox">
  <label class="checkbox">
    <input type="checkbox" class="checkbox__input">
  </label>
</th>

<!-- Sortable header -->
<th class="table__head table__head--sortable" aria-sort="ascending">
  Name
  <span class="table__sort-icon">
    <svg class="icon icon--sm">...</svg>
  </span>
</th>
```

### Tabs `.tabs`

```html
<div class="tabs" data-tabs>
  <div class="tabs__list" data-tabs-list>
    <button class="tabs__trigger" data-tab="tab1" aria-selected="true">Tab 1</button>
    <button class="tabs__trigger" data-tab="tab2" aria-selected="false">Tab 2</button>
    <button class="tabs__trigger" data-tab="tab3" aria-selected="false">Tab 3</button>
  </div>
  <div class="tabs__panels" data-tabs-panels>
    <div class="tabs__content" id="tab1" data-tab-panel>Content 1</div>
    <div class="tabs__content" id="tab2" data-tab-panel hidden>Content 2</div>
    <div class="tabs__content" id="tab3" data-tab-panel hidden>Content 3</div>
  </div>
</div>

<!-- Variants -->
<div class="tabs tabs--underline">...</div>  <!-- Underline style -->
<div class="tabs tabs--pills">...</div>      <!-- Pill buttons -->
<div class="tabs tabs--full">...</div>       <!-- Full width tabs -->
```

### Accordion `.accordion`

```html
<div class="accordion" data-accordion>
  <div class="accordion__item">
    <button class="accordion__trigger" aria-expanded="false">
      <span>Section Title</span>
      <svg class="icon accordion__icon">...</svg>
    </button>
    <div class="accordion__content">
      <div class="accordion__body">
        Content goes here
      </div>
    </div>
  </div>
</div>

<!-- Allow multiple open -->
<div class="accordion" data-accordion data-accordion-multiple="true">...</div>

<!-- Pre-opened item: the trigger's aria-expanded drives the open state -->
<button class="accordion__trigger" aria-expanded="true">...</button>

<!-- No-JS alternative: native <details> -->
<details class="accordion__item" open>
  <summary class="accordion__trigger">Section Title <svg class="icon accordion__icon">...</svg></summary>
  <div class="accordion__content"><div class="accordion__body">Content goes here</div></div>
</details>
```

### Dropdown `.dropdown`

```html
<!-- aria-expanded="true" on the trigger opens the menu -->
<div class="dropdown">
  <button class="btn dropdown__trigger" aria-expanded="false" aria-haspopup="menu">
    Options
    <svg class="icon icon--sm">...</svg>
  </button>
  <div class="dropdown__menu">
    <button class="dropdown__item">Edit</button>
    <button class="dropdown__item">Duplicate</button>
    <div class="dropdown__separator"></div>
    <button class="dropdown__item dropdown__item--destructive">Delete</button>
  </div>
</div>

<!-- With icons -->
<button class="dropdown__item">
  <svg class="icon dropdown__item-icon">...</svg>
  <span>Edit</span>
</button>

<!-- With labels/shortcuts -->
<button class="dropdown__item">
  <span>Save</span>
  <span class="dropdown__item-label">Ctrl+S</span>
</button>
```

### Modal `.modal`

```html
<div class="modal__backdrop">
  <div class="modal">
    <div class="modal__header">
      <h2 class="modal__title">Modal Title</h2>
      <p class="modal__description">Optional description</p>
      <button class="modal__close">
        <svg class="icon">...</svg>
      </button>
    </div>
    <div class="modal__body">
      Content
    </div>
    <div class="modal__footer">
      <button class="btn btn--outline">Cancel</button>
      <button class="btn btn--primary">Confirm</button>
    </div>
  </div>
</div>

<!-- Sizes -->
<div class="modal modal--sm">...</div>
<div class="modal modal--lg">...</div>
<div class="modal modal--full">...</div>
```

### Pagination `.pagination`

```html
<div class="pagination__info">
  <div class="pagination__text">
    Showing <strong>1</strong> to <strong>10</strong> of <strong>100</strong>
  </div>
  <div class="pagination__select">
    <span>Rows per page:</span>
    <select class="select select--sm select--auto">
      <option>10</option>
      <option>25</option>
      <option>50</option>
    </select>
  </div>
  <nav class="pagination">
    <button class="pagination__prev" disabled>
      <svg class="icon">...</svg>
    </button>
    <button class="pagination__item" aria-current="page">1</button>
    <button class="pagination__item">2</button>
    <button class="pagination__item">3</button>
    <span class="pagination__ellipsis">...</span>
    <button class="pagination__item">10</button>
    <button class="pagination__next">
      <svg class="icon">...</svg>
    </button>
  </nav>
</div>
```

### Dashboard Layout `.dashboard`

```html
<div class="dashboard">
  <!-- Icon rail navigation -->
  <nav class="navmenu">
    <div class="navmenu__header">
      <a href="/" class="navmenu__logo">
        <svg class="icon icon--lg">...</svg>
      </a>
    </div>
    <div class="navmenu__content">
      <div class="navmenu__section">
        <a href="#" class="navmenu__item navmenu__item--active">
          <svg class="icon">...</svg>
          <span class="navmenu__tooltip">Dashboard</span>
        </a>
      </div>
    </div>
    <div class="navmenu__footer">
      <button class="navmenu__avatar">
        <span class="navmenu__avatar-fallback">JD</span>
      </button>
    </div>
  </nav>

  <!-- Secondary sidebar -->
  <aside class="subnav">
    <div class="subnav__header">
      <h2 class="subnav__title">Section</h2>
    </div>
    <div class="subnav__content">
      <div class="subnav__section">
        <div class="subnav__section-header">
          <span class="subnav__section-title">Category</span>
        </div>
        <div class="subnav__list">
          <a href="#" class="subnav__item subnav__item--active">
            <svg class="icon subnav__item-icon">...</svg>
            <span class="subnav__item-text">Item</span>
            <span class="subnav__item-badge">12</span>
          </a>
        </div>
      </div>
    </div>
  </aside>

  <!-- Main content -->
  <main class="dashboard__main">
    <header class="dashboard__header">
      <div class="dashboard__header-left">
        <nav class="breadcrumb">...</nav>
      </div>
      <div class="dashboard__header-right">
        <!-- Header actions -->
      </div>
    </header>
    <div class="dashboard__content">
      <!-- Page content -->
    </div>
  </main>
</div>
```

---

## Utility Classes

### Layout

```html
<!-- Flexbox -->
<div class="layout">...</div>
<div class="layout layout--col">...</div>
<div class="layout layout--center">...</div>
<div class="layout layout--between">...</div>
<div class="layout layout--gap-md">...</div>

<!-- Stack (vertical) -->
<div class="stack stack--sm">...</div>
<div class="stack stack--md">...</div>
<div class="stack stack--lg">...</div>
<div class="stack stack--divided">...</div>  <!-- With dividers -->

<!-- Cluster (horizontal, wrapping) -->
<div class="cluster cluster--sm">...</div>
<div class="cluster cluster--md">...</div>

<!-- Grid -->
<div class="grid grid--2">...</div>   <!-- 2 columns -->
<div class="grid grid--3">...</div>   <!-- 3 columns -->
<div class="grid grid--4">...</div>   <!-- 4 columns -->
<div class="grid grid--2-1">...</div> <!-- 2:1 ratio -->

<!-- Centering -->
<div class="center center--sm">...</div>
<div class="center center--md">...</div>
```

### Spacing

```html
<!-- Margin bottom -->
<div class="mb--xs">...</div>
<div class="mb--sm">...</div>
<div class="mb--md">...</div>
<div class="mb--lg">...</div>

<!-- Margin top -->
<div class="mt--sm">...</div>
<div class="mt--lg">...</div>
<div class="mt--2xl">...</div>

<!-- Vertical margin -->
<div class="my--md">...</div>
<div class="my--lg">...</div>
```

### Typography

```html
<p class="text--sm">Small text</p>
<p class="text--lg">Large text</p>
<p class="text--muted">Muted color</p>
<p class="text--center">Centered</p>
<p class="text--semibold">Semi-bold</p>

<!-- Colors -->
<span class="text--primary">Primary</span>
<span class="text--success">Success</span>
<span class="text--warning">Warning</span>
<span class="text--destructive">Destructive</span>
```

### Flex utilities

```html
<div class="flex--1">...</div>      <!-- flex: 1 -->
<div class="flex--none">...</div>   <!-- flex: none -->
<div class="flex--shrink0">...</div> <!-- flex-shrink: 0 -->
```

### Width

```html
<div class="w--full">...</div>  <!-- width: 100% -->
```

### Box

```html
<!-- Icon box -->
<div class="box box--icon">
  <svg class="icon">...</svg>
</div>

<!-- Colored icon boxes -->
<div class="box box--icon box--primary">...</div>
<div class="box box--icon box--success">...</div>
<div class="box box--icon box--warning">...</div>
<div class="box box--icon box--destructive">...</div>

<!-- Muted background box -->
<div class="box box--muted">...</div>
```

### Dot indicators

```html
<span class="dot dot--blue"></span>
<span class="dot dot--green"></span>
<span class="dot dot--yellow"></span>
<span class="dot dot--red"></span>
```

---

## JavaScript Components

The `demo/js/main.js` file provides interactive behavior for:

### Accordion

```html
<div class="accordion" data-accordion>
  <!-- Automatically enhanced -->
</div>

<!-- Allow multiple panels open -->
<div class="accordion" data-accordion data-accordion-multiple="true">
```

### Tabs

```html
<div class="tabs" data-tabs>
  <!-- Automatically enhanced -->
</div>
```

### Toggle (dropdowns and other disclosures)

```html
<div class="dropdown">
  <button class="btn dropdown__trigger" data-toggle data-toggle-target="#menu" data-toggle-capture="true">Options</button>
  <div class="dropdown__menu" id="menu">...</div>
</div>
```

Toggle sets `aria-expanded` on the trigger (and `open` when the target is a `<dialog>` or
`<details>`); the stylesheet does the rest. Escape and, with `data-toggle-capture`, an
outside click close it again. `data-toggle-class="…"` additionally toggles that class on the
target, for markup that isn't styled from `aria-expanded`.

None of the scripts add state classes: Accordion flips `aria-expanded`, Tabs flips
`aria-selected` and the panels' `hidden` attribute.

### Dark Mode Toggle

```javascript
// Toggle theme
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  html.setAttribute('data-theme', current === 'dark' ? '' : 'dark');
}
```

### Demo Navigation

A floating navigation button is automatically added to all demo pages, allowing quick switching between templates.

---

## Theming

### Light/Dark Mode

Dark mode is activated by adding `data-theme="dark"` to the `<html>` element:

```html
<html data-theme="dark">
```

### Customizing Colors

Edit the CSS custom properties in `scss/_variables.scss`:

```scss
:root {
  // Change primary color
  --primary: #your-color;
  --primary-fg: #text-color;
  --primary-hover: #hover-color;

  // Change accent colors
  --success: #22c55e;
  --warning: #f59e0b;
  --destructive: #ef4444;
}

[data-theme="dark"] {
  // Dark mode overrides
  --primary: #your-dark-primary;
}
```

---

## Demo Pages

Use these as starting templates:

| Page | File | Description |
|------|------|-------------|
| Component Library | `index.html` | All components showcase |
| Dashboard | `dashboard.html` | Stats, charts, activity feed |
| Records List | `records.html` | Data table with search, filters, pagination |
| Record Form | `record-form.html` | Create/edit form with validation |
| Record Delete | `record-delete.html` | Confirmation pattern |
| Settings Index | `settings.html` | Settings category cards |
| Account Settings | `settings-account.html` | Form-heavy settings page |
| Login | `login.html` | Authentication page |
| Forgot Password | `forgot-password.html` | Password reset flow |

---

## Creating New Pages

1. Copy an existing demo page as a starting point
2. Update the `<title>` tag
3. Modify the navigation active states
4. Replace the main content

### Minimal Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title - Your App</title>
  <link rel="stylesheet" href="css/parallelogram-dashboard.css">
</head>
<body>
  <div class="dashboard">
    <!-- Navigation (copy from dashboard.html) -->
    <nav class="navmenu">...</nav>
    <aside class="subnav">...</aside>

    <!-- Main content -->
    <main class="dashboard__main">
      <header class="dashboard__header">
        <div class="dashboard__header-left">
          <nav class="breadcrumb">...</nav>
        </div>
        <div class="dashboard__header-right">
          <!-- Theme toggle, notifications, user avatar -->
        </div>
      </header>

      <div class="dashboard__content">
        <!-- Your page content here -->
      </div>
    </main>
  </div>

  <script type="module" src="js/main.js"></script>
  <script>
    function toggleTheme() {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      html.setAttribute('data-theme', current === 'dark' ? '' : 'dark');
    }
  </script>
</body>
</html>
```

---

## Best Practices

### 1. Use semantic HTML
```html
<!-- Good -->
<button class="btn btn--primary">Save</button>

<!-- Avoid -->
<div class="btn btn--primary" onclick="...">Save</div>
```

### 2. Combine utilities with components
```html
<div class="card mb--lg">
  <div class="card__content">
    <div class="stack stack--sm">
      <!-- Stack utility for consistent spacing -->
    </div>
  </div>
</div>
```

### 3. Use appropriate semantic colors
```html
<!-- For actions -->
<button class="btn btn--destructive">Delete</button>

<!-- For status -->
<span class="badge badge--success-muted">Active</span>
<span class="badge badge--warning-muted">Pending</span>
```

### 4. Keep modifiers minimal
```html
<!-- Good: Clear intent -->
<div class="card card--elevated">

<!-- Avoid: Too many modifiers -->
<div class="card card--elevated card--lg card--interactive card--bordered">
```

### 5. Use the grid for layouts
```html
<div class="grid grid--2">
  <div class="card">...</div>
  <div class="card">...</div>
</div>
```

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## License

MIT
