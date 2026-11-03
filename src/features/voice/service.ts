import { VoiceController } from '../../domain/voice/playback';
import { systemSpeech } from './systemSpeech';
// Exactly one owner across cafe, standalone Roast and routes.
export const voiceController = new VoiceController(systemSpeech);
