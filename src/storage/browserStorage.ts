import type { KeyValueStorage } from './contracts';
type BrowserStore = Pick<Storage, 'getItem' | 'setItem'>;
export function createBrowserStorage(resolve: () => BrowserStore = () => window.localStorage): KeyValueStorage {
  return {
    async getItem(key) { return resolve().getItem(key); },
    async setItem(key, value) { resolve().setItem(key, value); },
    async withLock<T>(key: string, action: () => Promise<T>): Promise<T> {
      if (typeof navigator !== 'undefined' && navigator.locks) return navigator.locks.request(key, action);
      return action();
    },
  };
}
