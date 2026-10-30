import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import type { HumorPreferences } from '../../domain/humor/models';
import { HumorPreferencesConflictError, HumorPreferencesRepository } from '../../storage/humorPreferencesRepository';
import { deviceStorage } from '../../storage/deviceStorage';
import { AppState, Platform } from 'react-native';
import { disableAdult } from '../../domain/humor/preferences';
const repository = new HumorPreferencesRepository(deviceStorage);
interface State { settings: HumorPreferences | null; loading: boolean; saving: boolean; error: string | null; reload: () => void; save: (settings: HumorPreferences) => Promise<void> }
const Context = createContext<State | null>(null);
export function HumorPreferencesProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<HumorPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const adultHidden = useRef(false);
  useEffect(() => {
    const refresh = () => {
      setLoading(true);
      void repository.load().then(value => setSettings(adultHidden.current ? disableAdult(value) : value)).catch(() => { setSettings(null); setError('No pudimos comprobar el consentimiento. Reintentá la lectura.'); }).finally(() => setLoading(false));
    };
    if (Platform.OS === 'web') {
      const changed = (event: StorageEvent) => { if (event.key === 'lingoverse.humor-preferences.v1' || event.key === null) refresh(); };
      window.addEventListener('storage', changed);
      window.addEventListener('focus', refresh);
      return () => { window.removeEventListener('storage', changed); window.removeEventListener('focus', refresh); };
    }
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    let active = true;
    void repository.load().then(value => { if (active) setSettings(value); }).catch(() => { if (active) setError('No se pudieron leer los ajustes de humor. La aventura sigue disponible sin comentarios.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const reload = () => {
    if (busy.current) return;
    setLoading(true);
    void repository.load().then(value => { setSettings(adultHidden.current ? disableAdult(value) : value); setError(null); }).catch(() => { setSettings(null); setError('No se pudieron leer los ajustes de humor.'); }).finally(() => setLoading(false));
  };
  const save = async (next: HumorPreferences) => {
    if (busy.current) return;
    busy.current = true; setSaving(true); setError(null);
    // Restrictive changes hide adult content before storage completes, even on failure.
    if (!next.adult.enabled) { adultHidden.current = true; setSettings(next); }
    try { await repository.save(next); adultHidden.current = !next.adult.enabled; setSettings(next); }
    catch (error) { setError(error instanceof HumorPreferencesConflictError ? error.message : !next.adult.enabled ? 'No se guardó la revocación. El contenido adulto sigue oculto en esta sesión; reintentá antes de cerrar la aplicación.' : 'No se guardaron los ajustes de humor. Se conserva la configuración anterior.'); }
    finally { busy.current = false; setSaving(false); }
  };
  return <Context.Provider value={{ settings, loading, saving, error, reload, save }}>{children}</Context.Provider>;
}
export function useHumorPreferences() {
  const state = useContext(Context);
  if (!state) throw Error('HumorPreferencesProvider requerido');
  return state;
}
