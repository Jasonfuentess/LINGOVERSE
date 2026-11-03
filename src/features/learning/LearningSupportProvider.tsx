import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import type { LearningSupport, SupportChange } from '../../domain/learning/support';
import type { LearningLanguage } from '../../domain/preferences';
import { LearningSupportRepository } from '../../storage/learningSupportRepository';
import { deviceStorage } from '../../storage/deviceStorage';
const repository = new LearningSupportRepository(deviceStorage);
interface SupportState {
  data: LearningSupport | null; loading: boolean; saving: boolean; error: string | null;
  reload: () => Promise<void>;
  change: (language: LearningLanguage, change: SupportChange) => Promise<boolean>;
}
const Context = createContext<SupportState | null>(null);
export function LearningSupportProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<LearningSupport | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const reload = useCallback(async () => {
    if (busy.current) return;
    busy.current = true; setLoading(true);
    try { setData(await repository.load()); setError(null); }
    catch { setError('No pudimos leer tu ayuda de aprendizaje. Tus aventuras se conservan; podés seguir con la ayuda habitual y reintentar.'); }
    finally { busy.current = false; setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    busy.current = true;
    void repository.load().then(value => { if (active) { setData(value); setError(null); } })
      .catch(() => { if (active) setError('No pudimos leer tu ayuda de aprendizaje. Tus aventuras se conservan; podés seguir con la ayuda habitual y reintentar.'); })
      .finally(() => { busy.current = false; if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const change = async (language: LearningLanguage, update: SupportChange) => {
    if (busy.current || !data) return false;
    busy.current = true; setSaving(true);
    try { setData(await repository.change(language, update)); setError(null); return true; }
    catch { setError('No se guardó la preparación. Podés reintentar sin reiniciar tu aventura.'); return false; }
    finally { busy.current = false; setSaving(false); }
  };
  return <Context.Provider value={{ data, loading, saving, error, reload, change }}>{children}</Context.Provider>;
}
export function useLearningSupport() {
  const state = useContext(Context);
  if (!state) throw Error('LearningSupportProvider requerido');
  return state;
}
