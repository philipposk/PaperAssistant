import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { CHAT_HISTORY_STRINGS } from "../lib/page-assistant/chatHistory";
import { PageAssistantWidget } from "./PageAssistantWidget";

const { init, refreshChatHistory } = vi.hoisted(() => ({
  init: vi.fn(),
  refreshChatHistory: vi.fn(async () => {}),
}));

vi.mock("@page-assistant/widget", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@page-assistant/widget")>()),
  PageAssistant: { init, refreshChatHistory },
}));

vi.mock("../lib/auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../lib/auth")>()),
  useAuth: () => ({ session: null, isSignedIn: false }),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("PageAssistantWidget", () => {
  // Sign-out runs clearLocalWorkspace(), which wipes device-saved chats (see auth.test.ts).
  // The SDK's default hint says they "stay in this browser"; ours must say when they go.
  it("tells people that signing out clears chats saved on this device", async () => {
    const root = createRoot(document.createElement("div"));
    await act(async () => {
      root.render(
        <MemoryRouter>
          <PageAssistantWidget />
        </MemoryRouter>,
      );
    });

    expect(init).toHaveBeenCalled();
    expect(init.mock.lastCall![0].strings).toBe(CHAT_HISTORY_STRINGS);
    expect(CHAT_HISTORY_STRINGS.historyModeDeviceHint).toMatch(/cleared on sign-out/);

    act(() => root.unmount());
  });
});
