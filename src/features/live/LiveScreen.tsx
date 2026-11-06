import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Copy, Notice, Page } from '../../components/ui';
import { AnswerTextInput, KeyboardAnswerGroup } from '../../components/KeyboardScroll';
import { CharacterPortrait } from '../../components/AdventureArt';
import { coaches } from '../../content/humor';
import { liveLessonFor } from '../../content/live';
import { liveLibrary } from '../../content/liveHumor';
import { pronunciationFor } from '../../content/pronunciation';
import { continueMission, submitAnswer } from '../../domain/learning/engine';
import type { AnswerChannel, MissionProgress } from '../../domain/learning/models';
import { pedagogicalMode } from '../../domain/learning/support';
import { canRoast } from '../../domain/humor/access';
import { disableAdult } from '../../domain/humor/preferences';
import { liveSettings } from '../../domain/humor/live';
import type { LiveIntensity } from '../../domain/humor/models';
import { liveConversation, liveSpeech, liveSummary, restartLiveScene, type LiveEntry } from '../../domain/live/session';
import type { CoachLocale } from '../../domain/preferences';
import { chooseCoachVoice } from '../../domain/voice/coachVoices';
import { selectVoice } from '../../domain/voice/playback';
import { inspectTranscript } from '../../domain/voice/transcriptReview';
import { MissionRepository } from '../../storage/missionRepository';
import { deviceStorage } from '../../storage/deviceStorage';
import { LiveVoiceRepository, emptyLiveVoices, type LiveVoices } from '../../storage/liveVoiceRepository';
import { LivePreferencesRepository, defaultLivePreferences, type LiveAnswerMode, type LiveMode, type LivePreferences } from '../../storage/livePreferencesRepository';
import { tokens as t } from '../../theme/tokens';
import { useHumorPreferences } from '../humor/HumorPreferencesProvider';
import { useLearningSupport } from '../learning/LearningSupportProvider';
import { PronunciationCoach } from '../learning/PronunciationCoach';
import { usePreferences } from '../preferences/PreferencesProvider';
import { SpeechInput } from '../voice/SpeechInput';
import { SpeechButton } from '../voice/VoiceControls';
import { useVoice } from '../voice/VoiceProvider';
import { voiceController } from '../voice/service';

const voiceRepository = new LiveVoiceRepository(deviceStorage);
const preferencesRepository = new LivePreferencesRepository(deviceStorage);
const repositories = new Map<string, MissionRepository>();
const repositoryFor = (language: 'fr' | 'en') => {
  const lesson = liveLessonFor(language);
  if (!repositories.has(lesson.id)) repositories.set(lesson.id, new MissionRepository(deviceStorage, lesson));
  return repositories.get(lesson.id)!;
};
const INTENSITIES: { id: LiveIntensity; label: string; detail: string }[] = [
  { id: 'picante', label: 'Picante', detail: 'Groserías suaves y carrilla de confianza.' },
  { id: 'sin-pena', label: 'Sin pena', detail: 'Puteadas regionales fuertes y roast con filo.' },
  { id: 'sin-misericordia', label: 'Sin misericordia', detail: 'Lo más bruto del catálogo, siempre sobre tu práctica.' },
];
const MODES: { id: LiveMode; label: string; detail: string }[] = [
  { id: 'guided', label: 'Con ayuda', detail: 'Antes de responder ves qué te dijeron, qué significa, la frase que vas a practicar, cómo se pronuncia y su audio.' },
  { id: 'free', label: 'Con libertad', detail: 'Respondés con tus propias palabras, sin ver la frase modelo. La ayuda queda a un toque si la necesitás.' },
];
const ANSWERS: { id: LiveAnswerMode; label: string; detail: string }[] = [
  { id: 'spoken', label: 'Hablando (recomendado)', detail: 'Dictás, revisás la transcripción y la enviás vos. No se califica tu pronunciación.' },
  { id: 'written', label: 'Escribiendo', detail: 'Escribís tu respuesta, con pistas de vocabulario y ortografía. No cuenta como práctica oral.' },
];

/** Roast Me Live (RML-001, RML-002): turn-based role-play with a regional coach. Reviewed scenes, not open-ended AI. */
export function LiveScreen() {
  const router = useRouter();
  const profile = usePreferences();
  const humor = useHumorPreferences();
  const voice = useVoice();
  const support = useLearningSupport();
  const language = profile.preferences?.learningLanguage ?? 'fr';
  const coachLocale = (profile.preferences?.coachLocale ?? 'es-SV') as CoachLocale;
  const coach = coaches.find(item => item.locale === coachLocale)!;
  const lesson = liveLessonFor(language);
  const target = language === 'en' ? 'en-GB' : 'fr-FR';
  const languageName = language === 'en' ? 'inglés' : 'francés';
  const repository = repositoryFor(language);
  const [progress, setProgress] = useState<MissionProgress | null>(null);
  const [phase, setPhase] = useState<'setup' | 'session'>('setup');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [source, setSource] = useState<AnswerChannel | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpUsed, setHelpUsed] = useState(false);
  const [alternate, setAlternate] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);
  const [lastRaw, setLastRaw] = useState<{ run: number; event: number; text: string } | null>(null);
  const [voices, setVoices] = useState<LiveVoices>(emptyLiveVoices());
  const [practice, setPractice] = useState<LivePreferences>(defaultLivePreferences());
  const [voicePanel, setVoicePanel] = useState(false);
  const [humorPanel, setHumorPanel] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const mounted = useRef(true);
  const loadedFor = useRef<MissionRepository | null>(null);
  const replays = useRef(0);
  const settings = liveSettings(humor.settings);
  const adult = canRoast(humor.settings);
  const mode = practice.mode ?? 'guided';
  const guided = mode === 'guided';
  const spokenFirst = practice.answer === 'spoken';
  const choice = chooseCoachVoice(voice.state.voices, coachLocale, voice.state.allowNetworkVoices, voices.voices[coachLocale]);
  const coachVoice = choice.voice ? { language: choice.voice.language, voiceId: choice.voice.identifier } : { language: coachLocale };
  // A language switch briefly leaves the other lesson's progress in state until the new one loads.
  const session = progress?.lessonId === lesson.id ? progress : null;
  const view = session && phase === 'session' ? liveConversation(lesson, session, coachLocale, settings, liveLibrary, { revealModel: guided }) : null;

  useEffect(() => {
    mounted.current = true;
    // Load once per lesson repository (a re-run of this effect must not send a running session back to setup).
    if (loadedFor.current === repository) return () => { mounted.current = false; void voiceController.stop(); };
    loadedFor.current = repository;
    setLoading(true);
    void repository.load().then(saved => {
      if (!mounted.current) return;
      setProgress(saved);
      // Resume a conversation in progress; otherwise start from the mode selection.
      setPhase(saved && saved.status === 'active' && saved.events.length > 0 ? 'session' : 'setup');
    }).catch(() => { if (mounted.current) { setProgress(null); setPhase('setup'); setError('No pudimos reanudar tu conversación guardada (puede ser de una versión anterior de Roast Me Live). Empezá una nueva: tu entrenador, tus preferencias y tu consentimiento se conservan.'); } })
      .finally(() => { if (mounted.current) setLoading(false); });
    void voiceRepository.load().then(saved => { if (mounted.current) setVoices(saved); });
    void preferencesRepository.load().then(saved => { if (mounted.current) setPractice(saved); });
    return () => { mounted.current = false; void voiceController.stop(); };
  }, [repository]);

  /** Plays entries in order as ONE controller sequence: no overlap, cancelled by stop/navigation/revocation. */
  const speak = (entries: LiveEntry[], key: string) => {
    const segments = entries.flatMap(entry => liveSpeech(entry, target, coachVoice))
      .filter(segment => segment.voiceId || selectVoice(voice.state.voices, segment.language, voice.state.allowNetworkVoices));
    if (segments.length) void voiceController.playSequence(`live:${key}`, segments);
  };
  const resetTurn = () => { setDraft(''); setSource(null); setHelpOpen(false); setHelpUsed(false); setAlternate(false); setHintsOpen(false); };
  const persist = async (next: MissionProgress) => {
    setSaving(true); setError(null);
    try { await repository.save(next); if (mounted.current) setProgress(next); return true; }
    catch { if (mounted.current) setError('No pudimos guardar este paso. Tu respuesta sigue en el campo; reintentá.'); return false; }
    finally { if (mounted.current) setSaving(false); }
  };
  const begin = (next: MissionProgress) => {
    resetTurn(); setLastRaw(null); setRestartOpen(false); setSettingsOpen(false); setPhase('session');
    speak(liveConversation(lesson, next, coachLocale, settings, liveLibrary, { revealModel: guided }).entries, `${next.run}:start`);
  };
  /** Starts a new scene, or the untouched scene left by "Cambiar modalidad", so a restart never resumes the old conversation. */
  const start = async () => {
    if (!practice.mode) return;
    if (session && session.status === 'active' && session.events.length === 0) { begin(session); return; }
    setSaving(true); setError(null);
    try {
      const next = await repository.start();
      if (!mounted.current) return;
      setProgress(next); begin(next);
    } catch { setError('No pudimos empezar la conversación. Reintentá.'); }
    finally { if (mounted.current) setSaving(false); }
  };
  /** Same scene from its first turn, with a new run: messages of this practice are cleared, nothing else. */
  const restart = async (toSetup: boolean) => {
    if (!session) return;
    void voiceController.stop();
    const fresh = restartLiveScene(lesson, session);
    if (!await persist(fresh)) return;
    if (toSetup) { resetTurn(); setLastRaw(null); setRestartOpen(false); setPhase('setup'); return; }
    begin(fresh);
  };
  const send = async () => {
    const text = draft.trim();
    if (!session || !text || saving) return;
    const before = view?.entries.length ?? 0;
    const channel: AnswerChannel = source === 'spoken' ? 'spoken' : 'written';
    const next = submitAnswer(lesson, session, { kind: 'text', text }, guided || helpUsed ? 'assisted' : 'independent', channel);
    if (!await persist(next)) return;
    // The free text stays only in memory, to show it next to how it was understood; it is never saved.
    setLastRaw({ run: next.run, event: next.events.length - 1, text });
    const after = liveConversation(lesson, next, coachLocale, settings, liveLibrary, { revealModel: guided });
    if (next.feedback?.correct) resetTurn();
    speak(after.entries.slice(before), `${next.run}:${next.events.length}`);
  };
  const advance = async () => {
    if (!session || saving) return;
    const before = view?.entries.length ?? 0;
    const next = continueMission(lesson, session);
    if (!await persist(next)) return;
    speak(liveConversation(lesson, next, coachLocale, settings, liveLibrary, { revealModel: guided }).entries.slice(before), `${next.run}:${next.events.length}`);
  };
  const replay = () => {
    if (!view) return;
    const lastStudent = view.entries.map(entry => entry.role).lastIndexOf('student');
    replays.current += 1;
    speak(view.entries.slice(lastStudent >= 0 ? lastStudent + 1 : 0), `replay:${replays.current}`);
  };
  const savePractice = async (change: Partial<Omit<LivePreferences, 'version'>>) => {
    const next = { ...practice, ...change };
    setPractice(next);
    try { setPractice(await preferencesRepository.save(change, practice)); } catch { setError('No pudimos guardar esa preferencia en este dispositivo; se usa solo en esta sesión.'); }
  };
  const saveHumor = (change: Partial<NonNullable<typeof humor.settings>>) => { if (humor.settings) void humor.save({ ...humor.settings, ...change }); };
  const revoke = () => { voiceController.restrict(); if (humor.settings) void humor.save(disableAdult(humor.settings)); };
  const chooseVoice = async (id: string) => { setVoices(await voiceRepository.choose(voices, coachLocale, id)); };
  const editDraft = (value: string) => { setDraft(value); if (!value.trim()) setSource(null); else if (source === null) setSource('written'); };

  if (loading || profile.loading || humor.loading) return <Page><Copy>Preparando Roast Me Live…</Copy></Page>;
  const current = view?.current ?? null;
  const model = current ? current.correction.split(' / ')[0]!.trim() : '';
  const guide = model ? pronunciationFor(model, language) : null;
  const speaking = voice.state.status === 'speaking' || voice.state.status === 'starting';
  const pedagogy = support.data ? pedagogicalMode(support.data.languages[language]) : 'starter';
  const intensity = INTENSITIES.find(item => item.id === (humor.settings?.live?.intensity ?? 'picante'))!;
  const summary = view?.completed && session ? liveSummary(lesson, session) : null;
  const showSpeech = spokenFirst !== alternate;
  const showTyping = !showSpeech || draft.length > 0 || alternate;
  const askedBy = current ? view?.entries.filter(entry => entry.role === 'partner').at(-1) : undefined;

  const practicePanel = <View style={s.section}>
    <Text accessibilityRole="header" style={s.step}>Modalidad</Text>
    <View accessibilityRole="radiogroup" accessibilityLabel="Modalidad de aprendizaje" style={s.section}>
      {MODES.map(item => <Pressable key={item.id} accessibilityRole="radio" accessibilityLabel={`Modalidad ${item.label}: ${item.detail}`} accessibilityState={{ checked: practice.mode === item.id }} onPress={() => { void savePractice({ mode: item.id }); }} style={[s.option, practice.mode === item.id && s.chipOn]}>
        <Text style={s.chipText}>{item.label}</Text><Text style={s.note}>{item.detail}</Text>
      </Pressable>)}
    </View>
    <Text accessibilityRole="header" style={s.step}>Cómo vas a responder</Text>
    <View accessibilityRole="radiogroup" accessibilityLabel="Forma de responder" style={s.section}>
      {ANSWERS.map(item => <Pressable key={item.id} accessibilityRole="radio" accessibilityLabel={`Responder ${item.label}: ${item.detail}`} accessibilityState={{ checked: practice.answer === item.id }} onPress={() => { setAlternate(false); void savePractice({ answer: item.id }); }} style={[s.option, practice.answer === item.id && s.chipOn]}>
        <Text style={s.chipText}>{item.label}</Text><Text style={s.note}>{item.detail}</Text>
      </Pressable>)}
    </View>
  </View>;

  const profilePanel = <>
    <View accessibilityRole="radiogroup" accessibilityLabel="Entrenador" style={s.coaches}>
      {coaches.map(item => <Pressable key={item.locale} accessibilityRole="radio" accessibilityState={{ checked: item.locale === coachLocale, disabled: profile.saving }} disabled={profile.saving} onPress={() => { void voiceController.stop(); void profile.save({ coachLocale: item.locale }); }} style={[s.coach, item.locale === coachLocale && s.coachOn]}>
        <CharacterPortrait name={item.name} size={40} /><Text style={s.coachName}>{item.name}</Text>
      </Pressable>)}
    </View>
    <View accessibilityRole="radiogroup" accessibilityLabel="Idioma de la conversación" style={s.row}>
      {(['fr', 'en'] as const).map(id => <Pressable key={id} accessibilityRole="radio" accessibilityState={{ checked: language === id, disabled: profile.saving }} disabled={profile.saving} onPress={() => { void voiceController.stop(); void profile.save({ learningLanguage: id }); }} style={[s.chip, language === id && s.chipOn]}><Text style={s.chipText}>{id === 'fr' ? 'Francés' : 'Inglés'}</Text></Pressable>)}
    </View>
    <View style={s.panel}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: humorPanel }} onPress={() => setHumorPanel(!humorPanel)} style={s.toggle}>
        <Text style={s.toggleText}>Humor: {adult ? intensity.label + (settings.doubleMeaning ? ' · con doble sentido' : '') : 'amistoso, sin groserías'}</Text>
      </Pressable>
      {humorPanel ? adult ? <View style={s.section}>
        <View accessibilityRole="radiogroup" accessibilityLabel="Intensidad del humor adulto" style={s.section}>
          {INTENSITIES.map(item => <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked: intensity.id === item.id, disabled: humor.saving }} disabled={humor.saving} onPress={() => saveHumor({ live: { intensity: item.id, doubleMeaning: humor.settings?.live?.doubleMeaning ?? false } })} style={[s.option, intensity.id === item.id && s.chipOn]}>
            <Text style={s.chipText}>{item.label}</Text><Text style={s.note}>{item.detail}</Text>
          </Pressable>)}
        </View>
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: settings.doubleMeaning, disabled: humor.saving }} disabled={humor.saving} onPress={() => saveHumor({ live: { intensity: intensity.id, doubleMeaning: !settings.doubleMeaning } })} style={s.option}>
          <Text style={s.chipText}>{settings.doubleMeaning ? '☑' : '☐'} Picardía y doble sentido (albures)</Text>
          <Text style={s.note}>Solo cuando la escena da pie. Podés apagarlo cuando quieras.</Text>
        </Pressable>
        <Button variant="secondary" label="Volver a modo amistoso (revocar consentimiento adulto)" disabled={humor.saving} onPress={revoke} />
      </View> : <View style={s.section}>
        <Copy>Ahora {coach.name} usa humor limpio. Las puteadas, el roast fuerte y el doble sentido son solo para adultos que lo eligen.</Copy>
        <Button variant="secondary" label="Activar humor adulto (Roast Me)" onPress={() => router.push('/roast')} />
      </View> : null}
    </View>
    <View style={s.panel}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: voicePanel }} onPress={() => setVoicePanel(!voicePanel)} style={s.toggle}>
        <Text style={s.toggleText}>Voz de {coach.name}: {choice.voice ? choice.voice.name : 'sin voz en español'}</Text>
      </Pressable>
      <Text style={s.note}>{choice.notice}</Text>
      {voicePanel ? <View accessibilityRole="radiogroup" accessibilityLabel={`Voz de ${coach.name}`} style={s.section}>
        {choice.ranked.slice(0, 8).map(item => <View key={item.voice.identifier} style={s.voiceRow}>
          <Pressable accessibilityRole="radio" accessibilityState={{ checked: choice.voice?.identifier === item.voice.identifier }} onPress={() => { void chooseVoice(item.voice.identifier); }} style={[s.option, choice.voice?.identifier === item.voice.identifier && s.chipOn]}>
            <Text style={s.chipText}>{item.voice.name}</Text>
            <Text style={s.note}>{item.voice.language} · {item.gender === 'male' ? 'masculina probable (por el nombre)' : item.gender === 'female' ? 'femenina probable' : 'género desconocido'}{item.voice.local === false ? ' · con Internet' : ''}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`Probar la voz ${item.voice.name}`} onPress={() => { void voiceController.playSequence('live:voice-test', [{ text: `Hola, soy ${coach.name}. ${coach.introduction}`, language: item.voice.language, voiceId: item.voice.identifier }]); }} style={s.small}><Text style={s.toggleText}>Probar</Text></Pressable>
        </View>)}
        {choice.ranked.length ? null : <Copy>No hay voces en español en este dispositivo o navegador.</Copy>}
      </View> : null}
    </View>
    {voice.state.muted ? <Button variant="secondary" label="Activar audio" disabled={voice.saving} onPress={() => { void voice.toggleMute(); }} /> : null}
  </>;

  if (!view) return <Page compact>
    <Button variant="text" label="Volver al inicio" onPress={() => router.replace('/')} />
    <View style={s.hero}>
      <Text style={s.kicker}>ROAST ME LIVE · {languageName.toUpperCase()}</Text>
      <Text accessibilityRole="header" style={s.title}>Conversá con {coach.name}</Text>
      <Text style={s.lead}>Escenas habladas por turnos: {coach.name} arma la situación, vos respondés y la conversación sigue según lo que digas. Entiende respuestas con tus propias palabras dentro de cada escena; no es una IA de charla libre.</Text>
    </View>
    {error ? <Notice message={error} /> : null}
    {practicePanel}
    {profilePanel}
    <Copy>{coach.name} te habla en {languageName}. Podés pedir ayuda, repetir el audio y reiniciar la práctica cuando quieras. LingoVerse no guarda grabaciones ni el texto libre que escribas.</Copy>
    <Button label={saving ? 'Preparando…' : practice.mode ? 'Empezar conversación' : 'Elegí una modalidad para empezar'} disabled={saving || !practice.mode} onPress={() => { void start(); }} />
  </Page>;

  return <Page compact>
    <Button variant="text" label="Volver al inicio" onPress={() => router.replace('/')} />
    <View style={s.bar}>
      <CharacterPortrait name={coach.name} size={44} />
      <View style={s.barText}>
        <Text accessibilityRole="header" style={s.barTitle}>{coach.name} · Roast Me Live</Text>
        <Text style={s.note}>{guided ? 'Con ayuda' : 'Con libertad'} · {spokenFirst ? 'Hablando' : 'Escribiendo'} · {languageName} · {adult ? intensity.label : 'humor amistoso'}</Text>
      </View>
    </View>
    <View style={s.row}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: restartOpen }} accessibilityLabel="Reiniciar práctica" onPress={() => { setRestartOpen(!restartOpen); setSettingsOpen(false); }} style={s.pill}><Text style={s.toggleText}>↺ Reiniciar práctica</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: settingsOpen }} accessibilityLabel={settingsOpen ? 'Cerrar ajustes de Roast Me Live' : 'Ajustes de Roast Me Live: modalidad, entrenador, idioma, humor y voz'} onPress={() => { setSettingsOpen(!settingsOpen); setRestartOpen(false); }} style={s.pill}><Text style={s.toggleText}>{settingsOpen ? 'Cerrar ajustes' : 'Ajustes'}</Text></Pressable>
    </View>
    {restartOpen ? <View accessibilityRole="alert" style={s.confirm}>
      <Text style={s.chipText}>¿Reiniciar esta práctica?</Text>
      <Copy>{session && session.events.length > 0 && !view.completed ? 'Se borran los mensajes y las respuestas de esta conversación y la escena vuelve al primer turno.' : 'La escena vuelve al primer turno.'} Tu entrenador, tus preferencias, tu consentimiento y tus aventuras no cambian.</Copy>
      <Button label="Reiniciar esta escena" disabled={saving} onPress={() => { void restart(false); }} />
      <Button variant="secondary" label="Reiniciar y elegir modalidad" disabled={saving} onPress={() => { void restart(true); }} />
      <Button variant="text" label="Cancelar" onPress={() => setRestartOpen(false)} />
    </View> : null}
    {settingsOpen ? <>{practicePanel}{profilePanel}</> : null}
    {!settingsOpen && voice.state.muted ? <Button variant="secondary" label="Activar audio" disabled={voice.saving} onPress={() => { void voice.toggleMute(); }} /> : null}
    {error ? <Notice message={error} /> : null}

    <View accessibilityLiveRegion="polite" style={s.status}>
      <Text style={s.statusText}>{speaking ? '🔊 Hablando…' : saving ? 'Procesando…' : view.completed ? 'Conversación terminada' : view.awaitingContinue ? 'Listo para seguir' : 'Tu turno'}</Text>
      {speaking ? <Pressable accessibilityRole="button" accessibilityLabel="Detener audio" onPress={() => { void voiceController.stop(); }} style={s.small}><Text style={s.toggleText}>Detener</Text></Pressable>
        : <Pressable accessibilityRole="button" accessibilityLabel="Repetir lo último que se dijo" onPress={replay} style={s.small}><Text style={s.toggleText}>Repetir</Text></Pressable>}
    </View>
    <View style={s.thread}>{view.entries.map(entry => <Entry key={entry.id} entry={entry} coachName={coach.name} target={target} raw={entry.role === 'student' && lastRaw && session && lastRaw.run === session.run && lastRaw.event === entry.event ? lastRaw.text : null} />)}</View>

    {current && !view.awaitingContinue ? <KeyboardAnswerGroup compact>
      <Text style={s.goal}>Tu objetivo: {current.instruction}</Text>
      {guided || helpOpen ? <View style={s.help}>
        <Text style={s.kicker2}>{guided ? 'ANTES DE RESPONDER' : 'AYUDA'}</Text>
        {askedBy && askedBy.role === 'partner' ? <Copy>{askedBy.speaker} te dijo «{askedBy.text}»{askedBy.translation ? `, que significa: ${askedBy.translation}` : ''}</Copy> : null}
        <Text style={s.note}>Frase para practicar</Text>
        <Text style={s.model}>{model}</Text>
        <SpeechButton text={model} language={target} label="la frase para practicar" />
        <PronunciationCoach guide={guide} text={model} language={target} mode={pedagogy} onHelp={() => setHelpUsed(true)} compact />
        <Copy>{current.teaching}</Copy>
        <Text style={s.note}>{showSpeech ? 'Ahora decila con el micrófono; si no funciona, podés escribirla.' : 'Ahora escribila con tus palabras o usá esta frase.'}</Text>
        {showSpeech ? null : <Button variant="text" label="Usar esta frase en mi borrador" onPress={() => { setDraft(model); setSource('written'); setHelpUsed(true); }} />}
      </View> : null}
      {showSpeech ? <SpeechInput key={`${session?.run}:${current.id}:${session?.events.length}`} language={target} disabled={saving} inspect={(text, evidence) => inspectTranscript(current, text, target, evidence)} onUse={text => { setDraft(text); setSource('spoken'); return true; }} /> : null}
      {showTyping ? <>
        {showSpeech ? <Text style={s.note}>{source === 'spoken' ? 'Revisá la transcripción: podés corregirla antes de enviarla.' : 'Escribí tu respuesta.'}</Text> : null}
        <AnswerTextInput accessibilityLabel={`Tu respuesta en ${languageName}`} value={draft} onChangeText={editDraft} editable={!saving} maxLength={400} multiline autoCorrect={false} style={s.input} placeholder={showSpeech ? `Transcripción o respuesta en ${languageName}…` : `Escribí en ${languageName}…`} placeholderTextColor={t.color.muted} />
      </> : null}
      <Button label={saving ? 'Guardando…' : 'Enviar respuesta'} disabled={!draft.trim() || saving} onPress={() => { void send(); }} />
      <View style={s.row}>
        {guided ? null : <Pressable accessibilityRole="button" accessibilityState={{ expanded: helpOpen }} onPress={() => { setHelpOpen(!helpOpen); setHelpUsed(true); }} style={s.toggle}><Text style={s.toggleText}>{helpOpen ? 'Cerrar ayuda' : '¿Qué digo? Ver ayuda'}</Text></Pressable>}
        <Pressable accessibilityRole="button" onPress={() => setAlternate(!alternate)} style={s.toggle}><Text style={s.toggleText}>{showSpeech ? (spokenFirst ? 'Prefiero escribir esta vez' : 'Volver a escribir') : 'Responder hablando'}</Text></Pressable>
      </View>
      {!guided && !helpOpen && !showSpeech ? <Pressable accessibilityRole='button' accessibilityState={{ expanded: hintsOpen }} onPress={() => { setHintsOpen(!hintsOpen); setHelpUsed(true); }} style={s.toggle}><Text style={s.toggleText}>{hintsOpen ? 'Ocultar pistas' : 'Pistas de vocabulario y ortografía'}</Text></Pressable> : null}
      {!guided && !helpOpen && !showSpeech && hintsOpen ? <View style={s.help}><Copy>{current.teaching}</Copy><Text style={s.note}>Ortografía: las tildes y los apóstrofos cuentan (café, s’il vous plaît, I’m). Mayúsculas y puntuación no importan.</Text></View> : null}
    </KeyboardAnswerGroup> : null}
    {view.awaitingContinue ? <Button label="Seguir la conversación" disabled={saving} onPress={() => { void advance(); }} /> : null}
    {summary ? <View style={s.section}>
      <Text accessibilityRole="header" style={s.step}>Resumen de esta escena</Text>
      <Copy>{summary.practised} de {summary.turns} turnos con la forma que se practica{summary.understood ? ` · ${summary.understood} con otra forma que se entendió` : ''}{summary.assisted ? ` · ${summary.assisted} con ayuda visible` : ''}{summary.errors ? ` · ${summary.errors} ${summary.errors === 1 ? 'error corregido' : 'errores corregidos'}` : ''}.</Copy>
      <Copy>Respuestas habladas: {summary.spoken} · escritas: {summary.written}. El dictado no evalúa tu pronunciación y esto no certifica nivel: es práctica guiada.</Copy>
      <Button label="Otra conversación" disabled={saving} onPress={() => { void start(); }} />
      <Button variant="secondary" label="Repetir esta escena" disabled={saving} onPress={() => { void restart(false); }} />
    </View> : null}
  </Page>;
}

function Entry({ entry, coachName, target, raw }: { entry: LiveEntry; coachName: string; target: 'fr-FR' | 'en-GB'; raw: string | null }) {
  if (entry.role === 'setup') return <View style={s.setup}><Text style={s.kicker}>ESCENA</Text><Text style={s.setupText}>{entry.text}</Text></View>;
  if (entry.role === 'partner') return <View style={s.partner}><Text style={s.speaker}>{entry.speaker}</Text><Text style={s.partnerText}>{entry.text}</Text>{entry.translation ? <Text style={s.note}>{entry.translation}</Text> : null}<SpeechButton text={entry.text} language={target} label={`a ${entry.speaker}`} /></View>;
  if (entry.role === 'student') {
    const how = entry.channel === 'spoken' ? 'Dijiste' : 'Escribiste';
    return <View style={s.student}>
      <Text style={s.speaker}>VOS{entry.channel === 'spoken' ? ' · HABLADO' : entry.channel === 'written' ? ' · ESCRITO' : ''}</Text>
      {raw && entry.shown !== 'exact' ? <Text style={s.studentText}>{how}: {raw}</Text> : null}
      {entry.shown === 'exact' ? <Text style={s.studentText}>{entry.text}</Text> : entry.shown === 'interpreted' ? <Text style={entry.outcome === 'ambiguous' ? s.note : s.studentText}>{entry.outcome === 'ambiguous' ? 'Entendí solo una parte; hace falta aclarar.' : `Entendí: ${entry.text}`}</Text> : <Text style={s.note}>{raw ? 'Todavía no pude interpretarla en esta escena (no se guarda).' : entry.text}</Text>}
    </View>;
  }
  const { line, teaching } = entry.turn;
  return <View style={[s.coachBubble, line.level > 0 && s.adult]}>
    <Text style={s.speaker}>{coachName}</Text>
    {line.laugh ? <Text accessibilityLabel={line.laugh === 'carcajada' ? 'se ríe a carcajadas' : 'se ríe'} style={s.laugh}>{line.laugh === 'carcajada' ? 'JAJAJAJA' : 'jaja'}</Text> : null}
    <Text style={s.coachText}>{line.text}</Text>
    {teaching ? <View style={s.teaching}><Text style={s.note}>{teaching.explanation}</Text>{teaching.model ? <><Text style={s.kicker}>ASÍ SE DICE</Text><Text style={s.model}>{teaching.model}</Text><SpeechButton text={teaching.model} language={target} label="la frase modelo" /></> : <Text style={s.note}>La frase modelo está en «¿Qué digo? Ver ayuda».</Text>}</View> : null}
  </View>;
}

const s = StyleSheet.create({
  hero: { gap: 6, padding: 18, borderRadius: 22, backgroundColor: t.color.night },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 18, backgroundColor: t.color.white, borderWidth: 1, borderColor: t.color.line },
  barText: { flex: 1, gap: 2 },
  barTitle: { color: t.color.ink, fontSize: 16, fontWeight: '800' },
  kicker: { color: '#F0C987', fontSize: 11, letterSpacing: 1.5, fontWeight: '800' },
  kicker2: { color: t.color.teal, fontSize: 11, letterSpacing: 1.5, fontWeight: '800' },
  title: { color: '#FFFFFF', fontSize: 26, lineHeight: 32, fontWeight: '700' },
  lead: { color: '#CCDEE5', fontSize: 15, lineHeight: 22 },
  step: { color: t.color.ink, fontSize: 17, fontWeight: '800' },
  coaches: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  coach: { alignItems: 'center', gap: 4, padding: 8, minWidth: 72, minHeight: 44, borderRadius: 14, borderWidth: 1, borderColor: t.color.line, backgroundColor: t.color.white },
  coachOn: { borderColor: t.color.teal, borderWidth: 2, backgroundColor: t.color.tint },
  coachName: { color: t.color.ink, fontSize: 13, fontWeight: '700' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: t.color.line, backgroundColor: t.color.white },
  chipOn: { borderColor: t.color.teal, backgroundColor: t.color.tint },
  chipText: { color: t.color.ink, fontSize: 15, fontWeight: '700' },
  pill: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 22, borderWidth: 1, borderColor: t.color.line, backgroundColor: t.color.white },
  panel: { gap: 8, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: t.color.line, backgroundColor: t.color.white },
  confirm: { gap: 10, padding: 14, borderRadius: 16, borderWidth: 2, borderColor: '#C98A2B', backgroundColor: '#FFF8EC' },
  section: { gap: 10 },
  option: { gap: 2, padding: 12, minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: t.color.line, flexShrink: 1, backgroundColor: t.color.white },
  toggle: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  toggleText: { color: t.color.teal, fontSize: 15, fontWeight: '700' },
  note: { color: t.color.muted, fontSize: 13, lineHeight: 20 },
  goal: { color: t.color.ink, fontSize: 14, lineHeight: 20, fontWeight: '700' },
  voiceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  small: { minHeight: 44, minWidth: 44, justifyContent: 'center', paddingHorizontal: 10 },
  status: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: 10, borderRadius: 12, backgroundColor: t.color.tint },
  statusText: { color: t.color.ink, fontSize: 14, fontWeight: '700', flexShrink: 1 },
  thread: { gap: 10 },
  setup: { gap: 4, padding: 12, borderRadius: 14, backgroundColor: '#EEF3F5' },
  setupText: { color: t.color.ink, fontSize: 15, lineHeight: 22, fontStyle: 'italic' },
  partner: { gap: 4, padding: 14, borderRadius: 18, backgroundColor: t.color.white, borderWidth: 1, borderColor: t.color.line, marginRight: 24 },
  partnerText: { color: t.color.ink, fontSize: 19, lineHeight: 27, fontWeight: '600' },
  speaker: { color: t.color.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  student: { gap: 4, padding: 12, borderRadius: 18, backgroundColor: t.color.tint, marginLeft: 32 },
  studentText: { color: t.color.ink, fontSize: 17, lineHeight: 25 },
  coachBubble: { gap: 6, padding: 14, borderRadius: 18, backgroundColor: '#FFF8EC', borderLeftWidth: 4, borderLeftColor: '#C98A2B' },
  adult: { backgroundColor: '#FDEFEA', borderLeftColor: '#A3402B' },
  laugh: { color: '#A3402B', fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  coachText: { color: t.color.ink, fontSize: 17, lineHeight: 25 },
  teaching: { gap: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#EAD9BF' },
  model: { color: t.color.ink, fontSize: 19, lineHeight: 27, fontWeight: '700' },
  input: { minHeight: 72, padding: 14, backgroundColor: t.color.white, color: t.color.ink, borderWidth: 2, borderColor: t.color.teal, borderRadius: 16, fontSize: 17 },
  help: { gap: 10, padding: 14, borderRadius: 16, backgroundColor: '#E8F1F1' },
});
