import type { HumorPreferences } from './models';
export function humorDefaults(): HumorPreferences { return { version: 1, enabled: true, intensity: 'playful', adult: { enabled: false, consent: null } }; }
export function decodeHumorPreferences(raw: string): HumorPreferences {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object') throw Error('Preferencias de humor inválidas');
  const p = value as Record<string, unknown>;
  if (p.adventureRoast !== undefined && typeof p.adventureRoast !== 'boolean') throw Error('Estilo de aventura inválido');
  if (p.version !== 1 || typeof p.enabled !== 'boolean' || !['gentle', 'playful'].includes(String(p.intensity)) || typeof p.intensity !== 'string' || !p.adult || typeof p.adult !== 'object') throw Error('Versión o configuración de humor inválida');
  const adult = p.adult as Record<string, unknown>;
  if (typeof adult.enabled !== 'boolean') throw Error('Configuración adulta inválida');
  let consent: HumorPreferences['adult']['consent'] = null;
  if (adult.consent !== null) {
    if (!adult.consent || typeof adult.consent !== 'object') throw Error('Consentimiento inválido');
    const c = adult.consent as Record<string, unknown>;
    if (c.version !== 1 || c.adultConfirmed !== true || c.explicitlyAgreed !== true || !Number.isSafeInteger(c.grantedAt) || (c.grantedAt as number) < 0) throw Error('Falta consentimiento adulto explícito válido');
    consent = { version: 1, adultConfirmed: true, explicitlyAgreed: true, grantedAt: c.grantedAt as number };
  }
  if (adult.enabled && !consent) throw Error('Humor adulto requiere consentimiento');
  return { version: 1, enabled: p.enabled, intensity: p.intensity as HumorPreferences['intensity'], ...(p.adventureRoast !== undefined ? { adventureRoast: p.adventureRoast as boolean } : {}), adult: { enabled: adult.enabled, consent } };
}
export function grantAdultConsent(previous: HumorPreferences, confirmation: { adultConfirmed?: boolean; explicitlyAgreed?: boolean }, at: number): HumorPreferences {
  if (confirmation.adultConfirmed !== true || confirmation.explicitlyAgreed !== true || !Number.isSafeInteger(at) || at < 0) throw Error('Se necesitan mayoría de edad y consentimiento explícitos');
  return decodeHumorPreferences(JSON.stringify({ ...previous, adult: { enabled: true, consent: { version: 1, adultConfirmed: true, explicitlyAgreed: true, grantedAt: at } } }));
}
export function disableAdult(previous: HumorPreferences): HumorPreferences { return { ...previous, ...(previous.adventureRoast !== undefined ? { adventureRoast: false } : {}), adult: { enabled: false, consent: null } }; }
