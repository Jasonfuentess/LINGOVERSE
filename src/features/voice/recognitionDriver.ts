import type { RecognitionDriver } from '../../domain/voice/recognition';
// Native Expo Go does not ship a speech-recognition module. Do not request an unusable permission.
export const recognitionDriver: RecognitionDriver = { available: () => false, create: () => { throw Error('Native speech recognition not installed'); } };
