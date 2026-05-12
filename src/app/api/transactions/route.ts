import "reflect-metadata";
import type { NextRequest } from "next/server";
import { ok, fail } from "@/common/utils/api-response";
import { validateDto } from "@/common/utils/validate-dto";
import { requireAuth } from "@/middleware/auth.middleware";
import { CreateTransactionDto } from "@/modules/transactions/dto/create-transaction.dto";
import { ListTransactionsDto } from "@/modules/transactions/dto/list-transactions.dto";
import { TransactionsService } from "@/modules/transactions/transaction.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    const dto = await validateDto(ListTransactionsDto, query);
    const transactions = await TransactionsService.list(auth.userId, dto);
    return ok(transactions);
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const body = await req.json().catch(() => ({}));
    const dto = await validateDto(CreateTransactionDto, body);
    const transaction = await TransactionsService.create(auth.userId, dto);
    return ok(transaction, 201);
  } catch (err) {
    return fail(err);
  }
}
