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
      "drizzle-zod": path.resolve(__dirname, "./node_modules/drizzle-zod"),
    },
    // Isso aqui é o "pulo do gato": força o Vite a resolver dependências 
    // do shared usando o node_modules do client
    preserveSymlinks: true,
  },
  // Caso o preserveSymlinks não seja suficiente para o Rollup, 
  // adicionamos os aliases específicos que estão faltando:
  build: {
    outDir: "dist",
    rollupOptions: {
      external: [], // Deixe vazio
    }
  }
})