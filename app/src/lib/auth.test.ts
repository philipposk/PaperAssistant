import { describe, expect, it } from "vitest";
import { CHAT_HISTORY_MODE_STORAGE_KEY } from "@page-assistant/widget";
import { clearLocalWorkspace } from "./auth";

describe("clearLocalWorkspace", () => {
  it("wipes device-saved chats but keeps the theme and the assistant's history-mode choice", async () => {
    const choice = JSON.stringify({ v: 1, modes: { "user:u1": "off" } });
    localStorage.setItem("paperassistant.theme", "dark");
    localStorage.setItem(CHAT_HISTORY_MODE_STORAGE_KEY, choice);
    localStorage.setItem("page_assistant_chat_history:user:u1", "{}");

    await clearLocalWorkspace();

    expect(localStorage.getItem("page_assistant_chat_history:user:u1")).toBeNull();
    expect(localStorage.getItem("paperassistant.theme")).toBe("dark");
    expect(localStorage.getItem(CHAT_HISTORY_MODE_STORAGE_KEY)).toBe(choice);
  });
});
