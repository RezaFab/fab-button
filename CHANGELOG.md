# Changelog

All notable changes to `@rezafab/fab-button` are documented in this file.

## [1.2.0] - 2026-05-05

- Added `@rezafab/fab-button-theme-tokens` package with shared `tokens.css` variables and JS/TS token exports.
- Refactored `@rezafab/fab-button-styles` to consume shared tokens for `cssMode: "manual"` defaults.
- Added root package subpath exports for tokens:
  - `./theme-tokens`
  - `./theme-tokens/tokens.css`
- Updated README with theme token package usage docs and roadmap completion.

## [1.1.0] - 2026-05-04

- Added CSS mode configuration system (`manual` and `library`) with global runtime config.
- Added library styling presets support with Tailwind default behavior in Storybook docs.
- Added native theme support (`light`, `dark`, `system`) across React, Vue, Svelte, and Element adapters.
- Added theme-aware base styling in `@rezafab/fab-button-styles`.
- Updated Storybook with:
  - default Tailwind library mode setup
  - global theme toolbar
  - dark theme examples
  - keyboard shortcut integration example (`C`, `S`, `V`)
- Expanded README with:
  - English-only documentation
  - richer comparison cases (traditional vs FabButton)
  - layout examples (horizontal, vertical, grid)
  - role-based hide/disable workflow example
  - keyboard shortcut integration documentation

## [1.0.0] - 2026-05-04

- Set the major baseline to `1` based on the updated versioning strategy.
- Refined npm publish configuration so the package only contains production files:
  - include: `README.md`, `LICENSE`, `package.json`, build output, `.d.ts`, compiled CSS
  - exclude: docs app, changeset folder, and source/story/config files not needed by consumers
- Added root export map for subpath access:
  - `./core`, `./react`, `./vue`, `./svelte`, `./element`
  - CSS subpath exports
- Added versioning guide and version bump scripts:
  - major for large FabButton changes
  - minor for merged feature/improvement PRs
  - patch for fixes

## [0.0.1]

- Initial published release of `@rezafab/fab-button`.
