import type { StorybookConfig } from "@storybook/react-vite"
import { fileURLToPath } from "node:url"
import path from "node:path"

const dirname = path.dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx|mdx)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  docs: {
    autodocs: "tag"
  },
  viteFinal: async (viteConfig) => {
    viteConfig.resolve ??= {}
    viteConfig.resolve.alias ??= {}

    Object.assign(viteConfig.resolve.alias, {
      "@rezafab/fab-button-react": path.resolve(dirname, "../../../packages/react/src/index.ts"),
      "@rezafab/fab-button-core": path.resolve(dirname, "../../../packages/core/src/index.ts"),
      "@rezafab/fab-button-styles/style.css": path.resolve(dirname, "../../../packages/styles/style.css")
    })

    return viteConfig
  }
}

export default config
