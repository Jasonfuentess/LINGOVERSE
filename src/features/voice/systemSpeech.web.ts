import { createBrowserSpeech } from '../../domain/voice/browser';
export const systemSpeech = createBrowserSpeech(
  () => typeof window === 'undefined' ? undefined : window.speechSynthesis,
  text => new SpeechSynthesisUtterance(text),
);
