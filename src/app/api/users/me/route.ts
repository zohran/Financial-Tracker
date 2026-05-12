import "reflect-metadata";
import type { NextRequest } from "next/server";
import { ok, fail } from "@/common/utils/api-response";
import { requireAuth } from "@/middleware/auth.middleware";
import { UsersService } from "@/modules/users/user.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const me = await UsersService.getById(auth.userId);
    return ok(me);
  } catch (err) {
    return fail(err);
  }
}
