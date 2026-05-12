import "reflect-metadata";
import type { NextRequest } from "next/server";
import { ok, fail } from "@/common/utils/api-response";
import { requireAuth } from "@/middleware/auth.middleware";
import { toObjectId } from "@/common/utils/object-id";
import { AccountsService } from "@/modules/accounts/account.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  try {
    const auth = requireAuth(req);
    const accountId = toObjectId(context.params.id, "accountId");
    await AccountsService.softDelete(auth.userId, accountId);
    return ok({ deleted: true, id: accountId.toString() });
  } catch (err) {
    return fail(err);
  }
}
