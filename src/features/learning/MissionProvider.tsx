import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { cafeLesson, cafeLessonV1, cafeLessonForProgress } from '../../content/cafe';
import { continueMission, submitAnswer } from '../../domain/learning/engine';
import type { LearnerAnswer, MissionProgress } from '../../domain/learning/models';
import { MissionConflictError, MissionRepository } from '../../storage/missionRepository';
import { deviceStorage } from '../../storage/deviceStorage';
import type { SavedReaction } from '../../domain/humor/models';
import { useHumorPreferences } from '../humor/HumorPreferencesProvider';
import { usePreferences } from '../preferences/PreferencesProvider';
import { roastLesson, roastLessonV2, roastLessonForProgress } from '../../content/roast';
import { canRoast } from '../../domain/humor/access';

const repository = new MissionRepository(deviceStorage, cafeLesson, [cafeLessonV1]);
const roastRepository = new MissionRepository(deviceStorage, roastLesson, [roastLessonV2], 'roast');
interface MissionState {
  mode?: 'friendly' | 'roast';
  progress: MissionProgress | null;
  reaction: SavedReaction | null;
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
export function MissionProvider({ children, roast = false }: PropsWithChildren<{ roast?: boolean }>) {
  const activeRepository = roast ? roastRepository : repository;
  const humor = useHumorPreferences();
  const profile = usePreferences();
  const [progress, setProgress] = useState<MissionProgress | null>(null);
  const [reaction, setReaction] = useState<SavedReaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const busy = useRef(false);
  const read = useCallback(async () => {
    try {
      const saved = await activeRepository.load();
      setProgress(saved);
      setReaction(activeRepository.getReaction());
      setLoadError(null);
      setSaveError(null);
    } catch { setLoadError('No pudimos leer la aventura: el almacenamiento no está disponible o el progreso es incompatible o está dañado. Podés reintentar o confirmar un reinicio.'); }
    finally { setLoading(false); }
  }, [activeRepository]);
  useEffect(() => {
    let active = true;
    void activeRepository.load().then(saved => {
      if (active) { setProgress(saved); setReaction(activeRepository.getReaction()); setLoadError(null); }
    }).catch(() => {
      if (active) setLoadError('No pudimos leer la aventura: el almacenamiento no está disponible o el progreso es incompatible o está dañado. Podés reintentar o confirmar un reinicio.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [activeRepository]);
  const reload = () => {
    if (busy.current || loading) return;
    setLoading(true);
    void read();
  };
  const persist = async (action: () => Promise<MissionProgress>) => {
    if (busy.current || loading || (roast && (humor.loading || !canRoast(humor.settings)))) return false;
    busy.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      const next = await action();
      setProgress(next);
      setReaction(activeRepository.getReaction());
      setLoadError(null);
      return true;
    } catch (error) {
      if (error instanceof MissionConflictError) setLoadError(error.message);
      else setSaveError('No se guardó la acción. Tu avance anterior se conserva. Revisá el almacenamiento y reintentá; si agotaste los intentos, podés reiniciar el recorrido.');
      return false;
    }
    finally { busy.current = false; setSaving(false); }
  };
  const persistChange = (change: () => MissionProgress, writtenInput?: string) => persist(async () => {
    const next = change();
    const locale = profile.preferences?.coachLocale;
    await activeRepository.save(next, Date.now(), !humor.loading && humor.settings && locale ? { locale, preferences: humor.settings, ...(roast && writtenInput !== undefined ? { writtenInput } : {}) } : undefined);
    return next;
  });
  const start = () => persist(() => activeRepository.start());
  const answer = (value: LearnerAnswer) => persistChange(() => {
    if (!progress || loadError) throw Error('No hay una aventura cargada');
    return submitAnswer(roast ? roastLessonForProgress(progress) : cafeLessonForProgress(progress), progress, value);
  }, value.kind === 'text' ? value.text : undefined);
  const advance = () => persistChange(() => {
    if (!progress || loadError) throw Error('No hay una aventura cargada');
    return continueMission(roast ? roastLessonForProgress(progress) : cafeLessonForProgress(progress), progress);
  });
  return <Context.Provider value={{ mode: roast ? 'roast' : 'friendly', progress, reaction, loading, saving, loadError, saveError, reload, start, answer, advance }}>{children}</Context.Provider>;
}
export function useMission() {
  const state = useContext(Context);
  if (!state) throw Error('MissionProvider requerido');
  return state;
}
