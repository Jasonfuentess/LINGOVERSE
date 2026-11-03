import { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { Button, Card, Copy, Heading, Loading, Notice, Page } from '../../components/ui';
import { cafeLessonForProgress } from '../../content/cafe';
import { currentExercise } from '../../domain/learning/engine';
import { usePreferences } from '../preferences/PreferencesProvider';
import { ExerciseView } from './ExerciseView';
import { useMission } from './MissionProvider';
import { CoachReaction } from '../humor/CoachReaction';
import { roastLessonForProgress } from '../../content/roast';
import { londonLesson, londonLessonForProgress } from '../../content/london';
import { rendezvousLessonForProgress } from '../../content/rendezvous';
import { useHumorPreferences } from '../humor/HumorPreferencesProvider';
import { disableAdult } from '../../domain/humor/preferences';
import { CafeScene, ConversationBridge, ConversationHistory } from './Conversation';
import { conversationPresentation, latestConversationBeat } from '../../domain/conversation/presentation';
import { canRoast } from '../../domain/humor/access';
import { TurnEntrance } from '../../components/AdventureArt';
import { ChapterReview } from './ChapterReview';
import { VoiceToolbar } from '../voice/VoiceControls';
import { useLearningSupport } from './LearningSupportProvider';
import { SupportSelector } from './BeginnerPreparation';
import { learningRescue } from '../../content/rescue';
import { pedagogicalMode } from '../../domain/learning/support';
import { practiceEvidence } from '../../domain/learning/evidence';

export function MissionScreen({ language = 'fr', adventure = 'cafe' }: { language?: 'fr' | 'en'; adventure?: 'cafe' | 'rendezvous' }) {
  const preferences = usePreferences();
  const english = language === 'en';
  const rendezvous = !english && adventure === 'rendezvous';
  const state = useMission(language, adventure);
  const humor = useHumorPreferences();
  const router = useRouter();
  const [confirmRestart, setConfirmRestart] = useState(false);
  const support = useLearningSupport();
  if (preferences.loading || state.loading || (state.mode !== 'roast' && support.loading)) return <Loading />;
  if (!preferences.preferences) return <Page><Notice message={preferences.error ?? 'No pudimos leer las preferencias.'} /><Button label="Volver al inicio" onPress={() => router.replace('/')} /></Page>;
  if (!preferences.preferences.onboardingCompleted) return <Redirect href="/onboarding" />;
  const progress = state.progress;
  const lesson = state.mode === 'roast' ? roastLessonForProgress(progress) : english ? londonLessonForProgress(progress) : rendezvous ? rendezvousLessonForProgress(progress) : cafeLessonForProgress(progress);
  const variant = lesson.variants.find(item => item.id === progress?.variantId);
  const errors = progress?.events.filter(event => event.type === 'answer').length ?? 0;
  const submittedAnswer = progress?.events.filter(event => event.type === 'answer').at(-1)?.answer;
  const conversational = state.mode !== 'roast';
  const presentation = progress && !state.loadError && conversational ? conversationPresentation(lesson, progress) : null;
  const active = progress?.status === 'active' && !state.loadError ? currentExercise(lesson, progress) : null;
  const supportEntry = support.data?.languages[language];
  const rescue = active && conversational ? learningRescue(language, adventure, active) : null;
  const evidence = progress && !state.loadError ? practiceEvidence(lesson,progress) : null;
  const adventureRoastActive=Boolean(humor.settings?.enabled&&humor.settings.adventureRoast&&canRoast(humor.settings));
  // During an active turn the optional adult-humour setup is secondary: it moves below the conversation
  // so the character's line is visible without scrolling. Consent rules are unchanged.
  const inTurn = conversational && progress?.status === 'active' && !state.loadError;
  const roastSetup = conversational && !humor.loading && !canRoast(humor.settings) ? <><Button variant="text" label="Configurar estilo Roast Me (adultos)" onPress={()=>router.push('/roast')} /><Copy>Es opcional. Requiere consentimiento en Roast Me; al volver a esta aventura podés activar el estilo.</Copy></> : null;
  return <Page compact={conversational}>{!conversational && <Copy>PARÍS / CAFETERÍA · FRANCÉS A1</Copy>}
    {state.mode === 'roast' && <><Heading>Roast Me · Sin Pena</Heading><Copy>Humor adulto consentido. Podés salir, detener la voz o revocar en cualquier momento.</Copy><Button variant="secondary" label="Revocar consentimiento y salir de Roast Me" disabled={humor.saving} onPress={() => { if (humor.settings) void humor.save(disableAdult(humor.settings)); }} /></>}
    {!conversational && <Button variant="secondary" label="Volver a Explorar" disabled={state.saving} onPress={() => router.replace('/explore')} />}
    <VoiceToolbar language={english ? 'en-GB' : 'fr-FR'} leading={conversational ? <Button variant="text" label="Volver a Explorar" disabled={state.saving} onPress={() => router.replace('/explore')} /> : undefined} />
    {conversational && supportEntry && <SupportSelector key={progress?'active':'intro'} entry={supportEntry} disabled={support.saving || state.saving} initiallyOpen={!progress} onChange={(stage, mode) => { void support.change(language, { stage, mode }); }} />}
    {conversational && support.error && <><Notice message={support.error} /><Button variant="text" label="Reintentar ayuda de aprendizaje" disabled={support.saving} onPress={() => { void support.reload(); }} /></>}
    {english && active?.id === 'greet' && progress && progress.contentVersion < londonLesson.version && <Copy>Este recorrido conserva su contenido inglés v{progress.contentVersion}. Una partida nueva usa v{londonLesson.version}, con respuestas iniciales más completas. Tu avance actual se mantiene.</Copy>}
    {conversational && !state.loadError && <CafeScene language={language} adventure={rendezvous ? 'rendezvous' : 'cafe'} variantId={variant?.id} total={lesson.objectives.length} title={variant?.title ?? lesson.title} speaker={active?.speaker ?? variant?.exercises[0]?.speaker ?? 'Tu guía'} scene={active?.scene ?? (progress?.status === 'completed' ? 'La aventura terminó. Podés revisar lo que dijiste y los caminos que recorriste.' : english ? 'Llegaste a Londres y necesitás encontrar tu destino.' : rendezvous ? 'Tenés un encuentro en París y necesitás encontrar a tu amistad.' : 'Una mesa, una bebida y tu primera conversación en francés.')} completed={progress?.completedObjectives.length ?? 0} />}
    {conversational && humor.error && <><Notice message={humor.error} /><Button variant="secondary" label="Reintentar lectura de consentimiento" onPress={humor.reload} />{humor.settings && !humor.settings.adult.enabled && <Button variant="secondary" label="Reintentar guardar revocación" disabled={humor.saving} onPress={() => { if (humor.settings) void humor.save(disableAdult(humor.settings)); }} />}</>}
    {!inTurn && roastSetup}
    {conversational && !humor.loading && canRoast(humor.settings) && <>
      <Button variant="secondary" label={adventureRoastActive ? 'Estilo Roast Me activo · Volver al humor normal' : 'Usar estilo Roast Me en esta aventura'} disabled={humor.saving || state.saving} onPress={() => { if (humor.settings) void humor.save({ ...humor.settings, adventureRoast: !adventureRoastActive, ...(!adventureRoastActive?{enabled:true}:{}) }); }} />
      {adventureRoastActive && <><Copy>Humor adulto consentido. El estilo se aplica a las próximas reacciones; la práctica oral y las respuestas inciertas no generan burlas de aventura.</Copy><Button variant="secondary" label="Revocar consentimiento adulto" disabled={humor.saving} onPress={() => { if (humor.settings) void humor.save(disableAdult(humor.settings)); }} /></>}
    </>}
    {state.loadError ? <><Heading>Tu avance necesita revisión</Heading><Notice message={state.loadError} /><Button label="Reintentar lectura" disabled={state.saving} onPress={state.reload} /></> : !progress ? <>
      <Heading>{lesson.title}</Heading><Copy>{english ? 'Acabás de llegar a Londres. Saludá, pedí ayuda, preguntá dónde queda tu destino y tomá decisiones que cambian a quién conocés en el camino.' : rendezvous ? 'Quedaste en encontrarte con una amistad en París. Confirmá el encuentro, pedí ayuda, seguí indicaciones y decidí qué hacer después. Dos relatos y caminos distintos.' : 'Aprendé a saludar, pedir café o té, responder preguntas, preguntar el precio y despedirte. Vas a leer expresiones útiles antes de usarlas.'}</Copy>
      <Card><Copy>{lesson.objectives.length} interacciones · Sin tiempo límite · Conversación con opciones y texto</Copy><Copy>En Desde cero aprendés cómo responder en cada turno. En A1 y Autónomo podés abrir la misma preparación cuando la necesités. El micrófono es opcional y podés continuar usando un modelo con ayuda.</Copy><Copy>Tu avance se guarda en este dispositivo.</Copy></Card>
      <Button label={state.saving ? 'Guardando…' : 'Comenzar aventura'} disabled={state.saving} onPress={() => { void state.start(); }} />
    </> : progress.status === 'completed' ? <>
      <Heading>{english ? '¡Encontraste tu destino!' : rendezvous ? '¡Encontraste a tu amistad!' : '¡Tu pedido está listo!'}</Heading><Copy>Completaste las {lesson.objectives.length} interacciones de {variant?.title}. {english ? 'Pediste ayuda, seguiste una ruta y terminaste la aventura en inglés.' : rendezvous ? 'Confirmaste tu encuentro, escuchaste indicaciones, elegiste un camino y llegaste a tiempo.' : 'Elegiste respuestas para saludar, pedir y cerrar una conversación.'}</Copy>
      <Card><Copy>{lesson.objectives.length}/{lesson.objectives.length} pasos completados</Copy><Copy>Respuestas enviadas: {errors}. Errores de respuesta confirmados: {evidence?.confirmedErrors??0}.</Copy><Copy>Objetivos con ayuda: {evidence?.assisted??0}. Resueltos sin modelo adicional: {evidence?.independent??0}. Sin registro de ayuda (partidas anteriores): {evidence?.unrecorded??0}.</Copy><Copy>Es progreso de una práctica guiada, no dominio de habilidades, puntuación de pronunciación ni certificación CEFR.</Copy></Card>
      {conversational && presentation && <ChapterReview language={language} adventure={rendezvous ? 'rendezvous' : 'cafe'} turns={presentation.history} />}
    </> : <>
      {!conversational && <Copy>{variant?.title} · {progress.completedObjectives.length}/{lesson.objectives.length} pasos completados</Copy>}
      {conversational && presentation && <ConversationBridge beat={latestConversationBeat(presentation.history)} language={english ? 'en-GB' : 'fr-FR'} />}
      <TurnEntrance key={`${progress.run}:${progress.nodeId}`}><ExerciseView language={language} adventure={adventure} conversational={conversational} rescue={rescue?{plan:rescue,mode:supportEntry?pedagogicalMode(supportEntry):'starter'}:undefined} exercise={currentExercise(lesson, progress)} feedback={progress.feedback} submittedAnswer={submittedAnswer} saving={state.saving} error={state.saveError} onAnswer={state.answer} onContinue={state.advance} /></TurnEntrance>
    </>}
    {!state.loadError && progress?.status === 'completed' && <CoachReaction language={language} adventure={adventure} />}
    {presentation && <ConversationHistory key={`${lesson.id}:${progress!.run}`} language={english ? 'en-GB' : 'fr-FR'} turns={presentation.history} />}
    {inTurn && roastSetup}
    {(!progress || progress.status === 'completed' || state.loadError) && state.saveError && <Notice message={state.saveError} />}
    {(progress || state.loadError) && (confirmRestart ? <Card><Heading>¿Empezar otro recorrido?</Heading><Copy>Se reemplazará el recorrido actual. Se conserva un resumen local de variantes vistas y errores detectados para orientar la variedad, además de tus preferencias. Si el registro actual está dañado, será reemplazado.</Copy>
      <Button label={state.saving ? 'Guardando…' : 'Confirmar reinicio'} disabled={state.saving} onPress={() => { void state.start().then(saved => { if (saved) setConfirmRestart(false); }); }} />
      <Button variant="secondary" label="Conservar mi avance" disabled={state.saving} onPress={() => setConfirmRestart(false)} />
    </Card> : <Button variant="text" label="Reiniciar aventura" disabled={state.saving} onPress={() => setConfirmRestart(true)} />)}
  </Page>;
}
