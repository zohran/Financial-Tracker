import { ObjectId } from "mongodb";
import { getUserRepo } from "@/database/repositories";
import { NotFoundError } from "@/common/utils/http-error";

export class UsersService {
  static async getById(userId: ObjectId) {
    const repo = await getUserRepo();
    const user = await repo.findOne({ where: { _id: userId } });
    if (!user) throw new NotFoundError("User not found");

    // Never leak credentials or session material.
    return {
      id: user._id.toString(),
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
