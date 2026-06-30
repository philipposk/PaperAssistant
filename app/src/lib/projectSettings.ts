import { db } from "./db";

export function citationStyleKey(projectId: string): string {
  return `citation_style:${projectId}`;
}

export function customCslKey(projectId: string): string {
  return `citation_style_csl:${projectId}`;
}

export function customCslTemplateId(projectId: string): string {
  return `custom-${projectId}`;
}

export async function getProjectCitationStyle(projectId: string): Promise<string> {
  const saved = await db.settings.get(citationStyleKey(projectId));
  if (saved?.value && typeof saved.value === "string") return saved.value;
  const global = await db.settings.get("citation_style");
  if (global?.value && typeof global.value === "string") return global.value;
  return "apa";
}

export async function setProjectCitationStyle(
  projectId: string,
  style: string,
): Promise<void> {
  await db.settings.put({ key: citationStyleKey(projectId), value: style });
}

export async function getProjectCustomCsl(projectId: string): Promise<string | null> {
  const saved = await db.settings.get(customCslKey(projectId));
  return saved?.value && typeof saved.value === "string" ? saved.value : null;
}

export async function setProjectCustomCsl(
  projectId: string,
  cslXml: string,
): Promise<void> {
  await db.settings.put({ key: customCslKey(projectId), value: cslXml });
}

export async function clearProjectCustomCsl(projectId: string): Promise<void> {
  await db.settings.delete(customCslKey(projectId));
}
