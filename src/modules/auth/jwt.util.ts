import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { env } from "@/config/env";
import { UnauthorizedError } from "@/common/utils/http-error";

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  email: string;
  typ: "access";
}

export interface RefreshTokenPayload extends JwtPayload {
  sub: string;
  typ: "refresh";
}

export function signAccessToken(userId: string, email: string): string {
  return jwt.sign({ sub: userId, email, typ: "access" }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  } as SignOptions);
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, typ: "refresh" }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  } as SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
    if (decoded.typ !== "access") throw new Error("Wrong token type");
    return decoded;
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, env.jwt.refreshSecret) as RefreshTokenPayload;
    if (decoded.typ !== "refresh") throw new Error("Wrong token type");
    return decoded;
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
}
