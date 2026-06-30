/** Default body for a brand-new note — empty so the editor placeholder shows. */
export const EMPTY_NOTE_MARKDOWN = "";

export function noteDisplayTitle(title: string): string {
  return title.trim() || "Untitled";
}
