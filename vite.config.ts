import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Inspector from "vite-plugin-vue-inspector";

export default defineConfig({
  plugins: [
    vue(),
    Inspector({
      enabled: false,
      toggleButtonVisibility: "always",
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
