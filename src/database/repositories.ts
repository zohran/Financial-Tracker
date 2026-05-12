import type { MongoRepository } from "typeorm";
import { getDataSource } from "@/database/data-source";
import type { User } from "@/database/entities/user.entity";
import type { Business } from "@/database/entities/business.entity";
import type { Account } from "@/database/entities/account.entity";
import type { Transaction } from "@/database/entities/transaction.entity";

export async function getUserRepo(): Promise<MongoRepository<User>> {
  const ds = await getDataSource();
  // Important: use entity name string to avoid Next.js dev/HMR class identity issues
  // that cause EntityMetadataNotFoundError.
  return ds.getMongoRepository<User>("User");
}

export async function getBusinessRepo(): Promise<MongoRepository<Business>> {
  const ds = await getDataSource();
  return ds.getMongoRepository<Business>("Business");
}

export async function getAccountRepo(): Promise<MongoRepository<Account>> {
  const ds = await getDataSource();
  return ds.getMongoRepository<Account>("Account");
}

export async function getTransactionRepo(): Promise<MongoRepository<Transaction>> {
  const ds = await getDataSource();
  return ds.getMongoRepository<Transaction>("Transaction");
}
