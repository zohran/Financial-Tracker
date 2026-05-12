import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "@/config/env";
import { User } from "@/database/entities/user.entity";
import { Business } from "@/database/entities/business.entity";
import { Account } from "@/database/entities/account.entity";
import { Transaction } from "@/database/entities/transaction.entity";
import { AuditLog } from "@/database/entities/audit-log.entity";
import { ensureMongoIndexes } from "./indexes";

declare global {
  var __APP_DATA_SOURCE__: DataSource | undefined;
  var __APP_DATA_SOURCE_INIT__: Promise<DataSource> | undefined;
}

function getCachedDataSource(): DataSource {
  if (!globalThis.__APP_DATA_SOURCE__) {
    globalThis.__APP_DATA_SOURCE__ = createDataSource();
  }
  return globalThis.__APP_DATA_SOURCE__;
}

function createDataSource() {
  return new DataSource({
    type: "mongodb",
    url: env.mongodb.uri,
    database: env.mongodb.db,
    synchronize: false,
    logging: env.nodeEnv === "development" ? ["error", "warn"] : ["error"],
    entities: [User, Business, Account, Transaction, AuditLog],
  });
}

function hasAllEntityMetadata(ds: DataSource) {
  return (
    ds.hasMetadata(User) &&
    ds.hasMetadata(Business) &&
    ds.hasMetadata(Account) &&
    ds.hasMetadata(Transaction) &&
    ds.hasMetadata(AuditLog)
  );
}

/**
 * Initializes the DataSource exactly once across concurrent requests.
 * All call sites should `await getDataSource()` before touching repositories.
 */
export async function getDataSource(): Promise<DataSource> {
  const ds = getCachedDataSource();

  if (ds.isInitialized) {
    if (hasAllEntityMetadata(ds)) return ds;
    await ds.destroy().catch(() => undefined);
    globalThis.__APP_DATA_SOURCE__ = createDataSource();
    globalThis.__APP_DATA_SOURCE_INIT__ = undefined;
    return getDataSource();
  }
  if (!globalThis.__APP_DATA_SOURCE_INIT__) {
    globalThis.__APP_DATA_SOURCE_INIT__ = ds
      .initialize()
      .then(async (ds) => {
        if (env.nodeEnv !== "production") {
          await ensureMongoIndexes(ds);
        }
        return ds;
      })
      .catch((err) => {
        globalThis.__APP_DATA_SOURCE_INIT__ = undefined;
        throw err;
      });
  }
  return globalThis.__APP_DATA_SOURCE_INIT__;
}
