# @rezafab/fab-button-core

Framework-agnostic core utilities and types for FabButton.

## Install

```bash
pnpm add @rezafab/fab-button-core
```

## Usage

```ts
import { visibleWhen, disabledWhen } from "@rezafab/fab-button-core"

const canDelete = true
const isBusy = false

const sections = [
  { key: "save", label: "Save" },
  {
    key: "delete",
    label: "Delete",
    ...visibleWhen(() => canDelete),
    ...disabledWhen(() => isBusy)
  }
]
```

## Recommendation

For most projects, install `@rezafab/fab-button` instead of using this package directly.

Use this package directly only if you need low-level core utilities and types.

## Why this package exists

- Keeps core logic framework-agnostic and reusable across adapters.
- Avoids logic duplication between React, Vue, Svelte, and Custom Element packages.
- Supports modular builds, testing, and maintenance in a monorepo.

Main docs: https://github.com/RezaFab/fab-button#readme
