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
- `@rezafab/fab-button-theme-tokens`: shared theme tokens (`tokens.css` + JS token object)
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

## CSS Mode (Manual vs Library)

FabButton now supports 2 CSS modes:

- `manual` (default): uses FabButton's built-in styles (same as current behavior).
- `library`: uses class strategies from a UI library (Tailwind/Bootstrap/custom classes).

The main goal is to make integration configurable through one app-level config file, without changing most component code.

### 1) Create a config file in your app

Example file: `src/fab-button.config.ts`

```ts
import { configureFabButton, createFabButtonConfig } from "@rezafab/fab-button-react"

configureFabButton(
  createFabButtonConfig({
    cssMode: "manual"
  })
)
```

For Vue/Svelte/Element, import from each package:

- `@rezafab/fab-button-vue`
- `@rezafab/fab-button-svelte`
- `@rezafab/fab-button-element`

### 2) Import the config once in your app entry

Example `src/main.tsx`:

```ts
import "./fab-button.config"
```

### Switch to Tailwind mode

```ts
import { configureFabButton, createFabButtonConfig } from "@rezafab/fab-button-react"

configureFabButton(
  createFabButtonConfig({
    cssMode: "library",
    library: {
      preset: "tailwind"
    }
  })
)
```

### Switch to Bootstrap mode

```ts
import { configureFabButton, createFabButtonConfig } from "@rezafab/fab-button-react"

configureFabButton(
  createFabButtonConfig({
    cssMode: "library",
    library: {
      preset: "bootstrap"
    }
  })
)
```

### Custom CSS library mode

```ts
import { configureFabButton, createFabButtonConfig } from "@rezafab/fab-button-react"

configureFabButton(
  createFabButtonConfig({
    cssMode: "library",
    library: {
      preset: "custom",
      classes: {
        root: "rk-btn",
        section: "rk-btn__section",
        actionSection: "rk-btn__section--interactive",
        variant: {
          primary: "rk-btn--primary",
          outline: "rk-btn--outline"
        },
        size: {
          sm: "rk-btn--sm",
          md: "rk-btn--md",
          lg: "rk-btn--lg"
        }
      }
    }
  })
)
```

When `cssMode` changes, button styles update automatically to the selected mode (`manual`/`library`) without rewriting your `FabButton` component usage.

## Native Theme Support (Light / Dark / System)

FabButton supports native theme selection through the `theme` prop:

- `light`
- `dark`
- `system` (follows `prefers-color-scheme`)

```tsx
<FabButton
  theme="dark"
  sections={[
    { key: "left", content: "Dark" },
    { key: "right", content: "Theme" }
  ]}
/>
```

You can also set it globally via config:

```ts
import { configureFabButton } from "@rezafab/fab-button-react"

configureFabButton({
  theme: "system"
})
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

## Styled FabButton Example

```tsx
import { FabButton } from "@rezafab/fab-button-react"

export function StyledExample() {
  return (
    <FabButton
      variant="primary"
      size="lg"
      shape="pill"
      className="hero-action"
      style={{
        "--fab-button-bg": "linear-gradient(90deg, #0f172a 0%, #1d4ed8 100%)",
        "--fab-button-border": "1px solid #1e40af",
        "--fab-button-gap": "10px",
        "--fab-button-radius": "999px",
        "--fab-button-height": "52px"
      }}
      sections={[
        { key: "label", content: "Start Career Assessment" },
        { key: "badge", content: "Free" },
        { key: "arrow", content: "→", ariaLabel: "Open assessment" }
      ]}
    />
  )
}
```

## Comparison Cases (Without FabButton vs With FabButton)

Why developers use FabButton:

- Less repeated markup for grouped actions.
- Better visual consistency across screens and teams.
- Easier control of grouped behavior (disabled/loading/keyboard navigation) in one place.
- Simpler style-system switching per project (manual CSS vs Tailwind/Bootstrap/custom).
- More consistent API across React, Vue, Svelte, and Web Component usage.

### Case 1: Utility Action Group (`Copy`, `Share`, `Save`)

Scenario: dashboard card or editor toolbar with three quick utility actions.

### Without FabButton (3 separate buttons)

```tsx
import { useState } from "react"

export function TraditionalActionGroup() {
  const [lastAction, setLastAction] = useState("None")

  return (
    <div>
      <div className="action-row">
        <button type="button" onClick={() => setLastAction("Copy")}>
          Copy
        </button>
        <button type="button" onClick={() => setLastAction("Share")}>
          Share
        </button>
        <button type="button" onClick={() => setLastAction("Save")}>
          Save
        </button>
      </div>
      <p>Last action: {lastAction}</p>
    </div>
  )
}
```

### With FabButton (1 component, 3 sections)

```tsx
import { FabButton } from "@rezafab/fab-button-react"
import { useState } from "react"

export function FabButtonActionGroup() {
  const [lastAction, setLastAction] = useState("None")

  return (
    <div>
      <FabButton
        sections={[
          { key: "copy", content: "Copy", onClick: () => setLastAction("Copy") },
          { key: "share", content: "Share", onClick: () => setLastAction("Share") },
          { key: "save", content: "Save", onClick: () => setLastAction("Save") }
        ]}
      />
      <p>Last action: {lastAction}</p>
    </div>
  )
}
```

Both examples produce the same output (`Last action: Copy/Share/Save`), but the FabButton version is more compact and consistent.

### Case 2: Keyboard Accessibility (`Previous`, `Next`, `Skip`)

Scenario: onboarding/tutorial controls that must work well with keyboard users.

### Without FabButton (manual keyboard logic)

```tsx
import { useRef } from "react"

export function TraditionalKeyboardActions() {
  const refs = [useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null)]

  const onKeyDown = (index: number, event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowRight") refs[(index + 1) % refs.length].current?.focus()
    if (event.key === "ArrowLeft") refs[(index - 1 + refs.length) % refs.length].current?.focus()
  }

  return (
    <div role="toolbar" aria-label="Tutorial actions">
      <button ref={refs[0]} onKeyDown={(e) => onKeyDown(0, e)}>Previous</button>
      <button ref={refs[1]} onKeyDown={(e) => onKeyDown(1, e)}>Next</button>
      <button ref={refs[2]} onKeyDown={(e) => onKeyDown(2, e)}>Skip</button>
    </div>
  )
}
```

### With FabButton (built-in toolbar keyboard behavior)

```tsx
import { FabButton } from "@rezafab/fab-button-react"

export function FabButtonKeyboardActions() {
  return (
    <FabButton
      keyboardNavigation="toolbar"
      keyboardOrientation="horizontal"
      sections={[
        { key: "prev", content: "Previous", onClick: () => {} },
        { key: "next", content: "Next", onClick: () => {} },
        { key: "skip", content: "Skip", onClick: () => {} }
      ]}
    />
  )
}
```

Both versions provide the same actions, but FabButton includes toolbar-style keyboard navigation without writing custom focus logic.

### Case 3: Unified Loading/Disabled State (`Save`, `Submit`, `Publish`)

Scenario: form workflow where all related actions should lock during async requests.

### Without FabButton (manual state sync across buttons)

```tsx
import { useState } from "react"

export function TraditionalAsyncActions() {
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    setLoading(false)
  }

  return (
    <div>
      <button disabled={loading} onClick={run}>Save</button>
      <button disabled={loading} onClick={run}>Submit</button>
      <button disabled={loading} onClick={run}>Publish</button>
      {loading && <p>Processing...</p>}
    </div>
  )
}
```

### With FabButton (single loading/disabled source)

```tsx
import { FabButton } from "@rezafab/fab-button-react"
import { useState } from "react"

export function FabButtonAsyncActions() {
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    setLoading(false)
  }

  return (
    <FabButton
      loading={loading}
      sections={[
        { key: "save", content: "Save", onClick: run },
        { key: "submit", content: "Submit", onClick: run },
        { key: "publish", content: "Publish", onClick: run }
      ]}
    />
  )
}
```

Both versions expose the same actions, but FabButton centralizes loading/disabled behavior to reduce state inconsistency bugs.

### Role-Based Approval Example (Hide + Disable)

Scenario: approval workflow where each role can only act at the right stage.

- Hide actions when the current user is not authorized for that role.
- Disable actions when authorized but the workflow prerequisites are not ready.

### Without FabButton (manual hide/disable per button)

```tsx
import { useState } from "react"

type Role = "staff" | "supervisor" | "manager"

export function TraditionalApprovalActions({ currentRole }: { currentRole: Role }) {
  const [loading, setLoading] = useState(false)
  const [staffApproved, setStaffApproved] = useState(false)
  const [supervisorApproved, setSupervisorApproved] = useState(false)
  const [managerApproved, setManagerApproved] = useState(false)

  const canSeeStaff = currentRole === "staff"
  const canSeeSupervisor = currentRole === "supervisor"
  const canSeeManager = currentRole === "manager"

  const canApproveStaff = !staffApproved
  const canApproveSupervisor = staffApproved && !supervisorApproved
  const canApproveManager = supervisorApproved && !managerApproved

  const run = async (cb: () => void) => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    cb()
    setLoading(false)
  }

  return (
    <div>
      {canSeeStaff && (
        <button disabled={loading || !canApproveStaff} onClick={() => run(() => setStaffApproved(true))}>
          Staff Approve
        </button>
      )}
      {canSeeSupervisor && (
        <button
          disabled={loading || !canApproveSupervisor}
          onClick={() => run(() => setSupervisorApproved(true))}
        >
          Supervisor Approve
        </button>
      )}
      {canSeeManager && (
        <button disabled={loading || !canApproveManager} onClick={() => run(() => setManagerApproved(true))}>
          Manager Approve
        </button>
      )}
    </div>
  )
}
```

### With FabButton (single grouped control with role logic)

```tsx
import { FabButton } from "@rezafab/fab-button-react"
import { useState } from "react"

type Role = "staff" | "supervisor" | "manager"

type FabSection = {
  key: string
  content: string
  disabled?: boolean
  onClick?: () => void
}

const isSection = (value: FabSection | false): value is FabSection => Boolean(value)

export function FabButtonApprovalActions({ currentRole }: { currentRole: Role }) {
  const [loading, setLoading] = useState(false)
  const [staffApproved, setStaffApproved] = useState(false)
  const [supervisorApproved, setSupervisorApproved] = useState(false)
  const [managerApproved, setManagerApproved] = useState(false)

  const canSeeStaff = currentRole === "staff"
  const canSeeSupervisor = currentRole === "supervisor"
  const canSeeManager = currentRole === "manager"

  const canApproveStaff = !staffApproved
  const canApproveSupervisor = staffApproved && !supervisorApproved
  const canApproveManager = supervisorApproved && !managerApproved

  const run = async (cb: () => void) => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    cb()
    setLoading(false)
  }

  const sections = [
    canSeeStaff && {
      key: "staff",
      content: "Staff Approve",
      disabled: !canApproveStaff,
      onClick: () => run(() => setStaffApproved(true))
    },
    canSeeSupervisor && {
      key: "supervisor",
      content: "Supervisor Approve",
      disabled: !canApproveSupervisor,
      onClick: () => run(() => setSupervisorApproved(true))
    },
    canSeeManager && {
      key: "manager",
      content: "Manager Approve",
      disabled: !canApproveManager,
      onClick: () => run(() => setManagerApproved(true))
    }
  ].filter(isSection)

  return <FabButton loading={loading} sections={sections} />
}
```

Both approaches can enforce the same rules. FabButton keeps role-based actions in one control while preserving clear hide/disable logic.

### Case 4: Style Strategy Switching (Project-Level Theme Direction)

Scenario: a project switches design direction from built-in CSS to utility classes.

### Without FabButton (manual refactor in component usage)

```tsx
export function TraditionalStyledActions({ useUtilityClasses }: { useUtilityClasses: boolean }) {
  return (
    <div className={useUtilityClasses ? "flex gap-2 rounded-lg border p-1" : "action-row"}>
      <button className={useUtilityClasses ? "px-3 py-2 rounded-md hover:bg-black/10" : "btn"}>
        Copy
      </button>
      <button className={useUtilityClasses ? "px-3 py-2 rounded-md hover:bg-black/10" : "btn"}>
        Share
      </button>
      <button className={useUtilityClasses ? "px-3 py-2 rounded-md hover:bg-black/10" : "btn"}>
        Save
      </button>
    </div>
  )
}
```

### With FabButton (switch mode in one config file)

```ts
// src/fab-button.config.ts
import { configureFabButton, createFabButtonConfig } from "@rezafab/fab-button-react"

configureFabButton(
  createFabButtonConfig({
    cssMode: "library",
    library: {
      preset: "tailwind"
    }
  })
)
```

```tsx
// component usage stays the same
<FabButton
  sections={[
    { key: "copy", content: "Copy", onClick: () => {} },
    { key: "share", content: "Share", onClick: () => {} },
    { key: "save", content: "Save", onClick: () => {} }
  ]}
/>
```

Both approaches can reach the same UI direction, but FabButton centralizes style-mode switching at config level.

### Case 5: Multi-Framework Product (React + Vue + Svelte)

Scenario: a team ships the same action pattern to multiple frontend stacks.

### Without FabButton (separate implementations per framework)

```tsx
// React: app-specific component + behavior
export function ReactActionGroup() {
  return (
    <div>
      <button>Copy</button>
      <button>Share</button>
      <button>Save</button>
    </div>
  )
}
```

```ts
// Vue: rebuild similar template/behavior
// Svelte: rebuild similar template/behavior
// Web Component: rebuild similar behavior again
```

### With FabButton (same concept across frameworks)

```tsx
// React
import { FabButton } from "@rezafab/fab-button-react"
```

```ts
// Vue
import { FabButton } from "@rezafab/fab-button-vue"
```

```ts
// Svelte
import { FabButton } from "@rezafab/fab-button-svelte"
```

```ts
// Element
import "@rezafab/fab-button-element"
```

All adapters share the same section-based mental model, so teams can keep behavior and UX aligned across stacks.

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

## Layout Examples

### Horizontal layout (default)

```tsx
<FabButton
  layout="flex"
  sections={[
    { key: "copy", content: "Copy", onClick: () => {} },
    { key: "share", content: "Share", onClick: () => {} },
    { key: "save", content: "Save", onClick: () => {} }
  ]}
/>
```

### Vertical layout

```tsx
<FabButton
  layout="flex"
  style={{ flexDirection: "column", alignItems: "stretch" }}
  sections={[
    { key: "overview", content: "Overview", onClick: () => {} },
    { key: "details", content: "Details", onClick: () => {} },
    { key: "history", content: "History", onClick: () => {} }
  ]}
/>
```

### Grid layout

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

## Theme Tokens Package

Use the dedicated tokens package when you want one shared source for colors, spacing, radius, and interaction tokens.

```bash
pnpm add @rezafab/fab-button-theme-tokens
```

```ts
import "@rezafab/fab-button-theme-tokens/tokens.css"
import { fabButtonThemeTokens } from "@rezafab/fab-button-theme-tokens"
```

`tokens.css` exposes CSS variables that the default FabButton styles consume.

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

### Keyboard Shortcut Integration Example

You can map full keyboard shortcuts (for example `C`, `S`, `V`) to trigger each section action directly.

```tsx
import { useEffect, useRef, useState } from "react"
import { FabButton } from "@rezafab/fab-button-react"

export function KeyboardShortcutActions() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [lastAction, setLastAction] = useState("None")

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const shortcutMap: Record<string, string> = {
        c: "copy",
        s: "share",
        v: "save"
      }
      const sectionKey = shortcutMap[key]
      if (!sectionKey) return

      const sectionButton = rootRef.current?.querySelector<HTMLButtonElement>(
        `button[data-section="${sectionKey}"]`
      )
      if (!sectionButton || sectionButton.disabled) return

      event.preventDefault()
      sectionButton.focus()
      sectionButton.click()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <div ref={rootRef}>
      <FabButton
        keyboardNavigation="toolbar"
        sections={[
          { key: "copy", content: "Copy", onClick: () => setLastAction("Copy") },
          { key: "share", content: "Share", onClick: () => setLastAction("Share") },
          { key: "save", content: "Save", onClick: () => setLastAction("Save") }
        ]}
      />
      <p>Last action: {lastAction}</p>
    </div>
  )
}
```

This pattern lets keyboard users trigger the exact same section buttons, not a separate duplicated action path.

## Development

```bash
pnpm install
pnpm build
pnpm storybook
```

## Roadmap

- [x] Add theme tokens package
- Publish examples for non-bundler environments
