// Vitest setup: mock IndexedDB so Dexie works in jsdom.
import 'fake-indexeddb/auto';

// Node 25+ ships its own global `localStorage`, which is undefined without
// --localstorage-file and hides jsdom's. Fall back to jsdom's (CI's Node 22 never needs this).
if (typeof globalThis.localStorage === 'undefined') {
  const dom = (globalThis as { jsdom?: { window: Window } }).jsdom;
  if (dom) {
    Object.defineProperty(globalThis, 'localStorage', {
      value: dom.window.localStorage,
      configurable: true,
    });
  }
}
