import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { prerenderMeta } from "./build/prerenderMeta";

// Per-route <head> metadata is baked into static HTML at build time by the
// prerenderMeta plugin below, so crawlers that do not run JavaScript still get a
// per-page title, description, canonical and Open Graph card. See
// build/prerenderMeta.ts for how it hands those tags over to react-helmet-async.
//
// vite-plugin-prerender (full body prerendering) remains unused: it has a
// CommonJS/ESM incompatibility here and would require a headless browser in the
// build, which this approach deliberately avoids.

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    prerenderMeta(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
}));
