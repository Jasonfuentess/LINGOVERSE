import { Redirect, useRouter } from 'expo-router';
import { Button, Card, Copy, Heading, Loading, Notice, Page } from '../src/components/ui';
import { usePreferences } from '../src/features/preferences/PreferencesProvider';
import { coaches, languages } from '../src/content/preferences';
import { MissionCard } from '../src/features/learning/MissionCard';

export default function Home() {
  const { preferences, loading, error, reload } = usePreferences();
  const router = useRouter();
  if (loading) return <Loading />;
  if (!preferences) return <Page><Heading>Tu espacio está en pausa</Heading><Notice message={error ?? 'No se pudo cargar el almacenamiento.'} /><Button label="Reintentar" onPress={() => { void reload(); }} /></Page>;
  if (!preferences.onboardingCompleted) return <Redirect href="/onboarding" />;
  return <Page><Copy>TU PRÓXIMO CAPÍTULO</Copy><Heading>Un idioma nuevo. A tu manera.</Heading><Copy>Tu espacio de invitado está listo. La primera aventura francesa ya te espera.</Copy>
    <Card><Copy>APRENDER / {languages.find(item => item.id === preferences.learningLanguage)?.label}</Copy><Copy>ENTRENADOR / {coaches.find(item => item.id === preferences.coachLocale)?.label}</Copy><Copy>Interfaz en español · Voz no disponible</Copy></Card>
    <Button label="Ver y cambiar mi perfil" onPress={() => router.push('/profile')} />
    {preferences.learningLanguage === 'en' && <Copy>Tu idioma elegido sigue siendo inglés. Podés probar la aventura francesa sin cambiar tus preferencias; la aventura de inglés está pendiente.</Copy>}
    <MissionCard /><Button label="Explorar aventuras" onPress={() => router.push('/explore')} />
    <Copy>Humor explícito desactivado. Sin cuenta, sin sincronización y sin grabaciones. Tus preferencias se guardan solo en este navegador o dispositivo.</Copy>
  </Page>;
}
