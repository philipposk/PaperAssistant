import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageAssistant } from "@page-assistant/widget";
import { useAuth } from "../lib/auth";
import {
  paperAssistantCapabilities,
  PAPERASSISTANT_PA_KNOWLEDGE,
} from "../lib/page-assistant/capabilities";
import { setPageAssistantNavigate } from "../lib/page-assistant/navigate";
import { useCurrentProjectStore } from "../lib/currentProject";

const PA_VOICE_SETTINGS_KEY = "paperassistant_pa_voice";

/** Floating page-assistant widget (site-wide; coexists with /ask PDF Q&A). */
export function PageAssistantWidget() {
  const navigate = useNavigate();
  const { session, isSignedIn } = useAuth();

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
      // Keep the chrome this app already shipped with. The SDK bump to 0.5.0 is here for
      // the microphone fixes, not for a new interface: left at their defaults these two
      // would add a chat-history sidebar and an extended settings modal that PaperAssistant
      // users have never seen.
      disableChatHistory: true,
      useExtendedSettings: false,
      // English-only app: no `lang` and no `strings`, so the SDK's en-US defaults apply.
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

  return null;
}
