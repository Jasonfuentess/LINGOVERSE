import type { SpeechDriver } from './playback';

/** Web adapter is synchronous at speak-time: no voice-discovery promise can outlive cancel. */
export function createBrowserSpeech(getEngine: () => SpeechSynthesis | undefined, utterance: (text: string) => SpeechSynthesisUtterance): SpeechDriver {
  return {
    voices: async () => {
      const engine = getEngine();
      if (!engine) return [];
      if (!engine.getVoices().length) await new Promise<void>(resolve => {
        const finish = () => { clearTimeout(timer); engine.removeEventListener('voiceschanged', finish); resolve(); };
        const timer = setTimeout(finish, 2000);
        engine.addEventListener('voiceschanged', finish);
        if (engine.getVoices().length) finish();
      });
      return engine.getVoices().map(voice => ({ identifier: voice.voiceURI, language: voice.lang, name: voice.name, local: voice.localService }));
    },
    stop: async () => { getEngine()?.cancel(); },
    speak: (text, voice, events, rate = 0.9) => {
      const engine = getEngine();
      const current = engine?.getVoices().find(item => item.voiceURI === voice.identifier && item.localService === voice.local);
      if (!engine || !current) throw Error('Voz local no disponible');
      const message = utterance(text);
      message.voice = current;
      message.lang = current.lang;
      message.rate = rate;
      message.onstart = events.onStart;
      message.onend = events.onDone;
      message.onerror = events.onError;
      engine.speak(message);
    },
  };
}
