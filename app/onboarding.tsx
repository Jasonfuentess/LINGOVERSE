import { Redirect } from 'expo-router';
import { Button, Copy, Heading, Loading, Notice, Page } from '../src/components/ui';
import { PreferencesForm } from '../src/features/preferences/PreferencesForm';
import { usePreferences } from '../src/features/preferences/PreferencesProvider';
export default function Onboarding() {
  const state = usePreferences();
  if (state.loading) return <Loading />;
  if (!state.preferences) return <Page><Heading>No pudimos abrir tu espacio</Heading><Notice message={state.error ?? 'Almacenamiento no disponible'} /><Button label="Reintentar" onPress={() => { void state.reload(); }} /></Page>;
  if (state.preferences.onboardingCompleted) return <Redirect href="/" />;
  return <Page><Copy>EMPEZÁ POR VOS</Copy><Heading>Tu viaje empieza con una elección.</Heading><Copy>Sin crear cuenta. Elegí qué idioma querés aprender y la región de tu futuro entrenador.</Copy>
    {state.recovered && <Notice message="Las preferencias guardadas no son compatibles o están dañadas. Elegí de nuevo para reemplazarlas de forma segura." />}
    <PreferencesForm initial={state.preferences} saving={state.saving} error={state.error} onboarding onSave={state.save} />
    <Copy>Interfaz en español. Audio y humor explícito desactivados. Si borrás los datos de la app o del navegador, se perderán estas preferencias.</Copy>
  </Page>;
}
