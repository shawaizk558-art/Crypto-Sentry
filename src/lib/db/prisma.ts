import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Supabase session pooler caps total clients (often 15). Keep this pool tiny.
const POOL_MAX = Math.max(
  1,
  Number.parseInt(process.env.DATABASE_POOL_MAX ?? "2", 10) || 2,
);

function getPool(connectionString: string) {
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({
      connectionString,
      max: POOL_MAX,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return globalForPrisma.pool;
}

// Connect to the Postgres database.
function createPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = getPool(connectionString);
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();
globalForPrisma.prisma = prisma;
