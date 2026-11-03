import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { cafeLesson, cafeLessonV1, cafeLessonForProgress } from '../../content/cafe';
import { londonLesson, londonLessonV1, londonLessonV2, londonLessonV3, londonLessonForProgress } from '../../content/london';
import { rendezvousLesson, rendezvousLessonForProgress } from '../../content/rendezvous';
import { continueMission, submitAnswer } from '../../domain/learning/engine';
import type { AnswerSupport, LearnerAnswer, MissionProgress } from '../../domain/learning/models';
import { MissionConflictError, MissionRepository } from '../../storage/missionRepository';
import { deviceStorage } from '../../storage/deviceStorage';
import type { SavedReaction } from '../../domain/humor/models';
import { useHumorPreferences } from '../humor/HumorPreferencesProvider';
import { usePreferences } from '../preferences/PreferencesProvider';
import { roastLesson, roastLessonV2, roastLessonForProgress } from '../../content/roast';
import { canRoast } from '../../domain/humor/access';
import { voiceController } from '../voice/service';

const repository = new MissionRepository(deviceStorage, cafeLesson, [cafeLessonV1]);
const englishRepository = new MissionRepository(deviceStorage, londonLesson, [londonLessonV1, londonLessonV2, londonLessonV3]);
const rendezvousRepository = new MissionRepository(deviceStorage, rendezvousLesson);
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
  answer: (answer: LearnerAnswer, support?: AnswerSupport) => Promise<boolean>;
  advance: () => Promise<boolean>;
}
const Context = createContext<MissionState | null>(null);
const EnglishContext = createContext<MissionState | null>(null);
const RendezvousContext = createContext<MissionState | null>(null);
export function MissionProvider({ children, roast = false, language = 'fr', adventure = 'cafe' }: PropsWithChildren<{ roast?: boolean; language?: 'fr' | 'en'; adventure?: 'cafe' | 'rendezvous' }>) {
  const isRendezvous = language === 'fr' && adventure === 'rendezvous' && !roast;
  const activeRepository = roast ? roastRepository : language === 'en' ? englishRepository : isRendezvous ? rendezvousRepository : repository;
  const ActiveContext = language === 'en' && !roast ? EnglishContext : isRendezvous ? RendezvousContext : Context;
  const lessonForProgress = (saved: MissionProgress) => roast ? roastLessonForProgress(saved) : language === 'en' ? londonLessonForProgress(saved) : isRendezvous ? rendezvousLessonForProgress(saved) : cafeLessonForProgress(saved);
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
    void voiceController.stop();
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
    await activeRepository.save(next, Date.now(), language === 'fr' && !humor.loading && humor.settings && locale ? { locale, preferences: humor.settings, ...(roast && writtenInput !== undefined ? { writtenInput } : {}) } : undefined);
    return next;
  });
  const start = () => persist(() => activeRepository.start());
  const answer = (value: LearnerAnswer, support?: AnswerSupport) => persistChange(() => {
    if (!progress || loadError) throw Error('No hay una aventura cargada');
    return submitAnswer(lessonForProgress(progress), progress, value, support);
  }, value.kind === 'text' ? value.text : undefined);
  const advance = () => persistChange(() => {
    if (!progress || loadError) throw Error('No hay una aventura cargada');
    return continueMission(lessonForProgress(progress), progress);
  });
  return <ActiveContext.Provider value={{ mode: roast ? 'roast' : 'friendly', progress, reaction, loading, saving, loadError, saveError, reload, start, answer, advance }}>{children}</ActiveContext.Provider>;
}
export function useMission(language: 'fr' | 'en' = 'fr', adventure: 'cafe' | 'rendezvous' = 'cafe') {
  const french = useContext(Context);
  const english = useContext(EnglishContext);
  const rendezvous = useContext(RendezvousContext);
  const state = language === 'en' ? english : adventure === 'rendezvous' ? rendezvous : french;
  if (!state) throw Error('MissionProvider requerido');
  return state;
}
