export interface ChoiceOption {
  id: string;
  label: string;
  correct: boolean;
  explanation: string;
  reply: string;
  next: string | null;
}
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
}
export interface ChoiceExercise extends ExerciseBase { kind: 'choice'; choices: ChoiceOption[] }
export interface TextExercise extends ExerciseBase { kind: 'text'; accepted: string[]; next: string | null; reply: string; writtenRules?: import('./written').WrittenRule[] }
export type Exercise = ChoiceExercise | TextExercise;
export interface LessonVariant { id: string; title: string; start: string; exercises: Exercise[] }
export interface Lesson {
  schemaVersion: 1;
  version: number;
  id: string;
  title: string;
  language: 'fr';
  level: 'A1';
  objectives: string[];
  variants: LessonVariant[];
}
export type LearnerAnswer = { kind: 'choice'; choiceId: string } | { kind: 'text'; text: string };
export interface Evaluation {
  writtenIssue?: import('./written').WrittenIssue;
  correct: boolean;
  explanation: string;
  correction: string;
  reply: string;
  next: string | null;
}
export type LearningEvent = { type: 'answer'; nodeId: string; answer: LearnerAnswer } | { type: 'continue' };
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
