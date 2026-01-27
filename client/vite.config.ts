import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@formugo/shared": path.resolve(__dirname, "../shared"),
      "@": path.resolve(__dirname, "./src"),
      "zod": path.resolve(__dirname, "./node_modules/zod"),
      "drizzle-orm": path.resolve(__dirname, "./node_modules/drizzle-orm"),
    },
  },
  build: {
    // Força a pasta dist a ser criada dentro de client/
    outDir: "dist",
    emptyOutDir: true,
  }
})