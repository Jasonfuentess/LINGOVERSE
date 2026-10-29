import type { Lesson, MissionProgress } from '../domain/learning/models';
import type { KeyValueStorage } from './contracts';
import { restoreProgress } from '../domain/learning/engine';
export class MissionConflictError extends Error {
  constructor() { super('El avance cambió en otra ventana. Releé el progreso antes de continuar.'); }
}
const writers = new Map<string, Promise<void>>();
async function serialize<T>(key: string, action: () => Promise<T>): Promise<T> {
  const previous = writers.get(key) ?? Promise.resolve();
  const result = previous.then(action);
  const settled = result.then(() => {}, () => {});
  writers.set(key, settled);
  try { return await result; }
  finally { if (writers.get(key) === settled) writers.delete(key); }
}
export class MissionRepository {
  private expected: string | null | undefined;
  constructor(private readonly storage: KeyValueStorage, private readonly lesson: Lesson) {}
  private get key() { return `lingoverse.mission.${this.lesson.id}.v1`; }
  async load(): Promise<MissionProgress | null> {
    const raw = await this.storage.getItem(this.key);
    this.expected = raw;
    if (raw === null) return null;
    if (raw.length > 500000) throw Error('El registro de la misión es demasiado grande');
    return restoreProgress(this.lesson, JSON.parse(raw));
  }
  async save(state: MissionProgress): Promise<void> {
    const verified = restoreProgress(this.lesson, state);
    if (this.expected === undefined) throw Error('Leé el progreso antes de guardarlo');
    const expected = this.expected;
    const write = async () => {
      const actual = await this.storage.getItem(this.key);
      if (actual !== expected) throw new MissionConflictError();
      const raw = JSON.stringify(verified);
      await this.storage.setItem(this.key, raw);
      this.expected = raw;
    };
    await serialize(this.key, () => this.storage.withLock ? this.storage.withLock(this.key, write) : write());
  }
}
