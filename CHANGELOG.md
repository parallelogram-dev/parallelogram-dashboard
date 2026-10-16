# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Package name `@parallelogram-js/dashboard`, with an `exports` map for the JS, the compiled CSS and the SCSS.
- `scss/_index.scss`, which forwards the foundation and every component so a project can `@use "@parallelogram-js/dashboard/scss" with (...)`.
- `!default` on every variable in `_variables.scss` and on `$theme-tokens`, so they can be configured.
- The behaviours as ES modules in `src/js`, with `init(root)` and every behaviour as a named export from `@parallelogram-js/dashboard`, and each one at `@parallelogram-js/dashboard/behaviours/<name>`.

### Changed

- Version reset to `0.1.0`; it stays on 0.x until Contenir has used it in production.
- `@parallelogram-js/core` is now an optional peer dependency. Only pages that use `<p-modal>`, `<p-datetime>` or `[data-modal]` need it.

- `@parallelogram-js/core` components load through literal dynamic imports, so the consuming bundler resolves and code-splits them.
- The demo pages import the package through an import map, the same way an app does.

### Removed

- The unused `@tabler/icons-webfont` dependency.
