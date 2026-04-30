# FabButton

**Styled by default. Flexible by design.**

FabButton is a section-based button builder for modern and legacy frontends. It gives you sensible default styling while keeping CSS override simple through CSS variables and data attributes.

## Why FabButton

- Framework-agnostic core logic and types
- React adapter for immediate use in React projects
- Vue adapter for Vue 3 projects
- Svelte adapter for Svelte projects
- Web Component adapter (`<fab-button>`) for vanilla HTML, Vue, Svelte, Angular, or legacy apps
- Easy customization via:
  - CSS variables such as `--fab-button-bg`, `--fab-button-radius`, and `--fab-button-gap`
  - Data attributes such as `data-variant`, `data-size`, `data-layout`, and `data-section`
- Works with plain CSS, utility-first CSS classes, and existing design systems

## Packages

- `@rezafab/fab-button-core`: core types and class/CSS-variable helpers
- `@rezafab/fab-button-styles`: default `style.css`
- `@rezafab/fab-button-react`: React `FabButton` component
- `@rezafab/fab-button-vue`: Vue `FabButton` component
- `@rezafab/fab-button-svelte`: Svelte `FabButton` component
- `@rezafab/fab-button-element`: Custom Element adapter
- `@rezafab/docs`: Storybook documentation app

## Installation

```bash
pnpm add @rezafab/fab-button-react
```

```bash
pnpm add @rezafab/fab-button-element
```

```bash
pnpm add @rezafab/fab-button-vue
```

```bash
pnpm add @rezafab/fab-button-svelte
```

## React Usage

```tsx
import { FabButton } from "@rezafab/fab-button-react"

export function Example() {
  return (
    <FabButton
      variant="primary"
      sections={[
        { key: "icon", content: "🚀", ariaLabel: "Launch icon" },
        { key: "label", content: "Launch" }
      ]}
    />
  )
}
```

## Section Action Usage

If any section has `onClick`, `FabButton` uses a non-button group root and renders each section as its own `<button>`.

```tsx
<FabButton
  sections={[
    { key: "copy", content: "Copy", onClick: () => console.log("copy") },
    { key: "share", content: "Share", onClick: () => console.log("share") }
  ]}
/>
```

## 4-Area Puzzle Button

```tsx
<FabButton
  layout="grid"
  columns="repeat(2, minmax(84px, 1fr))"
  rows="repeat(2, minmax(42px, auto))"
  sections={[
    { key: "up", content: "Up", onClick: () => {} },
    { key: "left", content: "Left", onClick: () => {} },
    { key: "right", content: "Right", onClick: () => {} },
    { key: "down", content: "Down", onClick: () => {} }
  ]}
/>
```

## Custom CSS Override

```css
.custom-action {
  --fab-button-bg: #fff7ed;
  --fab-button-color: #7c2d12;
  --fab-button-border: 1px solid #fdba74;
  --fab-button-radius: 999px;
  --fab-button-gap: 8px;
}
```

## Legacy CSS Integration

FabButton avoids global selectors and relies on local classes (`.fab-button`, `.fab-button__section`) plus data attributes, so it can coexist with old CSS stacks with low collision risk.

## Unstyled Mode

Use `unstyled` to skip default classes and fully own the rendering styles from your application.

```tsx
<FabButton
  unstyled
  className="my-button"
  sections={[
    { key: "left", content: "Plain" },
    { key: "right", content: "Styled by app" }
  ]}
/>
```

## Accessibility and Keyboard

For section-action buttons, you can keep default tab navigation or switch to toolbar-style keyboard navigation.

```tsx
<FabButton
  keyboardNavigation="toolbar"
  keyboardOrientation="horizontal"
  loopNavigation
  sections={[
    { key: "copy", content: "Copy", onClick: () => {} },
    { key: "share", content: "Share", onClick: () => {} },
    { key: "save", content: "Save", onClick: () => {} }
  ]}
/>
```

- `keyboardNavigation="tab"`: each section is in normal tab order (default)
- `keyboardNavigation="toolbar"`: one tab stop + arrow key navigation (`Home`/`End` supported)
- `keyboardOrientation`: `horizontal`, `vertical`, or `both`
- `loopNavigation`: wrap focus from last to first and vice versa (default `true`)

## Development

```bash
pnpm install
pnpm build
pnpm storybook
```

## Roadmap

- Add theme tokens package
- Publish examples for non-bundler environments
