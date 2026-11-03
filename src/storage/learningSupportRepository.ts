import { decodeSupport, supportDefaults, type LearningSupport, type SupportChange } from '../domain/learning/support';
import type { LearningLanguage } from '../domain/preferences';
import type { KeyValueStorage } from './contracts';
import { withStorageLock } from './serialization';

const key = 'lingoverse.learning-support.v1';
export class LearningSupportRepository {
  constructor(private readonly storage: KeyValueStorage) {}
  async load(): Promise<LearningSupport> {
    const raw = await this.storage.getItem(key);
    return raw === null ? supportDefaults() : decodeSupport(raw);
  }
  async change(language: LearningLanguage, change: SupportChange): Promise<LearningSupport> {
    return withStorageLock(this.storage, key, async () => {
      const current = await this.load();
      const previous = current.languages[language];
      const next = { ...previous, ...(change.stage ? { stage: change.stage } : {}), ...(change.mode ? { mode: change.mode } : {}), checkpoints: { ...previous.checkpoints, ...(change.checkpoint ? { [change.checkpoint.id]: change.checkpoint.step } : {}) } };
      const validated = decodeSupport(JSON.stringify({ ...current, languages: { ...current.languages, [language]: next } }));
      await this.storage.setItem(key, JSON.stringify(validated));
      return validated;
    });
  }
}
