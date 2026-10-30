import { Redirect, useRouter } from 'expo-router';
import { Button, Copy, Heading, Loading, Notice, Page } from '../src/components/ui';
import { PreferencesForm } from '../src/features/preferences/PreferencesForm';
import { usePreferences } from '../src/features/preferences/PreferencesProvider';
import { HumorSettings } from '../src/features/humor/HumorSettings';
export default function Profile() {
  const state = usePreferences();
  const router = useRouter();
  if (state.loading) return <Loading />;
  if (!state.preferences) return <Page><Notice message={state.error ?? 'No se pudo cargar tu perfil'} /><Button label="Reintentar" onPress={() => { void state.reload(); }} /></Page>;
  if (!state.preferences.onboardingCompleted) return <Redirect href="/onboarding" />;
  return <Page><Copy>PERFIL / INVITADO</Copy><Heading>Hacelo tuyo.</Heading><Copy>Cambiá tus preferencias y guardalas. Se aplicarán también en Inicio.</Copy>
    <PreferencesForm initial={state.preferences} saving={state.saving} error={state.error} onboarding={false} onSave={state.save} />
    <HumorSettings /><Copy>Interfaz: español. Proveedor de voz: ninguno. Humor explícito: desactivado.</Copy>
    <Button label="Volver al inicio" disabled={state.saving} onPress={() => router.replace('/')} />
  </Page>;
}
