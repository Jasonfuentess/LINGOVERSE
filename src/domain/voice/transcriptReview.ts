import type { Exercise } from '../learning/models';
import { evaluateAnswer } from '../learning/engine';
import { matchSpokenChoice } from './choiceMatching';
export interface TranscriptEvidence { confidence?: number | null; language?: string | null }
export interface TranscriptReview {
  kind: 'valid' | 'incorrect' | 'uncertain' | 'no-recognition' | 'wrong-language';
  message: string;
}
export function inspectTranscript(exercise: Exercise, transcript: string, requestedLanguage: string, evidence: TranscriptEvidence): TranscriptReview {
  if (evidence.language && evidence.language.split('-')[0]?.toLowerCase() !== requestedLanguage.split('-')[0]?.toLowerCase()) return { kind: 'wrong-language', message: 'El reconocimiento está configurado en otro idioma. Reintentá en el idioma de esta aventura o escribí.' };
  if (!transcript.trim()) return { kind: 'no-recognition', message: 'No se obtuvo una frase. No es un error de pronunciación; podés reintentar o escribir.' };
  if (transcript.length > 400) return { kind: 'uncertain', message: 'La transcripción es demasiado larga. Revisala antes de responder.' };
  const choiceId = exercise.kind === 'choice' ? matchSpokenChoice(exercise, transcript) : null;
  const feedback = exercise.kind === 'text' ? evaluateAnswer(exercise, { kind: 'text', text: transcript }) : choiceId ? evaluateAnswer(exercise, { kind: 'choice', choiceId }) : null;
  if (evidence.confidence == null || !Number.isFinite(evidence.confidence) || evidence.confidence < 0.7 || evidence.confidence > 1 || !feedback || feedback.writtenIssue === 'unknown') return { kind: 'uncertain', message: 'No podemos confirmar lo que entendió el navegador. Revisá el texto: una transcripción dudosa no significa mala pronunciación.' };
  return feedback.correct ? { kind: 'valid', message: 'El texto coincide con una respuesta válida. Confirmá que es lo que quisiste decir; esto no evalúa pronunciación.' } : { kind: 'incorrect', message: 'El texto transcrito no responde a esta escena. Si el navegador entendió otra cosa, corregilo antes de responder. No es una evaluación de tu pronunciación.' };
}
