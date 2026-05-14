import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), sentryVitePlugin({
    org: "data-unknown",
    project: "simrail-station-watcher"
  })],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("/node_modules/@mui/icons-material/")) {
            return "mui-icons";
          }
        }
      }
    },

    sourcemap: true
  }
});
