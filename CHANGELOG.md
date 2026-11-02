# Changelog

All notable changes to `@parallelogram-js/dashboard` are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow the rules in the
README's [Versioning](README.md#versioning) section.

Each release can have a **Markup changes** section. It lists every change a site has to make in
its own templates to upgrade: a class renamed or removed, a required element added or moved, or a
token renamed or removed. Each entry shows the markup before and after. A release with no such
section can be taken with a version bump and a rebuild.

## [Unreleased]

## [0.1.9] - 2026-11-02

### Added

- `.sheet__footer--between` (and `.drawer__footer--between`): Cancel at one end of a sheet's
  footer and the action at the other, as `.card__footer--between` and `.form__actions--between`
  already offer. A `layout--between` utility can't do it, since the footer's own rule comes later.

### Fixed

- `ConfirmAction` is listed in `sideEffects`, as the other behaviours that bind themselves on
  import are. Without it a bundler drops `import '@parallelogram-js/dashboard/behaviours/confirm-action'`,
  so the shared confirmation opened unchanged.

## [0.1.8] - 2026-11-02

### Added

- `LiveFilters` (`[data-live-filters]`): a filter form applies as it changes, with no Apply
  button. It fetches the page again with the form's query and swaps in only the element the
  attribute names, so typing in a search is not interrupted; selects apply at once, a date picker
  once it closes having changed, a search after a pause. The address keeps in step, and a failed
  fetch falls back to submitting the form. `init()` enhances it; the toolbar page shows it.
- `ConfirmAction`: one `.alertdialog` serves every button on a page that opens it. A button with
  `data-confirm-action` (and optionally `data-confirm-title`) points the dialog's form, and its
  title, at what that button would remove before the dialog opens. It binds itself on import.
- `.alertdialog__footer--between`: Cancel at one end, the action at the other, as a form's action
  bar has them.

### Fixed

- An alert dialog's buttons had no space above them: the footer's top padding was taken away
  with its border. It has `$spacing-lg` again.
- An icon drawn inside `.alertdialog__icon`, rather than the slot being the `<svg>` itself, fills
  the slot instead of sitting at its own size in the corner.
- A plain `.icon` in a `.dropdown__item`, as a project's icon helper draws it, takes the menu's
  icon size like `.dropdown__item-icon`.
- A grey status dot (`.badge--dot.badge--secondary`) shows: the secondary background is a faint
  tint made to sit behind text, so on its own the dot all but vanished.

- The unsaved-changes guard compares a field whose value is a list, such as a `<p-select multiple>`, by
  the values it holds. Each read gave a new array, which never matched the one recorded, so once
  such a field was checked its form stayed dirty: undoing an edit left it marked, and saving still
  asked about leaving the page.

## [0.1.7] - 2026-10-30

### Changed

- A checkbox or radio keeps its size and sits on the first line of its label, so a long option
  that wraps no longer squashes the box or circle or floats it between the lines, and the label
  has the leading to wrap (`line-height: 1.25`, was `1`). A single-line option looks as it did.
- `<p-datetime>` takes the same edge as every other control, `--input` at
  `--control-border-width`, rather than the lighter `--border`, so a date picker beside a search
  box or a select no longer looks washed out.

## [0.1.6] - 2026-10-28

### Added

- `navmenu--labelled`: a main menu wide enough to set each icon beside its label
  (`navmenu__label`), with section titles (`navmenu__section-title`) and room for a wordmark
  logo. Below `md` it is the bottom bar, with each label under its icon.
- `--navmenu-width`, `--navmenu-labelled-width` and `--subnav-width` tokens, so a theme can set
  the widths of the rail and the section menu, and `--navmenu-logo-height` for a labelled rail's
  logo. The defaults are today's widths, so existing pages are unchanged.

## [0.1.5] - 2026-10-27

### Fixed

- An action bar's title sets its label, detail and badges on one baseline, whatever their size,
  with the line in the middle of the bar. A long label or detail still truncates, the detail first,
  rather than wrapping the line.

## [0.1.4] - 2026-10-26

### Changed

- The "more" menu an action bar folds its lower-priority actions into opens from vertical dots, as
  every other menu of actions does, and the demos draw their menus of actions the same way.
- A field's help text and error sit 6px under its control, and help text is set at a 1.25 line
  height; the label keeps its 8px above the control.

### Fixed

- A sticky page header gains its shadow only once the page scrolls. Minified, the `animation`
  shorthand could be sorted after `animation-timeline`, resetting it so the shadow showed at the
  top of the page; the animation is now set in longhand.
- A sticky page header's title row sits evenly in its bar, with as much room above it as below.

## [0.1.3] - 2026-10-16

### Added

- `btn--warning`, `btn--success` and `btn--info`, coloured buttons beside `btn--destructive` for
  an action that matches a status, such as a Fix button next to a Warning badge. They read the
  new `--warning-hover`, `--success-hover` and `--info-hover` tokens.
- Record Grid, the picture view of a record list: a `.recordgrid` of `recordgrid__item` tiles
  (`recordgrid--sm`, `recordgrid--square`), each led by a `recordgrid__thumb` (`--contain` for
  logos and product shots, or an icon when there is no image), with `recordgrid__title`,
  `recordgrid__meta` and a `recordgrid__footer` holding `recordgrid__status` badges and the action
  menu. A `recordgrid__select` checkbox lets the grid share the table's bulk actions; checked tiles
  are outlined and `aria-disabled="true"` dims a tile.
- Bulk Actions, the bar for acting on selected rows: `.bulkactions` (`--inline` to sit in the flow
  rather than float over the bottom of the viewport) with `bulkactions__count`,
  `bulkactions__actions` and `bulkactions__clear`. The page toggles it with `hidden` and it slides
  in when shown. It was in the demo stylesheet, so a site had to copy it; it now ships in the
  library. Both have a component page, and the Records demo uses them for its grid view and
  selection bar.

### Changed

- `--success-fg` is dark in the light theme too, as it already was in dark, and `--info-fg` is
  dark in both. Light text on green-500 and blue-500 fell short of WCAG AA contrast, so
  `badge--success` and `badge--info` now have dark text.

## [0.1.2] - 2026-10-16

### Added

- Auth, a component for signing in and the other screens shown before the dashboard shell: `.auth`
  centres an `.auth__container` (`--wide` for a longer form) holding a header (`auth__logo`,
  `auth__title`, `auth__description`), the form and an `auth__footer` with `auth__back`, and
  `auth__icon` (`--success`, `--error`) heads a screen that reports an outcome. It was in the demo
  stylesheet, so a site had to copy it; it now ships in the library, with a component page.

## [0.1.1] - 2026-10-16

Ready to publish on npm as a public package.

### Added

- An MIT `LICENSE` file, and `author`, `repository` and `publishConfig` (public access) in
  `package.json`.
- `CHANGELOG.md` is included in the package, so the markup notes ship with each version.

### Changed

- The popovers that keep the page's colours inside the rail, section menu and header are picked
  out by role (`[popover]`, `menu`, `dialog`, `tooltip`) instead of by class.

### Removed

- The demo-only stylesheets `scss/_demo.scss` and `scss/demo-pages.scss` from the package.

## [0.1.0] - 2026-10-16

The first tagged release, covering everything on `main` to date.

### Added

- Components, each with a page and a live playground: accordion, action bar, alert, avatar,
  badge, banner, breadcrumb, button, card, chart, command palette, dashboard shell (icon rail,
  section menu, header), data list, dropdown, empty state, file browser, form layout, input,
  list, media field, modal, navbar, notification, page header, pagination, progress, separator,
  sheet, sidebar, skeleton, stat, table, tabs, timeline, toast, toolbar and tooltip.
- Behaviours, exported from `@parallelogram-js/dashboard`: Accordion, ActionBar, ActionBarList,
  Chart, Collapsible, EditableTable, Expandable, OverflowActions, PublishSchedule,
  SegmentedControl, SearchClear, Submenu, TableColumns, TablePaste, TableReorder, TableSort,
  Tabs, ToastManager, Toggle and UnsavedGuard, with `init()` to enhance a page.
- Theme tokens: colour tokens as light and dark pairs; chrome tokens so the rail
  (`--navmenu-*`), section menu (`--subnav-*`) and page header (`--header-*`) can be coloured
  apart from the page, with head tokens for the logo cell and title bar; shape tokens for corner
  radius (`--radius-*`), control border width (`--control-border-width`) and icon stroke width
  (`--icon-stroke-width`); and `--avatar-bg` / `--avatar-fg`. A theme is a file of token values.
- `.pageheader--sticky`: the title and actions pin under the dashboard header from tablet width
  up and gain a shadow once the page scrolls.
- Package name `@parallelogram-js/dashboard`, with an `exports` map for the JavaScript entry,
  each behaviour (`@parallelogram-js/dashboard/behaviours/<name>`), the compiled CSS (expanded
  and minified) and the SCSS.
- `scss/_index.scss`, which forwards the foundation and every component so a project can
  `@use "@parallelogram-js/dashboard/scss" with (...)`, and `!default` on every variable in
  `_variables.scss` and on the token maps, so they can be configured.
- The behaviours as ES modules in `src/js`, with `init(root)`.
- Release tooling: `npm run release` cuts a version and tag, and `npm run compare` with
  `demo/compare.html` lists the computed-style changes between the current build and a tag.

### Changed

- Version reset to `0.1.0`; it stays on 0.x until Contenir has used it in production.
- `@parallelogram-js/core` is an optional peer dependency. Only pages that use `<p-modal>`,
  `<p-datetime>` or `[data-modal]` need it, and its components load through literal dynamic
  imports, so the consuming bundler resolves and code-splits them.
- The demo pages import the package through an import map, the same way an app does.

### Removed

- The unused `@tabler/icons-webfont` dependency.

### Markup changes

- **Sticky page header.** To pin a page's title row, add `pageheader--sticky` and move the
  description out of the header to directly after it, so it scrolls away. The plain
  `.pageheader` markup is unchanged.

  Before:

  ```html
  <div class="pageheader pageheader--row">
    <div class="pageheader__content">
      <h1 class="pageheader__title">Records</h1>
      <p class="pageheader__description">Manage and browse your records.</p>
    </div>
    <div class="pageheader__actions">…</div>
  </div>
  ```

  After:

  ```html
  <div class="pageheader pageheader--row pageheader--sticky">
    <div class="pageheader__content">
      <h1 class="pageheader__title">Records</h1>
    </div>
    <div class="pageheader__actions">…</div>
  </div>
  <p class="pageheader__description">Manage and browse your records.</p>
  ```

- **Page content is no longer a scroll container.** `.dashboard__content` no longer sets
  `overflow-y: auto`; the page itself scrolls. Templates that relied on the content area
  scrolling inside a fixed-height shell need their own scrolling wrapper.

[Unreleased]: https://github.com/parallelogram-dev/parallelogram-dashboard/compare/v0.1.9...HEAD
[0.1.9]: https://github.com/parallelogram-dev/parallelogram-dashboard/compare/v0.1.8...v0.1.9
[0.1.8]: https://github.com/parallelogram-dev/parallelogram-dashboard/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/parallelogram-dev/parallelogram-dashboard/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/parallelogram-dev/parallelogram-dashboard/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/parallelogram-dev/parallelogram-dashboard/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/parallelogram-dev/parallelogram-dashboard/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/parallelogram-dev/parallelogram-dashboard/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/parallelogram-dev/parallelogram-dashboard/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/parallelogram-dev/parallelogram-dashboard/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/parallelogram-dev/parallelogram-dashboard/releases/tag/v0.1.0
