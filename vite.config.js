import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],

  // Required for GitHub Pages
  base: "/portfolio/",

  // GitHub Pages + Vite cache stability
  build: {
    sourcemap: true,
    assetsDir: "assets",
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
      },
    },
  },
})
