import { Redirect, useRouter } from 'expo-router';
import { Button, Card, Copy, Heading, Loading, Notice, Page } from '../src/components/ui';
import { usePreferences } from '../src/features/preferences/PreferencesProvider';
import { coaches, languages } from '../src/content/preferences';
import { EnglishMissionCard, MissionCard, RendezvousMissionCard } from '../src/features/learning/MissionCard';
import { DestinationLinks, Intro, RoastInvitation, SectionTitle } from '../src/components/Editorial';
import { useMission } from '../src/features/learning/MissionProvider';

export default function Home() {
  const { preferences, loading, error, reload } = usePreferences();
  const router = useRouter();
  const cafe = useMission();
  const meeting = useMission('fr', 'rendezvous');
  if (loading) return <Loading />;
  if (!preferences) return <Page><Heading>Tu espacio está en pausa</Heading><Notice message={error ?? 'No se pudo cargar el almacenamiento.'} /><Button label="Reintentar" onPress={() => { void reload(); }} /></Page>;
  if (!preferences.onboardingCompleted) return <Redirect href="/onboarding" />;
  return <Page wide><Intro label="TU IDIOMA. TU HISTORIA." title={"El mundo empieza\ncon un hola."} description="Conocé personas, elegí tu camino. Aprendé conversando." />
    {preferences.learningLanguage === 'en' ? <EnglishMissionCard featured /> : cafe.progress?.status === 'active' && meeting.progress?.status !== 'active' ? <MissionCard featured /> : <RendezvousMissionCard featured />}
    <SectionTitle number="01" title="¿Adónde vamos?" detail="Tres aventuras disponibles. Cada una conserva su propio recorrido." /><DestinationLinks />
    <Button variant="secondary" label="Explorar aventuras" onPress={() => router.push('/explore')} />
    <SectionTitle number="02" title="Aprender con personalidad" /><RoastInvitation />
    <Card><Copy>{languages.find(item => item.id === preferences.learningLanguage)?.label} · {coaches.find(item => item.id === preferences.coachLocale)?.label}</Copy><Button variant="text" label="Ver y cambiar mi perfil" onPress={() => router.push('/profile')} /><Copy>Tu recorrido se guarda en este dispositivo. Sin cuenta ni sincronización. El humor adulto requiere consentimiento explícito.</Copy></Card>
  </Page>;
}
