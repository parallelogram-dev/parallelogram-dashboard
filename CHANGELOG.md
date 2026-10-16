# Changelog

All notable changes to `@parallelogram-js/dashboard` are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow the rules in the
README's [Versioning](README.md#versioning) section.

Each release can have a **Markup changes** section. It lists every change a site has to make in
its own templates to upgrade: a class renamed or removed, a required element added or moved, or a
token renamed or removed. Each entry shows the markup before and after. A release with no such
section can be taken with a version bump and a rebuild.

## [Unreleased]

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

[Unreleased]: https://github.com/parallelogram-dev/parallelogram-dashboard/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/parallelogram-dev/parallelogram-dashboard/releases/tag/v0.1.0
