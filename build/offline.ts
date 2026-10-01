import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";

interface Options {
  appTitle: string;
  description: string;
  themeColour: string;
  backgroundColour: string;
}

/**
 * Makes the app installable and usable offline without extra dependencies:
 * writes manifest.webmanifest, and writes sw.js from src/service-worker.js
 * with the list of every built file to save on the phone.
 */
export function offline(options: Options): Plugin {
  const manifest = JSON.stringify(
    {
      name: options.appTitle,
      short_name: options.appTitle,
      description: options.description,
      start_url: "./",
      scope: "./",
      display: "standalone",
      orientation: "portrait",
      theme_color: options.themeColour,
      background_color: options.backgroundColour,
      icons: [
        { src: "icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "icon-512.png", sizes: "512x512", type: "image/png" },
        {
          src: "icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    null,
    2,
  );
  let publicDir = "";
  let root = "";

  return {
    name: "offline",
    configResolved(config) {
      publicDir = config.publicDir;
      root = config.root;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.endsWith("/manifest.webmanifest")) return next();
        res.setHeader("Content-Type", "application/manifest+json");
        res.end(manifest);
      });
    },
    // Added after Vite's own HTML processing, so the link stays relative
    // and works when the app is hosted in a sub-folder.
    transformIndexHtml: {
      order: "post",
      handler: () => [
        {
          tag: "link",
          attrs: { rel: "manifest", href: "manifest.webmanifest" },
          injectTo: "head",
        },
      ],
    },
    generateBundle(_, bundle) {
      this.emitFile({
        type: "asset",
        fileName: "manifest.webmanifest",
        source: manifest,
      });

      const hash = createHash("sha256");
      const files = new Set(["index.html", "manifest.webmanifest"]);
      for (const [name, chunk] of Object.entries(bundle)) {
        if (name.endsWith(".map")) continue;
        files.add(name);
        hash.update(name);
        hash.update(chunk.type === "chunk" ? chunk.code : chunk.source);
      }
      for (const name of readdirSync(publicDir)) {
        files.add(name);
        hash.update(name);
        hash.update(readFileSync(join(publicDir, name)));
      }
      hash.update(manifest);

      const template = readFileSync(
        join(root, "src/service-worker.js"),
        "utf8",
      );
      const precache = [...files].sort();
      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source:
          `const PRECACHE = ${JSON.stringify(precache)};\n` +
          `const VERSION = ${JSON.stringify(hash.digest("hex").slice(0, 12))};\n` +
          template,
      });
    },
  };
}
