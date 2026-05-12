import "reflect-metadata";
import type { NextRequest } from "next/server";
import { ok, fail } from "@/common/utils/api-response";
import { validateDto } from "@/common/utils/validate-dto";
import { requireAuth } from "@/middleware/auth.middleware";
import { CreateBusinessDto } from "@/modules/business/dto/create-business.dto";
import { BusinessService } from "@/modules/business/business.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const businesses = await BusinessService.listForUser(auth.userId);
    return ok(businesses);
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const body = await req.json().catch(() => ({}));
    const dto = await validateDto(CreateBusinessDto, body);
    const business = await BusinessService.create(auth.userId, dto);
    return ok(business, 201);
  } catch (err) {
    return fail(err);
  }
}
