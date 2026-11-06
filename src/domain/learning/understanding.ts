import type { ErrorPattern, TextExercise, UnderstandingRule } from './models';

/**
 * RML-002 deterministic understanding of natural replies. Not a language model and not similarity:
 * - words are compared whole (accents, case, apostrophes and punctuation ignored);
 * - a reply is only interpreted when EVERY word belongs to the turn's reviewed vocabulary (its own
 *   phrases, rules and a short reviewed list of fillers), so unknown content is never guessed;
 * - polarity and entities come from explicit reviewed word groups (`all` / `none`), so "non, merci"
 *   can never satisfy an affirmative rule.
 */
export function understandingText(value: string): string {
  const words = value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('fr')
    .replace(/[’‘'`-]/g, ' ').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  return ` ${words} `;
}
const words = (value: string) => understandingText(value).trim().split(' ').filter(Boolean);
const contains = (text: string, phrase: string) => { const needle = understandingText(phrase); return needle.trim().length > 0 && text.includes(needle); };

export function patternMatches(pattern: Pick<UnderstandingRule, 'all' | 'none'>, text: string): boolean {
  return pattern.all.every(group => group.some(phrase => contains(text, phrase))) && !(pattern.none ?? []).some(phrase => contains(text, phrase));
}

/** Every word a reviewed reply to this turn may contain. */
export function turnVocabulary(exercise: TextExercise): Set<string> {
  const phrases: string[] = [
    ...exercise.accepted, ...(exercise.intents ?? []).flatMap(intent => intent.examples),
    ...(exercise.minorForms ?? []).map(form => form.input), ...(exercise.clarifications ?? []).flatMap(item => item.inputs),
    ...(exercise.offContext ?? []).flatMap(item => item.inputs), ...(exercise.writtenRules ?? []).map(rule => rule.input),
    ...(exercise.understanding ?? []).flatMap(rule => [rule.canonical, ...rule.all.flat(), ...(rule.none ?? [])]),
    ...(exercise.errorPatterns ?? []).flatMap(pattern => [...pattern.all.flat(), ...(pattern.none ?? [])]),
    ...(exercise.lexicon ?? []),
  ];
  return new Set(phrases.flatMap(words));
}

/** Interpretable only when the reply is short and made entirely of reviewed words. */
export function confidentReply(exercise: TextExercise, input: string): boolean {
  const list = words(input);
  if (!list.length || list.length > 16) return false;
  const vocabulary = turnVocabulary(exercise);
  return list.every(word => vocabulary.has(word));
}

export function matchErrorPattern(exercise: TextExercise, input: string): ErrorPattern | undefined {
  if (!exercise.errorPatterns?.length || !confidentReply(exercise, input)) return undefined;
  const text = understandingText(input);
  return exercise.errorPatterns.find(pattern => patternMatches(pattern, text));
}

const meaning = (rule: UnderstandingRule) => JSON.stringify([rule.fit === 'clarify' ? 'clarify' : 'continue', rule.intent ?? '', Object.entries(rule.facts ?? {}).sort(), rule.reply ?? '']);
/**
 * The first matching rule, or undefined when nothing matches or when matching rules disagree
 * (e.g. "un café et un thé"): conflicting meanings are never resolved by guessing.
 */
export function matchUnderstanding(exercise: TextExercise, input: string): UnderstandingRule | undefined {
  if (!exercise.understanding?.length || !confidentReply(exercise, input)) return undefined;
  const text = understandingText(input);
  const all = exercise.understanding.filter(rule => patternMatches(rule, text));
  // Clarification rules are fallbacks: a reply that fully matches a continuing rule is not re-asked.
  const continuing = all.filter(rule => rule.fit !== 'clarify');
  const hits = continuing.length ? continuing : all;
  if (!hits.length) return undefined;
  const first = meaning(hits[0]!);
  return hits.every(rule => meaning(rule) === first) ? hits[0] : undefined;
}
