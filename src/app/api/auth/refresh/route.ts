import "reflect-metadata";
import type { NextRequest } from "next/server";
import { ok, fail } from "@/common/utils/api-response";
import { validateDto } from "@/common/utils/validate-dto";
import { RefreshDto } from "@/modules/auth/dto/refresh.dto";
import { AuthService } from "@/modules/auth/auth.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const dto = await validateDto(RefreshDto, body);
    const result = await AuthService.refresh(dto.refreshToken);
    return ok(result);
  } catch (err) {
    return fail(err);
  }
}
