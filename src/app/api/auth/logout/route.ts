import "reflect-metadata";
import type { NextRequest } from "next/server";
import { ok, fail } from "@/common/utils/api-response";
import { requireAuth } from "@/middleware/auth.middleware";
import { AuthService } from "@/modules/auth/auth.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    await AuthService.logout(auth.userId);
    return ok({ loggedOut: true });
  } catch (err) {
    return fail(err);
  }
}
