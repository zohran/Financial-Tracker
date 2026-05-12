import "reflect-metadata";
import type { NextRequest } from "next/server";
import { ok, fail } from "@/common/utils/api-response";
import { validateDto } from "@/common/utils/validate-dto";
import { RegisterDto } from "@/modules/auth/dto/register.dto";
import { AuthService } from "@/modules/auth/auth.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const dto = await validateDto(RegisterDto, body);
    const result = await AuthService.register(dto);
    return ok(result, 201);
  } catch (err) {
    return fail(err);
  }
}
