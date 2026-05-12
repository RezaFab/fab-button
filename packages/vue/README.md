# @rezafab/fab-button-vue

Vue adapter for FabButton.

## Install

```bash
pnpm add @rezafab/fab-button-vue vue
```

## Usage

```vue
<script setup lang="ts">
import { FabButton } from "@rezafab/fab-button-vue"

const sections = [
  { key: "save", label: "Save", onClick: () => console.log("save") },
  { key: "share", label: "Share", onClick: () => console.log("share") }
]
</script>

<template>
  <FabButton :sections="sections" />
</template>
```

## Recommendation

For most projects, install the main package:

```bash
pnpm add @rezafab/fab-button
```

Then import from:

```ts
import { FabButton } from "@rezafab/fab-button/vue"
```

## Why this package exists

- Provides a framework-specific entrypoint for users who want adapter-level installation.
- Keeps Vue adapter release and internals modular in the monorepo.
- Enables internal composition with shared core and style packages.

Main docs: https://github.com/RezaFab/fab-button#readme
