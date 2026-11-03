import { Redirect, useRouter } from 'expo-router';
import { Button, Loading, Notice, Page } from '../src/components/ui';
import { AdventureCollection, EnglishMissionCard, MissionCard, RendezvousMissionCard } from '../src/features/learning/MissionCard';
import { usePreferences } from '../src/features/preferences/PreferencesProvider';
import { Intro, RoastInvitation, SectionTitle } from '../src/components/Editorial';

export default function Explore() {
  const { preferences, loading, error } = usePreferences();
  const router = useRouter();
  if (loading) return <Loading />;
  if (!preferences) return <Page><Notice message={error ?? 'No se pudieron cargar tus preferencias'} /><Button label="Volver al inicio" onPress={() => router.replace('/')} /></Page>;
  if (!preferences.onboardingCompleted) return <Redirect href="/onboarding" />;
  return <Page wide><Intro label="EL ATLAS DE TUS HISTORIAS" title={"Lejos de la rutina.\nCerca de otra cultura."} description="Una cafetería, una calle desconocida, alguien que te espera. Elegí una aventura y entrá en la conversación." />
    <SectionTitle number="01" title="Destinos para descubrir" detail="París / Francés A1 · Londres / Inglés A1. Progreso independiente, a tu ritmo." />
    <AdventureCollection>{preferences.learningLanguage === 'en' ? [<EnglishMissionCard key="london" />, <RendezvousMissionCard key="meeting" />, <MissionCard key="cafe" />] : [<RendezvousMissionCard key="meeting" />, <MissionCard key="cafe" />, <EnglishMissionCard key="london" />]}</AdventureCollection>
    <SectionTitle number="02" title="Modo Sin Pena" detail="Otra forma de practicar. Siempre con tu consentimiento." /><RoastInvitation /><Button variant="text" label="Volver al inicio" onPress={() => router.replace('/')} />
  </Page>;
}
