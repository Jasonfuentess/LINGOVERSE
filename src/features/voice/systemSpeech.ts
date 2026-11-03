import * as Speech from 'expo-speech';
import type { SpeechDriver } from '../../domain/voice/playback';

export const systemSpeech: SpeechDriver = {
  voices: async () => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        Speech.getAvailableVoicesAsync(),
        new Promise<never>((_resolve, reject) => { timer = setTimeout(() => reject(Error('Voice discovery timed out')), 5000); }),
      ]);
    } finally { if (timer) clearTimeout(timer); }
  },
  stop: () => Speech.stop(),
  speak: (text, voice, events, rate = 0.9) => {
    if (text.length > Speech.maxSpeechInputLength) throw Error('Texto demasiado largo');
    Speech.speak(text, { voice: voice.identifier, language: voice.language, rate, ...events });
  },
};
