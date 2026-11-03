import { Redirect, useRouter } from 'expo-router';
import { Button, Copy, Loading, Notice, Page } from '../src/components/ui';
import { PreferencesForm } from '../src/features/preferences/PreferencesForm';
import { usePreferences } from '../src/features/preferences/PreferencesProvider';
import { HumorSettings } from '../src/features/humor/HumorSettings';
import { Intro, SectionTitle } from '../src/components/Editorial';
import { VoiceToolbar } from '../src/features/voice/VoiceControls';
export default function Profile() {
  const state = usePreferences();
  const router = useRouter();
  if (state.loading) return <Loading />;
  if (!state.preferences) return <Page><Notice message={state.error ?? 'No se pudo cargar tu perfil'} /><Button label="Reintentar" onPress={() => { void state.reload(); }} /></Page>;
  if (!state.preferences.onboardingCompleted) return <Redirect href="/onboarding" />;
  return <Page><Intro label="TU IDENTIDAD DE EXPLORADOR / INVITADO" title="A tu manera." description="Un idioma, un entrenador y tu propio ritmo. Guardá tus preferencias para llevarlas a cada conversación." />
    <PreferencesForm initial={state.preferences} saving={state.saving} error={state.error} onboarding={false} onSave={state.save} />
    <SectionTitle number="03" title="El sonido de tu aventura" /><VoiceToolbar language={state.preferences.learningLanguage === 'en' ? 'en-GB' : 'fr-FR'} />
    <HumorSettings /><Copy>Interfaz en español. Preferencias y recorridos locales, sin sincronización. El consentimiento adulto se administra en los ajustes de humor.</Copy>
    <Button label="Volver al inicio" disabled={state.saving} onPress={() => router.replace('/')} />
  </Page>;
}
