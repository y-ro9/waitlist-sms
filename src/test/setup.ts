import '@testing-library/jest-dom/vitest';

/**
 * Node.js 22+ exposes an experimental `localStorage` global that is undefined
 * unless the process is started with `--localstorage-file=<path>`. That global
 * shadows jsdom's `window.localStorage`, causing `localStorage.clear()` to
 * throw `Cannot read properties of undefined`.
 *
 * Fix: force `globalThis.localStorage` to point at the jsdom localStorage.
 * Fall back to an in-memory polyfill if window.localStorage isn't available.
 */
if (typeof window !== 'undefined' && window.localStorage) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: window.localStorage,
    writable: true,
    configurable: true,
  });
} else {
  class MemoryStorage implements Storage {
    private store: Record<string, string> = {};
    get length(): number {
      return Object.keys(this.store).length;
    }
    clear(): void {
      this.store = {};
    }
    getItem(key: string): string | null {
      return key in this.store ? this.store[key] : null;
    }
    key(index: number): string | null {
      return Object.keys(this.store)[index] ?? null;
    }
    removeItem(key: string): void {
      delete this.store[key];
    }
    setItem(key: string, value: string): void {
      this.store[key] = String(value);
    }
  }
  Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage(),
    writable: true,
    configurable: true,
  });
}