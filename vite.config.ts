import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      babel: {
        plugins: [
          ['styled-jsx/babel', { optimizeForSpeed: true }]
        ]
      }
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "client", "src", "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    // Only use proxy in development mode
    ...(mode === 'development' && {
      proxy: {
        '/api': {
          target: 'https://flowerschoolbengaluru.com',
          changeOrigin: true,
          secure: true
        }
      }
    })
  }
}));
