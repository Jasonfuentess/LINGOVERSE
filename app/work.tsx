import { Redirect, useRouter } from 'expo-router';
import { Button, Card, Copy, Loading, Notice, Page } from '../src/components/ui';
import { Intro, SectionTitle } from '../src/components/Editorial';
import { usePreferences } from '../src/features/preferences/PreferencesProvider';

export default function Work() {
  const state = usePreferences();
  const router = useRouter();
  if (state.loading) return <Loading />;
  if (!state.preferences) return <Page><Notice message={state.error ?? 'No pudimos leer tus preferencias.'} /><Button label="Reintentar" onPress={() => { void state.reload(); }} /></Page>;
  if (!state.preferences.onboardingCompleted) return <Redirect href="/onboarding" />;
  return <Page wide><Intro label="IDIOMAS PARA TU VIDA PROFESIONAL" title={"Tu próximo desafío,\nmás allá del viaje."} description="El espacio para conversaciones del trabajo está en preparación." />
    <Card><SectionTitle number="◇" title="Un capítulo por escribir" /><Copy>Todavía no hay misiones profesionales disponibles. Mientras llegan, podés practicar saludos, pedir ayuda y comprender indicaciones en las aventuras actuales.</Copy><Button label="Explorar aventuras disponibles" onPress={() => router.push('/explore')} /></Card>
  </Page>;
}
