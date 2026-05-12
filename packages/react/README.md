# @rezafab/fab-button-react

React adapter for FabButton.

## Install

```bash
pnpm add @rezafab/fab-button-react react react-dom
```

## Usage

```tsx
import { FabButton } from "@rezafab/fab-button-react"

const sections = [
  { key: "save", label: "Save", onClick: () => console.log("save") },
  { key: "share", label: "Share", onClick: () => console.log("share") }
]

export function Example() {
  return <FabButton sections={sections} />
}
```

## Recommendation

For most projects, install the main package:

```bash
pnpm add @rezafab/fab-button
```

Then import from:

```ts
import { FabButton } from "@rezafab/fab-button/react"
```

## Why this package exists

- Provides a framework-specific entrypoint for users who want adapter-level installation.
- Keeps React adapter release and internals modular in the monorepo.
- Enables internal composition with shared core and style packages.

Main docs: https://github.com/RezaFab/fab-button#readme
