import "dotenv/config";
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
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Health check (unauthenticated) — Dublyo and other platforms probe this
  app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start listening immediately so Caddy / health checks don't time out
  // while DB migrations are running
  const preferredPort = parseInt(process.env.PORT || "3000", 10);
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`[Server] Port ${preferredPort} busy — using ${port}`);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`[Server] Running on http://0.0.0.0:${port}`);
  });

  // Run DB migrations and seed in background — server is already accepting requests
  runMigrations()
    .then(() => ensureAdminExists())
    .catch(err => console.warn("[Server] DB setup warning:", (err as Error).message));
}

startServer().catch(console.error);
