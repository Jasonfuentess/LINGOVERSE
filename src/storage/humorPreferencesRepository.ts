import { decodeHumorPreferences, humorDefaults } from '../domain/humor/preferences';
import type { HumorPreferences } from '../domain/humor/models';
import type { KeyValueStorage } from './contracts';
import { withStorageLock } from './serialization';
const key = 'lingoverse.humor-preferences.v1';
export class HumorPreferencesConflictError extends Error {
  constructor() { super('Los ajustes cambiaron en otra ventana. Releé los ajustes antes de guardar.'); }
}
export class HumorPreferencesRepository {
  private expected: string | null | undefined;
  constructor(private readonly storage: KeyValueStorage) {}
  async load(): Promise<HumorPreferences> {
    const value = await this.storage.getItem(key);
    this.expected = value;
    return value === null ? humorDefaults() : decodeHumorPreferences(value);
  }
  async save(preferences: HumorPreferences): Promise<void> {
    if (this.expected === undefined) throw Error('Leé los ajustes antes de guardarlos');
    const expected = this.expected;
    const value = JSON.stringify(decodeHumorPreferences(JSON.stringify(preferences)));
    await withStorageLock(this.storage, key, async () => {
      if (await this.storage.getItem(key) !== expected) throw new HumorPreferencesConflictError();
      await this.storage.setItem(key, value);
      this.expected = value;
    });
  }
}
