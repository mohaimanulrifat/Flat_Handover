import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { offline } from "./build/offline.ts";
import { APP_TITLE } from "./src/config.ts";

export default defineConfig({
  // Relative asset paths, so the build works from any folder on a web host.
  base: "./",
  plugins: [
    react(),
    offline({
      appTitle: APP_TITLE,
      description:
        "A room-by-room checklist for flat handover day, with a PDF defect report.",
      themeColour: "#0b1020",
      backgroundColour: "#0b1020",
    }),
    {
      name: "app-title",
      transformIndexHtml: (html) => html.replaceAll("%APP_TITLE%", APP_TITLE),
    },
  ],
  // pdf-lib is loaded lazily; pre-bundle it so the dev server does not
  // reload the page the first time a PDF is made.
  optimizeDeps: { include: ["pdf-lib"] },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
