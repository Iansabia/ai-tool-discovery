import "@testing-library/jest-dom/vitest"
import { afterEach, beforeEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"

// jsdom does not ship `window.matchMedia`. Sonner (toast lib) reads it at mount
// time to decide whether to honor `prefers-reduced-motion`. Provide a no-op
// polyfill so test files that mount <Toaster /> (e.g. SignInForm.test.tsx) don't
// crash. The shape matches the MediaQueryList interface narrowly enough for
// sonner's read.
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

// Reset DOM between tests
afterEach(() => {
  cleanup()
})

// Provide a fresh in-memory localStorage for every test.
// jsdom ships its own Storage, but we replace it with a controllable mock so
// tests can assert on writes and dispatch synthetic StorageEvents reliably.
beforeEach(() => {
  const store = new Map<string, string>()
  const mockStorage: Storage = {
    get length() {
      return store.size
    },
    clear: () => store.clear(),
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    key: (i) => Array.from(store.keys())[i] ?? null,
    removeItem: (key) => {
      store.delete(key)
    },
    setItem: (key, value) => {
      store.set(key, String(value))
    },
  }
  vi.stubGlobal("localStorage", mockStorage)
})
