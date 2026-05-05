import type { Meta, StoryObj } from "@storybook/react"
import { useEffect, useRef, useState } from "react"
import { FabButton } from "@rezafab/fab-button-react"

const meta = {
  title: "FabButton/Examples",
  component: FabButton,
  args: {
    theme: "light"
  },
  argTypes: {
    theme: {
      control: "radio",
      options: ["light", "dark", "system"]
    }
  }
} satisfies Meta<typeof FabButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: "default",
    sections: [{ key: "main", content: "FabButton Default" }]
  }
}

export const TechStackButton: Story = {
  args: {
    variant: "primary",
    sections: [
      { key: "js", content: "JS" },
      { key: "ts", content: "TS" },
      { key: "vite", content: "Vite" }
    ]
  }
}

export const IconLabelCountButton: Story = {
  args: {
    shape: "pill",
    sections: [
      { key: "icon", content: "Bell", ariaLabel: "Notification icon" },
      { key: "label", content: "Alerts" },
      { key: "count", content: "12" }
    ]
  }
}

export const PuzzleButtonFourActions: Story = {
  args: {
    layout: "grid",
    columns: "repeat(2, minmax(84px, 1fr))",
    rows: "repeat(2, minmax(42px, auto))",
    gap: "6px",
    sections: [
      { key: "up", content: "Up", onClick: () => undefined, ariaLabel: "Move up" },
      { key: "left", content: "Left", onClick: () => undefined, ariaLabel: "Move left" },
      { key: "right", content: "Right", onClick: () => undefined, ariaLabel: "Move right" },
      { key: "down", content: "Down", onClick: () => undefined, ariaLabel: "Move down" }
    ]
  }
}

export const ToolbarKeyboardNavigation: Story = {
  args: {
    keyboardNavigation: "toolbar",
    keyboardOrientation: "horizontal",
    loopNavigation: true,
    sections: [
      { key: "copy", content: "Copy", onClick: () => undefined, ariaLabel: "Copy item" },
      { key: "share", content: "Share", onClick: () => undefined, ariaLabel: "Share item" },
      { key: "save", content: "Save", onClick: () => undefined, ariaLabel: "Save item" }
    ]
  }
}

const KeyboardShortcutActionsDemo = () => {
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
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  return (
    <div ref={rootRef} style={{ display: "grid", gap: "12px" }}>
      <p style={{ margin: 0, fontSize: "14px", color: "#475569" }}>
        Press keyboard shortcuts: <strong>C</strong> = Copy, <strong>S</strong> = Share,{" "}
        <strong>V</strong> = Save
      </p>
      <FabButton
        keyboardNavigation="toolbar"
        sections={[
          { key: "copy", content: "Copy", onClick: () => setLastAction("Copy") },
          { key: "share", content: "Share", onClick: () => setLastAction("Share") },
          { key: "save", content: "Save", onClick: () => setLastAction("Save") }
        ]}
      />
      <p style={{ margin: 0, fontSize: "14px", color: "#0f172a" }}>Last action: {lastAction}</p>
    </div>
  )
}

export const KeyboardShortcutIntegration: Story = {
  render: () => <KeyboardShortcutActionsDemo />,
  args: {
    sections: []
  }
}

export const LegacyCSSIntegration: Story = {
  render: (args) => (
    <div className="legacy-wrapper">
      <FabButton {...args} />
    </div>
  ),
  args: {
    variant: "outline",
    sections: [
      { key: "name", content: "Legacy UI" },
      { key: "status", content: "Compatible" }
    ]
  }
}

export const TailwindLikeClassNameExample: Story = {
  args: {
    className: "tailwind-like",
    unstyled: true,
    sections: [
      { key: "left", content: "Tailwind-like" },
      { key: "right", content: "Class Name API" }
    ]
  }
}

export const UnstyledMode: Story = {
  args: {
    unstyled: true,
    style: {
      display: "inline-flex",
      border: "2px dashed #6366f1",
      borderRadius: "12px",
      padding: "4px",
      gap: "6px",
      fontFamily: "monospace"
    },
    sections: [
      {
        key: "slot-1",
        content: "Unstyled",
        style: {
          padding: "8px 12px",
          background: "#e0e7ff",
          borderRadius: "8px"
        }
      },
      {
        key: "slot-2",
        content: "Custom Painted",
        style: {
          padding: "8px 12px",
          background: "#c7d2fe",
          borderRadius: "8px"
        }
      }
    ]
  }
}

export const Disabled: Story = {
  args: {
    disabled: true,
    sections: [
      { key: "label", content: "Disabled" },
      { key: "hint", content: "No action" }
    ]
  }
}

export const Loading: Story = {
  args: {
    loading: true,
    sections: [{ key: "label", content: "Submit" }]
  }
}

export const DarkTheme: Story = {
  args: {
    theme: "dark",
    variant: "default",
    sections: [
      { key: "label", content: "Dark Theme" },
      { key: "state", content: "Native Support" }
    ]
  }
}
