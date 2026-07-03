import { Pool } from "pg";

const globalForPg = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString:
      process.env.DATABASE_URL ?? "postgresql://localhost:5432/company_intel",
    max: 10,
  });

if (process.env.NODE_ENV !== "production") globalForPg.pgPool = pool;
