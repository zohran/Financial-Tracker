import { ObjectId } from "mongodb";
import { getTransactionRepo } from "@/database/repositories";
import { Transaction } from "@/database/entities/transaction.entity";
import { BadRequestError } from "@/common/utils/http-error";
import { BusinessService } from "@/modules/business/business.service";
import { AccountsService } from "@/modules/accounts/account.service";
import { resolveDateRange } from "@/common/utils/date-range";
import type { CreateTransactionDto } from "@/modules/transactions/dto/create-transaction.dto";
import type { ListTransactionsDto } from "@/modules/transactions/dto/list-transactions.dto";

export class TransactionsService {
  static async create(userId: ObjectId, dto: CreateTransactionDto): Promise<Transaction> {
    const businessId = new ObjectId(dto.businessId);
    const accountId = new ObjectId(dto.accountId);

    const [business, account] = await Promise.all([
      BusinessService.getOwnedOrFail(userId, businessId),
      AccountsService.getOwnedOrFail(userId, accountId),
    ]);

    if (!account.businessId.equals(business._id)) {
      throw new BadRequestError("Account does not belong to this business");
    }

    const repo = await getTransactionRepo();
    const tx = repo.create({
      userId,
      businessId,
      accountId,
      type: dto.type,
      amount: Number(dto.amount),
      description: dto.description?.trim() ?? null,
      category: dto.category?.trim() ?? null,
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
      isDeleted: false,
    });
    return repo.save(tx);
  }

  static async list(userId: ObjectId, dto: ListTransactionsDto): Promise<Transaction[]> {
    const businessId = new ObjectId(dto.businessId);
    await BusinessService.getOwnedOrFail(userId, businessId);

    const repo = await getTransactionRepo();
    const where: Record<string, unknown> = {
      userId,
      businessId,
      isDeleted: false,
    };
    if (dto.accountId) where.accountId = new ObjectId(dto.accountId);
    if (dto.type) where.type = dto.type;
    if (dto.category) where.category = dto.category;

    const range = resolveDateRange({
      preset: dto.range ?? null,
      from: dto.from ?? null,
      to: dto.to ?? null,
    });
    if (range) {
      where.occurredAt = { $gte: range.from, $lte: range.to };
    }

    return repo.find({
      where,
      order: { occurredAt: "DESC" },
      take: dto.limit ?? 50,
      skip: dto.skip ?? 0,
    });
  }
}
