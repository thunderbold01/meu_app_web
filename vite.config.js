import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

function copyClassicScript() {
  return {
    name: "copy-classic-script",
    apply: "build",
    closeBundle() {
      const outDir = resolve(process.cwd(), "dist");
      mkdirSync(resolve(outDir, "js"), { recursive: true });
      copyFileSync(resolve(process.cwd(), "js", "main.js"), resolve(outDir, "js", "main.js"));
    }
  };
}

export default defineConfig({
  base: "./",
  plugins: [copyClassicScript()],
  server: {
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()"
    }
  },
  build: {
    outDir: "dist",
    target: "es2018",
    assetsInlineLimit: 0,
    cssCodeSplit: false
  }
});
