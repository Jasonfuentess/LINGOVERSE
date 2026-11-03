import type { Exercise, FactValues, Lesson } from './models';

interface Transition { next: string | null; facts?: FactValues; completes?: string[] }
/** All ways a correct reply can move the story forward (deduplicated). */
export function transitions(exercise: Exercise): Transition[] {
  const all: Transition[] = exercise.kind === 'choice'
    ? exercise.choices.filter(option => option.correct).map(option => ({ next: option.next, ...(option.facts ? { facts: option.facts } : {}) }))
    : [{ next: exercise.next, ...(exercise.acceptedFacts ? { facts: exercise.acceptedFacts } : {}) },
      ...(exercise.intents ?? []).map(intent => ({ next: intent.next !== undefined ? intent.next : exercise.next, ...(intent.facts ? { facts: intent.facts } : {}), ...(intent.completes ? { completes: intent.completes } : {}) }))];
  const seen = new Map<string, Transition>();
  for (const item of all) seen.set(JSON.stringify([item.next, Object.keys(item.facts ?? {}).sort(), item.completes ?? []]), item);
  return [...seen.values()];
}
const normalizedInput = (s: string) => s.normalize('NFC').toLocaleLowerCase('fr').replace(/[’‘]/g, "'").replace(/^[¡¿\s]+|[.!?\s]+$/g, '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
function facts(value: unknown) {
  if (value === undefined) return;
  const entries = Object.entries(record(value));
  if (!entries.length || entries.length > 10) throw Error('Hechos narrativos inválidos');
  for (const [key, item] of entries) { identifier(key); text(item); }
}
function validateContextual(exercise: Record<string, unknown>, objectives: string[]) {
  if (exercise.conversation !== 'contextual-v1') throw Error('Motor conversacional desconocido');
  if (exercise.asks !== undefined) identifier(exercise.asks);
  if (exercise.contextualPrompts !== undefined) {
    list(exercise.contextualPrompts);
    for (const raw of exercise.contextualPrompts) {
      const prompt = record(raw); text(prompt.prompt); text(prompt.promptTranslation); list(prompt.when);
      for (const rawCondition of prompt.when) { const condition = record(rawCondition); identifier(condition.fact); text(condition.value); if (condition.status !== undefined && condition.status !== 'confirmed' && condition.status !== 'ambiguous') throw Error('Estado de hecho inválido'); }
    }
  }
  if (exercise.kind === 'choice') { for (const option of exercise.choices as Record<string, unknown>[]) { facts(option.facts); if (option.facts !== undefined && !option.correct) throw Error('Una opción incorrecta no confirma hechos'); } return; }
  facts(exercise.acceptedFacts);
  const accepted = new Set((exercise.accepted as string[]).map(normalizedInput));
  const owner = new Map<string, string>();
  const claim = (input: unknown, kind: string) => { text(input); const key = normalizedInput(input); if (owner.has(key)) throw Error(`Entrada con dos interpretaciones: ${input}`); owner.set(key, kind); };
  const intentIds = new Set<string>();
  const examples = new Set<string>();
  for (const raw of (exercise.intents as unknown[] | undefined) ?? []) {
    const intent = record(raw); identifier(intent.id); text(intent.explanation); list(intent.examples); facts(intent.facts);
    if (intentIds.has(intent.id)) throw Error('Intención duplicada');
    intentIds.add(intent.id);
    if (intent.reply !== undefined) text(intent.reply);
    if (intent.spokenExplanation !== undefined) text(intent.spokenExplanation);
    if (intent.next !== undefined) next(intent.next);
    if (intent.completes !== undefined) { list(intent.completes); for (const objective of intent.completes) { identifier(objective); if (!objectives.includes(objective)) throw Error('Objetivo adicional desconocido'); } }
    for (const example of intent.examples) {
      text(example); const key = normalizedInput(example);
      if (!accepted.has(key)) throw Error(`Ejemplo de intención no aceptado: ${example}`);
      if (examples.has(key)) throw Error('Ejemplo en dos intenciones');
      examples.add(key);
    }
  }
  for (const value of exercise.accepted as string[]) claim(value, 'accepted');
  for (const raw of (exercise.minorForms as unknown[] | undefined) ?? []) {
    const minor = record(raw); claim(minor.input, 'minor'); text(minor.better); text(minor.explanation);
    if (!['spelling', 'structure', 'vocabulary'].includes(String(minor.issue))) throw Error('Error menor desconocido');
    if (!accepted.has(normalizedInput(minor.better as string))) throw Error('La forma mejor debe ser una respuesta aceptada');
    if (minor.intent !== undefined && !intentIds.has(minor.intent as string)) throw Error('Error menor con intención desconocida');
  }
  for (const raw of (exercise.clarifications as unknown[] | undefined) ?? []) {
    const clarification = record(raw); list(clarification.inputs); clarification.inputs.forEach(input => claim(input, 'clarification'));
    text(clarification.reply); text(clarification.explanation); facts(clarification.facts);
  }
  for (const raw of (exercise.offContext as unknown[] | undefined) ?? []) {
    const off = record(raw); list(off.inputs); off.inputs.forEach(input => claim(input, 'off-context')); text(off.explanation);
  }
  for (const raw of (exercise.writtenRules as unknown[] | undefined) ?? []) claim(record(raw).input, 'rule');
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Se esperaba un objeto de contenido');
  return value as Record<string, unknown>;
}
function text(value: unknown): asserts value is string {
  if (typeof value !== 'string' || !value.trim() || value.length > 4000) throw Error('Texto de contenido inválido');
}
function identifier(value: unknown): asserts value is string {
  text(value);
  if (!/^[a-z][a-z0-9-]*$/.test(value)) throw Error('Identificador inválido');
}
function list(value: unknown): asserts value is unknown[] {
  if (!Array.isArray(value) || !value.length || value.length > 100) throw Error('Lista de contenido inválida');
}
function next(value: unknown) { if (value !== null) identifier(value); }

export function validateLesson(value: unknown): Lesson {
  const lesson = record(value);
  if (lesson.schemaVersion !== 1 || !Number.isSafeInteger(lesson.version) || (lesson.version as number) < 1 || (lesson.language !== 'fr' && lesson.language !== 'en') || lesson.level !== 'A1') throw Error('Versión o idioma de lección no admitido');
  identifier(lesson.id); text(lesson.title);
  list(lesson.objectives); list(lesson.variants);
  lesson.objectives.forEach(identifier);
  if (new Set(lesson.objectives).size !== lesson.objectives.length) throw Error('Objetivos duplicados');
  const variantIds = new Set<string>();
  for (const rawVariant of lesson.variants) {
    const variant = record(rawVariant);
    identifier(variant.id); text(variant.title); identifier(variant.start); list(variant.exercises);
    if (variantIds.has(variant.id)) throw Error('Variante duplicada');
    variantIds.add(variant.id);
    const ids = new Set<string>();
    for (const rawExercise of variant.exercises) {
      const exercise = record(rawExercise);
      identifier(exercise.id); identifier(exercise.objectiveId);
      if (!lesson.objectives.includes(exercise.objectiveId) || ids.has(exercise.id)) throw Error('Objetivo desconocido o ejercicio duplicado');
      ids.add(exercise.id);
      for (const field of ['title', 'scene', 'speaker', 'prompt', 'promptTranslation', 'teaching', 'instruction', 'explanation', 'correction']) text(exercise[field]);
      if (exercise.kind === 'choice') {
        list(exercise.choices);
        const optionIds = new Set<string>();
        let correct = 0;
        for (const rawOption of exercise.choices) {
          const option = record(rawOption);
          identifier(option.id); text(option.label); text(option.explanation); if (option.spokenExplanation !== undefined) text(option.spokenExplanation); next(option.next);
          if (option.spokenAlternatives !== undefined) {
            list(option.spokenAlternatives);
            option.spokenAlternatives.forEach(text);
          }
          if (typeof option.correct !== 'boolean' || typeof option.reply !== 'string' || optionIds.has(option.id)) throw Error('Opción inválida');
          if (!option.correct && option.next !== null) throw Error('Un error no debe avanzar');
          optionIds.add(option.id);
          if (option.correct) correct++;
        }
        if (!correct) throw Error('Faltan respuestas correctas');
      } else if (exercise.kind === 'text') {
        if (exercise.writtenRules !== undefined) {
          if (!Array.isArray(exercise.writtenRules) || exercise.writtenRules.length > 100) throw Error('Reglas escritas inválidas');
          for (const rawRule of exercise.writtenRules) {
            const rule = record(rawRule); text(rule.input); text(rule.explanation); if (rule.spokenExplanation !== undefined) text(rule.spokenExplanation);
            if (!['spelling', 'vocabulary', 'structure', 'unknown'].includes(String(rule.issue))) throw Error('Diagnóstico desconocido');
          }
        }
        list(exercise.accepted); exercise.accepted.forEach(text); next(exercise.next); text(exercise.reply);
        for (const field of ['unknownExplanation', 'spokenExplanation', 'unknownSpokenExplanation']) {
          if (exercise[field] !== undefined) text(exercise[field]);
        }
        if (exercise.acceptedFeedback !== undefined) {
          if (!Array.isArray(exercise.acceptedFeedback) || exercise.acceptedFeedback.length > 100) throw Error('Equivalencias editoriales inválidas');
          const normalized = (s: string) => s.normalize('NFC').toLocaleLowerCase('fr').replace(/[’‘]/g, "'").replace(/^[¡¿\s]+|[.!?\s]+$/g, '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
          const accepted = new Set((exercise.accepted as string[]).map(normalized));
          const recorded = new Set<string>();
          for (const rawFeedback of exercise.acceptedFeedback) {
            const entry = record(rawFeedback); text(entry.input); text(entry.explanation);
            if (entry.spokenExplanation !== undefined) text(entry.spokenExplanation);
            const key = normalized(entry.input as string);
            if (!accepted.has(key) || recorded.has(key)) throw Error('Equivalencia no enseñada o repetida');
            recorded.add(key);
          }
        }
      } else throw Error('Tipo de ejercicio no admitido');
      if (exercise.conversation !== undefined) validateContextual(exercise, lesson.objectives as string[]);
    }
    const exercises = variant.exercises as Exercise[];
    const reached = new Set<string>();
    // Every reachable path, including LV-007B intent routes, must cover all objectives in order and
    // must never ask for a fact that an earlier valid transition already confirmed.
    const walk = (id: string | null, path: string[], objectives: string[], facts: Set<string>) => {
      if (id === null) {
        if (JSON.stringify(objectives) !== JSON.stringify(lesson.objectives)) throw Error('Ruta sin todos los objetivos en orden');
        return;
      }
      if (path.includes(id)) throw Error('Ciclo en el diálogo');
      const exercise = exercises.find(item => item.id === id);
      if (!exercise) throw Error('Referencia de diálogo inexistente');
      if (exercise.asks !== undefined && facts.has(exercise.asks)) throw Error(`El diálogo vuelve a preguntar un dato confirmado: ${exercise.asks}`);
      reached.add(id);
      for (const transition of transitions(exercise)) {
        const known = new Set([...facts, ...Object.keys(transition.facts ?? {})]);
        walk(transition.next, [...path, id], [...objectives, exercise.objectiveId, ...(transition.completes ?? [])], known);
      }
    };
    walk(variant.start, [], [], new Set());
    if (reached.size !== exercises.length) throw Error('Ejercicio inalcanzable');
  }
  return value as Lesson;
}
