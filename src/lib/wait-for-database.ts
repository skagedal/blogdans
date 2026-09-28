import { logger } from "@/logger";

// Errors that mean "the database cannot be reached yet", as opposed to errors
// in what we asked it to do. The Node codes come from DNS lookups and sockets;
// 57P03 is Postgres saying it is still starting up.
const TRANSIENT_CODES = new Set([
  "EAI_AGAIN",
  "ENOTFOUND",
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "EPIPE",
  "57P03",
]);

/**
 * Whether an error, or anything in its cause chain, is a transient connection
 * or name resolution failure. Also looks inside AggregateError, which Node
 * throws when every address a hostname resolves to refuses the connection.
 */
export function isTransientConnectionError(error: unknown): boolean {
  const seen = new Set<unknown>();
  const stack: unknown[] = [error];
  while (stack.length > 0) {
    const current = stack.pop();
    if (typeof current !== "object" || current === null || seen.has(current)) continue;
    seen.add(current);

    const code = (current as { code?: unknown }).code;
    if (typeof code === "string" && TRANSIENT_CODES.has(code)) return true;

    stack.push((current as { cause?: unknown }).cause);
    if (current instanceof AggregateError) stack.push(...current.errors);
  }
  return false;
}

export type WaitForDatabaseOptions = {
  timeoutMs?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
};

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Runs `probe` until it succeeds, retrying with exponential backoff while it
 * fails with a transient connection error. Rethrows at once on any other
 * error, and rethrows the last transient error once `timeoutMs` has passed.
 */
export async function waitForDatabase(
  probe: () => Promise<unknown>,
  {
    timeoutMs = 5 * 60_000,
    initialDelayMs = 1_000,
    maxDelayMs = 15_000,
    sleep = defaultSleep,
    now = Date.now,
  }: WaitForDatabaseOptions = {},
): Promise<void> {
  const start = now();
  let delay = initialDelayMs;
  for (let attempt = 1; ; attempt++) {
    try {
      await probe();
      if (attempt > 1) {
        logger.info(`Database reachable after ${attempt} attempts (${Math.round((now() - start) / 1000)}s)`);
      }
      return;
    } catch (error) {
      if (!isTransientConnectionError(error)) throw error;

      const remaining = start + timeoutMs - now();
      if (remaining <= 0) throw error;

      const wait = Math.min(delay, remaining);
      logger.warn(`Database not reachable yet (attempt ${attempt}), retrying in ${Math.round(wait / 1000)}s: ${error}`);
      await sleep(wait);
      delay = Math.min(delay * 2, maxDelayMs);
    }
  }
}
