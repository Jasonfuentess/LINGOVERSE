import { decodePreferences, defaults, type Preferences } from '../domain/preferences';
import type { KeyValueStorage } from './contracts';
export class PreferencesRepository {
  constructor(private readonly storage: KeyValueStorage) {}
  async load(): Promise<{ preferences: Preferences; recovered: boolean }> {
    const raw = await this.storage.getItem('lingoverse.preferences.v1');
    if (raw === null) return { preferences: defaults(), recovered: false };
    try { return { preferences: decodePreferences(raw), recovered: false }; }
    catch { return { preferences: defaults(), recovered: true }; }
  }
  async save(preferences: Preferences): Promise<void> {
    const validated = decodePreferences(JSON.stringify(preferences));
    await this.storage.setItem('lingoverse.preferences.v1', JSON.stringify(validated));
  }
}
