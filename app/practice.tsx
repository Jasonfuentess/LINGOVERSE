import { Redirect } from 'expo-router';
import { Button, Card, Copy, Loading, Notice, Page } from '../src/components/ui';
import { Intro, SectionTitle } from '../src/components/Editorial';
import { AdventureCollection, EnglishMissionCard, MissionCard, RendezvousMissionCard } from '../src/features/learning/MissionCard';
import { usePreferences } from '../src/features/preferences/PreferencesProvider';

export default function Practice() {
  const state = usePreferences();
  if (state.loading) return <Loading />;
  if (!state.preferences) return <Page><Notice message={state.error ?? 'No pudimos leer tus preferencias.'} /><Button label="Reintentar" onPress={() => { void state.reload(); }} /></Page>;
  if (!state.preferences.onboardingCompleted) return <Redirect href="/onboarding" />;
  return <Page wide><Intro label="TU TALLER DE IDIOMAS" title={"Las palabras se quedan\ncuando las usás."} description="Volvé a tus conversaciones para escuchar, comprender, elegir y escribir. Sin reloj, con ayuda cuando la necesitás." />
    <Card><SectionTitle number="↻" title="Recordá lo que viviste" /><Copy>Al completar una aventura, su resumen reúne las expresiones y objetivos que practicaste. Abrí tu recorrido para consultarlo. Reiniciar requiere confirmación y reemplaza ese recorrido.</Copy><Copy>El micrófono ofrece transcripción editable en navegadores compatibles. Escuchar un modelo ayuda a practicar; no mide pronunciación.</Copy></Card>
    <SectionTitle number="01" title="Práctica en contexto" detail="Estos accesos abren tus aventuras existentes con su progreso real." />
    <AdventureCollection>{state.preferences.learningLanguage === 'en' ? [<EnglishMissionCard key="london" />, <MissionCard key="cafe" />, <RendezvousMissionCard key="meeting" />] : [<MissionCard key="cafe" />, <RendezvousMissionCard key="meeting" />, <EnglishMissionCard key="london" />]}</AdventureCollection>
  </Page>;
}
