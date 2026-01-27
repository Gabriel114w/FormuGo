import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname), // define que o root é a pasta client
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    include: ["zod"],
  },
  build: {
    outDir: path.resolve(__dirname, "../dist"), // saída fora da pasta client
    emptyOutDir: true,
  },
});
