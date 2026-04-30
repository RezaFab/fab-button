import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [
    svelte(),
    dts({
      include: ["src"],
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: () => "index.js"
    },
    rollupOptions: {
      external: ["svelte", /^svelte\//]
    }
  },
  test: {
    environment: "node"
  }
})
