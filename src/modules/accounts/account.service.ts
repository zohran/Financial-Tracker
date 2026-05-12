import { ObjectId } from "mongodb";
import { getAccountRepo } from "@/database/repositories";
import { Account } from "@/database/entities/account.entity";
import { AccountType } from "@/common/enums/account-type.enum";
import { NotFoundError } from "@/common/utils/http-error";
import { BusinessService } from "@/modules/business/business.service";
import type { CreateAccountDto } from "@/modules/accounts/dto/create-account.dto";

/**
 * Seed template used when a new user is onboarded. Keeps product-specific
 * defaults in one place so it's easy to tweak per-market later.
 */
const DEFAULT_ACCOUNTS: ReadonlyArray<{ name: string; type: AccountType }> = [
  { name: "Cash", type: AccountType.CASH },
  { name: "Easypaisa", type: AccountType.WALLET },
  { name: "Jazzcash", type: AccountType.WALLET },
  { name: "Bank Al Habib", type: AccountType.BANK },
  { name: "Meezan Bank", type: AccountType.BANK },
  { name: "Punjab Bank", type: AccountType.BANK },
  { name: "Allied Bank", type: AccountType.BANK },
];

export class AccountsService {
  static async create(userId: ObjectId, dto: CreateAccountDto): Promise<Account> {
    const businessId = new ObjectId(dto.businessId);
    // Ensures the business belongs to this user (multi-tenant isolation).
    await BusinessService.getOwnedOrFail(userId, businessId);

    const repo = await getAccountRepo();
    const account = repo.create({
      userId,
      businessId,
      name: dto.name.trim(),
      type: dto.type,
      isDeleted: false,
    });
    return repo.save(account);
  }

  /**
   * Lists accounts for a business. By default excludes soft-deleted accounts
   * (for UI dropdowns). Pass `includeDeleted` for analytics views.
   */
  static async list(
    userId: ObjectId,
    businessId: ObjectId,
    opts: { includeDeleted?: boolean } = {},
  ): Promise<Account[]> {
    await BusinessService.getOwnedOrFail(userId, businessId);
    const repo = await getAccountRepo();
    const where = opts.includeDeleted
      ? { userId, businessId }
      : { userId, businessId, isDeleted: false };
    return repo.find({ where, order: { createdAt: "ASC" } });
  }

  /** Soft-delete an account. Historical transactions remain intact. */
  static async softDelete(userId: ObjectId, accountId: ObjectId): Promise<void> {
    const repo = await getAccountRepo();
    const account = await repo.findOne({ where: { _id: accountId, userId } });
    if (!account) throw new NotFoundError("Account not found");
    if (account.isDeleted) return;

    await repo.updateOne(
      { _id: accountId, userId },
      { $set: { isDeleted: true, updatedAt: new Date() } },
    );
  }

  static async getOwnedOrFail(userId: ObjectId, accountId: ObjectId): Promise<Account> {
    const repo = await getAccountRepo();
    const account = await repo.findOne({ where: { _id: accountId, userId } });
    if (!account) throw new NotFoundError("Account not found");
    return account;
  }

  /** Seeds the default set of accounts for a freshly-onboarded business. */
  static async seedDefaults(userId: ObjectId, businessId: ObjectId): Promise<Account[]> {
    const repo = await getAccountRepo();
    const now = new Date();
    const docs = DEFAULT_ACCOUNTS.map((a) =>
      repo.create({
        userId,
        businessId,
        name: a.name,
        type: a.type,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
      }),
    );
    return repo.save(docs);
  }
}
