import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext", // ✅ allows top-level await
  },
  define: {
    "process.env": {}, // 🩹 Patch to stop "process is not defined" error
  },
});
