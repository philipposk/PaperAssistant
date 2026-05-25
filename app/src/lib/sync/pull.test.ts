import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const supabaseModuleMock = vi.hoisted(() => {
  let projectsData: unknown[] = [];
  let filesData: unknown[] = [];
  let notesData: unknown[] = [];
  let downloadBlob: Blob | null = new Blob(["x"], { type: "text/plain" });
  let cloud = true;

  const client = {
    from: vi.fn((table: string) => ({
      select: vi.fn(async () => {
        const map: Record<string, unknown[]> = {
          projects: projectsData,
          files: filesData,
          notes: notesData,
        };
        return { data: map[table] ?? [], error: null };
      }),
    })),
    storage: {
      from: vi.fn(() => ({
        download: vi.fn(async () => ({ data: downloadBlob, error: null })),
      })),
    },
  };

  return {
    client,
    setCloud: (b: boolean) => {
      cloud = b;
    },
    setProjects: (d: unknown[]) => {
      projectsData = d;
    },
    setFiles: (d: unknown[]) => {
      filesData = d;
    },
    setNotes: (d: unknown[]) => {
      notesData = d;
    },
    setDownloadBlob: (b: Blob | null) => {
      downloadBlob = b;
    },
    get isCloud() {
      return cloud;
    },
  };
});

vi.mock("../supabase", () => ({
  get supabase() {
    return supabaseModuleMock.isCloud ? supabaseModuleMock.client : null;
  },
  get isCloudConfigured() {
    return supabaseModuleMock.isCloud;
  },
}));

import { useAuthStore } from "../auth";
import { db } from "../db";
import { pullAll } from "./pull";

const FAKE_UID = "u1";

beforeEach(() => {
  supabaseModuleMock.setCloud(true);
  supabaseModuleMock.setProjects([]);
  supabaseModuleMock.setFiles([]);
  supabaseModuleMock.setNotes([]);
  useAuthStore.setState({ user: { id: FAKE_UID } as never, session: { user: { id: FAKE_UID } } as never });
});

afterEach(async () => {
  await db.projects.clear();
  await db.files.clear();
  await db.notes.clear();
  useAuthStore.setState({ user: null, session: null });
});

describe("pullAll", () => {
  it("writes new remote projects into Dexie", async () => {
    supabaseModuleMock.setProjects([
      {
        id: "p1",
        user_id: FAKE_UID,
        name: "Remote",
        description: null,
        color: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-02T00:00:00Z",
      },
    ]);
    const report = await pullAll();
    expect(report.projects).toBe(1);
    const row = await db.projects.get("p1");
    expect(row?.name).toBe("Remote");
    expect(row?.remote_id).toBe("p1");
  });

  it("skips remote rows that are older than local", async () => {
    await db.projects.add({
      id: "p1",
      name: "Local newer",
      created_at: 1_000_000_000_000,
      updated_at: 1_900_000_000_000,
    });
    supabaseModuleMock.setProjects([
      {
        id: "p1",
        user_id: FAKE_UID,
        name: "Remote older",
        description: null,
        color: null,
        created_at: "2020-01-01T00:00:00Z",
        updated_at: "2020-01-02T00:00:00Z",
      },
    ]);
    const report = await pullAll();
    expect(report.projects).toBe(0);
    const row = await db.projects.get("p1");
    expect(row?.name).toBe("Local newer");
  });

  it("overwrites local row when remote.updated_at is newer", async () => {
    await db.projects.add({
      id: "p1",
      name: "Local older",
      created_at: 1_000_000_000_000,
      updated_at: 1_700_000_000_000,
    });
    supabaseModuleMock.setProjects([
      {
        id: "p1",
        user_id: FAKE_UID,
        name: "Remote newer",
        description: null,
        color: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2030-01-02T00:00:00Z",
      },
    ]);
    const report = await pullAll();
    expect(report.projects).toBe(1);
    const row = await db.projects.get("p1");
    expect(row?.name).toBe("Remote newer");
  });

  it("returns zeros and no-ops when cloud not configured", async () => {
    supabaseModuleMock.setCloud(false);
    const report = await pullAll();
    expect(report).toEqual({ projects: 0, files: 0, notes: 0 });
  });
});
