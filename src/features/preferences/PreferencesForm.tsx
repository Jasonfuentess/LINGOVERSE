import { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Choice, Copy, Notice } from '../../components/ui';
import { coaches, languages } from '../../content/preferences';
import type { Preferences, PreferencesChange } from '../../domain/preferences';

export function PreferencesForm({ initial, saving, error, onboarding, onSave }: {
  initial: Preferences; saving: boolean; error: string | null; onboarding: boolean;
  onSave: (change: PreferencesChange) => Promise<boolean>;
}) {
  const [language, setLanguage] = useState(initial.learningLanguage);
  const [coach, setCoach] = useState(initial.coachLocale);
  const [saved, setSaved] = useState(false);
  return <>
    <Card><Copy>01 / Tu idioma de aprendizaje</Copy><View accessibilityRole="radiogroup" accessibilityLabel="Idioma de aprendizaje" style={{ gap: 12 }}>
      {languages.map(item => <Choice key={item.id} label={item.label} detail={item.detail} selected={language === item.id} disabled={saving} onPress={() => { setLanguage(item.id); setSaved(false); }} />)}
    </View></Card>
    <Card><Copy>02 / Región de tu entrenador</Copy><Copy>Guardamos tu elección para las próximas experiencias. En esta entrega todavía no hay diálogos ni voces.</Copy><View accessibilityRole="radiogroup" accessibilityLabel="Región del entrenador" style={{ gap: 12 }}>
      {coaches.map(item => <Choice key={item.id} label={item.label} detail={item.detail} selected={coach === item.id} disabled={saving} onPress={() => { setCoach(item.id); setSaved(false); }} />)}
    </View></Card>
    {error && <Notice message={error} />}
    {saved && !error && <View accessibilityLiveRegion="polite"><Copy>Preferencias guardadas en este dispositivo.</Copy></View>}
    <Button label={saving ? 'Guardando…' : onboarding ? 'Entrar como invitado' : 'Guardar preferencias'} disabled={saving} onPress={() => { setSaved(false); void onSave({ learningLanguage: language, coachLocale: coach, onboardingCompleted: true }).then(setSaved); }} />
  </>;
}
