import { describe, expect, it } from "vitest";
import type { SupabaseClientLike } from "@page-assistant/widget";
import { CHAT_HISTORY_APP_KEY, createChatHistoryAdapter } from "./chatHistory";

type Call = { table: string; op: string; args: unknown[] }[];

/** Minimal chainable stand-in for supabase-js that records every query. */
function fakeClient(userId: string | null, rows: unknown[] = []) {
  const queries: Call[] = [];
  const client: SupabaseClientLike = {
    auth: {
      getSession: async () => ({
        data: { session: userId ? { user: { id: userId } } : null },
      }),
    },
    from(table: string) {
      const calls: Call = [];
      queries.push(calls);
      const builder: Record<string, unknown> = {};
      for (const op of ["select", "eq", "gte", "lt", "order", "limit", "delete", "upsert", "maybeSingle"]) {
        builder[op] = (...args: unknown[]) => {
          calls.push({ table, op, args });
          return builder;
        };
      }
      builder.then = (resolve: (v: unknown) => void) => resolve({ data: rows, error: null });
      return builder;
    },
  };
  return { client, queries };
}

const eqs = (calls: Call) =>
  Object.fromEntries(calls.filter((c) => c.op === "eq").map((c) => c.args as [string, unknown]));

describe("assistant chat history adapter", () => {
  it("is absent when cloud is not configured", () => {
    expect(createChatHistoryAdapter(null)).toBeUndefined();
  });

  it("reports the signed-in user, or null when signed out", async () => {
    expect(await createChatHistoryAdapter(fakeClient("u1").client)!.currentUserId!()).toBe("u1");
    expect(await createChatHistoryAdapter(fakeClient(null).client)!.currentUserId!()).toBeNull();
  });

  it("advertises 12-month retention", () => {
    expect(createChatHistoryAdapter(fakeClient("u1").client)!.retentionMonths).toBe(12);
  });

  it("lists only the signed-in user's chats in this app", async () => {
    const { client, queries } = fakeClient("u1");
    await createChatHistoryAdapter(client)!.list();
    const select = queries.find((q) => q.some((c) => c.op === "select"))!;
    expect(select[0].table).toBe("assistant_chats");
    expect(eqs(select)).toEqual({ user_id: "u1", app: CHAT_HISTORY_APP_KEY });
  });

  it("saves rows under the session user and this app", async () => {
    const { client, queries } = fakeClient("u1");
    await createChatHistoryAdapter(client)!.save({
      id: "c1",
      title: "t",
      messages: [],
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    });
    const upsert = queries.flat().find((c) => c.op === "upsert")!;
    expect(upsert.args[0]).toMatchObject({ id: "c1", user_id: "u1", app: CHAT_HISTORY_APP_KEY });
  });

  it("refuses to read when nobody is signed in", async () => {
    await expect(createChatHistoryAdapter(fakeClient(null).client)!.list()).rejects.toThrow();
  });

  it("deletes all only within this user and app", async () => {
    const { client, queries } = fakeClient("u1");
    await createChatHistoryAdapter(client)!.deleteAll();
    const del = queries.find((q) => q.some((c) => c.op === "delete"))!;
    expect(eqs(del)).toEqual({ user_id: "u1", app: CHAT_HISTORY_APP_KEY });
  });
});
