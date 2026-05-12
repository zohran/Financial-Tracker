import { ObjectId } from "mongodb";
import { getBusinessRepo } from "@/database/repositories";
import { Business } from "@/database/entities/business.entity";
import { NotFoundError } from "@/common/utils/http-error";
import type { CreateBusinessDto } from "@/modules/business/dto/create-business.dto";

export class BusinessService {
  static async create(userId: ObjectId, dto: CreateBusinessDto): Promise<Business> {
    const repo = await getBusinessRepo();
    const business = repo.create({
      userId,
      name: dto.name.trim(),
      description: dto.description?.trim() ?? null,
      isActive: true,
    });
    const saved = await repo.save(business);

    // Seed default accounts for every new business.
    // Use a dynamic import to avoid a circular dependency (AccountsService -> BusinessService).
    const { AccountsService } = await import("@/modules/accounts/account.service");
    await AccountsService.seedDefaults(userId, saved._id);

    return saved;
  }

  static async listForUser(userId: ObjectId): Promise<Business[]> {
    const repo = await getBusinessRepo();
    return repo.find({
      where: { userId, isActive: true },
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Enforces multi-tenant isolation: throws 404 if the business does not
   * belong to the given user.
   */
  static async getOwnedOrFail(userId: ObjectId, businessId: ObjectId): Promise<Business> {
    const repo = await getBusinessRepo();
    const business = await repo.findOne({
      where: { _id: businessId, userId, isActive: true },
    });
    if (!business) throw new NotFoundError("Business not found");
    return business;
  }
}
