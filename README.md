# Financial Tracker

Production-ready financial tracking backend built with **Next.js 14 (App Router, TypeScript)**, **TypeORM + MongoDB**, and **JWT-based OAuth 2.0–style authentication**, organized around **clean, modular architecture**.

## Features

- Multi-tenant: each user owns multiple businesses; strict ownership checks on every query.
- Dynamic accounts (Cash / Bank / Wallet / Custom) with **soft delete** that still participates in analytics.
- Income / expense transactions scoped to a business and account.
- Real-time financial dashboard with per-account balances, totals, and date-range filters.
- JWT access + refresh tokens; refresh tokens are bcrypt-hashed in the DB and rotated on every refresh.
- DTO validation (`class-validator`), repository pattern, service-layer business logic, thin route handlers.

## Stack

| Layer            | Tech                                  |
| ---------------- | ------------------------------------- |
| Framework        | Next.js 14 (App Router, `nodejs` runtime) |
| Language         | TypeScript (strict, decorators on)    |
| ORM              | TypeORM (MongoDB driver)              |
| Database         | MongoDB                               |
| Auth             | `jsonwebtoken` + `bcryptjs`           |
| Validation       | `class-validator` + `class-transformer` |
| Lint / Format    | ESLint + Prettier                     |

## Project structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/
│   │   ├── auth/{register,login,refresh,logout}/route.ts
│   │   ├── users/me/route.ts
│   │   ├── business/route.ts
│   │   ├── accounts/route.ts
│   │   ├── accounts/[id]/route.ts
│   │   ├── transactions/route.ts
│   │   └── financials/dashboard/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── modules/                  # Feature modules (clean architecture)
│   ├── auth/                 #  - dto, service, jwt util
│   ├── users/
│   ├── business/
│   ├── accounts/
│   ├── transactions/
│   └── financials/
├── database/
│   ├── data-source.ts        # TypeORM MongoDB DataSource (HMR-safe)
│   ├── repositories.ts       # Typed repo accessors
│   └── entities/             # User, Business, Account, Transaction
├── common/
│   ├── enums/                # TransactionType, AccountType, DateRangePreset
│   ├── utils/                # http errors, api response, dto validate, date range, ObjectId
│   └── dto/
├── config/                   # env
└── middleware/               # auth middleware (Bearer JWT)
```

## Setup

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env
# edit MONGODB_URI, JWT secrets, etc.

# 3. Run MongoDB locally (docker)
docker run -d --name ft-mongo -p 27017:27017 mongo:7

# 4. Dev server
npm run dev
```

App runs at <http://localhost:3000>. All endpoints live under `/api/*`.

## Environment variables

See `.env.example`. The most important:

- `MONGODB_URI` – e.g. `mongodb://127.0.0.1:27017`
- `MONGODB_DB` – database name
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` – **must** be overridden in production
- `JWT_ACCESS_EXPIRES_IN` (default `15m`), `JWT_REFRESH_EXPIRES_IN` (default `7d`)

## API reference

All authenticated endpoints require `Authorization: Bearer <accessToken>`.
All responses follow `{ success: true, data }` or `{ success: false, error, details? }`.

### Auth

| Method | Path                  | Auth | Body                            |
| ------ | --------------------- | ---- | ------------------------------- |
| POST   | `/api/auth/register`  | —    | `{ email, password }`           |
| POST   | `/api/auth/login`     | —    | `{ email, password }`           |
| POST   | `/api/auth/refresh`   | —    | `{ refreshToken }`              |
| POST   | `/api/auth/logout`    | ✓    | —                               |
| GET    | `/api/users/me`       | ✓    | —                               |

Register/login/refresh return:

```json
{
  "user": { "id": "…", "email": "…" },
  "accessToken": "…",
  "refreshToken": "…"
}
```

On registration the system **auto-creates** a default business ("My Business") and seeds default accounts: Cash, Easypaisa, Jazzcash, Bank Al Habib, Meezan Bank, Punjab Bank, Allied Bank.

### Business

| Method | Path            | Body                          |
| ------ | --------------- | ----------------------------- |
| GET    | `/api/business` | —                             |
| POST   | `/api/business` | `{ name, description? }`      |

### Accounts

| Method | Path                                         | Body / Query |
| ------ | -------------------------------------------- | ------------ |
| GET    | `/api/accounts?businessId=…&includeDeleted=` | —            |
| POST   | `/api/accounts`                              | `{ businessId, name, type }` |
| DELETE | `/api/accounts/:id`                          | soft-delete  |

`type` ∈ `CASH | BANK | WALLET | CUSTOM`.

Soft-deleted accounts are hidden from default listings but are still included in the financial dashboard so historical balances stay accurate.

### Transactions

| Method | Path                | Body / Query |
| ------ | ------------------- | ------------ |
| GET    | `/api/transactions` | query: `businessId`, `accountId?`, `type?`, `range?` (`today|last7|last30|thisMonth|custom`), `from?`, `to?`, `category?`, `limit?`, `skip?` |
| POST   | `/api/transactions` | `{ businessId, accountId, type, amount, description?, category?, occurredAt? }` |

`type` ∈ `INCOME | EXPENSE`. `amount` must be **positive** — direction comes from `type`.

### Financials

| Method | Path                          | Query |
| ------ | ----------------------------- | ----- |
| GET    | `/api/financials/dashboard`   | `businessId`, `range?`, `from?`, `to?` |

Response shape:

```json
{
  "businessId": "…",
  "range": { "from": "ISO|null", "to": "ISO|null" },
  "totals": { "income": 0, "expense": 0, "net": 0 },
  "accounts": [
    {
      "accountId": "…",
      "name": "Cash",
      "type": "CASH",
      "isDeleted": false,
      "income": 0,
      "expense": 0,
      "balance": 0
    }
  ]
}
```

## Quick smoke test

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H 'content-type: application/json' \
  -d '{"email":"demo@acme.io","password":"password123"}'

# Save accessToken from the response into $TOKEN, then:
curl http://localhost:3000/api/business -H "authorization: Bearer $TOKEN"

# List default accounts for your business
curl "http://localhost:3000/api/accounts?businessId=$BUSINESS_ID" -H "authorization: Bearer $TOKEN"

# Record an income
curl -X POST http://localhost:3000/api/transactions \
  -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{"businessId":"'"$BUSINESS_ID"'","accountId":"'"$ACCOUNT_ID"'","type":"INCOME","amount":1500}'

# Dashboard
curl "http://localhost:3000/api/financials/dashboard?businessId=$BUSINESS_ID&range=last7" \
  -H "authorization: Bearer $TOKEN"
```

## Architectural notes

- **Thin routes, thick services.** Route handlers only (1) auth-check, (2) validate DTO, (3) call service, (4) format response. All business logic is in `modules/*/service.ts`.
- **Repository pattern.** Routes/services never `import { AppDataSource }`; they go through `getUserRepo()`, `getBusinessRepo()`, etc., which also ensure the DataSource is initialized lazily.
- **HMR-safe DataSource.** In dev, Next.js re-evaluates modules on every save. `data-source.ts` caches the `DataSource` on `globalThis` so we don't leak MongoClients.
- **Multi-tenant isolation.** Every query filters by the authenticated `userId`; cross-entity ops (e.g. creating a transaction) call `BusinessService.getOwnedOrFail` / `AccountsService.getOwnedOrFail` before accepting input.
- **Soft delete, full analytics.** The dashboard pipeline joins against *all* accounts (including `isDeleted: true`) so legacy balances remain visible; only listing endpoints hide them by default.
- **Refresh-token security.** Refresh tokens are bcrypt-hashed at rest and rotated on every refresh; mismatched tokens revoke the session.

## Production checklist

- [ ] Replace JWT secrets with strong, rotated values
- [ ] Set `synchronize: false` and run proper migrations (TypeORM Mongo has limited migration support — most teams rely on code-level schema management)
- [ ] Put Next.js behind HTTPS and set `SameSite=strict; Secure` cookies if you move tokens from headers to cookies
- [ ] Add rate-limiting (e.g. upstash/ratelimit) to `/api/auth/*`
- [ ] Add structured logging & error reporting (Sentry, Pino, etc.)
# Financial-Tracker
