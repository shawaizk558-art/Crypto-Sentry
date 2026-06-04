export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEntry = {
  ts: string;
  level: LogLevel;
  msg: string;
  line: string;
};

const MAX_LOG_BUFFER = 200;
const VERBOSE = process.env.LOG_VERBOSE === "1";

const LEVEL_PREFIX: Record<LogLevel, string> = {
  error: "ERROR",
  warn: "WARN ",
  info: "INFO ",
  debug: "DEBUG",
};

function getLogBuffer(): LogEntry[] {
  const g = globalThis as typeof globalThis & {
    __cryptoSentryLogs?: LogEntry[];
  };
  if (!g.__cryptoSentryLogs) {
    g.__cryptoSentryLogs = [];
  }
  return g.__cryptoSentryLogs;
}

function formatTime(): string {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

export function formatLogLine(level: LogLevel, msg: string): string {
  return `[${formatTime()}] ${LEVEL_PREFIX[level]} ${msg}`;
}

function write(level: LogLevel, msg: string) {
  const ts = new Date().toISOString();
  const line = formatLogLine(level, msg);

  const entry: LogEntry = { ts, level, msg, line };
  const logBuffer = getLogBuffer();
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOG_BUFFER) {
    logBuffer.splice(0, logBuffer.length - MAX_LOG_BUFFER);
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

/** Plain-English logs only — one short sentence per line. */
export const logger = {
  info: (msg: string) => write("info", msg),
  warn: (msg: string) => write("warn", msg),
  error: (msg: string) => write("error", msg),
  debug: (msg: string) => {
    if (VERBOSE) write("debug", msg);
  },
};

export function getRecentLogs(limit = 50): LogEntry[] {
  return getLogBuffer().slice(-limit);
}

export function getRecentLogLines(limit = 50): string[] {
  return getRecentLogs(limit).map((e) => e.line);
}
