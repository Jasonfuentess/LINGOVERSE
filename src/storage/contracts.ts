export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  withLock?<T>(key: string, action: () => Promise<T>): Promise<T>;
}
