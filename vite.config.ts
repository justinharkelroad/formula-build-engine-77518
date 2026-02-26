import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Note: vite-plugin-prerender is installed but has a CommonJS/ESM compatibility
// issue in this project. Prerendering can be enabled once the plugin is updated
// to support ESM, or by using an alternative like vite-ssg.
// For now, the SPA is fully optimized with code splitting, structured data,
// and static SEO files (sitemap.xml, robots.txt, llms.txt) which provide
// strong crawlability for search engines and AI systems.

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
}));
