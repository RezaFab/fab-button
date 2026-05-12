# Changelog

All notable changes to `@rezafab/fab-button` are documented in this file.

## [1.5.3] - 2026-05-12

- fix(release): publish workspace packages first, then publish root package (`@rezafab/fab-button`) with pnpm to avoid leaking `workspace:*` in npm metadata.

## [1.5.2] - 2026-05-12

- fix(release): republish with pnpm workspace flow so workspace dependencies are converted for external installs.

## [1.5.1] - 2026-05-12

- fix(release): publish with pnpm workspace flow.

## [1.5.0] - 2026-05-07

- Added role/permission section guard helpers: `visibleWhen(...)` and `disabledWhen(...)`.
- Added runtime section guard resolution across React, Vue, and Svelte adapters:
  - `visibleWhen` hides sections before rendering and interaction registration.
  - `disabledWhen` marks sections as disabled while preserving existing `disabled` and async loading behavior.
- Added split-button preset for grouped actions across React, Vue, and Svelte adapters:
  - `actionPreset: "split"` keeps the first section as primary action.
  - Remaining sections are moved into a built-in dropdown menu.
  - Added `splitButtonMenuLabel` to customize the split dropdown trigger icon/symbol (default: `\u25BE`).
  - Added `splitButtonTriggerSide` (`"left" | "right"`) to position split trigger.
  - Last selected dropdown action is promoted to the next primary action.
- Added action analytics hook across React, Vue, Svelte, and Element adapters:
  - `onSectionAction` callback with metadata `{ key, index, source }`.
  - Web Component emits native `section-action` event with the same metadata payload.
  - Source metadata includes `click`, `shortcut`, and `keyboard-nav`.
- Updated adapter re-exports (`@rezafab/fab-button-react`, `@rezafab/fab-button-vue`, `@rezafab/fab-button-svelte`, `@rezafab/fab-button-element`) to expose guard helpers and `FabButtonSectionGuard` type.

## [1.4.0] - 2026-05-05

- Added built-in section confirmation flow via modal popup (`confirm: true | { title, description }`) before section action handlers execute.
- Added Storybook `SectionConfirmFlow` demo and README usage docs for React and Web Component confirmation setup.
- Added per-section async feedback states (`loading`, `success`, `error`) with Promise-aware auto handling and manual `asyncState` override support.
- Added `asyncFeedbackDuration` for per-section auto reset timing and Storybook `PerSectionAsyncState` example.
- Added automatic shortcut hint UI from `shortcut` / `shortcutId` with standardized hint labels and `data-shortcut-hint` metadata.
- Added responsive overflow mode (`More` menu) for small screens with `overflowMode`, `overflowBreakpoint`, `overflowVisibleCount`, and `overflowMenuLabel`.

## [1.3.0] - 2026-05-05

- Added built-in section keyboard shortcuts via `shortcut` and `shortcutId` across React, Vue, Svelte, and Element adapters.
- Added complete keyboard ID map exports: `FAB_BUTTON_SHORTCUT_ID_TO_CODE` and `FAB_BUTTON_SHORTCUT_CODE_TO_ID` (including React re-export).
- Added shortcut token matching for `key`, `code`, `keycode`, and ID token formats (`id:<number>` / `shortcutid:<number>`).
- Added adapter metadata attributes for shortcuts: `data-shortcut` and `data-shortcut-id`.
- Updated keyboard behavior demos to use built-in shortcut mapping (no manual `window` listener code needed).
- Added Storybook reference story `FullKeyboardShortcutIdMap` for keyboard ID mapping visibility.
- Updated README keyboard shortcut docs with simplified shortcut rules and full mapping tables.
- Reformatted README keyboard map tables into 3-column layout for cleaner Markdown rendering.

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
