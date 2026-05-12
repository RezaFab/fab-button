# @rezafab/fab-button-element

Custom Element adapter for FabButton.

## Install

```bash
pnpm add @rezafab/fab-button-element
```

## Usage

```ts
import "@rezafab/fab-button-element"
```

Or register manually:

```ts
import { defineFabButtonElement } from "@rezafab/fab-button-element"

defineFabButtonElement()
```

## Recommendation

For most projects, install the main package:

```bash
pnpm add @rezafab/fab-button
```

Then import from:

```ts
import "@rezafab/fab-button/element"
```

## Why this package exists

- Provides a framework-specific entrypoint for users who want adapter-level installation.
- Keeps Custom Element adapter release and internals modular in the monorepo.
- Enables internal composition with shared core and style packages.

Main docs: https://github.com/RezaFab/fab-button#readme
