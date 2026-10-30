import { Button, Card, Choice, Copy, Heading, Notice } from '../../components/ui';
import { View } from 'react-native';
import { coaches } from '../../content/humor';
import { disableAdult, humorDefaults } from '../../domain/humor/preferences';
import { usePreferences } from '../preferences/PreferencesProvider';
import { useHumorPreferences } from './HumorPreferencesProvider';
export function HumorSettings() {
  const state = useHumorPreferences();
  const profile = usePreferences();
  const coach = coaches.find(coach => coach.locale === profile.preferences?.coachLocale);
  if (state.loading) return <Copy>Cargando ajustes de humor…</Copy>;
  if (!state.settings) return <Card><Notice message={state.error ?? 'Ajustes no disponibles'} /><Button label="Reintentar ajustes" onPress={state.reload} /><Button label="Restablecer humor seguro" disabled={state.saving} onPress={() => { void state.save(humorDefaults()); }} /></Card>;
  const settings = state.settings;
  return <Card><Heading>Tu entrenador</Heading><Copy>{coach?.name}: {coach?.personality}</Copy>
    <Copy>El entrenador acompaña por texto. El audio todavía no está disponible.</Copy>
    <Copy>Comentarios amistosos: {settings.enabled ? 'activados' : 'desactivados'}. Se guardan al cambiar cada opción. La enseñanza funciona también sin humor.</Copy>
    <Button label={settings.enabled ? 'Desactivar humor amistoso' : 'Activar humor amistoso'} disabled={state.saving} onPress={() => { void state.save({ ...settings, enabled: !settings.enabled }); }} />
    <View accessibilityRole="radiogroup" accessibilityLabel="Intensidad del humor amistoso" style={{ gap: 12 }}><Choice label="Suave" detail="Acompañamiento breve y tranquilo." selected={settings.intensity === 'gentle'} disabled={state.saving} onPress={() => { void state.save({ ...settings, intensity: 'gentle' }); }} />
    <Choice label="Más juguetón" detail="También permite bromas ligeras, sin lenguaje vulgar." selected={settings.intensity === 'playful'} disabled={state.saving} onPress={() => { void state.save({ ...settings, intensity: 'playful' }); }} /></View>
    <Copy>Roast Me tiene su propio acceso y consentimiento en Explorar → Modo Sin Pena. La intensidad amistosa no activa el modo adulto. Mamá de LATAM todavía no está disponible.</Copy>
    {(settings.adult.enabled || settings.adult.consent) && <Button label="Desactivar y revocar consentimiento adulto" disabled={state.saving} onPress={() => { void state.save(disableAdult(settings)); }} />}
    {state.error && <View><Notice message={state.error} /><Button label="Releer ajustes" disabled={state.saving} onPress={state.reload} /></View>}
  </Card>;
}
