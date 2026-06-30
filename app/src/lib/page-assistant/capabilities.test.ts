import { describe, expect, it } from "vitest";
import { paperAssistantCapabilityManifest } from "@paperassistant/lib/page-assistant/manifest";

describe("page-assistant manifest", () => {
  it("lists pilot capabilities with confirm on delete", () => {
    const names = paperAssistantCapabilityManifest().map((c) => c.name);
    expect(names).toEqual([
      "navigate_to",
      "search_papers",
      "list_projects",
      "open_project",
      "list_files",
      "delete_file",
    ]);
    const del = paperAssistantCapabilityManifest().find((c) => c.name === "delete_file");
    expect(del?.confirm).toBe(true);
  });
});
