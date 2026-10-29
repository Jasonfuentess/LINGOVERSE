import type { Exercise, Lesson } from './models';

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
  if (lesson.schemaVersion !== 1 || lesson.version !== 1 || lesson.language !== 'fr' || lesson.level !== 'A1') throw Error('Versión o idioma de lección no admitido');
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
          identifier(option.id); text(option.label); text(option.explanation); next(option.next);
          if (typeof option.correct !== 'boolean' || typeof option.reply !== 'string' || optionIds.has(option.id)) throw Error('Opción inválida');
          if (!option.correct && option.next !== null) throw Error('Un error no debe avanzar');
          optionIds.add(option.id);
          if (option.correct) correct++;
        }
        if (!correct) throw Error('Faltan respuestas correctas');
      } else if (exercise.kind === 'text') {
        list(exercise.accepted); exercise.accepted.forEach(text); next(exercise.next); text(exercise.reply);
      } else throw Error('Tipo de ejercicio no admitido');
    }
    const exercises = variant.exercises as Exercise[];
    const reached = new Set<string>();
    const walk = (id: string | null, path: string[], objectives: string[]) => {
      if (id === null) {
        if (JSON.stringify(objectives) !== JSON.stringify(lesson.objectives)) throw Error('Ruta sin todos los objetivos en orden');
        return;
      }
      if (path.includes(id)) throw Error('Ciclo en el diálogo');
      const exercise = exercises.find(item => item.id === id);
      if (!exercise) throw Error('Referencia de diálogo inexistente');
      reached.add(id);
      const targets = exercise.kind === 'text' ? [exercise.next] : exercise.choices.filter(option => option.correct).map(option => option.next);
      for (const target of new Set(targets)) walk(target, [...path, id], [...objectives, exercise.objectiveId]);
    };
    walk(variant.start, [], []);
    if (reached.size !== exercises.length) throw Error('Ejercicio inalcanzable');
  }
  return value as Lesson;
}
