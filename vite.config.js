import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // Bind to all interfaces so the app is reachable from previews/proxies.
    host: true,
    // Allow sandbox preview hosts (e.g. https://{port}-{id}.e2b.app) through
    // Vite's Host header check, in addition to plain localhost.
    allowedHosts: ['.e2b.app', 'localhost', '127.0.0.1'],
  },
  preview: {
    host: true,
    allowedHosts: ['.e2b.app', 'localhost', '127.0.0.1'],
  },
});