import type { ChoiceExercise, Evaluation, Exercise, LearnerAnswer, TextExercise, TextIntent, UnderstandingRule } from './models';
import { normalizeWritten, validateWritten } from './written';
import { matchErrorPattern, matchUnderstanding } from './understanding';

/**
 * LV-007B contextual interpretation. Deterministic and editorial: exact reviewed phrasings first (after
 * punctuation/case/apostrophe normalisation). RML-002 adds, only for exercises that opt in, reviewed
 * understanding rules over a closed turn vocabulary (see understanding.ts): still no fuzzy similarity and
 * no claim of general language understanding. Anything else is `unrecognized`.
 *
 * Replay invariant: the evaluation depends only on the retained answer. Rules retain their canonical
 * phrasing (validated to replay to the same rule) and error patterns retain the reviewed error.
 *
 * Only `valid` and `valid-minor` set `correct` and a `next` turn. Ambiguous and off-context replies use
 * `writtenIssue: 'unknown'` so they never count as confirmed language errors or trigger Roast.
 */
export interface Interpretation { evaluation: Evaluation; retained: LearnerAnswer }

const same = (a: string, b: string) => normalizeWritten(a) === normalizeWritten(b);

function interpretChoice(exercise: ChoiceExercise, choiceId: string): Interpretation {
  const choice = exercise.choices.find(item => item.id === choiceId);
  const correct = choice?.correct ?? false;
  const evaluation: Evaluation = {
    correct, explanation: choice?.explanation ?? 'Elegí una de las respuestas de esta escena.', correction: exercise.correction,
    reply: correct && choice ? choice.reply : '', next: correct && choice ? choice.next : null,
    ...(choice?.spokenExplanation ? { spokenExplanation: choice.spokenExplanation } : {}),
    outcome: correct ? 'valid' : 'incorrect',
    ...(correct && choice?.facts ? { facts: { ...choice.facts }, factStatus: 'confirmed' as const } : {}),
  };
  return { evaluation, retained: { kind: 'choice', choiceId } };
}

function routed(exercise: TextExercise, intent: TextIntent | undefined) {
  return {
    reply: intent?.reply ?? exercise.reply,
    next: intent && 'next' in intent && intent.next !== undefined ? intent.next : exercise.next,
    ...(intent?.completes?.length ? { completes: [...intent.completes] } : {}),
    ...(intent ? { intentId: intent.id } : {}),
  };
}

function interpretText(exercise: TextExercise, input: string): Interpretation {
  const base = { correction: exercise.correction };
  const keep = (text: string): LearnerAnswer => ({ kind: 'text', text });
  const facts = (values: Record<string, string> | undefined, status: 'confirmed' | 'ambiguous') => values && Object.keys(values).length ? { facts: { ...values }, factStatus: status } : {};

  for (const intent of exercise.intents ?? []) {
    const example = intent.examples.find(value => same(value, input));
    if (example) return { retained: keep(example), evaluation: { ...base, correct: true, outcome: 'valid', explanation: intent.explanation, ...(intent.spokenExplanation ? { spokenExplanation: intent.spokenExplanation } : {}), ...routed(exercise, intent), ...facts(intent.facts, 'confirmed') } };
  }
  if (exercise.accepted.some(value => same(value, input))) {
    const written = validateWritten(exercise, input);
    return { retained: keep(written.retained), evaluation: { ...base, correct: true, outcome: 'valid', explanation: written.explanation, ...(written.spokenExplanation ? { spokenExplanation: written.spokenExplanation } : {}), ...routed(exercise, undefined), ...facts(exercise.acceptedFacts, 'confirmed') } };
  }
  const minor = exercise.minorForms?.find(form => same(form.input, input));
  if (minor) {
    const intent = exercise.intents?.find(item => item.id === minor.intent);
    return { retained: keep(minor.input), evaluation: { correct: true, outcome: 'valid-minor', minorIssue: minor.issue, explanation: minor.explanation, correction: minor.better, ...(minor.spokenExplanation ? { spokenExplanation: minor.spokenExplanation } : {}), ...routed(exercise, intent), ...facts(intent ? intent.facts : exercise.acceptedFacts, 'confirmed') } };
  }
  const clarification = exercise.clarifications?.find(item => item.inputs.some(value => same(value, input)));
  if (clarification) {
    const matched = clarification.inputs.find(value => same(value, input))!;
    return { retained: keep(matched), evaluation: { ...base, correct: false, outcome: 'ambiguous', writtenIssue: 'unknown', explanation: clarification.explanation, ...(clarification.spokenExplanation ? { spokenExplanation: clarification.spokenExplanation } : {}), reply: clarification.reply, next: null, ...facts(clarification.facts, 'ambiguous') } };
  }
  const off = exercise.offContext?.find(item => item.inputs.some(value => same(value, input)));
  if (off) {
    const matched = off.inputs.find(value => same(value, input))!;
    return { retained: keep(matched), evaluation: { ...base, correct: false, outcome: 'off-context', writtenIssue: 'unknown', explanation: off.explanation, ...(off.spokenExplanation ? { spokenExplanation: off.spokenExplanation } : {}), reply: '', next: null } };
  }
  const written = validateWritten(exercise, input);
  // RML-002: a reviewed error inside a longer reply is diagnosed exactly like the reviewed error itself.
  if (written.issue === 'unknown') {
    const pattern = matchErrorPattern(exercise, input);
    if (pattern && pattern.rule !== input) return interpretText(exercise, pattern.rule);
    const rule = matchUnderstanding(exercise, input);
    if (rule) return understood(exercise, rule);
  }
  // Known language errors keep the existing editorial diagnosis; anything else stays unrecognised.
  const known = written.issue !== 'unknown';
  return { retained: keep(written.retained), evaluation: { ...base, correct: false, outcome: known ? 'incorrect' : 'unrecognized', writtenIssue: written.issue, explanation: written.explanation, ...(written.spokenExplanation ? { spokenExplanation: written.spokenExplanation } : {}), reply: '', next: null } };
}

function understood(exercise: TextExercise, rule: UnderstandingRule): Interpretation {
  const retained: LearnerAnswer = { kind: 'text', text: rule.canonical };
  const intent = rule.intent ? exercise.intents?.find(item => item.id === rule.intent) : undefined;
  if (rule.fit === 'clarify') {
    return { retained, evaluation: { correct: false, outcome: 'ambiguous', writtenIssue: 'unknown', understood: rule.id, explanation: rule.explanation, correction: exercise.correction, reply: rule.reply ?? '', next: null,
      ...(rule.facts && Object.keys(rule.facts).length ? { facts: { ...rule.facts }, factStatus: 'ambiguous' as const } : {}) } };
  }
  const values = rule.facts ?? intent?.facts ?? exercise.acceptedFacts;
  return { retained, evaluation: { correct: true, outcome: rule.fit === 'target' ? 'valid' : 'understood', understood: rule.id, explanation: rule.explanation, correction: rule.better ?? exercise.correction,
    ...routed(exercise, intent), ...(rule.reply ? { reply: rule.reply } : {}),
    ...(values && Object.keys(values).length ? { facts: { ...values }, factStatus: 'confirmed' as const } : {}) } };
}

export function interpretAnswer(exercise: Exercise, answer: LearnerAnswer): Interpretation {
  if (exercise.kind === 'choice' && answer.kind === 'choice') return interpretChoice(exercise, answer.choiceId);
  if (exercise.kind === 'text' && answer.kind === 'text') return interpretText(exercise, answer.text);
  return { retained: answer, evaluation: { correct: false, outcome: 'incorrect', explanation: 'El formato de respuesta no corresponde a este ejercicio.', correction: exercise.correction, reply: '', next: null } };
}
