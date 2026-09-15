import { describe, expect, it } from "vitest";
import { capabilitySchemaProblems } from "@page-assistant/core";
import { paperAssistantCapabilityManifest } from "@paperassistant/lib/page-assistant/manifest";
import { paperAssistantCapabilities } from "./capabilities";

describe("capability schemas", () => {
  // The SDK refuses to start (CapabilitySchemaError) when any schema is unusable.
  it("server manifest passes the SDK's registration check", () => {
    expect(capabilitySchemaProblems(paperAssistantCapabilityManifest())).toEqual([]);
  });
  it("browser capabilities pass the SDK's registration check", () => {
    expect(capabilitySchemaProblems(paperAssistantCapabilities())).toEqual([]);
  });
});

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
