import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { env } from "@/config/env";
import { getUserRepo } from "@/database/repositories";
import { User } from "@/database/entities/user.entity";
import { ConflictError, UnauthorizedError } from "@/common/utils/http-error";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/modules/auth/jwt.util";
import { BusinessService } from "@/modules/business/business.service";
import type { RegisterDto } from "@/modules/auth/dto/register.dto";
import type { LoginDto } from "@/modules/auth/dto/login.dto";

export interface AuthResult {
  user: { id: string; email: string };
  accessToken: string;
  refreshToken: string;
}

/**
 * Auth service – handles credential hashing, JWT issuance and refresh-token
 * rotation. Refresh tokens are stored as bcrypt hashes so a DB leak does not
 * hand attackers a valid session.
 */
export class AuthService {
  /**
   * Creates a new user, seeds a default business and default accounts,
   * and returns an initial token pair.
   */
  static async register(dto: RegisterDto): Promise<AuthResult> {
    const repo = await getUserRepo();
    const email = dto.email.trim().toLowerCase();

    const existing = await repo.findOne({ where: { email } });
    if (existing) throw new ConflictError("Email already registered");

    const passwordHash = await bcrypt.hash(dto.password, env.bcrypt.saltRounds);

    const user = repo.create({
      email,
      password: passwordHash,
      refreshTokenHash: null,
    });
    await repo.save(user);

    // Auto-onboard: create a default business + default accounts.
    const business = await BusinessService.create(user._id, {
      name: "My Business",
      description: "Default business",
    });

    return this.issueTokens(user);
  }

  static async login(dto: LoginDto): Promise<AuthResult> {
    const repo = await getUserRepo();
    const email = dto.email.trim().toLowerCase();
    const user = await repo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedError("Invalid credentials");

    return this.issueTokens(user);
  }

  static async refresh(refreshToken: string): Promise<AuthResult> {
    const payload = verifyRefreshToken(refreshToken);
    const repo = await getUserRepo();
    const user = await repo.findOne({ where: { _id: new ObjectId(payload.sub) } });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedError("Session revoked");
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      // Token reuse / tampering – revoke the session defensively.
      await repo.updateOne({ _id: user._id }, { $set: { refreshTokenHash: null } });
      throw new UnauthorizedError("Session revoked");
    }

    return this.issueTokens(user);
  }

  static async logout(userId: ObjectId): Promise<void> {
    const repo = await getUserRepo();
    await repo.updateOne({ _id: userId }, { $set: { refreshTokenHash: null } });
  }

  private static async issueTokens(user: User): Promise<AuthResult> {
    const userId = user._id.toString();
    const accessToken = signAccessToken(userId, user.email);
    const refreshToken = signRefreshToken(userId);

    const refreshTokenHash = await bcrypt.hash(refreshToken, env.bcrypt.saltRounds);
    const repo = await getUserRepo();
    await repo.updateOne({ _id: user._id }, { $set: { refreshTokenHash } });

    return {
      user: { id: userId, email: user.email },
      accessToken,
      refreshToken,
    };
  }
}
