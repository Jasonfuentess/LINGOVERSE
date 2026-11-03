import { beginMission, continueMission, submitAnswer } from './engine';
import type { Lesson, MissionProgress } from './models';
/** Observed performance here, never CEFR mastery. Legacy absence remains unrecorded. */
export function practiceEvidence(lesson: Lesson, progress: MissionProgress) {
  let cursor = beginMission(lesson, progress.run, () => progress.variantId);
  const result = { assisted: 0, independent: 0, unrecorded: 0, confirmedErrors: 0 };
  for (const event of progress.events) {
    if (event.type === 'answer') {
      cursor = submitAnswer(lesson, cursor, event.answer, event.support);
      if (!cursor.feedback?.correct && cursor.feedback?.writtenIssue !== 'unknown') result.confirmedErrors++;
    } else {
      const last = cursor.events.at(-1);
      if (last?.type === 'answer') result[last.support === 'assisted' ? 'assisted' : last.support === 'independent' ? 'independent' : 'unrecorded']++;
      cursor = continueMission(lesson, cursor);
    }
  }
  return result;
}
