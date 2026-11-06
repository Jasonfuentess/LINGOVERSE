import { emptyMemory, rememberFeedback, withContext } from '../conversation/memory';
import { beginMission, continueMission, currentExercise, submitAnswer } from '../learning/engine';
import type { AnswerChannel, Exercise, Lesson, MissionProgress, ResponseOutcome } from '../learning/models';
import { seededRandom } from '../variety/selection';
import { decideKind, selectLiveLine, type LiveKind, type LiveLine, type LiveSettings } from '../humor/live';
import type { CoachLocale } from '../preferences';

/**
 * Roast Me Live session projection (RML-001, RML-002). The whole conversation is rebuilt from the
 * validated event log of a regular MissionProgress: nothing new is persisted, free text is never stored,
 * a reload shows the same conversation, and a consent change (e.g. revocation) re-renders past coach
 * lines within the new limits. Coach lines are reproducible: each answer uses a random source seeded by
 * run + event + coach.
 */
export interface LiveTeaching { explanation: string; model?: string }
export interface LiveCoachTurn { kind: LiveKind; line: LiveLine; teaching?: LiveTeaching; adult: boolean }
/**
 * How the student's reply is shown. `exact`: a reviewed phrase the student wrote; `interpreted`: the
 * reviewed phrase their own words were understood as (their text is not stored); `unknown`: not
 * interpretable yet (not stored either).
 */
export type StudentShown = 'exact' | 'interpreted' | 'unknown';
export type LiveEntry =
  | { id: string; role: 'setup'; text: string }
  | { id: string; role: 'partner'; speaker: string; text: string; translation?: string }
  | { id: string; role: 'student'; text: string; verified: boolean; shown: StudentShown; event: number; channel?: AnswerChannel; outcome: ResponseOutcome }
  | { id: string; role: 'coach'; turn: LiveCoachTurn };
export interface LiveView { entries: LiveEntry[]; current: Exercise | null; awaitingContinue: boolean; completed: boolean; usedLines: string[] }
export interface LiveOptions {
  /**
   * "Con ayuda" reveals the model with every correction. "Con libertad" keeps the model behind the help
   * button when a reply was simply not interpretable (unknown, ambiguous, off-context); real errors and
   * understood-but-different replies still show the practised form after answering.
   */
  revealModel?: boolean;
}

const split = (value: string) => { const [text, translation] = value.split('→').map(part => part.trim()); return { text: text ?? value, ...(translation ? { translation } : {}) }; };
const seed = (run: number, index: number, coach: string) => { let hash = 2166136261; for (const c of `${run}:${index}:${coach}`) { hash ^= c.codePointAt(0)!; hash = Math.imul(hash, 16777619); } return hash >>> 0; };
const HIDDEN_UNLESS_GUIDED: ResponseOutcome[] = ['unrecognized', 'ambiguous', 'off-context'];

export function liveConversation(lesson: Lesson, progress: MissionProgress, coach: CoachLocale, settings: LiveSettings, library: LiveLine[], options: LiveOptions = {}): LiveView {
  const revealModel = options.revealModel ?? true;
  let cursor = beginMission(lesson, progress.run, () => progress.variantId);
  let memory = emptyMemory();
  const entries: LiveEntry[] = [];
  const used = new Set<string>();
  const kinds: LiveKind[] = [];
  const failed = new Map<string, number>();
  const first = currentExercise(lesson, cursor);
  entries.push({ id: `${progress.run}:setup`, role: 'setup', text: first.scene });
  const partner = (exercise: Exercise, key: string) => {
    const shown = withContext(exercise, memory);
    entries.push({ id: `${progress.run}:${key}:prompt`, role: 'partner', speaker: shown.speaker, text: shown.prompt, translation: shown.promptTranslation });
  };
  partner(first, 'start');
  progress.events.forEach((event, index) => {
    if (event.type === 'continue') {
      cursor = continueMission(lesson, cursor);
      if (cursor.status === 'active') partner(currentExercise(lesson, cursor), `${index}`);
      return;
    }
    const exercise = currentExercise(lesson, cursor);
    cursor = submitAnswer(lesson, cursor, event.answer, event.support, event.channel);
    const recorded = cursor.events.at(-1);
    const feedback = cursor.feedback!;
    if (recorded?.type === 'answer') memory = rememberFeedback(memory, exercise.id, feedback, recorded.answer);
    const retained = recorded?.type === 'answer' && recorded.answer.kind === 'text' ? recorded.answer.text : '';
    const outcome = feedback.outcome ?? (feedback.correct ? 'valid' : 'unrecognized');
    const shown: StudentShown = !retained ? 'unknown' : feedback.understood ? 'interpreted' : 'exact';
    entries.push({ id: `${progress.run}:${index}:student`, role: 'student', text: retained || 'Respuesta que todavía no pude interpretar (no se guarda el texto libre).', verified: Boolean(retained), shown, event: index, outcome, ...(event.channel ? { channel: event.channel } : {}) });
    const facts = Object.fromEntries(Object.entries(memory.facts).filter(([, fact]) => fact.status === 'confirmed').map(([name, fact]) => [name, fact.value]));
    const wrongBefore = failed.get(exercise.id) ?? 0;
    const moment = { lesson: lesson.id, turn: exercise.id, outcome, ...(feedback.writtenIssue && feedback.writtenIssue !== 'unknown' ? { issue: feedback.writtenIssue } : {}), ...(retained ? { input: retained } : {}),
      facts, recovered: feedback.correct && wrongBefore > 0, completed: feedback.correct && feedback.next === null, previousKinds: [...kinds], ...(event.channel ? { channel: event.channel } : {}) };
    if (!feedback.correct) failed.set(exercise.id, wrongBefore + 1);
    const random = seededRandom(seed(progress.run, index, coach));
    const kind = decideKind(moment, settings, coach, random, library);
    const line = selectLiveLine(kind, moment, coach, settings, used, random, library);
    used.add(line.id); kinds.push(line.kind);
    let teaching: LiveTeaching | undefined;
    if (outcome !== 'valid') {
      const model = feedback.correction.split(' / ')[0]!.split('→')[0]!.trim();
      teaching = { explanation: feedback.explanation, ...(revealModel || !HIDDEN_UNLESS_GUIDED.includes(outcome) ? { model } : {}) };
    }
    entries.push({ id: `${progress.run}:${index}:coach`, role: 'coach', turn: { kind: line.kind, line, adult: line.level > 0, ...(teaching ? { teaching } : {}) } });
    if (feedback.reply) entries.push({ id: `${progress.run}:${index}:reply`, role: 'partner', speaker: exercise.speaker, ...split(feedback.reply) });
  });
  const active = cursor.status === 'active';
  return { entries, current: active ? withContext(currentExercise(lesson, cursor), memory) : null, awaitingContinue: active && Boolean(cursor.feedback?.correct), completed: cursor.status === 'completed', usedLines: [...used] };
}

/** RML-002 restart: the same scene from its first turn, as a new run (new seed, empty conversation). */
export function restartLiveScene(lesson: Lesson, progress: MissionProgress): MissionProgress {
  return beginMission(lesson, progress.run + 1, () => progress.variantId);
}

export interface LiveSegment { text: string; language: string; adult?: boolean; voiceId?: string }
/**
 * Speech for one entry. Spanish goes to the coach voice; phrases in «» and the model go to the target
 * voice (never a Spanish voice reading French or English). Laughter is never spoken.
 */
export function liveSpeech(entry: LiveEntry, target: 'fr-FR' | 'en-GB', coachVoice: { language: string; voiceId?: string }): LiveSegment[] {
  const coach = (text: string, adult = false): LiveSegment => ({ text, language: coachVoice.language, ...(adult ? { adult } : {}), ...(coachVoice.voiceId ? { voiceId: coachVoice.voiceId } : {}) });
  if (entry.role === 'partner') return [{ text: entry.text, language: target }];
  if (entry.role === 'setup') return [coach(entry.text)];
  if (entry.role === 'student') return [];
  const segments: LiveSegment[] = [];
  for (const part of entry.turn.line.text.split(/(«[^»]+»)/)) {
    const clean = part.trim();
    if (!clean) continue;
    if (clean.startsWith('«')) segments.push({ text: clean.slice(1, -1), language: target });
    else segments.push(coach(clean, entry.turn.adult));
  }
  if (entry.turn.teaching?.model) segments.push({ text: entry.turn.teaching.model, language: target });
  return segments;
}

/**
 * RML-002 end-of-scene summary. Observed practice only: it never claims pronunciation quality (speech
 * recognition is not a phonetic assessment) or CEFR level.
 */
export interface LiveSummary { turns: number; practised: number; understood: number; assisted: number; spoken: number; written: number; errors: number }
export function liveSummary(lesson: Lesson, progress: MissionProgress): LiveSummary {
  let cursor = beginMission(lesson, progress.run, () => progress.variantId);
  const result: LiveSummary = { turns: 0, practised: 0, understood: 0, assisted: 0, spoken: 0, written: 0, errors: 0 };
  for (const event of progress.events) {
    if (event.type === 'continue') { cursor = continueMission(lesson, cursor); continue; }
    cursor = submitAnswer(lesson, cursor, event.answer, event.support, event.channel);
    if (event.channel === 'spoken') result.spoken++;
    if (event.channel === 'written') result.written++;
    const feedback = cursor.feedback!;
    if (feedback.outcome === 'incorrect') result.errors++;
    if (!feedback.correct) continue;
    result.turns++;
    if (feedback.outcome === 'understood') result.understood++; else result.practised++;
    if (event.support === 'assisted') result.assisted++;
  }
  return result;
}
