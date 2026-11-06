export interface ChoiceOption {
  id: string;
  label: string;
  correct: boolean;
  explanation: string;
  reply: string;
  next: string | null;
  spokenExplanation?: string;
  /** Exact editorial alternatives for reviewed transcripts; never fuzzy matching. */
  spokenAlternatives?: string[];
  /** LV-007B: narrative facts confirmed by choosing this option. */
  facts?: FactValues;
}

// ——— LV-007B contextual conversation contracts (all optional; legacy content is unaffected) ———
/** How a reply was understood. Only `valid` and `valid-minor` advance the story. */
export type ResponseOutcome = 'valid' | 'valid-minor' | 'understood' | 'ambiguous' | 'incorrect' | 'unrecognized' | 'off-context';
export type FactValues = Record<string, string>;
export type FactStatus = 'confirmed' | 'ambiguous';
export interface FactCondition { fact: string; value: string; status?: FactStatus }
/** An editorial communicative intent: exact reviewed phrasings with their own consequence. */
export interface TextIntent {
  id: string;
  /** Exact phrasings (compared after normalisation). Each must also be listed in `accepted`. */
  examples: string[];
  explanation: string;
  spokenExplanation?: string;
  /** The character's reaction to this intent; defaults to the exercise reply. */
  reply?: string;
  /** Narrative consequence; defaults to the exercise `next`. */
  next?: string | null;
  /** Objectives demonstrated by this reply in addition to the exercise objective (e.g. stating the destination early). */
  completes?: string[];
  facts?: FactValues;
}
/** A reviewed small error that still achieves the communicative goal of this turn. */
export interface MinorForm {
  input: string;
  better: string;
  issue: 'spelling' | 'structure' | 'vocabulary';
  explanation: string;
  spokenExplanation?: string;
  /** Routes like this intent when set; otherwise like the default accepted answer. */
  intent?: string;
}
/** A reviewed reply whose meaning is unclear here: the character asks back inside the story. */
export interface Clarification { inputs: string[]; reply: string; explanation: string; spokenExplanation?: string; facts?: FactValues }
/** A reviewed, understandable reply that does not fit this moment of the story. */
export interface OffContext { inputs: string[]; explanation: string; spokenExplanation?: string }
/**
 * RML-002 reviewed understanding rule (opt-in, contextual exercises only). Deterministic: every group in
 * `all` must contain one of its phrases (whole words, accents and case ignored), none of `none` may
 * appear, and every word of the reply must belong to the turn's reviewed vocabulary. The free text is
 * never stored: `canonical` is retained instead and must replay to this same rule.
 * - `target`: demonstrates the practised objective (outcome `valid`).
 * - `different`: coherent, the story continues, but it is not the practised form (outcome `understood`).
 * - `clarify`: understood only partly; the character asks back (outcome `ambiguous`).
 */
export interface UnderstandingRule {
  id: string;
  all: string[][];
  none?: string[];
  canonical: string;
  fit: 'target' | 'different' | 'clarify';
  explanation: string;
  /** Routes like this intent (reply, next, facts, completes) unless overridden here. */
  intent?: string;
  facts?: FactValues;
  reply?: string;
  /** The practised form taught after a `different` reply. */
  better?: string;
}
/** A reviewed real error recognised inside a longer reply; it is diagnosed exactly like `rule` (a writtenRules input). */
export interface ErrorPattern { all: string[][]; none?: string[]; rule: string }
/** Prompt shown instead of the default when every condition holds in conversation memory. */
export interface ContextualPrompt { when: FactCondition[]; prompt: string; promptTranslation: string }

interface ExerciseBase {
  id: string;
  objectiveId: string;
  title: string;
  scene: string;
  speaker: string;
  prompt: string;
  promptTranslation: string;
  teaching: string;
  instruction: string;
  explanation: string;
  correction: string;
  /** LV-007B opt-in: contextual interpretation, facts and outcomes. Absent on archived content. */
  conversation?: 'contextual-v1';
  /** Fact this turn asks for. Validation guarantees it is never asked once confirmed. */
  asks?: string;
  contextualPrompts?: ContextualPrompt[];
}
export interface ChoiceExercise extends ExerciseBase { kind: 'choice'; choices: ChoiceOption[] }
export interface TextExercise extends ExerciseBase {
  kind: 'text'; accepted: string[]; next: string | null; reply: string;
  writtenRules?: import('./written').WrittenRule[];
  /** Editorial, exact intent-equivalents; never fuzzy matches or AI-generated classifications. */
  acceptedFeedback?: { input: string; explanation: string; spokenExplanation?: string }[];
  unknownExplanation?: string;
  /** Spanish-only alternative used for spoken coaching when visible copy quotes English. */
  spokenExplanation?: string;
  unknownSpokenExplanation?: string;
  intents?: TextIntent[];
  minorForms?: MinorForm[];
  clarifications?: Clarification[];
  offContext?: OffContext[];
  /** Facts confirmed by any accepted reply that is not part of a more specific intent. */
  acceptedFacts?: FactValues;
  /** RML-002: reviewed understanding of natural variants, checked after every exact list. */
  understanding?: UnderstandingRule[];
  errorPatterns?: ErrorPattern[];
  /** Extra reviewed words (fillers, greetings) allowed in understood replies besides the turn's own phrases. */
  lexicon?: string[];
}
export type Exercise = ChoiceExercise | TextExercise;
export interface LessonVariant { id: string; title: string; start: string; exercises: Exercise[] }
export interface Lesson {
  schemaVersion: 1;
  version: number;
  id: string;
  title: string;
  language: 'fr' | 'en';
  level: 'A1';
  objectives: string[];
  variants: LessonVariant[];
}
export type LearnerAnswer = { kind: 'choice'; choiceId: string } | { kind: 'text'; text: string };
export interface Evaluation {
  writtenIssue?: import('./written').WrittenIssue;
  spokenExplanation?: string;
  correct: boolean;
  explanation: string;
  correction: string;
  reply: string;
  next: string | null;
  /** LV-007B fields, present only for contextual exercises. */
  outcome?: ResponseOutcome;
  intentId?: string;
  facts?: FactValues;
  factStatus?: FactStatus;
  completes?: string[];
  minorIssue?: MinorForm['issue'];
  /** RML-002: id of the understanding rule that interpreted the reply. */
  understood?: string;
}
export type AnswerSupport = 'assisted' | 'independent';
/** RML-002: how the reply was produced. Spoken means dictated and reviewed; it never proves pronunciation. */
export type AnswerChannel = 'spoken' | 'written';
export type LearningEvent = { type: 'answer'; nodeId: string; answer: LearnerAnswer; support?: AnswerSupport; channel?: AnswerChannel } | { type: 'continue' };
export interface MissionProgress {
  version: 1;
  lessonId: string;
  contentVersion: number;
  variantId: string;
  run: number;
  status: 'active' | 'completed';
  nodeId: string | null;
  completedObjectives: string[];
  events: LearningEvent[];
  feedback: Evaluation | null;
}
// Future Variety Engine receives context and must return a validated variant ID.
export type VariantSelector = (lesson: Lesson, run: number) => string;
