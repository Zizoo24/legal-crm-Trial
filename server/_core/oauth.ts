import type { Express } from "express";

/** OAuth routes are disabled — using password-based auth instead. */
export function registerOAuthRoutes(_app: Express) {
  // OAuth callback disabled in this deployment.
  // Password-based login is used via POST /api/trpc/auth.login
}
