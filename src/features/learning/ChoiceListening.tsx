import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { pronunciationFor } from '../../content/pronunciation';
import type { ChoiceOption } from '../../domain/learning/models';
import type { PedagogicalMode } from '../../domain/learning/support';
import { tokens as t } from '../../theme/tokens';
import { SpeechButton } from '../voice/VoiceControls';
import { PronunciationCoach } from './PronunciationCoach';

/**
 * LV-009-LEARN-04: hear every visible option in the adventure language and, when a reviewed guide exists,
 * open its meaning and pronunciation. Neutral by design: it lists options in their on-screen order and never
 * marks which one is correct, so it reveals nothing in A1 or Autónomo. It receives no answer callback:
 * listening or studying an option never selects or submits it. Opening a meaning counts as help (honest
 * evidence); listening alone does not.
 */
export function ChoiceListening({ choices, language, mode, onHelp }: {
  choices: Pick<ChoiceOption, 'id' | 'label'>[]; language: 'fr-FR' | 'en-GB'; mode: PedagogicalMode; onHelp: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [studying, setStudying] = useState<string | null>(null);
  const lang = language === 'fr-FR' ? 'fr' : 'en';
  return <View style={s.wrapper}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={s.toggle}>
      <Text style={s.toggleText}>{open ? 'Cerrar las opciones' : 'Escuchar las opciones'}</Text>
    </Pressable>
    {open && <View style={s.panel}>
      <Text style={s.note}>Escuchar o estudiar una opción no la elige ni indica si es la correcta.</Text>
      {choices.map(option => {
        const guide = pronunciationFor(option.label, lang);
        const expanded = studying === option.id;
        return <View key={option.id} style={s.option}>
          <Text style={s.label}>{option.label}</Text>
          {!(guide && expanded) && <SpeechButton text={option.label} language={language} label={`«${option.label}»`} />}
          {guide ? <Pressable accessibilityRole="button" accessibilityState={{ expanded }} accessibilityLabel={expanded ? `Ocultar significado y pronunciación de ${option.label}` : `Significado y pronunciación de ${option.label}`} onPress={() => { if (!expanded) onHelp(); setStudying(expanded ? null : option.id); }} style={s.toggle}>
            <Text style={s.toggleText}>{expanded ? 'Ocultar significado' : 'Significado y pronunciación'}</Text>
          </Pressable> : <Text style={s.note}>Sin guía revisada: escuchá el audio original.</Text>}
          {guide && expanded && <View style={s.detail}><Text style={s.meaning}>{guide.translation}</Text><PronunciationCoach guide={guide} text={option.label} language={language} mode={mode} onHelp={onHelp} compact /></View>}
        </View>;
      })}
    </View>}
  </View>;
}
const s = StyleSheet.create({
  wrapper: { gap: 8 },
  toggle: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  toggleText: { color: t.color.teal, fontSize: 15, fontWeight: '700' },
  panel: { gap: 12, padding: 14, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D3E2DF' },
  option: { gap: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E3ECEA' },
  label: { color: t.color.ink, fontSize: 17, lineHeight: 25, fontWeight: '600' },
  meaning: { color: t.color.ink, fontSize: 15, lineHeight: 22 },
  detail: { gap: 6 },
  note: { color: t.color.muted, fontSize: 13, lineHeight: 20 },
});
