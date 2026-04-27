import "@testing-library/jest-dom/vitest"
import { afterEach, beforeEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"

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
