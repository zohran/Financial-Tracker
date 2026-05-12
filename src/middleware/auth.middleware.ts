import type { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { UnauthorizedError } from "@/common/utils/http-error";
import { verifyAccessToken } from "@/modules/auth/jwt.util";

export interface AuthContext {
  userId: ObjectId;
  email: string;
}

/**
 * Extracts and verifies the Bearer access token from a Next.js Request.
 * Throws `UnauthorizedError` on any failure.
 *
 * Usage in a route handler:
 *   const auth = requireAuth(req);
 *   // auth.userId / auth.email available here
 */
export function requireAuth(req: NextRequest | Request): AuthContext {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    throw new UnauthorizedError("Missing Bearer token");
  }
  const token = header.slice(7).trim();
  if (!token) throw new UnauthorizedError("Missing Bearer token");

  const payload = verifyAccessToken(token);
  if (!payload.sub || !ObjectId.isValid(payload.sub)) {
    throw new UnauthorizedError("Invalid token subject");
  }
  return { userId: new ObjectId(payload.sub), email: payload.email };
}
