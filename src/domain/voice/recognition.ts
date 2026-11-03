import type { TranscriptEvidence } from './transcriptReview';
/** Transcription is untrusted input, not an assessment of pronunciation. No audio is stored. */
export interface RecognitionEvents {
  result: (finalText: string, interimText: string, evidence?: TranscriptEvidence) => void;
  error: (code: string) => void;
  end: () => void;
}
export interface RecognitionSession {
  start(): void;
  stop(): void;
  abort(): void;
}
export interface RecognitionDriver {
  available(): boolean;
  create(language: string, events: RecognitionEvents): RecognitionSession;
}
export type RecognitionStatus = 'idle' | 'listening' | 'stopping' | 'error';
export interface RecognitionState {
  status: RecognitionStatus;
  finalText: string;
  interimText: string;
  error: string | null;
  evidence: TranscriptEvidence;
  problem: 'permission' | 'empty' | 'uncertain' | 'language' | 'unavailable' | 'service' | null;
}
export function recognitionError(code: string): string {
  switch (code) {
    case 'not-allowed': case 'service-not-allowed': return 'Permiso de micrófono denegado o reconocimiento bloqueado. Revisá los permisos del navegador o escribí tu respuesta.';
    case 'audio-capture': return 'No se pudo utilizar el micrófono. Revisá la conexión del dispositivo o escribí.';
    case 'network': return 'El servicio de reconocimiento del navegador no respondió. Podés escribir tu respuesta.';
    case 'language-not-supported': return 'El navegador no dispone de reconocimiento para este idioma. Podés escribir.';
    case 'no-speech': return 'No se detectó una frase. Podés intentar de nuevo o escribir.';
    case 'aborted': return 'Se interrumpió el reconocimiento. Podés intentarlo de nuevo.';
    default: return 'No se pudo transcribir la voz. Podés intentar de nuevo o escribir.';
  }
}
/** Each recording owns an epoch. Late callbacks cannot repopulate a cancelled or changed exercise. */
export class RecognitionController {
  private state: RecognitionState = { status: 'idle', finalText: '', interimText: '', error: null, evidence: {}, problem: null };
  private listeners = new Set<() => void>();
  private session: RecognitionSession | null = null;
  private epoch = 0;
  private disposed = false;
  constructor(private readonly driver: RecognitionDriver) {}
  snapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  available = () => !this.disposed && this.driver.available();
  private update(change: Partial<RecognitionState>) {
    if (this.disposed) return;
    this.state = { ...this.state, ...change };
    this.listeners.forEach(listener => listener());
  }
  start(language: string): boolean {
    if (this.disposed || this.state.status === 'listening' || this.state.status === 'stopping') return false;
    if (!this.driver.available()) { this.update({ status: 'error', problem: 'unavailable', error: 'El micrófono por reconocimiento de voz no está disponible en este navegador. Podés escribir.' }); return false; }
    this.abortActive();
    const epoch = ++this.epoch;
    this.update({ status: 'listening', finalText: '', interimText: '', error: null, evidence: { language, confidence: null }, problem: null });
    try {
      const session = this.driver.create(language, {
        result: (finalText, interimText, evidence) => {
          if (this.epoch !== epoch) return;
          if (evidence?.language && evidence.language.split('-')[0]?.toLowerCase() !== language.split('-')[0]?.toLowerCase()) {
            this.abortActive();
            this.update({ status: 'error', finalText: '', interimText: '', problem: 'language', error: 'El reconocimiento se configuró en otro idioma. Reintentá en el idioma de esta aventura o escribí.', evidence });
            return;
          }
          this.update({ finalText, interimText, evidence: { language, confidence: null, ...evidence } });
        },
        error: code => {
          if (this.epoch !== epoch) return;
          this.update({ status: 'error', interimText: '', error: recognitionError(code), problem: code === 'not-allowed' || code === 'service-not-allowed' ? 'permission' : code === 'no-speech' ? 'empty' : code === 'language-not-supported' ? 'language' : 'service' });
          const failed = this.session;
          this.session = null;
          ++this.epoch;
          try { failed?.abort(); } catch { /* Browser may already have ended. */ }
        },
        end: () => {
          if (this.epoch !== epoch) return;
          this.session = null;
          this.update({ status: 'idle', interimText: '', error: this.state.finalText ? null : recognitionError('no-speech'), problem: !this.state.finalText ? 'empty' : this.state.evidence.confidence == null || this.state.evidence.confidence < 0.7 ? 'uncertain' : null });
          ++this.epoch;
        },
      });
      this.session = session;
      session.start();
      return true;
    } catch {
      if (this.epoch === epoch) {
        this.session = null;
        ++this.epoch;
        this.update({ status: 'error', interimText: '', error: recognitionError('unknown'), problem: 'service' });
      }
      return false;
    }
  }
  stop() {
    if (this.state.status !== 'listening' || !this.session) return;
    this.update({ status: 'stopping', interimText: '' });
    try { this.session.stop(); }
    catch { this.abortActive(); this.update({ status: 'error', error: recognitionError('unknown'), problem: 'service' }); }
  }
  private abortActive() {
    ++this.epoch;
    const previous = this.session;
    this.session = null;
    try { previous?.abort(); } catch { /* A browser can already have ended this session. */ }
  }
  cancel() {
    this.abortActive();
    this.update({ status: 'idle', finalText: '', interimText: '', error: null, evidence: {}, problem: null });
  }
  dispose() {
    this.abortActive();
    this.disposed = true;
    this.listeners.clear();
  }
}
