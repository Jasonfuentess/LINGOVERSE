import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Card, Choice, Copy, Notice } from '../../components/ui';
import { coaches, languages } from '../../content/preferences';
import type { CoachLocale, Preferences, PreferencesChange } from '../../domain/preferences';
import { CharacterPortrait } from '../../components/AdventureArt';
import { tokens as t } from '../../theme/tokens';
const coachNames: Record<CoachLocale, string> = { 'es-SV': 'Luz', 'es-MX': 'Toño', 'es-CO': 'Vale', 'es-AR': 'Romi' };

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
    <Card><Copy>02 / Región de tu entrenador</Copy><Copy>Esta elección define su personalidad y expresiones. Las voces sintéticas disponibles dependen de tu dispositivo.</Copy><View accessibilityRole="radiogroup" accessibilityLabel="Región del entrenador" style={{ gap: 12 }}>
      {coaches.map(item => <Pressable key={item.id} accessibilityRole="radio" accessibilityLabel={`${coachNames[item.id]}, ${item.label}, ${item.detail}`} accessibilityState={{ checked: coach === item.id, disabled: saving }} disabled={saving} onPress={() => { setCoach(item.id); setSaved(false); }} style={({ pressed }) => [{ flexDirection: 'row', gap: 14, alignItems: 'center', borderWidth: 2, borderColor: coach === item.id ? t.color.teal : t.color.line, backgroundColor: coach === item.id ? t.color.tint : t.color.white, borderRadius: 18, padding: 14 }, pressed && { opacity: 0.7 }]}>
        <CharacterPortrait name={coachNames[item.id]} size={56} /><View style={{ flex: 1, gap: 3 }}><Text style={{ color: t.color.ink, fontSize: 18, fontWeight: '700' }}>{coachNames[item.id]}</Text><Text style={{ color: t.color.muted, fontSize: 14, lineHeight: 21 }}>{item.label}</Text></View><Text accessible={false} style={{ color: t.color.teal, fontSize: 22 }}>{coach === item.id ? '●' : '○'}</Text>
      </Pressable>)}
    </View></Card>
    {error && <Notice message={error} />}
    {saved && !error && <View accessibilityLiveRegion="polite"><Copy>Preferencias guardadas en este dispositivo.</Copy></View>}
    <Button label={saving ? 'Guardando…' : onboarding ? 'Entrar como invitado' : 'Guardar preferencias'} disabled={saving} onPress={() => { setSaved(false); void onSave({ learningLanguage: language, coachLocale: coach, onboardingCompleted: true }).then(setSaved); }} />
  </>;
}
