import { ObjectId } from "mongodb";
import { getTransactionRepo, getAccountRepo } from "@/database/repositories";
import { TransactionType } from "@/common/enums/transaction-type.enum";
import { BusinessService } from "@/modules/business/business.service";
import { resolveDateRange } from "@/common/utils/date-range";
import type { DashboardQueryDto } from "@/modules/financials/dto/dashboard-query.dto";

export interface AccountBalance {
  accountId: string;
  name: string;
  type: string;
  isDeleted: boolean;
  /** Net balance before the selected range start. */
  openingBalance: number;
  income: number;
  expense: number;
  /** Net change within the selected range. */
  balance: number;
}

export interface DashboardResult {
  businessId: string;
  range: { from: string | null; to: string | null };
  totals: {
    income: number;
    expense: number;
    net: number;
  };
  accounts: AccountBalance[];
}

/**
 * Financial aggregation engine.
 *
 * Uses a single Mongo aggregation pipeline to compute per-account income /
 * expense totals, joins against the accounts collection (keeping deleted
 * accounts visible in analytics, as per requirements), and returns totals.
 */
export class FinancialsService {
  static async dashboard(userId: ObjectId, dto: DashboardQueryDto): Promise<DashboardResult> {
    const businessId = new ObjectId(dto.businessId);
    await BusinessService.getOwnedOrFail(userId, businessId);

    const range = resolveDateRange({
      preset: dto.range ?? null,
      from: dto.from ?? null,
      to: dto.to ?? null,
    });

    const baseMatch: Record<string, unknown> = {
      userId,
      businessId,
      isDeleted: false,
    };

    const txRepo = await getTransactionRepo();

    // Aggregate opening balance (before range) + in-range income/expense in one round-trip.
    const cursor = txRepo.aggregate<{
      rangeAgg: Array<{ _id: ObjectId; income: number; expense: number }>;
      openingAgg: Array<{ _id: ObjectId; opening: number }>;
    }>([
      {
        $facet: {
          rangeAgg: [
            {
              $match: range
                ? { ...baseMatch, occurredAt: { $gte: range.from, $lte: range.to } }
                : baseMatch,
            },
            {
              $group: {
                _id: "$accountId",
                income: {
                  $sum: {
                    $cond: [{ $eq: ["$type", TransactionType.INCOME] }, "$amount", 0],
                  },
                },
                expense: {
                  $sum: {
                    $cond: [{ $eq: ["$type", TransactionType.EXPENSE] }, "$amount", 0],
                  },
                },
              },
            },
          ],
          openingAgg: range
            ? [
                { $match: { ...baseMatch, occurredAt: { $lt: range.from } } },
                {
                  $group: {
                    _id: "$accountId",
                    opening: {
                      $sum: {
                        $cond: [
                          { $eq: ["$type", TransactionType.INCOME] },
                          "$amount",
                          { $multiply: [-1, "$amount"] },
                        ],
                      },
                    },
                  },
                },
              ]
            : [{ $match: { _id: null } }], // no range => opening balance is 0 for all
        },
      },
    ]);

    const [agg] = await cursor.toArray();
    const byAccount = new Map(
      (agg?.rangeAgg ?? []).map((g) => [g._id.toString(), { income: g.income, expense: g.expense }]),
    );
    const openingByAccount = new Map(
      (agg?.openingAgg ?? []).map((g) => [g._id.toString(), g.opening]),
    );

    // Hydrate with account metadata (including soft-deleted ones, per the
    // requirement that deleted accounts still show in analytics).
    const accountsRepo = await getAccountRepo();
    const accounts = await accountsRepo.find({
      where: { userId, businessId },
      order: { createdAt: "ASC" },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const accountBalances: AccountBalance[] = accounts.map((a) => {
      const agg = byAccount.get(a._id.toString());
      const income = agg?.income ?? 0;
      const expense = agg?.expense ?? 0;
      const openingBalance = openingByAccount.get(a._id.toString()) ?? 0;
      totalIncome += income;
      totalExpense += expense;
      return {
        accountId: a._id.toString(),
        name: a.name,
        type: a.type,
        isDeleted: a.isDeleted,
        openingBalance,
        income,
        expense,
        balance: income - expense,
      };
    });

    return {
      businessId: businessId.toString(),
      range: {
        from: range?.from.toISOString() ?? null,
        to: range?.to.toISOString() ?? null,
      },
      totals: {
        income: totalIncome,
        expense: totalExpense,
        net: totalIncome - totalExpense,
      },
      accounts: accountBalances,
    };
  }
}
