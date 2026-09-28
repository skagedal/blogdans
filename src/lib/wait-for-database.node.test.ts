import { describe, it, expect, vi } from "vitest";
import { Kysely, PostgresDialect, sql } from "kysely";
import { Pool } from "pg";
import { isTransientConnectionError, waitForDatabase } from "./wait-for-database";

function errorWithCode(code: string, message = code) {
  return Object.assign(new Error(message), { code });
}

// Fake clock: sleeping advances time instantly.
function fakeClock() {
  let time = 0;
  const sleeps: number[] = [];
  return {
    sleeps,
    now: () => time,
    sleep: async (ms: number) => {
      sleeps.push(ms);
      time += ms;
    },
  };
}

describe("isTransientConnectionError", () => {
  it.each(["EAI_AGAIN", "ENOTFOUND", "ECONNREFUSED", "ETIMEDOUT", "ECONNRESET", "57P03"])(
    "treats %s as transient",
    (code) => {
      expect(isTransientConnectionError(errorWithCode(code))).toBe(true);
    },
  );

  it("finds the code in the cause chain", () => {
    const error = new Error("Failed to sync post to database", {
      cause: errorWithCode("EAI_AGAIN", "getaddrinfo EAI_AGAIN postgres"),
    });
    expect(isTransientConnectionError(error)).toBe(true);
  });

  it("finds the code inside an AggregateError", () => {
    const error = new AggregateError([errorWithCode("ECONNREFUSED"), errorWithCode("ECONNREFUSED")]);
    expect(isTransientConnectionError(error)).toBe(true);
  });

  it("does not treat SQL errors as transient", () => {
    expect(isTransientConnectionError(errorWithCode("23505", "duplicate key"))).toBe(false);
    expect(isTransientConnectionError(errorWithCode("42P01", "relation does not exist"))).toBe(false);
  });

  it("does not treat errors without a code as transient", () => {
    expect(isTransientConnectionError(new Error("bad data"))).toBe(false);
    expect(isTransientConnectionError("a string")).toBe(false);
    expect(isTransientConnectionError(undefined)).toBe(false);
  });
});

describe("waitForDatabase", () => {
  it("returns at once when the database is reachable", async () => {
    const clock = fakeClock();
    const probe = vi.fn().mockResolvedValue(undefined);

    await waitForDatabase(probe, clock);

    expect(probe).toHaveBeenCalledTimes(1);
    expect(clock.sleeps).toEqual([]);
  });

  it("retries with backoff until the database becomes reachable", async () => {
    const clock = fakeClock();
    const probe = vi
      .fn()
      .mockRejectedValueOnce(errorWithCode("EAI_AGAIN"))
      .mockRejectedValueOnce(errorWithCode("ENOTFOUND"))
      .mockRejectedValueOnce(errorWithCode("ECONNREFUSED"))
      .mockResolvedValue(undefined);

    await waitForDatabase(probe, { ...clock, initialDelayMs: 1_000, maxDelayMs: 3_000 });

    expect(probe).toHaveBeenCalledTimes(4);
    expect(clock.sleeps).toEqual([1_000, 2_000, 3_000]);
  });

  it("gives up with the last error once the timeout has passed", async () => {
    const clock = fakeClock();
    const probe = vi.fn().mockRejectedValue(errorWithCode("EAI_AGAIN"));

    await expect(
      waitForDatabase(probe, { ...clock, timeoutMs: 10_000, initialDelayMs: 1_000, maxDelayMs: 4_000 }),
    ).rejects.toMatchObject({ code: "EAI_AGAIN" });

    expect(clock.sleeps).toEqual([1_000, 2_000, 4_000, 3_000]);
    expect(probe).toHaveBeenCalledTimes(5);
  });

  it("does not retry non-transient errors", async () => {
    const clock = fakeClock();
    const error = errorWithCode("42P01", "relation does not exist");
    const probe = vi.fn().mockRejectedValue(error);

    await expect(waitForDatabase(probe, clock)).rejects.toBe(error);

    expect(probe).toHaveBeenCalledTimes(1);
    expect(clock.sleeps).toEqual([]);
  });

  it("recognises the error pg raises when nothing listens on the port", async () => {
    const db = new Kysely({
      dialect: new PostgresDialect({
        pool: new Pool({ connectionString: "postgres://nobody@127.0.0.1:1/nothing" }),
      }),
    });
    const clock = fakeClock();
    try {
      await expect(
        waitForDatabase(() => sql`select 1`.execute(db), { ...clock, timeoutMs: 2_000 }),
      ).rejects.toSatisfy(isTransientConnectionError);
      expect(clock.sleeps.length).toBeGreaterThan(0);
    } finally {
      await db.destroy();
    }
  });
});
