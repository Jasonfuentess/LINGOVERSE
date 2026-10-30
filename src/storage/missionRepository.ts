import type { Lesson, MissionProgress } from '../domain/learning/models';
import type { KeyValueStorage } from './contracts';
import { withStorageLock } from './serialization';
import { beginMission, restoreProgress, submitAnswer } from '../domain/learning/engine';
import { annotateConversationProfiles, historyForProgress, lessonCandidates, lessonContext, variantContentId } from '../domain/learning/variety';
import { emptyHistory, noteAppearance, validateHistory } from '../domain/variety/history';
import { humorContext } from '../domain/humor/context';
import { restoreReaction, selectReaction } from '../domain/humor/engine';
import type { HumorRequest, SavedReaction } from '../domain/humor/models';
import { seededRandom, selectContent } from '../domain/variety/selection';
import type { RandomSource, VarietyHistory } from '../domain/variety/models';
import { roastLibrary } from '../content/roastHumor';
import { reactionLibrary } from '../content/humor';
import { canRoast } from '../domain/humor/access';
import { detectReference, restoreReference, type ReferenceEvidence } from '../domain/humor/references';
export class MissionConflictError extends Error {
  constructor() { super('El avance cambió en otra ventana. Releé el progreso antes de continuar.'); }
}
export class MissionRepository {
  private expected: string | null | undefined;
  private current: MissionProgress | null = null;
  private history: VarietyHistory = emptyHistory();
  private reaction: SavedReaction | null = null;
  private reference: ReferenceEvidence | null = null;
  constructor(private readonly storage: KeyValueStorage, private readonly lesson: Lesson, private readonly archives: Lesson[] = [], private readonly mode: 'friendly' | 'roast' = 'friendly') {}
  private get library() { return this.mode === 'roast' ? roastLibrary : reactionLibrary; }
  private async requireAccess() {
    if (this.mode !== 'roast') return;
    const raw = await this.storage.getItem('lingoverse.humor-preferences.v1');
    if (!raw || !canRoast(JSON.parse(raw))) throw Error('Roast Me requiere consentimiento adulto vigente');
  }
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
    if (raw === null) { this.current = null; this.history = emptyHistory(); this.reaction = null; this.reference = null; return null; }
    if (raw.length > 1000000) throw Error('El registro de la misión es demasiado grande');
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') throw Error('Registro de misión inválido');
    const envelope = value as Record<string, unknown>;
    let progress: MissionProgress;
    let history: VarietyHistory;
    if (envelope.version === 2 || envelope.version === 3) {
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
    const context = humorContext(this.contentFor(progress), progress, this.history);
    this.reference = this.mode === 'roast' ? restoreReference(envelope.reference, context) : null;
    const restoredContext = context && this.reference ? { ...context, referenceId: this.reference.referenceId } : context;
    this.reaction = envelope.version === 3 ? restoreReaction(envelope.reaction, restoredContext, this.history, this.library) : null;
    if (this.mode === 'roast') {
      try { await this.requireAccess(); } catch { this.reaction = null; }
    }
    return progress;
  }
  getHistory(): VarietyHistory { return validateHistory(this.history); }
  getReaction(): SavedReaction | null { return this.reaction ? { ...this.reaction } : null; }
  async start(random: RandomSource = seededRandom((Date.now() >>> 0) ^ (this.history.session + 1)), at = Date.now()): Promise<MissionProgress> {
    const decision = selectContent(lessonCandidates(this.lesson), lessonContext(this.lesson, this.history.session + 1), this.history, random);
    const variant = this.lesson.variants.find(item => variantContentId(this.lesson, item.id) === decision.candidateId);
    if (!variant) throw Error('No hay una variante educativa apropiada');
    const progress = beginMission(this.lesson, (this.current?.run ?? -1) + 1, () => variant.id);
    await this.save(progress, at);
    return progress;
  }
  async save(state: MissionProgress, at = Date.now(), humor?: HumorRequest): Promise<void> {
    await this.requireAccess();
    const content = this.contentFor(state);
    const verified = restoreProgress(content, state);
    if (this.expected === undefined) throw Error('Leé el progreso antes de guardarlo');
    const expected = this.expected;
    let history = validateHistory(historyForProgress(content, this.history, this.current, verified, at));
    let reaction = this.reaction;
    let reference = this.reference;
    const newAction = !this.current || this.current.run !== verified.run || verified.events.length > this.current.events.length;
    if (newAction) {
      let context = humorContext(content, verified, history);
      reference = null;
      if (context && this.mode === 'roast' && this.current && humor?.writtenInput !== undefined && verified.events.length === this.current.events.length + 1 && verified.events.at(-1)?.type === 'answer') {
        // Verify that transient input yields exactly this saved action before deriving evidence.
        const reproduced = submitAnswer(content, this.current, { kind: 'text', text: humor.writtenInput });
        if (JSON.stringify(reproduced) !== JSON.stringify(verified)) throw Error('La respuesta escrita no corresponde al evento guardado');
        reference = detectReference(humor.writtenInput, context);
        if (reference) context = { ...context, referenceId: reference.referenceId };
      }
      reaction = context && humor ? selectReaction(context, humor.locale, humor.preferences, history, humor.random ?? seededRandom((at >>> 0) ^ verified.events.length), this.library, this.mode) : null;
      if (reaction && context) history = validateHistory(noteAppearance(history, reaction.id, { category: 'reaction', language: content.language, level: content.level, scopeId: content.id, objectives: [context.objectiveId], variantId: verified.variantId }, at));
    }
    const write = async () => {
      await this.requireAccess();
      const actual = await this.storage.getItem(this.key);
      if (actual !== expected) throw new MissionConflictError();
      const raw = JSON.stringify({ version: 3, progress: verified, history, reaction, ...(reference ? { reference } : {}) });
      if (raw.length > 1000000) throw Error('El registro de la misión es demasiado grande');
      await this.storage.setItem(this.key, raw);
      this.expected = raw;
      this.current = verified;
      this.history = history;
      this.reaction = reaction;
      this.reference = reference;
    };
    await withStorageLock(this.storage, this.key, write);
  }
}
