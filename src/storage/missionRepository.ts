import type { Lesson, MissionProgress } from '../domain/learning/models';
import type { KeyValueStorage } from './contracts';
import { beginMission, restoreProgress } from '../domain/learning/engine';
import { annotateConversationProfiles, historyForProgress, lessonCandidates, lessonContext, variantContentId } from '../domain/learning/variety';
import { emptyHistory, validateHistory } from '../domain/variety/history';
import { seededRandom, selectContent } from '../domain/variety/selection';
import type { RandomSource, VarietyHistory } from '../domain/variety/models';
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
  private current: MissionProgress | null = null;
  private history: VarietyHistory = emptyHistory();
  constructor(private readonly storage: KeyValueStorage, private readonly lesson: Lesson, private readonly archives: Lesson[] = []) {}
  private contentFor(value: unknown): Lesson {
    const version = value && typeof value === 'object' ? (value as Record<string, unknown>).contentVersion : undefined;
    const lesson = [this.lesson, ...this.archives].find(item => item.id === this.lesson.id && item.version === version);
    if (!lesson) throw Error('Versión de contenido no admitida');
    return lesson;
  }
  private get key() { return `lingoverse.mission.${this.lesson.id}.v1`; }
  async load(): Promise<MissionProgress | null> {
    const raw = await this.storage.getItem(this.key);
    this.expected = raw;
    if (raw === null) { this.current = null; this.history = emptyHistory(); return null; }
    if (raw.length > 1000000) throw Error('El registro de la misión es demasiado grande');
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') throw Error('Registro de misión inválido');
    const envelope = value as Record<string, unknown>;
    let progress: MissionProgress;
    let history: VarietyHistory;
    if (envelope.version === 2) {
      const content = this.contentFor(envelope.progress);
      progress = restoreProgress(content, envelope.progress);
      history = validateHistory(envelope.history);
      if (history.session < 1 || !history.entries.some(item => item.id === variantContentId(content, progress.variantId))) throw Error('Historial de misión inconsistente');
    } else {
      const content = this.contentFor(value);
      progress = restoreProgress(content, value);
      // Only the retained legacy run is observable. Do not invent earlier appearances or dates.
      history = historyForProgress(content, emptyHistory(), null, progress, null);
    }
    this.current = progress;
    this.history = validateHistory(annotateConversationProfiles(history, [this.lesson, ...this.archives]));
    return progress;
  }
  getHistory(): VarietyHistory { return validateHistory(this.history); }
  async start(random: RandomSource = seededRandom((Date.now() >>> 0) ^ (this.history.session + 1)), at = Date.now()): Promise<MissionProgress> {
    const decision = selectContent(lessonCandidates(this.lesson), lessonContext(this.lesson, this.history.session + 1), this.history, random);
    const variant = this.lesson.variants.find(item => variantContentId(this.lesson, item.id) === decision.candidateId);
    if (!variant) throw Error('No hay una variante educativa apropiada');
    const progress = beginMission(this.lesson, (this.current?.run ?? -1) + 1, () => variant.id);
    await this.save(progress, at);
    return progress;
  }
  async save(state: MissionProgress, at = Date.now()): Promise<void> {
    const content = this.contentFor(state);
    const verified = restoreProgress(content, state);
    if (this.expected === undefined) throw Error('Leé el progreso antes de guardarlo');
    const expected = this.expected;
    const history = validateHistory(historyForProgress(content, this.history, this.current, verified, at));
    const write = async () => {
      const actual = await this.storage.getItem(this.key);
      if (actual !== expected) throw new MissionConflictError();
      const raw = JSON.stringify({ version: 2, progress: verified, history });
      if (raw.length > 1000000) throw Error('El registro de la misión es demasiado grande');
      await this.storage.setItem(this.key, raw);
      this.expected = raw;
      this.current = verified;
      this.history = history;
    };
    await serialize(this.key, () => this.storage.withLock ? this.storage.withLock(this.key, write) : write());
  }
}
