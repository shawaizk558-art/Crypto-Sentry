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

// Turn a date into a time string like 14:30:05.
function formatTime(at: Date): string {
  return at.toLocaleTimeString("en-GB", { hour12: false });
}

// Build one line of text for the terminal log.
export function formatSystemLogLine(level: LogLevel, msg: string, at = new Date()): string {
  return `[${formatTime(at)}] ${LEVEL_PREFIX[level]} ${msg}`;
}

// Build a log object from message, level, and time.
function toSystemLogEntry(level: LogLevel, msg: string, at: Date): SystemLogEntry {
  return {
    ts: at.toISOString(),
    level,
    msg,
    line: formatSystemLogLine(level, msg, at),
  };
}

// Save log to database and print to console.
function write(level: LogLevel, msg: string) {
  const at = new Date();
  const line = formatSystemLogLine(level, msg, at);

  void persistSystemLog(level, msg).catch((err: unknown) => {
    console.error("[logger] Failed to persist system log:", err);
  });

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

/** Operational / poller logs — not flash-crash alerts. */
export const logger = {
  // Log a normal info message.
  info: (msg: string) => write("info", msg),
  // Log a warning message.
  warn: (msg: string) => write("warn", msg),
  // Log an error message.
  error: (msg: string) => write("error", msg),
  // Log a debug message (only when LOG_VERBOSE=1).
  debug: (msg: string) => {
    if (VERBOSE) write("debug", msg);
  },
};

// Load recent system logs from the database.
export async function getRecentSystemLogs(limit = 50): Promise<SystemLogEntry[]> {
  const rows = await fetchRecentSystemLogs(limit);

  return rows.reverse().map((row) =>
    toSystemLogEntry(row.level as LogLevel, row.message, row.created_at),
  );
}

// Load recent logs as ready-to-print text lines.
export async function getRecentSystemLogLines(limit = 50): Promise<string[]> {
  const logs = await getRecentSystemLogs(limit);
  return logs.map((entry) => entry.line);
}
