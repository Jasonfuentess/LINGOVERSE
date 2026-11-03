import { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { Button, Card, Copy, Loading, Notice, Page, styles } from '../src/components/ui';
import { canRoast } from '../src/domain/humor/access';
import { disableAdult, grantAdultConsent } from '../src/domain/humor/preferences';
import { useHumorPreferences } from '../src/features/humor/HumorPreferencesProvider';
import { MissionProvider } from '../src/features/learning/MissionProvider';
import { MissionScreen } from '../src/features/learning/MissionScreen';
import { usePreferences } from '../src/features/preferences/PreferencesProvider';
import { Intro } from '../src/components/Editorial';
import { CoachCharacter } from '../src/features/humor/CoachCharacter';
import { coaches } from '../src/content/humor';

export default function Roast() {
  const humor = useHumorPreferences();
  const profile = usePreferences();
  const router = useRouter();
  const [adult, setAdult] = useState(false);
  const [agreed, setAgreed] = useState(false);
  if (profile.loading || humor.loading) return <Loading />;
  if (!profile.preferences?.onboardingCompleted) return <Redirect href="/onboarding" />;
  if (canRoast(humor.settings)) return <MissionProvider roast><MissionScreen /></MissionProvider>;
  const coach = coaches.find(item => item.locale === profile.preferences?.coachLocale);
  return <Page><Intro label="MODO SIN PENA / ROAST ME" title="Francés con filo" description="Equivocarse es parte del viaje. Reírte también puede serlo." />
    {coach && <CoachCharacter name={coach.name} locale={coach.locale} tone="roast" text={coach.personality} />}
    <Copy>Ocho interacciones A1 de «Un café en París», con correcciones reales y humor intenso de tu entrenador regional. Incluye groserías, insultos amistosos y sarcasmo dirigidos a los intentos de la práctica. No evalúa pronunciación.</Copy>
    <Card><Copy>Solo para mayores de edad que lo elijan. Podés rechazar y seguir aprendiendo normalmente. El consentimiento se guarda solo en este dispositivo; podés revocarlo en Perfil o durante el recorrido. No necesitamos tu fecha de nacimiento.</Copy>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: adult }} accessibilityLabel="Confirmo que soy mayor de edad" onPress={() => setAdult(!adult)} style={styles.choice}><Text style={styles.choiceTitle}>{adult ? '☑' : '☐'} Confirmo que soy mayor de edad</Text></Pressable>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: agreed }} accessibilityLabel="Acepto explícitamente groserías, insultos amistosos y sarcasmo en Roast Me" onPress={() => setAgreed(!agreed)} style={styles.choice}><Text style={styles.choiceTitle}>{agreed ? '☑' : '☐'} Acepto explícitamente groserías, insultos amistosos y sarcasmo en Roast Me</Text></Pressable>
    </Card>
    <Button label={humor.saving ? 'Guardando…' : 'Aceptar y entrar a Roast Me'} disabled={!adult || !agreed || !humor.settings || humor.saving} onPress={() => {
      if (humor.settings) { void humor.save(grantAdultConsent(humor.settings, { adultConfirmed: adult, explicitlyAgreed: agreed }, Date.now())); setAdult(false); setAgreed(false); }
    }} />
    <Button variant="secondary" label="Prefiero aprender sin Roast Me" onPress={() => router.replace('/explore')} />
    {humor.error && <><Notice message={humor.error} /><Button label="Releer ajustes" disabled={humor.saving} onPress={humor.reload} />{humor.settings && <Button variant="secondary" label="Reintentar guardar la desactivación adulta" disabled={humor.saving} onPress={() => { if (humor.settings) void humor.save(disableAdult(humor.settings)); }} />}</>}
    {!humor.settings && <Button label="Reintentar lectura de ajustes" onPress={humor.reload} />}
  </Page>;
}
