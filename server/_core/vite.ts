import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

// Resolve the project root reliably regardless of whether the code is compiled
// or run via tsx. __filename works in both ESM (node --experimental-vm-modules)
// and esbuild-bundled ESM.
function getProjectRoot(): string {
  try {
    // Works in compiled dist/index.js (dist/ → project root with "../")
    const thisDir = path.dirname(fileURLToPath(import.meta.url));
    // When bundled by esbuild: thisDir = <root>/dist
    // When run via tsx: thisDir = <root>/server/_core
    if (thisDir.endsWith("dist")) {
      return path.resolve(thisDir, "..");
    }
    // tsx source mode: go up two levels from server/_core
    return path.resolve(thisDir, "../..");
  } catch {
    return process.cwd();
  }
}

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: { server },
      allowedHosts: true as const,
    },
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const root = getProjectRoot();
      const clientTemplate = path.resolve(root, "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const root = getProjectRoot();
  const distPath = path.resolve(root, "dist", "public");

  if (!fs.existsSync(distPath)) {
    console.error(
      `[Server] Build directory not found: ${distPath}\n` +
      `         Run 'pnpm build' before starting in production mode.`
    );
  } else {
    console.log(`[Server] Serving static files from: ${distPath}`);
  }

  app.use(express.static(distPath, { maxAge: "1d", etag: true }));

  // SPA fallback — all unknown paths serve index.html so client-side routing works
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(503).send("Application not built. Run pnpm build first.");
    }
  });
}
