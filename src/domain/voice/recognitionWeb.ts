import type { RecognitionDriver, RecognitionEvents, RecognitionSession } from './recognition';

interface BrowserResult { isFinal: boolean; 0?: { transcript: string; confidence?: number } }
interface BrowserResultEvent { results: ArrayLike<BrowserResult> }
interface BrowserRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: BrowserResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type BrowserConstructor = new () => BrowserRecognition;
type BrowserWindow = { isSecureContext?: boolean; SpeechRecognition?: BrowserConstructor; webkitSpeechRecognition?: BrowserConstructor };

/** Never polyfill silently: when absent, written learning remains available. */
export function createWebRecognition(getWindow: () => BrowserWindow | undefined): RecognitionDriver {
  const constructor = (): BrowserConstructor | undefined => {
    const source = getWindow();
    if (!source || source.isSecureContext === false) return undefined;
    return source.SpeechRecognition ?? source.webkitSpeechRecognition;
  };
  return {
    available: () => Boolean(constructor()),
    create: (language: string, events: RecognitionEvents): RecognitionSession => {
      const Engine = constructor();
      if (!Engine) throw Error('SpeechRecognition unavailable');
      const recognizer = new Engine();
      recognizer.lang = language;
      recognizer.continuous = false;
      recognizer.interimResults = true;
      recognizer.maxAlternatives = 1;
      recognizer.onresult = event => {
        const final: string[] = [];
        const interim: string[] = [];
        const confidences: number[] = [];
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const value = result?.[0]?.transcript?.trim();
          if (!value) continue;
          (result?.isFinal ? final : interim).push(value);
          if (result?.isFinal) {
            const confidence = result[0]?.confidence;
            // Zero/missing/out-of-range are treated as unavailable evidence, never a grade.
            confidences.push(typeof confidence === 'number' && confidence > 0 && confidence <= 1 ? confidence : 0);
          }
        }
        events.result(final.join(' ').trim(), interim.join(' ').trim(), { language: recognizer.lang, confidence: confidences.length && confidences.every(c => c > 0) ? Math.min(...confidences) : null });
      };
      recognizer.onerror = event => events.error(event.error);
      recognizer.onend = events.end;
      return { start: () => recognizer.start(), stop: () => recognizer.stop(), abort: () => recognizer.abort() };
    },
  };
}
