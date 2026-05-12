import "reflect-metadata";
import type { NextRequest } from "next/server";
import { ok, fail } from "@/common/utils/api-response";
import { validateDto } from "@/common/utils/validate-dto";
import { requireAuth } from "@/middleware/auth.middleware";
import { DashboardQueryDto } from "@/modules/financials/dto/dashboard-query.dto";
import { FinancialsService } from "@/modules/financials/financials.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    const dto = await validateDto(DashboardQueryDto, query);
    const dashboard = await FinancialsService.dashboard(auth.userId, dto);
    return ok(dashboard);
  } catch (err) {
    return fail(err);
  }
}
