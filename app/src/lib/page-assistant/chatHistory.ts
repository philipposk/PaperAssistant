import {
  supabaseChatHistoryAdapter,
  type ChatHistoryAdapter,
  type SupabaseClientLike,
  type WidgetStrings,
} from "@page-assistant/widget";
import { supabase } from "../supabase";

/**
 * Signing out wipes this browser's storage on purpose, device-saved chats included
 * (clearLocalWorkspace in ../auth, for shared computers). The widget's default device hint
 * says chats "stay in this browser", which would promise more than that, so say when they go.
 */
export const CHAT_HISTORY_STRINGS: Partial<WidgetStrings> = {
  historyModeDeviceHint:
    "Your chats are kept in this browser only and are cleared on sign-out. They aren't saved to your account.",
};

/** Stored in `paperassistant.assistant_chats.app`; the table already lives in this app's schema. */
export const CHAT_HISTORY_APP_KEY = "paperassistant";

/** Saved chats are deleted after this many months without activity (same rule as migration 0009). */
export const CHAT_HISTORY_RETENTION_MONTHS = 12;

/**
 * "Account" chat history for the page assistant, backed by `paperassistant.assistant_chats`.
 *
 * Uses the app's browser client, so every query runs with the signed-in user's session and
 * RLS limits it to that user's rows. Never pass a service-role client here.
 *
 * `currentUserId()` (implemented by the SDK adapter from `auth.getSession()`) is null when
 * signed out, which makes the widget fall back to device mode, and the user's id otherwise,
 * which keys both their mode choice and their device-only chats, so two people on one
 * browser never see each other's chats.
 *
 * Returns undefined when cloud is not configured; the widget then stays on device history.
 */
export function createChatHistoryAdapter(
  client: SupabaseClientLike | null = supabase,
): ChatHistoryAdapter | undefined {
  if (!client) return undefined;
  return supabaseChatHistoryAdapter(client, {
    app: CHAT_HISTORY_APP_KEY,
    retentionMonths: CHAT_HISTORY_RETENTION_MONTHS,
  });
}
