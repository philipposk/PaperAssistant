import type { NavigateFunction } from "react-router-dom";

let navigateFn: NavigateFunction | null = null;

export function setPageAssistantNavigate(fn: NavigateFunction) {
  navigateFn = fn;
}

export function pageAssistantNavigate(path: string) {
  if (!navigateFn) throw new Error("Navigation is not ready yet.");
  if (!path.startsWith("/")) throw new Error("Path must start with /");
  navigateFn(path);
}
