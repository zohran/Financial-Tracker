import "reflect-metadata";
import type { NextRequest } from "next/server";
import { ok, fail } from "@/common/utils/api-response";
import { validateDto } from "@/common/utils/validate-dto";
import { requireAuth } from "@/middleware/auth.middleware";
import { BadRequestError } from "@/common/utils/http-error";
import { toObjectId } from "@/common/utils/object-id";
import { CreateAccountDto } from "@/modules/accounts/dto/create-account.dto";
import { AccountsService } from "@/modules/accounts/account.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const businessIdRaw = searchParams.get("businessId");
    if (!businessIdRaw) throw new BadRequestError("'businessId' query param is required");
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const accounts = await AccountsService.list(
      auth.userId,
      toObjectId(businessIdRaw, "businessId"),
      { includeDeleted },
    );
    return ok(accounts);
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const body = await req.json().catch(() => ({}));
    const dto = await validateDto(CreateAccountDto, body);
    const account = await AccountsService.create(auth.userId, dto);
    return ok(account, 201);
  } catch (err) {
    return fail(err);
  }
}
