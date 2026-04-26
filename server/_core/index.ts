import { config as loadDotenv } from "dotenv";
import fs from "fs";

// ── 1. Load env files from known platform locations ───────────────────────────
// Dublyo stores platform config under /assets/ (same dir as /assets/Caddyfile)
const envCandidates = ["/assets/.env", "/assets/env", "/.env", ".env"];
for (const p of envCandidates) {
  if (fs.existsSync(p)) {
    loadDotenv({ path: p, override: false });
    console.log(`[Server] Loaded env from: ${p}`);
  }
}
loadDotenv({ override: false }); // also try CWD .env (dev / docker-compose)

// ── 2. Build DATABASE_URL from individual POSTGRES_* vars if not already set ──
// Dublyo (and many PaaS platforms) inject individual vars instead of a URL.
if (!process.env.DATABASE_URL && process.env.POSTGRES_PASSWORD) {
  const user     = process.env.POSTGRES_USER     ?? "postgres";
  const password = encodeURIComponent(process.env.POSTGRES_PASSWORD);
  const host     = process.env.POSTGRES_HOST     ??
                   process.env.POSTGRES_HOSTNAME ??
                   process.env.DB_HOST           ?? "localhost";
  const port     = process.env.POSTGRES_PORT     ?? "5432";
  const db       = process.env.POSTGRES_DB       ?? "postgres";
  process.env.DATABASE_URL = `postgresql://${user}:${password}@${host}:${port}/${db}?sslmode=require`;
  console.log(`[Server] DATABASE_URL constructed from POSTGRES_* vars (host: ${host})`);
}

import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { ensureAdminExists, runMigrations } from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => server.close(() => resolve(true)));
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  console.log("[Server] NODE_ENV:", process.env.NODE_ENV ?? "(not set)");
  console.log("[Server] DATABASE_URL:", process.env.DATABASE_URL ? "SET ✓" : "NOT SET ✗");
  console.log("[Server] JWT_SECRET:", process.env.JWT_SECRET ? "SET ✓" : "NOT SET ✗");
  console.log("[Server] POSTGRES_USER:", process.env.POSTGRES_USER ?? "(not set)");
  console.log("[Server] POSTGRES_HOST:", process.env.POSTGRES_HOST ?? process.env.POSTGRES_HOSTNAME ?? "(not set)");

  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000", 10);
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`[Server] Port ${preferredPort} busy — using ${port}`);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`[Server] Running on http://0.0.0.0:${port}`);
  });

  runMigrations()
    .then(() => ensureAdminExists())
    .catch(err => console.warn("[Server] DB setup warning:", (err as Error).message));
}

startServer().catch(console.error);
