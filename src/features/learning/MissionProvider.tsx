import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { cafeLesson, cafeLessonV1, cafeLessonForProgress } from '../../content/cafe';
import { continueMission, submitAnswer } from '../../domain/learning/engine';
import type { LearnerAnswer, MissionProgress } from '../../domain/learning/models';
import { MissionConflictError, MissionRepository } from '../../storage/missionRepository';
import { deviceStorage } from '../../storage/deviceStorage';

const repository = new MissionRepository(deviceStorage, cafeLesson, [cafeLessonV1]);
interface MissionState {
  progress: MissionProgress | null;
  loading: boolean;
  saving: boolean;
  loadError: string | null;
  saveError: string | null;
  reload: () => void;
  start: () => Promise<boolean>;
  answer: (answer: LearnerAnswer) => Promise<boolean>;
  advance: () => Promise<boolean>;
}
const Context = createContext<MissionState | null>(null);
export function MissionProvider({ children }: PropsWithChildren) {
  const [progress, setProgress] = useState<MissionProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const busy = useRef(false);
  const read = useCallback(async () => {
    try {
      const saved = await repository.load();
      setProgress(saved);
      setLoadError(null);
      setSaveError(null);
    } catch { setLoadError('No pudimos leer la aventura: el almacenamiento no está disponible o el progreso es incompatible o está dañado. Podés reintentar o confirmar un reinicio.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    void repository.load().then(saved => {
      if (active) { setProgress(saved); setLoadError(null); }
    }).catch(() => {
      if (active) setLoadError('No pudimos leer la aventura: el almacenamiento no está disponible o el progreso es incompatible o está dañado. Podés reintentar o confirmar un reinicio.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const reload = () => {
    if (busy.current || loading) return;
    setLoading(true);
    void read();
  };
  const persist = async (action: () => Promise<MissionProgress>) => {
    if (busy.current || loading) return false;
    busy.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      const next = await action();
      setProgress(next);
      setLoadError(null);
      return true;
    } catch (error) {
      if (error instanceof MissionConflictError) setLoadError(error.message);
      else setSaveError('No se guardó la acción. Tu avance anterior se conserva. Revisá el almacenamiento y reintentá; si agotaste los intentos, podés reiniciar el recorrido.');
      return false;
    }
    finally { busy.current = false; setSaving(false); }
  };
  const persistChange = (change: () => MissionProgress) => persist(async () => {
    const next = change();
    await repository.save(next);
    return next;
  });
  const start = () => persist(() => repository.start());
  const answer = (value: LearnerAnswer) => persistChange(() => {
    if (!progress || loadError) throw Error('No hay una aventura cargada');
    return submitAnswer(cafeLessonForProgress(progress), progress, value);
  });
  const advance = () => persistChange(() => {
    if (!progress || loadError) throw Error('No hay una aventura cargada');
    return continueMission(cafeLessonForProgress(progress), progress);
  });
  return <Context.Provider value={{ progress, loading, saving, loadError, saveError, reload, start, answer, advance }}>{children}</Context.Provider>;
}
export function useMission() {
  const state = useContext(Context);
  if (!state) throw Error('MissionProvider requerido');
  return state;
}
