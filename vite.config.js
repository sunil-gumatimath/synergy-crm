import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
  build: {
    // Increase chunk size warning limit slightly (default is 500kB)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React and React-DOM into separate chunk
          "react-vendor": ["react", "react-dom", "react-router-dom"],

          // Split Recharts into its own chunk (this is the heavy one)
          "recharts-vendor": ["recharts"],

          // Split Supabase into separate chunk
          "supabase-vendor": ["@supabase/supabase-js"],

          // Split icons and utilities
          "ui-vendor": ["react-icons", "date-fns", "prop-types"],
        },
      },
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize dependencies
    sourcemap: false,
    minify: "esbuild",
  },
  // Pre-bundle heavy dependencies
  optimizeDeps: {
    include: ["recharts", "@supabase/supabase-js", "react-icons"],
  },
});
