import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
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

function devApi() {
  return {
    name: "dev-api-product",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res) => {
        const url = new URL(req.url || "/", "http://localhost");
        if (url.pathname !== "/api/product") return;
        const query = {};
        url.searchParams.forEach((v, k) => { query[k] = v; });
        const respond = (code, obj) => {
          res.statusCode = code;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(obj));
        };
        try {
          const mod = await import(pathToFileURL(resolve(process.cwd(), "api", "product.js")).href);
          const out = {
            statusCode: 200,
            setHeader(k, v) { res.setHeader(k, v); return this; },
            status(c) { this.statusCode = c; return this; },
            json(o) { respond(this.statusCode, o); return this; },
            end() { res.statusCode = this.statusCode; res.end(); return this; }
          };
          await mod.default({ method: req.method, query }, out);
        } catch (e) {
          respond(500, { ok: false, error: String((e && e.message) || e).slice(0, 200) });
        }
      });
    }
  };
}

export default defineConfig({
  base: "./",
  plugins: [copyClassicScript(), devApi()],
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
