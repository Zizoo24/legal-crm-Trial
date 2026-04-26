import { createHash, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";

const scryptAsync = promisify(scrypt);

export const AUTH_COOKIE = "crm_session";
const TOKEN_EXPIRY = "30d";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    console.warn("[Auth] JWT_SECRET not set — using insecure default. Set JWT_SECRET in production.");
  }
  return new TextEncoder().encode(secret || "dev-insecure-secret-change-in-production");
}

// ─── Password Hashing ─────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const hashBuffer = Buffer.from(hashHex, "hex");
  if (derivedKey.length !== hashBuffer.length) return false;
  return timingSafeEqual(derivedKey, hashBuffer);
}

// ─── JWT Session ─────────────────────────────────────────────────────────────

export async function createSessionToken(userId: number, email: string): Promise<string> {
  const secret = getJwtSecret();
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(TOKEN_EXPIRY)
    .setIssuedAt()
    .sign(secret);
}

export type SessionPayload = { userId: number; email: string };

export async function verifySessionToken(token: string | null | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    const userId = payload.userId as number;
    const email = payload.email as string;
    if (!userId || !email) return null;
    return { userId, email };
  } catch {
    return null;
  }
}

// ─── Cookie Helpers ───────────────────────────────────────────────────────────

export function getSessionFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const cookies = parseCookieHeader(cookieHeader);
  return cookies[AUTH_COOKIE] ?? null;
}

export function isSecureRequest(req: Request): boolean {
  if (req.protocol === "https") return true;
  const fwd = req.headers["x-forwarded-proto"];
  if (!fwd) return false;
  const protos = Array.isArray(fwd) ? fwd : fwd.split(",");
  return protos.some(p => p.trim().toLowerCase() === "https");
}
