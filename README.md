# Parallelogram Dashboard

A BEM-style CSS dashboard component library inspired by shadcn/ui. Built with SCSS, vanilla JavaScript, and zero framework dependencies.

## Quick Start

```bash
# Install dependencies
npm install

# Build the library (expanded and minified) and the demo stylesheet
npm run build

# Watch for changes during development
npm run watch

# Serve the demo pages at http://localhost:8080 (no caching, so edits show on reload)
npm run serve
```

## Using the Package

The library is consumed as `@parallelogram-js/dashboard` from another project's build. There is no
CDN copy and no prebuilt `<script>` bundle. Install a published version from npm:

```bash
npm install @parallelogram-js/dashboard@0.1.1
```

Or install a tagged release straight from GitHub, which needs git access to the repository:

```bash
npm install "git+ssh://git@github.com/parallelogram-dev/parallelogram-dashboard.git#v0.1.1"
```

To upgrade, read the [changelog](CHANGELOG.md) entries since the current version, make any listed
markup changes in the project's templates, then install the new version. The compiled CSS in
`dist/` ships with the package, so nothing needs building after install.

```js
import { init } from '@parallelogram-js/dashboard';
import { TableSort } from '@parallelogram-js/dashboard/behaviours/table-sort';
```

```scss
@use "@parallelogram-js/dashboard/scss" with ($control-border-width: 2px);
```

Keep the project's own look in a theme file of token values (see [Theme files](#theme-files)) and
write each component's markup once in the project's templates, so a markup change in a release is
one edit.

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

Specs can also set `layout: 'block'` (full-width stage) or `layout: 'full'` (no padding, opens at the
Desktop width; for page-level layouts such as the dashboard shell). In the "All variants" grid each
cell gets its own ids, so toggles and labels keep working in every copy.

`npm run playground:register` registers every spec file in `specs/`: it rewrites `specs/index.js`, sets
`spec` on the matching manifest entry and adds the Playground section to the component page.

`npm run playground:check` fails if a spec never renders a class its SCSS `sources` define, or if a
component partial has no page, and lists pages still without a playground. Pass spec files to check
just those, before registering them: `node scripts/playground-check.mjs demo/js/playground/specs/table.js`. It runs in CI before the
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
│   ├── _variables.scss         # Sass values (palette, spacing, type, breakpoints); emits no CSS
│   ├── _tokens.scss            # Theme custom properties and the @parallelogram-js/core tokens they feed
│   ├── _mixins.scss            # Reusable SCSS mixins
│   ├── _base.scss              # Reset & base styles
│   ├── _utilities.scss         # Utility classes
│   ├── _icon.scss              # Icon styles
│   ├── _datetime.scss          # <p-datetime> web component theming
│   ├── _demo.scss              # Demo page styles (not part of the library)
│   ├── components/             # Component styles
│   │   ├── _accordion.scss
│   │   ├── _alert.scss
│   │   ├── _auth.scss
│   │   ├── _avatar.scss
│   │   ├── _badge.scss
│   │   ├── _banner.scss
│   │   ├── _breadcrumb.scss
│   │   ├── _bulkactions.scss
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
│   │   ├── _pageheader.scss
│   │   ├── _pagination.scss
│   │   ├── _progress.scss
│   │   ├── _recordgrid.scss
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
│   ├── main.scss               # Library entry point → dist/parallelogram-dashboard.css
│   └── demo-pages.scss         # Demo entry point → demo/css/demo.css
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

Colors are defined as CSS custom properties for easy theming. Edit the `$theme-tokens` map in
`scss/_tokens.scss` to customize; each entry holds its light and dark value.

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
| Required | `required` on the control, plus an explicit `.form__required` marker in the label (not added automatically, so existing forms keep their look) | `.form__field` |
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
off-canvas; the Toggle script adds them, see below), `.sidebaroverlay--visible`, `.dashboard__overlay--visible`,
`.tooltip__content--visible`, `.steps__item--completed`, `.form__counter--warning` /
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
| `.form__field--error` | aria-invalid="true" on the control |
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
<button class="btn btn--warning">Warning</button>
<button class="btn btn--success">Success</button>
<button class="btn btn--info">Info</button>
<button class="btn btn--outline">Outline</button>
<button class="btn btn--ghost">Ghost</button>
<button class="btn btn--link">Link</button>

<!-- Sizes (a bare .btn is primary; add a variant to change colour) -->
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
<span class="badge badge--sm badge--pill">Primary, small pill</span>
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

### Form `.form`

Form parts are elements of the `.form` block. A `.form__field` bundles a label, the control(s), a description, an error and any extra markup; `.form__control` marks the concrete input, select, textarea or custom widget inside it.

```html
<form class="form">
  <!-- Field -->
  <div class="form__field">
    <label class="form__label" for="email">Email <span class="form__required">*</span></label>
    <input type="email" id="email" class="input form__control">
    <p class="form__description">We'll never share your email.</p>
  </div>

  <!-- Error state: aria-invalid on the control (form__field--error is deprecated) -->
  <div class="form__field">
    <label class="form__label" for="password">Password</label>
    <input type="password" id="password" class="input form__control" required aria-invalid="true" aria-describedby="password-error">
    <p class="form__error" id="password-error">Password is required.</p>
  </div>

  <!-- Optional marker and character counter -->
  <div class="form__field">
    <label class="form__label" for="bio">Bio <span class="form__optional">(optional)</span></label>
    <textarea id="bio" class="textarea form__control" rows="3"></textarea>
    <div class="form__counter">0 / 500</div>
  </div>

  <!-- Group: controls joined into one unit, like .btn__group -->
  <div class="form__field">
    <label class="form__label" for="price">Price</label>
    <div class="form__group">
      <span class="form__addon">$</span>
      <input type="number" id="price" class="input form__control">
      <button type="button" class="btn btn--outline">Apply</button>
    </div>
  </div>

  <!-- Stacked group -->
  <div class="form__group form__group--block">...</div>

  <!-- Fieldset -->
  <fieldset class="form__fieldset">
    <legend class="form__legend">Contact</legend>
    <div class="form__row form__row--2">
      <div class="form__field">...</div>
      <div class="form__field">...</div>
    </div>
  </fieldset>

  <div class="form__actions form__actions--end">
    <button class="btn">Save</button>
  </div>
</form>

<!-- Horizontal: labels in a fixed column, everything else beside them (stacks below md) -->
<form class="form form--horizontal">...</form>
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

### Record Grid `.recordgrid`

The picture view of a record list. Tiles fill the row at a minimum of 14rem (`recordgrid--sm`:
10rem); thumbnails are 4:3 (`recordgrid--square`: 1:1) and fill the frame, or sit whole with
`recordgrid__thumb--contain`. A record with no image puts an `.icon` in the thumbnail instead.

```html
<ul class="recordgrid">
  <li class="recordgrid__item">
    <label class="checkbox recordgrid__select">
      <input type="checkbox" class="checkbox__input" value="42" aria-label="Select Spring launch">
    </label>
    <a href="/records/42" class="recordgrid__thumb" tabindex="-1" aria-hidden="true"><img src="..." alt=""></a>
    <div class="recordgrid__body">
      <a href="/records/42" class="recordgrid__title">Spring launch</a>
      <p class="recordgrid__meta">News &middot; Modified 2 hours ago</p>
      <div class="recordgrid__footer">
        <div class="recordgrid__status"><span class="badge badge--success-muted">Published</span></div>
        <div class="dropdown dropdown--right">...</div>
      </div>
    </div>
  </li>
</ul>
```

The selection checkbox shows while a tile is hovered or focused, and on every tile once any is
checked. A checked tile is outlined, and `aria-disabled="true"` on `recordgrid__item` dims an
unpublished or locked record while its controls stay usable.

### Bulk Actions `.bulkactions`

Acts on the rows selected in a table or record grid. Keep it in the page with `hidden`; the
page's script sets the count and toggles `hidden` as the selection changes, and the bar slides in
each time it appears. It floats over the bottom of the viewport, so dropdowns in it open upwards
(`dropdown--top`); `bulkactions--inline` sits in the flow instead, e.g. above the table.

```html
<div class="bulkactions" role="region" aria-label="Bulk actions" hidden>
  <span class="bulkactions__count"><strong>3</strong>&nbsp;selected</span>
  <div class="bulkactions__actions">
    <div class="dropdown dropdown--top">...</div>
    <button type="button" class="btn btn--ghost btn--sm">Archive</button>
    <button type="button" class="btn btn--destructive btn--sm">Delete</button>
  </div>
  <button type="button" class="btn btn--ghost btn--icon btn--sm bulkactions__clear" aria-label="Clear selection">
    <svg class="icon">...</svg>
  </button>
</div>
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
    <button type="button" class="accordion__trigger" aria-expanded="false" aria-controls="faq-1">
      <span>Section Title</span>
      <svg class="icon accordion__icon">...</svg>
    </button>
    <div class="accordion__content" id="faq-1">
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

<!-- No-JS alternative: native <details>; a shared name keeps one open at a time -->
<div class="accordion">
  <details class="accordion__item" name="faq" open>
    <summary class="accordion__trigger">Section Title <svg class="icon accordion__icon">...</svg></summary>
    <div class="accordion__content"><div class="accordion__body">Content goes here</div></div>
  </details>
  <details class="accordion__item" name="faq">...</details>
</div>

<!-- Single item: <details class="collapsible">, or a button trigger (wired automatically) -->
<div class="collapsible">
  <button type="button" class="collapsible__trigger" aria-expanded="false">
    <span>Advanced options</span>
    <svg class="icon collapsible__icon">...</svg>
  </button>
  <div class="collapsible__content"><div class="collapsible__body">Content goes here</div></div>
</div>
```

Content animates to its natural height, so there is no maximum to tune.

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

The interactive modal is the `<p-modal>` web component from `@parallelogram-js/core`; the
stylesheet themes it. For a modal without the component, use a native `<dialog>`:

```html
<button type="button" class="btn btn--primary" commandfor="edit-profile" command="show-modal">Edit profile</button>

<dialog class="modal" id="edit-profile" aria-labelledby="edit-profile-title">
  <div class="modal__dialog">
    <div class="modal__header">
      <div>
        <h2 class="modal__title" id="edit-profile-title">Edit profile</h2>
        <p class="modal__description">Make changes to your profile here.</p>
      </div>
      <button type="button" class="modal__close" commandfor="edit-profile" command="close" aria-label="Close">
        <svg class="icon">...</svg>
      </button>
    </div>
    <div class="modal__content">Content</div>
    <div class="modal__footer">
      <button type="button" class="btn btn--outline" commandfor="edit-profile" command="close">Cancel</button>
      <button type="button" class="btn btn--primary">Save changes</button>
    </div>
  </div>
</dialog>

<!-- Sizes go on the dialog box -->
<div class="modal__dialog modal__dialog--sm">...</div>   <!-- --xs, --sm, --lg, --xl, --fullscreen -->

<!-- Confirmations: <dialog class="alertdialog" role="alertdialog"> with alertdialog__* parts -->
```

Opened with `command="show-modal"` (or `showModal()`), the dialog draws its own dimmed
backdrop. A `<dialog class="modaloverlay" open>` sibling is only needed when the modal is
shown non-modally with the `open` attribute.

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
        <a href="#" class="navmenu__item" aria-current="page">
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
          <a href="#" class="subnav__item" aria-current="page">
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

#### Labelled rail `.navmenu--labelled`

For a short main menu that reads better with its words showing, `navmenu--labelled` widens the
rail to `--navmenu-labelled-width` (14rem) and sets each icon beside a `navmenu__label`. Section
titles (`navmenu__section-title`) show, and the logo keeps its proportions at
`--navmenu-logo-height`, so a wordmark fits. The visible label names each item, so it needs no
`aria-label` or tooltip. The section menu and main column move over to make room. Below `md` it
is the same bottom bar as the icon rail, with each label under its icon.

```html
<nav class="navmenu navmenu--labelled" aria-label="Main">
  <div class="navmenu__header">
    <a href="/" class="navmenu__logo" aria-label="Home"><svg>...</svg></a>
  </div>
  <div class="navmenu__content">
    <div class="navmenu__section">
      <span class="navmenu__section-title">Workspace</span>
      <a href="#" class="navmenu__item" aria-current="page">
        <svg class="icon">...</svg>
        <span class="navmenu__label">Events</span>
      </a>
    </div>
  </div>
</nav>
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

Button triggers get `type="button"` and `aria-controls` pointing at their `.accordion__content`
(an id is generated when the content has none). A `.collapsible` with a `<button>` trigger is
wired the same way without any data attribute.

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

Off-canvas navigation below the `lg` breakpoint uses the class and an overlay together;
`data-toggle-overlay` adds `--visible` to the overlay's first class and closes on a click on it:

```html
<button class="btn btn--ghost btn--icon" aria-label="Menu"
        data-toggle data-toggle-target="#sidebar" data-toggle-class="sidebar--open"
        data-toggle-overlay="#sidebar-overlay">…</button>
<aside class="sidebar" id="sidebar">…</aside>
<div class="sidebaroverlay" id="sidebar-overlay" aria-hidden="true"></div>

<!-- Dashboard section nav: data-toggle-class="subnav--open" with a .dashboard__overlay -->
```

A `.sidebar--right` offsets `.sidebarlayout__main` on the right; beside a navbar use
`.navbar--with-sidebar` plus `.navbar--sidebar-collapsed` and/or `.navbar--sidebar-right`.

Dropdown submenus (`.dropdown__submenu`) open on hover in CSS; the script lets keyboard and
touch users open them with a click or ArrowRight and close them with ArrowLeft or Escape.
`.segmented-control` items are kept mutually exclusive through `aria-pressed` (or
`aria-checked` when the items are `role="radio"`). Tabs skip disabled tabs with the arrow keys,
link each tab and panel with `aria-controls`/`aria-labelledby`, and slide the
`.tabs__indicator` of a `.tabs--animated` list under the selected tab.

Apart from `data-toggle-class`, none of the scripts add state classes: Accordion and Collapsible flip `aria-expanded`, Tabs flips
`aria-selected` and the panels' `hidden` attribute.

### Dark Mode Toggle

The page follows the OS until a toggle pins it, so the toggle writes an explicit theme:

```javascript
function toggleTheme() {
  const html = document.documentElement;
  const theme = html.getAttribute('data-theme');
  const dark = theme === 'dark' || (theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  html.setAttribute('data-theme', dark ? 'light' : 'dark');
}
```

### Demo Navigation

A floating navigation button is automatically added to all demo pages, allowing quick switching between templates.

---

## Theming

### Light/Dark Mode

The theme follows the operating system's light or dark setting. Each colour token is a
`light-dark()` pair and `:root` sets `color-scheme: light dark`, so no second block of overrides
is needed. Set `data-theme` to pin a theme, on `<html>` or on any element to pin just that subtree:

```html
<html data-theme="dark">
<section data-theme="light">
```

### Customizing Colors

Edit the `$theme-tokens` map in `scss/_tokens.scss`. Each entry is a light and a dark value, and
an entry whose two values match is emitted as a plain colour:

```scss
$theme-tokens: (
  primary: (#your-light-primary, #your-dark-primary),
  primary-fg: (#text-on-light-primary, #text-on-dark-primary),
  success: (#22c55e, #22c55e),
  // ...
);
```

At runtime, override a token for both themes with a plain value or keep the pair:

```css
:root {
  --primary: light-dark(#4f46e5, #818cf8);
}
```

### Theme files

A theme is a stylesheet of token values loaded after the library, so it survives upgrades as long
as the token names stay the same. `demo/css/brand-contenir.css` is a worked example. Besides the
colour tokens it can set:

| Tokens | What they colour or shape |
|--------|---------------------------|
| `--navmenu-*` | The icon rail: `bg`, `fg`, `fg-muted`, `fg-subtle`, `bg-muted`, `bg-subtle`, `accent`, `accent-fg`, `border`, `input`, `input-placeholder`, `icon-stroke-width`, plus `indicator` for the current-page marker |
| `--subnav-*` | The section menu, with the same names |
| `--header-*` | The page header, with the same names |
| `--navmenu-head-*`, `--subnav-head-*` | The rail's logo cell and the section menu's title bar: `bg`, `fg`, `fg-muted`, `accent`, `accent-fg`, `border` |
| `--navmenu-width`, `--navmenu-labelled-width`, `--subnav-width` | Widths of the icon rail (4rem), the labelled rail (14rem) and the section menu (16rem) |
| `--navmenu-logo-height` | Height of the logo in a labelled rail's header (1.5rem) |
| `--radius-sm` … `--radius-2xl` | Corner radius scale |
| `--control-border-width` | Borders of inputs, selects, add-ons and outline buttons |
| `--icon-stroke-width` | Line icon strokes |
| `--avatar-bg`, `--avatar-fg` | Avatar initials |

Inside the rail, section menu and header the general tokens (`--fg`, `--accent`, `--border` and
so on) are pointed at the region's own, so everything in a region follows its tokens; menus and
tooltips that open there keep the page's colours. Every region token defaults to the general
token, so a theme sets only what differs.

### Typography

`html` keeps the reader's browser font size (`100%`), so every `rem` scales with it. Element
styles for headings, `code`, `kbd`, `pre`, `blockquote` and `hr` sit inside `:where()` and carry
no specificity, so any component class overrides them.

Headings use a compact fluid scale, set in `$heading-sizes` in `scss/_variables.scss` and
exposed as `--heading-1` to `--heading-6`. h1 runs from 24px on a phone to 30px on desktop, h3
from 18px to 20px, and h4 to h6 are fixed at 18, 16 and 14px. Fonts and leading are
`--font-sans`, `--font-mono`, `--leading-tight`, `--leading-normal` and `--leading-relaxed`.

| Class | Use |
|-------|-----|
| `.heading .heading--1` … `--6` | Heading sizes on any element, for when the look and the outline level differ |
| `.text--lead` | Introductory paragraph under a page or section title |
| `.text--overline` | Small uppercase label above a title |
| `.text--tabular` | Tabular figures; tables and `.stat__value` already use them |
| `.text--mono` | Monospace text |

### @parallelogram-js/core

`scss/_tokens.scss` also sets core's role and surface tokens (`--color-*`, `--surface-*`,
`--button-*`, `--form-control-*`, `--framework-focus-*`, `--framework-transition-*`) from the
dashboard theme. Core's web components (`<p-modal>`, `<p-datetime>`, `<p-select>`, `<p-uploader>`,
toasts) and its per-component stylesheets (`styles/components/*.css`) therefore match the
dashboard in both themes with no further theming. Load this stylesheet instead of core's
`styles/index.css`, whose own `:root` palette would compete with it.

The dashboard's transitions and focus rings read the same `--framework-transition-duration`,
`--framework-transition-easing` and `--framework-focus-*` tokens, and transitions drop to `0s`
under `prefers-reduced-motion: reduce`.

---

## Demo Pages

Use these as starting templates:

| Page | File | Description |
|------|------|-------------|
| Component Library | `index.html` | All components showcase |
| Dashboard | `dashboard.html` | Stats, charts, activity feed |
| Records List | `records.html` | Data table and picture grid with search, filters, bulk actions, pagination |
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

## Versioning

Releases follow semantic versioning, read for markup as well as code. While the version is below
1.0, the minor number stands in for the major one:

| Change | Below 1.0 | From 1.0 |
|--------|-----------|----------|
| A class renamed or removed, required markup added or moved, a token renamed or removed, a behaviour's options or events changed | Minor (0.2.0) | Major (2.0.0) |
| A new component, modifier, token or behaviour that leaves existing markup working | Patch (0.1.1) | Minor (1.1.0) |
| A fix to CSS or JavaScript that keeps markup and tokens as they are | Patch | Patch |

Every change that needs a site to edit its templates goes under **Markup changes** in the
[changelog](CHANGELOG.md), with the markup before and after.

## Releasing

1. While working, add entries under `## [Unreleased]` in `CHANGELOG.md`, with a **Markup changes**
   section whenever templates need editing.
2. On a clean `main`, run `npm run release -- <patch|minor|major|x.y.z>`. It builds, runs the
   playground check, sets the version in `package.json` and `package-lock.json`, moves the
   Unreleased entries under the new version and date, commits, and creates the tag `vX.Y.Z`.
3. Check the commit, then push it with its tag: `git push --follow-tags`.
4. The tag publishes that version to npm (`.github/workflows/publish.yml`), with provenance,
   once the build and playground check pass and the tag matches `package.json`. It needs the
   repository secret `NPM_TOKEN`, an npm automation token for the `@parallelogram-js` scope. For a
   tag pushed before the workflow existed, or one whose run failed, run it by hand from `main`:
   `gh workflow run publish.yml -f tag=vX.Y.Z`.
   Publishing by hand still works from a clean `main`: `npm publish` after `npm login`.

## Comparing Styles Between Releases

To see what a release changes on screen, compare the current build with an earlier tag:

```bash
npm run compare -- v0.1.0
npm run serve
```

`npm run compare` copies that tag's compiled CSS into `demo/compare/` (git-ignored). Open
`http://localhost:8080/compare.html`, choose pages and a width, and run it: each page loads with
the current CSS and then the tag's, and every element whose computed styles differ is listed with
the before and after values.

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## License

MIT
