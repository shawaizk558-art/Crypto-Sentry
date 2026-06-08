import "server-only";

import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db/prisma";

export type SystemLogRow = {
  level: string;
  message: string;
  created_at: Date;
};

// Save a system log line to the database.
export async function persistSystemLog(level: string, message: string): Promise<void> {
  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO "SystemLog" ("id", "level", "message")
      VALUES (${randomUUID()}, ${level}, ${message})
    `,
  );
}

// Load the latest system logs from the database.
export async function fetchRecentSystemLogs(limit: number): Promise<SystemLogRow[]> {
  return prisma.$queryRaw<SystemLogRow[]>(
    Prisma.sql`
      SELECT level, message, created_at
      FROM "SystemLog"
      ORDER BY created_at DESC
      LIMIT ${limit}
    `,
  );
}
