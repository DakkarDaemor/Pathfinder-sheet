import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Repository name on GitHub Pages, e.g. https://<user>.github.io/<repo>/
// Override locally with `BASE_PATH=/` if you don't need the sub-path.
const base = process.env.BASE_PATH ?? "/Pathfinder-sheet/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
