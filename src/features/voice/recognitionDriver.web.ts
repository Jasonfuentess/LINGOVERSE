import { createWebRecognition } from '../../domain/voice/recognitionWeb';
// The web browser owns microphone permission and any remote transcription service.
export const recognitionDriver = createWebRecognition(() => typeof window === 'undefined' ? undefined : window);
