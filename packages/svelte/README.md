# @rezafab/fab-button-svelte

Svelte adapter for FabButton.

## Install

```bash
pnpm add @rezafab/fab-button-svelte svelte
```

## Usage

```svelte
<script lang="ts">
  import { FabButton } from "@rezafab/fab-button-svelte"

  const sections = [
    { key: "save", label: "Save", onClick: () => console.log("save") },
    { key: "share", label: "Share", onClick: () => console.log("share") }
  ]
</script>

<FabButton {sections} />
```

## Recommendation

For most projects, install the main package:

```bash
pnpm add @rezafab/fab-button
```

Then import from:

```ts
import { FabButton } from "@rezafab/fab-button/svelte"
```

## Why this package exists

- Provides a framework-specific entrypoint for users who want adapter-level installation.
- Keeps Svelte adapter release and internals modular in the monorepo.
- Enables internal composition with shared core and style packages.

Main docs: https://github.com/RezaFab/fab-button#readme
