import { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { Button, Card, Copy, Heading, Loading, Notice, Page } from '../../components/ui';
import { cafeLessonForProgress } from '../../content/cafe';
import { currentExercise } from '../../domain/learning/engine';
import { usePreferences } from '../preferences/PreferencesProvider';
import { ExerciseView } from './ExerciseView';
import { useMission } from './MissionProvider';

export function MissionScreen() {
  const preferences = usePreferences();
  const state = useMission();
  const router = useRouter();
  const [confirmRestart, setConfirmRestart] = useState(false);
  if (preferences.loading || state.loading) return <Loading />;
  if (!preferences.preferences) return <Page><Notice message={preferences.error ?? 'No pudimos leer las preferencias.'} /><Button label="Volver al inicio" onPress={() => router.replace('/')} /></Page>;
  if (!preferences.preferences.onboardingCompleted) return <Redirect href="/onboarding" />;
  const progress = state.progress;
  const cafeLesson = cafeLessonForProgress(progress);
  const variant = cafeLesson.variants.find(item => item.id === progress?.variantId);
  const errors = progress?.events.filter(event => event.type === 'answer').length ?? 0;
  const submittedAnswer = progress?.events.filter(event => event.type === 'answer').at(-1)?.answer;
  return <Page><Copy>PARÍS / CAFETERÍA · FRANCÉS A1</Copy>
    <Button label="Volver a Explorar" disabled={state.saving} onPress={() => router.replace('/explore')} />
    {state.loadError ? <><Heading>Tu avance necesita revisión</Heading><Notice message={state.loadError} /><Button label="Reintentar lectura" disabled={state.saving} onPress={state.reload} /></> : !progress ? <>
      <Heading>Un café en París</Heading><Copy>Aprendé a saludar, pedir café o té, responder preguntas, preguntar el precio y despedirte. Vas a leer expresiones útiles antes de usarlas.</Copy>
      <Card><Copy>8 interacciones · Sin tiempo límite · Práctica escrita y de comprensión</Copy><Copy>Las ayudas permanecen visibles: completar este recorrido guiado no certifica dominio del nivel A1.</Copy><Copy>Tu avance se guarda solo en este dispositivo. Las voces y la evaluación oral no están disponibles.</Copy></Card>
      <Button label={state.saving ? 'Guardando…' : 'Comenzar aventura'} disabled={state.saving} onPress={() => { void state.start(); }} />
    </> : progress.status === 'completed' ? <>
      <Heading>¡Tu pedido está listo!</Heading><Copy>Completaste las 8 interacciones de {variant?.title}. Elegiste respuestas para saludar, pedir y cerrar una conversación.</Copy>
      <Card><Copy>8/8 pasos completados</Copy><Copy>Respuestas enviadas: {errors}. Intentos incorrectos: {Math.max(0, errors - 8)}.</Copy><Copy>Es progreso de una práctica guiada, no una puntuación de pronunciación ni una certificación CEFR.</Copy></Card>
    </> : <>
      <Copy>{variant?.title} · {progress.completedObjectives.length}/8 pasos completados</Copy>
      <ExerciseView key={`${progress.run}:${progress.nodeId}`} exercise={currentExercise(cafeLesson, progress)} feedback={progress.feedback} submittedAnswer={submittedAnswer} saving={state.saving} error={state.saveError} onAnswer={state.answer} onContinue={state.advance} />
    </>}
    {(!progress || progress.status === 'completed' || state.loadError) && state.saveError && <Notice message={state.saveError} />}
    {(progress || state.loadError) && (confirmRestart ? <Card><Heading>¿Empezar otro recorrido?</Heading><Copy>Se reemplazará el recorrido actual. Se conserva un resumen local de variantes vistas y errores detectados para orientar la variedad, además de tus preferencias. Si el registro actual está dañado, será reemplazado.</Copy>
      <Button label={state.saving ? 'Guardando…' : 'Confirmar reinicio'} disabled={state.saving} onPress={() => { void state.start().then(saved => { if (saved) setConfirmRestart(false); }); }} />
      <Button label="Conservar mi avance" disabled={state.saving} onPress={() => setConfirmRestart(false)} />
    </Card> : <Button label="Reiniciar aventura" disabled={state.saving} onPress={() => setConfirmRestart(true)} />)}
  </Page>;
}
