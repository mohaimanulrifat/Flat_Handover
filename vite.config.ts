import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { APP_TITLE } from "./src/config.ts";

export default defineConfig({
  // Relative asset paths, so the build works from any folder on a web host.
  base: "./",
  plugins: [
    react(),
    {
      name: "app-title",
      transformIndexHtml: (html) => html.replaceAll("%APP_TITLE%", APP_TITLE),
    },
  ],
  test: {
    include: ["src/**/*.test.ts"],
  },
});
