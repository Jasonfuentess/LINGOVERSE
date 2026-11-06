import { coaches } from '../../content/humor';
import type { AnswerChannel, ResponseOutcome } from '../learning/models';
import { normalizeWritten, type WrittenIssue } from '../learning/written';
import type { CoachLocale } from '../preferences';
import type { RandomSource } from '../variety/models';
import { canRoast } from './access';
import type { HumorPreferences } from './models';

/**
 * Roast Me Live humor layer (RML-001, revised in RML-002): a minimal extension of the Humor Engine. It
 * decides WHAT KIND of reply a verified moment deserves, then picks an editorial line for that kind.
 * Humor needs a real reason (a reviewed error, a slip, an off-context reply, a remembered fact, a
 * situation in the scene, a recovery) and never follows unverifiable input. Selection is reproducible
 * with a seeded random source and avoids repeating a line within a session.
 */
export type LiveKind = 'normal' | 'light' | 'roast' | 'double' | 'celebration' | 'teach' | 'clarify' | 'callback' | 'situational';
export type LiveLevel = 0 | 1 | 2 | 3;
export interface LiveLine {
  id: string;
  coach: CoachLocale;
  kind: LiveKind;
  /** 0 clean; 1 picante; 2 sin pena; 3 sin misericordia. Levels above 0 need adult consent. */
  level: LiveLevel;
  text: string;
  /** Visual laughter only; never spoken by TTS. */
  laugh?: 'risa' | 'carcajada';
  when?: { lesson?: string; turn?: string; inputs?: string[]; issue?: WrittenIssue; outcome?: ResponseOutcome; fact?: { name: string; value: string }; recovered?: true; completed?: true; channel?: AnswerChannel };
}
export interface LiveSettings { humor: boolean; maxLevel: LiveLevel; doubleMeaning: boolean }
export interface LiveMoment {
  lesson: string; turn: string; outcome: ResponseOutcome; issue?: WrittenIssue;
  /** Retained editorial input (never free text). */
  input?: string;
  facts: Record<string, string>;
  recovered: boolean; completed: boolean; previousKinds: LiveKind[];
  /** How the reply was produced: lines about speech recognition only follow spoken replies. */
  channel?: AnswerChannel;
}
const KINDS: LiveKind[] = ['normal', 'light', 'roast', 'double', 'celebration', 'teach', 'clarify', 'callback', 'situational'];
export const HUMOROUS: LiveKind[] = ['light', 'roast', 'double', 'callback', 'situational'];
const LAUGHTER = /(^|[^a-záéíóú])(ja){2,}|jaja|jeje|haha|jajá/i;
const SPEECH_TOOLS = /micr[óo]fono|dictado|transcrip/i;
/** RML-002: generic comparisons are not a comic mechanism here. */
const STOCK_COMPARISON = /m[áa]s (perdid|despistad)[oa]s? que/i;
/** Words that make a line adult-only (level >= 1). Mild colloquial address terms (maje, güey, parce, che, mijo) are allowed at level 0. */
export const ADULT_WORDS = ['puta', 'puto', 'pendejo', 'cabrón', 'cabron', 'hijueputa', 'verga', 'vergón', 'mierda', 'jodás', 'joder', 'jodido', 'no joda', 'gonorrea', 'boludo', 'pelotudo', 'pinche', 'culero', 'carajo', 'cerote', 'chingado', 'chingar', 'chingón', 'no mames', 'huevo', 'animalito', 'chimba', 'malparido', 'concha', 'ojete', 'pedo', 'peda', 'desmadre', 'mamado'];
const tierLevel = { picante: 1, 'sin-pena': 2, 'sin-misericordia': 3 } as const;

export function liveSettings(preferences: HumorPreferences | null | undefined): LiveSettings {
  const adult = canRoast(preferences);
  const live = preferences?.live;
  return {
    humor: Boolean(preferences?.enabled) || adult,
    maxLevel: adult ? tierLevel[live?.intensity ?? 'picante'] : 0,
    doubleMeaning: adult && live?.doubleMeaning === true,
  };
}

export function validateLiveLibrary(library: LiveLine[]): void {
  const ids = new Set<string>();
  const texts = new Set<string>();
  for (const line of library) {
    if (!/^live-v\d+:[a-z]{2}:[a-z]+:[a-z0-9-]+$/.test(line.id) || ids.has(line.id)) throw Error(`Identificador de línea inválido: ${line.id}`);
    ids.add(line.id);
    if (!coaches.some(coach => coach.locale === line.coach) || !KINDS.includes(line.kind) || ![0, 1, 2, 3].includes(line.level)) throw Error(`Línea inválida: ${line.id}`);
    if (typeof line.text !== 'string' || line.text.trim().length < 10 || line.text.length > 260) throw Error(`Texto inválido: ${line.id}`);
    if (LAUGHTER.test(line.text)) throw Error(`La risa va como marca visual, no en el texto hablado: ${line.id}`);
    if (STOCK_COMPARISON.test(line.text)) throw Error(`Comparación genérica no permitida: ${line.id}`);
    const lower = line.text.toLocaleLowerCase('es');
    if (line.level === 0 && ADULT_WORDS.some(word => lower.includes(word))) throw Error(`Lenguaje adulto en línea de nivel 0: ${line.id}`);
    if (line.kind === 'roast' && line.level < 1) throw Error(`Un roast requiere nivel adulto: ${line.id}`);
    if (line.kind === 'double' && line.level < 2) throw Error(`El doble sentido requiere nivel 2 o más: ${line.id}`);
    if ((line.kind === 'situational' || line.kind === 'callback' || line.kind === 'double') && !(line.when?.turn || line.when?.fact)) throw Error(`Una broma de situación necesita su escena o su dato: ${line.id}`);
    // Speech recognition is only mentioned after a spoken reply: a typed reply is never blamed on the microphone.
    if (SPEECH_TOOLS.test(line.text) && line.when?.channel !== 'spoken') throw Error(`Mención del micrófono fuera de una respuesta hablada: ${line.id}`);
    const normalized = normalizeWritten(line.text);
    if (texts.has(normalized)) throw Error(`Línea repetida: ${line.id}`);
    texts.add(normalized);
    // Guillemets mark target-language phrases (spoken with the target voice); they must quote a reviewed input.
    for (const [, quoted] of line.text.matchAll(/«([^»]+)»/g)) {
      if (!line.when?.inputs?.some(input => normalizeWritten(input).includes(normalizeWritten(quoted!)))) throw Error(`Frase entre «» sin entrada revisada: ${line.id}`);
    }
  }
  for (const coach of coaches) for (const kind of ['normal', 'teach', 'clarify', 'celebration'] as const) {
    if (!library.some(line => line.coach === coach.locale && line.kind === kind && line.level === 0 && !line.when)) throw Error(`Falta una línea limpia y general de ${kind} para ${coach.name}`);
  }
}

function matches(line: LiveLine, moment: LiveMoment): boolean {
  const when = line.when;
  if (!when) return true;
  if (when.lesson && when.lesson !== moment.lesson) return false;
  if (when.turn && when.turn !== moment.turn) return false;
  if (when.outcome && when.outcome !== moment.outcome) return false;
  if (when.issue && when.issue !== moment.issue) return false;
  if (when.inputs && !(moment.input && when.inputs.some(input => normalizeWritten(input) === normalizeWritten(moment.input!)))) return false;
  if (when.fact && moment.facts[when.fact.name] !== when.fact.value) return false;
  if (when.recovered && !moment.recovered) return false;
  if (when.completed && !moment.completed) return false;
  if (when.channel && when.channel !== moment.channel) return false;
  return true;
}
const specificity = (line: LiveLine) => Object.keys(line.when ?? {}).length + (line.when?.inputs ? 2 : 0);
function eligible(kind: LiveKind, moment: LiveMoment, coach: CoachLocale, settings: LiveSettings, library: LiveLine[]) {
  return library.filter(line => line.coach === coach && line.kind === kind && line.level <= settings.maxLevel
    && (line.kind !== 'double' || settings.doubleMeaning) && (settings.humor || !HUMOROUS.includes(line.kind)) && matches(line, moment));
}

/**
 * Deterministic rules (documented in docs/RML-002-LIVE-MODES.md):
 * - unrecognized / ambiguous → clarify (never a joke about the student; the microphone is only
 *   mentioned when the reply was dictated).
 * - off-context → light joke about the situation, or plain teaching when humor is off.
 * - incorrect (a reviewed error) → roast with consent, otherwise a clean joke about that error or
 *   teaching. Teaching is always attached by the session layer.
 * - valid-minor → light joke or teaching of the better form.
 * - understood (coherent, not the practised form) → a normal reply that hands over the practised form,
 *   sometimes a light joke.
 * - valid → celebration on recovery or completion; otherwise humor is possible (callback, double
 *   meaning with its opt-in, a situational joke about the scene) but rationed: never after two
 *   humorous replies in a row, and less likely right after one. Correct answers can stay plain.
 */
export function decideKind(moment: LiveMoment, settings: LiveSettings, coach: CoachLocale, random: RandomSource, library: LiveLine[]): LiveKind {
  const has = (kind: LiveKind) => eligible(kind, moment, coach, settings, library).length > 0;
  switch (moment.outcome) {
    case 'unrecognized': case 'ambiguous': return 'clarify';
    case 'off-context': return settings.humor && has('light') ? 'light' : 'teach';
    case 'incorrect':
      if (settings.maxLevel >= 1 && has('roast')) return 'roast';
      return settings.humor && has('light') ? 'light' : 'teach';
    case 'valid-minor': return settings.humor && has('light') && random() < 0.6 ? 'light' : 'teach';
    case 'understood': return settings.humor && has('light') && random() < 0.35 ? 'light' : 'normal';
    case 'valid': {
      if (moment.recovered || moment.completed) return 'celebration';
      const recent = moment.previousKinds.slice(-2).filter(kind => HUMOROUS.includes(kind)).length;
      if (!settings.humor || recent >= 2 || random() >= (recent ? 0.35 : 0.7)) return 'normal';
      if (has('callback') && random() < 0.4) return 'callback';
      if (settings.doubleMeaning && has('double') && random() < 0.6) return 'double';
      if (has('situational')) return 'situational';
      return 'normal';
    }
  }
}

const FALLBACK: Record<LiveKind, LiveKind[]> = {
  double: ['situational', 'normal'], roast: ['light', 'teach'], light: ['teach'], callback: ['normal'], situational: ['normal'],
  celebration: ['normal'], normal: [], teach: [], clarify: [],
};
/** Kinds whose most intense allowed line is preferred: the chosen intensity must be noticeable. */
const INTENSE: LiveKind[] = ['roast', 'celebration', 'double', 'situational'];
/** Most specific matching line first; unused lines in this session before used ones; highest allowed level preferred for intense kinds. */
export function selectLiveLine(kind: LiveKind, moment: LiveMoment, coach: CoachLocale, settings: LiveSettings, used: ReadonlySet<string>, random: RandomSource, library: LiveLine[]): LiveLine {
  for (const candidate of [kind, ...FALLBACK[kind]]) {
    const pool = eligible(candidate, moment, coach, settings, library);
    if (!pool.length) continue;
    // Most specific group that still has an unused line; repeat only when every matching line was used.
    const levels = [...new Set(pool.map(specificity))].sort((a, b) => b - a);
    const group = levels.map(level => pool.filter(line => specificity(line) === level && !used.has(line.id))).find(lines => lines.length);
    let best = group ?? pool.filter(line => specificity(line) === levels[0]);
    if (INTENSE.includes(candidate)) {
      const level = Math.max(...best.map(line => line.level));
      best = best.filter(line => line.level === level);
    }
    return best[Math.floor(random() * best.length) % best.length]!;
  }
  throw Error(`Sin línea disponible para ${coach}/${kind}`);
}
