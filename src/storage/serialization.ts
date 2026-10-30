import type { KeyValueStorage } from './contracts';
const writers = new Map<string, Promise<void>>();
export async function withStorageLock<T>(storage: KeyValueStorage, key: string, action: () => Promise<T>): Promise<T> {
  const previous = writers.get(key) ?? Promise.resolve();
  const result = previous.then(() => storage.withLock ? storage.withLock(key, action) : action());
  const settled = result.then(() => {}, () => {});
  writers.set(key, settled);
  try { return await result; }
  finally { if (writers.get(key) === settled) writers.delete(key); }
}
