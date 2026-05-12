# @rezafab/fab-button-theme-tokens

Theme token package for FabButton.

## Install

```bash
pnpm add @rezafab/fab-button-theme-tokens
```

## Usage

Import CSS tokens:

```css
@import "@rezafab/fab-button-theme-tokens/tokens.css";
```

Import JS tokens:

```ts
import { fabButtonThemeTokens } from "@rezafab/fab-button-theme-tokens"
```

## Recommendation

For most projects, install `@rezafab/fab-button` and use built-in styles and exports first.

Use this package directly when you need standalone token access for custom design-system integration.

## Why this package exists

- Separates design tokens from component/runtime logic.
- Makes tokens reusable for CSS and JavaScript consumption.
- Supports theming customization without coupling to a specific adapter.

Main docs: https://github.com/RezaFab/fab-button#readme
