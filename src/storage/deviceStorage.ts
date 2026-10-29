import Storage from 'expo-sqlite/kv-store';
import type { KeyValueStorage } from './contracts';
export const deviceStorage: KeyValueStorage = {
  getItem: key => Storage.getItem(key),
  setItem: (key, value) => Storage.setItem(key, value),
};
