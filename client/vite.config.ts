import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // permite importar coisas do src usando "@"
    },
  },
  optimizeDeps: {
    include: ["zod"], // garante que o zod seja incluído no bundle
  },
});
