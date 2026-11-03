import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { changePreferences, type Preferences, type PreferencesChange } from '../../domain/preferences';
import { PreferencesRepository } from '../../storage/preferencesRepository';
import { deviceStorage } from '../../storage/deviceStorage';
import { voiceController } from '../voice/service';

const repository = new PreferencesRepository(deviceStorage);
interface State {
  preferences: Preferences | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  recovered: boolean;
  reload: () => Promise<void>;
  save: (change: PreferencesChange) => Promise<boolean>;
}
const Context = createContext<State | null>(null);
export function PreferencesProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recovered, setRecovered] = useState(false);
  const busy = useRef(false);
  const read = useCallback(async () => {
    try {
      const result = await repository.load();
      setPreferences(result.preferences);
      setRecovered(result.recovered);
      setError(null);
    } catch { setError('No pudimos leer tus preferencias. Habilitá el almacenamiento local y reintentá.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    void repository.load().then(result => {
      if (active) { setPreferences(result.preferences); setRecovered(result.recovered); setError(null); }
    }).catch(() => {
      if (active) setError('No pudimos leer tus preferencias. Habilitá el almacenamiento local y reintentá.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const reload = async () => {
    voiceController.restrict();
    setLoading(true);
    setError(null);
    await read();
  };
  const save = async (change: PreferencesChange) => {
    if (!preferences || busy.current) return false;
    voiceController.restrict();
    busy.current = true;
    setSaving(true);
    setError(null);
    try {
      const next = changePreferences(preferences, change);
      await repository.save(next);
      setPreferences(next);
      setRecovered(false);
      return true;
    } catch { setError('No se guardaron los cambios. Revisá el espacio y los permisos de almacenamiento, y reintentá.'); return false; }
    finally { busy.current = false; setSaving(false); }
  };
  return <Context.Provider value={{ preferences, loading, saving, error, recovered, reload, save }}>{children}</Context.Provider>;
}
export function usePreferences() {
  const state = useContext(Context);
  if (!state) throw new Error('PreferencesProvider requerido');
  return state;
}
