import "server-only";

import { fetchRecentSystemLogs, persistSystemLog } from "@/lib/db/system-log";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type SystemLogEntry = {
  ts: string;
  level: LogLevel;
  msg: string;
  line: string;
};

const VERBOSE = process.env.LOG_VERBOSE === "1";

const LEVEL_PREFIX: Record<LogLevel, string> = {
  error: "ERROR",
  warn: "WARN ",
  info: "INFO ",
  debug: "DEBUG",
};

function formatTime(at: Date): string {
  return at.toLocaleTimeString("en-GB", { hour12: false });
}

export function formatSystemLogLine(level: LogLevel, msg: string, at = new Date()): string {
  return `[${formatTime(at)}] ${LEVEL_PREFIX[level]} ${msg}`;
}

function toSystemLogEntry(level: LogLevel, msg: string, at: Date): SystemLogEntry {
  return {
    ts: at.toISOString(),
    level,
    msg,
    line: formatSystemLogLine(level, msg, at),
  };
}

async function write(level: LogLevel, msg: string): Promise<void> {
  const at = new Date();
  const line = formatSystemLogLine(level, msg, at);

  try {
    await persistSystemLog(level, msg);
  } catch (err: unknown) {
    console.error("[logger] Failed to persist system log:", err);
  }

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else if (level === "debug") {
    if (VERBOSE) console.log(line);
  } else {
    console.log(line);
  }
}

/** Operational / poller logs — persisted to SystemLog before returning. */
export const logger = {
  info: (msg: string) => write("info", msg),
  warn: (msg: string) => write("warn", msg),
  error: (msg: string) => write("error", msg),
  debug: (msg: string) => {
    if (VERBOSE) return write("debug", msg);
    return Promise.resolve();
  },
};

export async function getRecentSystemLogs(limit = 50): Promise<SystemLogEntry[]> {
  const rows = await fetchRecentSystemLogs(limit);

  return rows.reverse().map((row) =>
    toSystemLogEntry(row.level as LogLevel, row.message, row.created_at),
  );
}

export async function getRecentSystemLogLines(limit = 50): Promise<string[]> {
  const logs = await getRecentSystemLogs(limit);
  return logs.map((entry) => entry.line);
}
