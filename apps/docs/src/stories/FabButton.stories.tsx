import type { Meta, StoryObj } from "@storybook/react"
import { FabButton } from "@rezafab/fab-button-react"

const meta = {
  title: "FabButton/Examples",
  component: FabButton
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
      { key: "icon", content: "🔔", ariaLabel: "Notification icon" },
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
