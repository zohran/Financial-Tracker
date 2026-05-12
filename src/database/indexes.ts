import type { DataSource } from "typeorm";

type IndexSpec = {
  /** MongoDB collection name */
  collection: string;
  /** Desired index name */
  name: string;
  /** Key pattern */
  key: Record<string, 1 | -1>;
  /** Optional uniqueness */
  unique?: boolean;
};

function sameKey(a: Record<string, unknown>, b: Record<string, unknown>) {
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) {
    if (!(k in b)) return false;
    if (a[k] !== b[k]) return false;
  }
  return true;
}

/**
 * Reconciles MongoDB indexes in development:
 * - If an index with the same key exists under a different name (TypeORM's IDX_*),
 *   we drop the old one and create the desired named one.
 * - If the desired name exists with different key options, we drop and recreate it.
 *
 * This prevents "Index already exists with a different name" errors while keeping
 * indexes enabled (no removal of indexing strategy).
 */
export async function ensureMongoIndexes(ds: DataSource) {
  // TypeORM's Mongo driver keeps the native db on internal connection objects.
  // We access it defensively to avoid version coupling.
  const db =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ds.mongoManager as any)?.connection?.db ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ds.driver as any)?.databaseConnection?.db;

  if (!db) {
    // eslint-disable-next-line no-console
    console.warn("[DB] Could not access native MongoDB db for index reconciliation.");
    return;
  }

  const desired: IndexSpec[] = [
    // Users
    { collection: "users", name: "idx_users_email_unique", key: { email: 1 }, unique: true },
    { collection: "users", name: "idx_users_createdAt", key: { createdAt: 1 } },

    // Businesses
    { collection: "businesses", name: "idx_businesses_userId", key: { userId: 1 } },
    { collection: "businesses", name: "idx_businesses_isActive", key: { isActive: 1 } },
    { collection: "businesses", name: "idx_businesses_createdAt", key: { createdAt: 1 } },

    // Accounts
    { collection: "accounts", name: "idx_accounts_userId", key: { userId: 1 } },
    { collection: "accounts", name: "idx_accounts_businessId", key: { businessId: 1 } },
    { collection: "accounts", name: "idx_accounts_user_business", key: { userId: 1, businessId: 1 } },

    // Transactions (high-volume)
    { collection: "transactions", name: "idx_tx_userId", key: { userId: 1 } },
    { collection: "transactions", name: "idx_tx_businessId", key: { businessId: 1 } },
    { collection: "transactions", name: "idx_tx_accountId", key: { accountId: 1 } },
    { collection: "transactions", name: "idx_tx_occurredAt", key: { occurredAt: 1 } },
    { collection: "transactions", name: "idx_tx_createdAt", key: { createdAt: 1 } },
    {
      collection: "transactions",
      name: "idx_tx_user_business_occurredAt",
      key: { userId: 1, businessId: 1, occurredAt: 1 },
    },
    {
      collection: "transactions",
      name: "idx_tx_business_account_occurredAt",
      key: { businessId: 1, accountId: 1, occurredAt: 1 },
    },
    { collection: "transactions", name: "idx_tx_business_createdAt", key: { businessId: 1, createdAt: 1 } },

    // Audit logs
    { collection: "audit_logs", name: "idx_audit_action", key: { action: 1 } },
    { collection: "audit_logs", name: "idx_audit_entity", key: { entity: 1, entityId: 1 } },
    { collection: "audit_logs", name: "idx_audit_user_timestamp", key: { userId: 1, timestamp: 1 } },
  ];

  const byCollection = new Map<string, IndexSpec[]>();
  for (const spec of desired) {
    byCollection.set(spec.collection, [...(byCollection.get(spec.collection) ?? []), spec]);
  }

  for (const [collection, specs] of byCollection) {
    const col = db.collection(collection);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = (await col.indexes()) as any[];

    for (const spec of specs) {
      const existingByName = existing.find((i) => i.name === spec.name);
      const existingSameKey = existing.find((i) => sameKey(i.key, spec.key));

      // Case A: desired name exists but points to different keys -> recreate
      if (existingByName && !sameKey(existingByName.key, spec.key)) {
        // eslint-disable-next-line no-console
        console.warn(`[DB] Recreating index ${collection}.${spec.name} (definition changed)`);
        await col.dropIndex(spec.name).catch(() => undefined);
        await col.createIndex(spec.key, { name: spec.name, unique: spec.unique });
        continue;
      }

      // Case B: same key exists but under different name -> rename by drop+create
      if (existingSameKey && existingSameKey.name !== spec.name) {
        // never drop _id_
        if (existingSameKey.name !== "_id_") {
          // eslint-disable-next-line no-console
          console.warn(
            `[DB] Renaming index ${collection}.${existingSameKey.name} -> ${spec.name} (same keys)`,
          );
          await col.dropIndex(existingSameKey.name).catch(() => undefined);
        }
        await col.createIndex(spec.key, { name: spec.name, unique: spec.unique });
        continue;
      }

      // Case C: doesn't exist at all -> create
      if (!existingByName && !existingSameKey) {
        await col.createIndex(spec.key, { name: spec.name, unique: spec.unique });
      }
    }
  }
}

