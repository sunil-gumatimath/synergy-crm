import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  build: {
    // Increase chunk size warning limit slightly (default is 500kB)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/react-router-dom/")
          ) {
            return "react-vendor";
          }

          if (id.includes("/recharts/")) {
            return "recharts-vendor";
          }

          if (id.includes("/@supabase/supabase-js/")) {
            return "supabase-vendor";
          }

          if (
            id.includes("/react-icons/") ||
            id.includes("/date-fns/") ||
            id.includes("/prop-types/")
          ) {
            return "ui-vendor";
          }
        },
      },
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize dependencies
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // Pre-bundle heavy dependencies
  optimizeDeps: {
    include: ["recharts", "@supabase/supabase-js", "react-icons"],
  },
});
