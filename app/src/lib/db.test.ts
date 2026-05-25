import { afterEach, describe, expect, it } from "vitest";
import { db, now, uid } from "./db";

afterEach(async () => {
  await db.projects.clear();
  await db.files.clear();
  await db.notes.clear();
});

describe("uid", () => {
  it("returns a v4 uuid string", () => {
    const id = uid();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-9a-f][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
  it("returns unique values", () => {
    const ids = new Set(Array.from({ length: 200 }, () => uid()));
    expect(ids.size).toBe(200);
  });
});

describe("now", () => {
  it("returns a millisecond timestamp", () => {
    const t = now();
    expect(typeof t).toBe("number");
    expect(t).toBeGreaterThan(1_700_000_000_000);
  });
});

describe("Dexie schema", () => {
  it("round-trips a project", async () => {
    const id = uid();
    const t = now();
    await db.projects.add({
      id,
      name: "Test",
      description: "hello",
      created_at: t,
      updated_at: t,
    });
    const back = await db.projects.get(id);
    expect(back?.name).toBe("Test");
    expect(back?.description).toBe("hello");
  });

  it("scopes files by project_id", async () => {
    const p1 = uid();
    const p2 = uid();
    const t = now();
    await db.files.bulkAdd([
      { id: uid(), project_id: p1, name: "a", mime: "text/plain", size: 1, blob: new Blob(["a"]), tags: [], created_at: t, updated_at: t },
      { id: uid(), project_id: p1, name: "b", mime: "text/plain", size: 1, blob: new Blob(["b"]), tags: [], created_at: t, updated_at: t },
      { id: uid(), project_id: p2, name: "c", mime: "text/plain", size: 1, blob: new Blob(["c"]), tags: [], created_at: t, updated_at: t },
    ]);
    const p1Files = await db.files.where("project_id").equals(p1).toArray();
    const p2Files = await db.files.where("project_id").equals(p2).toArray();
    expect(p1Files).toHaveLength(2);
    expect(p2Files).toHaveLength(1);
  });

  it("orders projects by updated_at desc", async () => {
    const id1 = uid();
    const id2 = uid();
    await db.projects.add({ id: id1, name: "older", created_at: 100, updated_at: 100 });
    await db.projects.add({ id: id2, name: "newer", created_at: 200, updated_at: 200 });
    const ordered = await db.projects.orderBy("updated_at").reverse().toArray();
    expect(ordered[0].name).toBe("newer");
    expect(ordered[1].name).toBe("older");
  });
});
