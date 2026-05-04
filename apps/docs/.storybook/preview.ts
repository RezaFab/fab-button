import type { Preview } from "@storybook/react"
import { configureFabButton } from "@rezafab/fab-button-react"
import "@rezafab/fab-button-styles/style.css"
import "../src/stories/legacy.css"

const preview: Preview = {
  globalTypes: {
    theme: {
      name: "Theme",
      description: "FabButton theme mode",
      defaultValue: "light",
      toolbar: {
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
          { value: "system", title: "System" }
        ]
      }
    }
  },
  decorators: [
    (Story, context) => {
      const selectedTheme = (context.globals.theme as "light" | "dark" | "system") ?? "light"

      configureFabButton({
        cssMode: "library",
        theme: selectedTheme,
        library: {
          preset: "tailwind"
        }
      })

      const root = document.documentElement
      root.dataset.fabTheme = selectedTheme
      if (selectedTheme === "dark") {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }

      return Story()
    }
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i
      }
    },
    backgrounds: {
      default: "canvas-light",
      values: [
        { name: "canvas-light", value: "#f3f4f6" },
        { name: "canvas-dark", value: "#111827" }
      ]
    },
    layout: "centered"
  }
}

export default preview
