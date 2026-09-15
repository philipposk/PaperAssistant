import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageAssistant } from "@page-assistant/widget";
import { useAuth } from "../lib/auth";
import {
  paperAssistantCapabilities,
  PAPERASSISTANT_PA_KNOWLEDGE,
} from "../lib/page-assistant/capabilities";
import { setPageAssistantNavigate } from "../lib/page-assistant/navigate";
import { createChatHistoryAdapter } from "../lib/page-assistant/chatHistory";
import { useCurrentProjectStore } from "../lib/currentProject";

const PA_VOICE_SETTINGS_KEY = "paperassistant_pa_voice";

// User-session client only (RLS scopes rows to auth.uid()); undefined without cloud config.
const chatHistoryAdapter = createChatHistoryAdapter();

/** Floating page-assistant widget (site-wide; coexists with /ask PDF Q&A). */
export function PageAssistantWidget() {
  const navigate = useNavigate();
  const { session, isSignedIn } = useAuth();
  const userId = session?.user?.id ?? null;

  useEffect(() => {
    setPageAssistantNavigate(navigate);
  }, [navigate]);

  useEffect(() => {
    const base = window.location.origin;
    PageAssistant.init({
      serverUrl: `${base}/api/pa`,
      authToken: session?.access_token,
      appName: "PaperAssistant",
      persona:
        "You help researchers manage projects, files, and literature. Be concise. Only state facts returned by tools. For deep PDF Q&A direct users to the Ask page on their project.",
      knowledge: PAPERASSISTANT_PA_KNOWLEDGE,
      knowledgeUrl: `${base}/llm.txt`,
      voice: true,
      settingsPageUrl: "/settings#assistant",
      settingsStorageKey: PA_VOICE_SETTINGS_KEY,
      // Chat history. Default for signed-in users is "account": chats are saved to their
      // PaperAssistant account (paperassistant.assistant_chats, readable and deletable only by
      // the owner via RLS) so they follow them across devices, and are deleted after 12 months
      // without activity. Signed-out visitors (or no cloud config) fall back to "device":
      // this browser only, kept per person. Each user can switch to device or off, and delete
      // one or all chats, in the assistant's Settings > Data; their pick wins over this default.
      chatHistoryMode: "account",
      chatHistoryAdapter,
      chatHistoryFallbackMode: "device",
      onChatHistoryError: (error) => console.warn("[assistant] chat history:", error),
      autoScan: true,
      capabilities: paperAssistantCapabilities(),
      suggestions: [
        "List my projects",
        "Search papers about transformer models",
        "Open files for my current project",
        "Go to settings",
      ],
      greeting: isSignedIn
        ? "Hi — I can navigate PaperAssistant, search papers, and manage your projects."
        : "Hi — sign in to use AI chat. I can still help navigate once you're exploring the app.",
      getPageState: () => ({
        path: window.location.pathname,
        currentProjectId: useCurrentProjectStore.getState().currentProjectId,
        signedIn: Boolean(session),
      }),
    });
  }, [session?.access_token, isSignedIn, session]);

  // init() only runs once per page, so tell the widget when the signed-in user changes:
  // it switches between the user's account chats and the signed-out fallback.
  useEffect(() => {
    void PageAssistant.refreshChatHistory();
  }, [userId]);

  return null;
}
