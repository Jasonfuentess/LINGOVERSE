export interface DeviceVoice { identifier: string; language: string; name: string; local?: boolean }
const tag = (language: string) => language.replace(/_/g, '-').toLowerCase();
export function selectVoice(voices: DeviceVoice[], language: string, allowNetwork = false) {
  const requested = tag(language);
  const compatible = voices.filter(voice => (voice.local !== false || allowNetwork) && tag(voice.language).split('-')[0] === requested.split('-')[0]);
  const local = compatible.filter(voice => voice.local !== false);
  const voice = local.find(voice => tag(voice.language) === requested) ?? local[0] ?? compatible.find(voice => tag(voice.language) === requested) ?? compatible[0];
  return voice ? { voice, regionalFallback: requested.includes('-') && tag(voice.language) !== requested } : null;
}
export interface SpeechEvents { onStart: () => void; onDone: () => void; onError: () => void; onStopped: () => void }
export interface SpeechDriver {
  voices: () => Promise<DeviceVoice[]>;
  stop: () => Promise<void>;
  speak: (text: string, voice: DeviceVoice, events: SpeechEvents, rate?: number) => void;
}
export interface SpeechRequest { id: string; text: string; language: string; adult?: boolean; rate?: number }
export interface VoiceContext { scope: string; muted: boolean; adultAllowed: boolean; allowNetworkVoices?: boolean }
export interface VoiceState { voices: DeviceVoice[]; status: 'idle' | 'loading' | 'starting' | 'speaking' | 'error'; activeId: string | null; muted: boolean; error: string | null; allowNetworkVoices: boolean }
type Schedule = (callback: () => void, milliseconds: number) => () => void;

/** Single owner of the device speech queue. Never persists text or changes learning state. */
export class VoiceController {
  private state: VoiceState = { voices: [], status: 'idle', activeId: null, muted: true, error: null, allowNetworkVoices: false };
  private context: VoiceContext = { scope: '', muted: true, adultAllowed: false };
  private generation = 0;
  private discovery = 0;
  private stopping: Promise<boolean> = Promise.resolve(true);
  private cancelTimer: (() => void) | undefined;
  private listeners = new Set<() => void>();
  constructor(private driver: SpeechDriver, private schedule: Schedule = (callback, ms) => { const timer = setTimeout(callback, ms); return () => clearTimeout(timer); }) {}
  snapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private publish(change: Partial<VoiceState>) { this.state = { ...this.state, ...change }; this.listeners.forEach(listener => listener()); }
  configure(context: VoiceContext) {
    if (JSON.stringify(context) === JSON.stringify(this.context)) return;
    this.context = context;
    this.publish({ muted: context.muted, allowNetworkVoices: context.allowNetworkVoices === true });
    void this.stop();
  }
  /** Restrictive actions invalidate permission synchronously, before storage or React commits. */
  restrict() { this.context = { ...this.context, adultAllowed: false }; void this.stop(); }
  mute(muted: boolean) { this.configure({ ...this.context, muted }); }
  private halt() {
    this.stopping = this.stopping.then(async () => { try { await this.driver.stop(); return true; } catch { return false; } });
    return this.stopping;
  }
  async stop() {
    const token = ++this.generation;
    this.cancelTimer?.();
    this.publish({ status: 'idle', activeId: null, error: null });
    if (!await this.halt() && token === this.generation) this.publish({ status: 'error', error: 'No pudimos detener la voz del sistema. No se iniciará otra reproducción hasta reintentar.' });
  }
  async refresh() {
    const discovery = ++this.discovery;
    this.publish({ status: this.state.activeId ? this.state.status : 'loading', error: null });
    try {
      const voices = await this.driver.voices();
      if (discovery === this.discovery) this.publish({ voices, status: this.state.activeId ? this.state.status : 'idle' });
    } catch {
      if (discovery === this.discovery) this.publish({ voices: [], status: 'error', error: 'No pudimos consultar las voces. Podés seguir leyendo y reintentar.' });
    }
  }
  async play(request: SpeechRequest) {
    if (this.context.muted || (request.adult && !this.context.adultAllowed)) return;
    const token = ++this.generation;
    this.cancelTimer?.();
    this.publish({ status: 'starting', activeId: request.id, error: null });
    const stopped = await this.halt();
    if (token !== this.generation || this.context.muted || (request.adult && !this.context.adultAllowed)) return;
    const selection = selectVoice(this.state.voices, request.language, this.context.allowNetworkVoices);
    if (!stopped || !selection || !request.text.trim() || request.text.length > 2000 || (request.rate !== undefined && (!Number.isFinite(request.rate) || request.rate < 0.5 || request.rate > 1.2))) {
      this.publish({ status: 'error', activeId: null, error: !stopped ? 'No pudimos detener la voz anterior. Reintentá.' : !selection ? 'No hay una voz compatible disponible. El texto sigue disponible.' : 'Este texto no se puede reproducir.' });
      return;
    }
    const finish = (error = false) => {
      if (token !== this.generation) return;
      ++this.generation;
      this.cancelTimer?.();
      this.publish({ status: error ? 'error' : 'idle', activeId: null, error: error ? 'La voz no respondió o no pudo reproducirse. Revisá el sonido del dispositivo y reintentá.' : null });
      if (error) void this.halt();
    };
    this.cancelTimer = this.schedule(() => finish(true), 8000);
    try {
      this.driver.speak(request.text, selection.voice, {
        onStart: () => {
          if (token !== this.generation) return;
          this.cancelTimer?.();
          this.cancelTimer = this.schedule(() => finish(true), 120000);
          this.publish({ status: 'speaking' });
        },
        onDone: () => finish(), onStopped: () => finish(), onError: () => finish(true),
      }, request.rate ?? 0.9);
    } catch { finish(true); }
  }
}
