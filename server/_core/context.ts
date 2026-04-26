import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { getSessionFromRequest, verifySessionToken } from "./auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const token = getSessionFromRequest(opts.req);
    const session = await verifySessionToken(token);

    if (session?.userId) {
      user = await db.getUserById(session.userId);
    }
  } catch (error) {
    console.error("[Context] Auth error:", error);
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
