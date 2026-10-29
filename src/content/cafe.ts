import type { MissionProgress } from '../domain/learning/models';
import { cafeLesson as cafeLessonV1 } from './cafe.v1';
import { cafeLessonV2 as cafeLesson } from './cafe.v2';
export { cafeLesson, cafeLessonV1 };
export function cafeLessonForProgress(progress: MissionProgress | null) {
  if (!progress) return cafeLesson;
  if (progress.lessonId !== cafeLesson.id) throw Error('Misión desconocida');
  if (progress.contentVersion === 1) return cafeLessonV1;
  if (progress.contentVersion === 2) return cafeLesson;
  throw Error('Versión de contenido no admitida');
}
