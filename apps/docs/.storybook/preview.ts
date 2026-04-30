import type { Preview } from "@storybook/react"
import "@rezafab/fab-button-styles/style.css"
import "../src/stories/legacy.css"

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i
      }
    },
    layout: "centered"
  }
}

export default preview
