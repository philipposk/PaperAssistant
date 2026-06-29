// Custom Supabase auth storage that writes cookies on `.6x7.gr` in
// production so the session is shared with sibling subdomains (hub at
// 6x7.gr, school.6x7.gr, digestive.6x7.gr, …). On localhost / non-6x7
// hosts we fall back to localStorage so dev still works.
//
// IMPORTANT: cookies are keyed by the ACTUAL Supabase storage key, not a
// single fixed name. supabase-js stores several keys during OAuth — the
// session under `sb-6x7-auth` AND a transient PKCE `…-code-verifier`. An
// earlier version mapped every key to one cookie, so the post-login
// removal of the code-verifier deleted the session cookie too — OAuth
// (Google/GitHub) appeared to log in then immediately logged out, while
// magic-link (no verifier) worked. Keying by `key` keeps them separate;
// the session still lands in `sb-6x7-auth` so cross-subdomain SSO holds.
//
// Cookies are capped at ~4KB by browsers; an OAuth session (with provider
// tokens) can exceed that, so large values are split across numbered
// chunk cookies (`<key>.0`, `<key>.1`, …) and reassembled on read.

const COOKIE_DOMAIN_PROD = ".6x7.gr";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const CHUNK_SIZE = 3200; // raw chars per cookie; encoded stays under the 4KB cap
const MAX_CHUNKS = 16;

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
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
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
  const parts = [`${name}=`, "path=/", "max-age=0"];
  if (isSharedHost()) parts.push(`domain=${COOKIE_DOMAIN_PROD}`);
  document.cookie = parts.join("; ");
}

function removeCookieAndChunks(key: string) {
  deleteCookie(key);
  for (let i = 0; i < MAX_CHUNKS; i++) {
    if (readCookie(`${key}.${i}`) === null) break;
    deleteCookie(`${key}.${i}`);
  }
}

function readCookieValue(key: string): string | null {
  const single = readCookie(key);
  if (single !== null) return single;
  // reassemble chunks
  const first = readCookie(`${key}.0`);
  if (first === null) return null;
  let out = first;
  for (let i = 1; i < MAX_CHUNKS; i++) {
    const chunk = readCookie(`${key}.${i}`);
    if (chunk === null) break;
    out += chunk;
  }
  return out;
}

function writeCookieValue(key: string, value: string) {
  // clear any previous representation (single or chunked) first
  removeCookieAndChunks(key);
  if (value.length <= CHUNK_SIZE) {
    writeCookie(key, value);
    return;
  }
  for (let i = 0; i * CHUNK_SIZE < value.length && i < MAX_CHUNKS; i++) {
    writeCookie(`${key}.${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
  }
}

// Supabase's StorageAdapter: getItem / setItem / removeItem, keyed by the
// real key (cookie on shared hosts, localStorage elsewhere).
export const sharedCookieStorage = {
  getItem(key: string): string | null {
    if (isSharedHost()) return readCookieValue(key);
    return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
  },
  setItem(key: string, value: string): void {
    if (isSharedHost()) writeCookieValue(key, value);
    else if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
  },
  removeItem(key: string): void {
    if (isSharedHost()) removeCookieAndChunks(key);
    else if (typeof localStorage !== "undefined") localStorage.removeItem(key);
  },
};
