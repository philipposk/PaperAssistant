// Custom Supabase auth storage that writes to a single cookie on
// `.6x7.gr` in production so the session is shared with sibling
// subdomains (hub at 6x7.gr, school.6x7.gr, digestive.6x7.gr, …).
//
// On localhost / non-6x7 hosts we fall back to localStorage so dev still
// works. Supabase's StorageAdapter requires getItem / setItem / removeItem.

const COOKIE_NAME = "sb-6x7-auth";
const COOKIE_DOMAIN_PROD = ".6x7.gr";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function isSharedHost(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname.endsWith(".6x7.gr") || window.location.hostname === "6x7.gr";
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const target = name + "=";
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(target)) {
      return decodeURIComponent(trimmed.substring(target.length));
    }
  }
  return null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const encoded = encodeURIComponent(value);
  const parts = [
    `${name}=${encoded}`,
    "path=/",
    `max-age=${COOKIE_MAX_AGE}`,
    "samesite=lax",
  ];
  if (window.location.protocol === "https:") parts.push("secure");
  if (isSharedHost()) parts.push(`domain=${COOKIE_DOMAIN_PROD}`);
  document.cookie = parts.join("; ");
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  const parts = [
    `${name}=`,
    "path=/",
    "max-age=0",
  ];
  if (isSharedHost()) parts.push(`domain=${COOKIE_DOMAIN_PROD}`);
  document.cookie = parts.join("; ");
}

// Supabase calls these with keys like "sb-fmrnqepyyjucnfbrqawl-auth-token".
// We store them under a single shared cookie name so any sibling app reads
// the same value, and fall back to localStorage on non-6x7 hosts.

export const sharedCookieStorage = {
  getItem(_key: string): string | null {
    if (isSharedHost()) return readCookie(COOKIE_NAME);
    return typeof localStorage !== "undefined" ? localStorage.getItem(COOKIE_NAME) : null;
  },
  setItem(_key: string, value: string): void {
    if (isSharedHost()) writeCookie(COOKIE_NAME, value);
    else if (typeof localStorage !== "undefined") localStorage.setItem(COOKIE_NAME, value);
  },
  removeItem(_key: string): void {
    if (isSharedHost()) deleteCookie(COOKIE_NAME);
    else if (typeof localStorage !== "undefined") localStorage.removeItem(COOKIE_NAME);
  },
};
