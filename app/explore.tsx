import { Redirect, useRouter } from 'expo-router';
import { Button, Copy, Heading, Loading, Notice, Page } from '../src/components/ui';
import { MissionCard } from '../src/features/learning/MissionCard';
import { usePreferences } from '../src/features/preferences/PreferencesProvider';

export default function Explore() {
  const { preferences, loading, error } = usePreferences();
  const router = useRouter();
  if (loading) return <Loading />;
  if (!preferences) return <Page><Notice message={error ?? 'No se pudieron cargar tus preferencias'} /><Button label="Volver al inicio" onPress={() => router.replace('/')} /></Page>;
  if (!preferences.onboardingCompleted) return <Redirect href="/onboarding" />;
  return <Page><Copy>EXPLORAR / PRIMERA AVENTURA</Copy><Heading>Entrá en la historia.</Heading>
    <Copy>{preferences.learningLanguage === 'en' ? 'Tu preferencia sigue siendo inglés. La primera aventura disponible es en francés; podés probarla sin cambiar tu perfil. El contenido de inglés está pendiente.' : 'La primera aventura de francés está disponible. Cada recorrido permite tomar decisiones y repasar con ayuda.'}</Copy>
    <MissionCard /><Button label="Volver al inicio" onPress={() => router.replace('/')} />
  </Page>;
}
