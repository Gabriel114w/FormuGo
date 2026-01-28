import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // O alias antigo (mantenha por segurança)
      "@formugo/shared": path.resolve(__dirname, "../shared"),

      // ✅ O NOVO ALIAS (Isso conserta o erro vermelho de import)
      "@shared": path.resolve(__dirname, "../shared"),

      "@": path.resolve(__dirname, "./src"),
      "zod": path.resolve(__dirname, "./node_modules/zod"),
      "drizzle-orm": path.resolve(__dirname, "./node_modules/drizzle-orm"),
      "drizzle-zod": path.resolve(__dirname, "./node_modules/drizzle-zod"),
    },
    preserveSymlinks: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  }
})