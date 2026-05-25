// Tests for push helpers. We mock the supabase client so no network
// happens; assertions check that the right rows + storage paths get
// produced, and that calls become no-ops when unauthenticated.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const supabaseModuleMock = vi.hoisted(() => {
  const upsertCalls: Array<{ table: string; row: unknown }> = [];
  const deleteCalls: Array<{ table: string; eqArg: [string, string] }> = [];
  const uploadCalls: Array<{ bucket: string; path: string; mime: string }> = [];
  const removeCalls: Array<{ bucket: string; paths: string[] }> = [];

  const fromTable = (table: string) => ({
    upsert: vi.fn(async (row: unknown) => {
      upsertCalls.push({ table, row });
      return { data: null, error: null };
    }),
    delete: () => ({
      eq: vi.fn(async (col: string, value: string) => {
        deleteCalls.push({ table, eqArg: [col, value] });
        return { data: null, error: null };
      }),
    }),
  });

  const fromBucket = (bucket: string) => ({
    upload: vi.fn(async (path: string, _blob: Blob, options: { contentType?: string }) => {
      uploadCalls.push({ bucket, path, mime: options.contentType ?? "" });
      return { data: { path }, error: null };
    }),
    remove: vi.fn(async (paths: string[]) => {
      removeCalls.push({ bucket, paths });
      return { data: null, error: null };
    }),
  });

  const client = {
    from: vi.fn((table: string) => fromTable(table)),
    storage: { from: vi.fn((bucket: string) => fromBucket(bucket)) },
  };

  let cloudConfigured = true;
  return {
    upsertCalls,
    deleteCalls,
    uploadCalls,
    removeCalls,
    client,
    setCloud: (b: boolean) => {
      cloudConfigured = b;
    },
    get isCloudConfigured() {
      return cloudConfigured;
    },
  };
});

vi.mock("../supabase", () => ({
  get supabase() {
    return supabaseModuleMock.isCloudConfigured ? supabaseModuleMock.client : null;
  },
  get isCloudConfigured() {
    return supabaseModuleMock.isCloudConfigured;
  },
}));

import { useAuthStore } from "../auth";
import { db, now, uid } from "../db";
import {
  pushFileDelete,
  pushFileUpsert,
  pushNoteDelete,
  pushNoteUpsert,
  pushProjectDelete,
  pushProjectUpsert,
} from "./push";

const FAKE_UID = "user-1";

function setSignedIn(signedIn: boolean) {
  useAuthStore.setState({
    session: signedIn ? ({ user: { id: FAKE_UID } } as never) : null,
    user: signedIn ? ({ id: FAKE_UID } as never) : null,
  });
}

beforeEach(() => {
  supabaseModuleMock.upsertCalls.length = 0;
  supabaseModuleMock.deleteCalls.length = 0;
  supabaseModuleMock.uploadCalls.length = 0;
  supabaseModuleMock.removeCalls.length = 0;
  supabaseModuleMock.setCloud(true);
  setSignedIn(true);
});

afterEach(async () => {
  await db.projects.clear();
  await db.files.clear();
  await db.notes.clear();
  setSignedIn(false);
});

describe("pushProjectUpsert", () => {
  it("upserts a project row when signed in", async () => {
    const id = uid();
    const t = now();
    await db.projects.add({ id, name: "P", created_at: t, updated_at: t });
    await pushProjectUpsert({ id, name: "P", created_at: t, updated_at: t });
    expect(supabaseModuleMock.upsertCalls).toHaveLength(1);
    const call = supabaseModuleMock.upsertCalls[0];
    expect(call.table).toBe("projects");
    expect(call.row).toMatchObject({ id, name: "P", user_id: FAKE_UID });
  });

  it("sets remote_id on the local row after push", async () => {
    const id = uid();
    const t = now();
    await db.projects.add({ id, name: "P", created_at: t, updated_at: t });
    await pushProjectUpsert({ id, name: "P", created_at: t, updated_at: t });
    const back = await db.projects.get(id);
    expect(back?.remote_id).toBe(id);
  });

  it("is a no-op when unauthenticated", async () => {
    setSignedIn(false);
    await pushProjectUpsert({ id: "x", name: "P", created_at: 1, updated_at: 1 });
    expect(supabaseModuleMock.upsertCalls).toHaveLength(0);
  });

  it("is a no-op when cloud not configured", async () => {
    supabaseModuleMock.setCloud(false);
    await pushProjectUpsert({ id: "x", name: "P", created_at: 1, updated_at: 1 });
    expect(supabaseModuleMock.upsertCalls).toHaveLength(0);
  });
});

describe("pushProjectDelete", () => {
  it("calls delete().eq('id', id) on the projects table", async () => {
    await pushProjectDelete("abc");
    expect(supabaseModuleMock.deleteCalls).toEqual([
      { table: "projects", eqArg: ["id", "abc"] },
    ]);
  });
});

describe("pushFileUpsert", () => {
  it("uploads blob to {uid}/{project_id}/{file_id} then inserts metadata", async () => {
    const id = uid();
    const projectId = uid();
    const t = now();
    const blob = new Blob(["hello"], { type: "text/plain" });
    await db.files.add({
      id,
      project_id: projectId,
      name: "hello.txt",
      mime: "text/plain",
      size: 5,
      blob,
      tags: [],
      created_at: t,
      updated_at: t,
    });
    await pushFileUpsert({
      id,
      project_id: projectId,
      name: "hello.txt",
      mime: "text/plain",
      size: 5,
      blob,
      tags: [],
      created_at: t,
      updated_at: t,
    });
    expect(supabaseModuleMock.uploadCalls).toEqual([
      { bucket: "files", path: `${FAKE_UID}/${projectId}/${id}`, mime: "text/plain" },
    ]);
    expect(supabaseModuleMock.upsertCalls).toHaveLength(1);
    const meta = supabaseModuleMock.upsertCalls[0];
    expect(meta.table).toBe("files");
    expect(meta.row).toMatchObject({
      id,
      project_id: projectId,
      user_id: FAKE_UID,
      storage_path: `${FAKE_UID}/${projectId}/${id}`,
      size_bytes: 5,
    });
  });
});

describe("pushFileDelete", () => {
  it("removes blob then deletes metadata row", async () => {
    const id = "fid";
    const projectId = "pid";
    await pushFileDelete({ id, project_id: projectId } as never);
    expect(supabaseModuleMock.removeCalls).toEqual([
      { bucket: "files", paths: [`${FAKE_UID}/${projectId}/${id}`] },
    ]);
    expect(supabaseModuleMock.deleteCalls).toEqual([
      { table: "files", eqArg: ["id", id] },
    ]);
  });
});

describe("pushNoteUpsert / pushNoteDelete", () => {
  it("upserts a note row with markdown body", async () => {
    const id = uid();
    const t = now();
    await pushNoteUpsert({
      id,
      project_id: "p",
      title: "T",
      markdown: "# hi",
      created_at: t,
      updated_at: t,
    });
    expect(supabaseModuleMock.upsertCalls[0]).toMatchObject({
      table: "notes",
      row: { id, title: "T", markdown: "# hi", user_id: FAKE_UID },
    });
  });

  it("deletes a note by id", async () => {
    await pushNoteDelete("note-1");
    expect(supabaseModuleMock.deleteCalls).toEqual([
      { table: "notes", eqArg: ["id", "note-1"] },
    ]);
  });
});
