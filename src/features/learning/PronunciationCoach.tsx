import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Copy } from '../../components/ui';
import type { PronunciationGuide } from '../../content/pronunciation';
import type { PedagogicalMode } from '../../domain/learning/support';
import { tokens as t } from '../../theme/tokens';
import { SpeechButton, StudyAudio } from '../voice/VoiceControls';

/** Slow rate requested from the existing VoiceController (accepted range 0.5–1.2). The perceived effect depends on the voice. */
export const SLOW_RATE = 0.65;

/**
 * Teaching aid only: plays original text in the guide's locale through the shared voice controller.
 * It never receives an answer callback, so it cannot submit, grade or record pronunciation.
 */
export function PronunciationCoach({ guide, text, language, mode, onHelp, related = false, defaultOpen = false, compact = related }: {
  guide: PronunciationGuide | null; text: string; language: 'fr-FR' | 'en-GB'; mode: PedagogicalMode;
  onHelp: () => void; related?: boolean; defaultOpen?: boolean;
  /** Secondary coaches (related chunk, choice options) skip the mute/voice notices already shown once by the main model. */
  compact?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const locale = guide?.locale ?? language;
  const original = guide?.original ?? text;
  const showApproximate = Boolean(guide) && (mode === 'starter' || open);
  return <View style={s.coach}>
    {related && guide && <><Text accessibilityRole="header" style={s.label}>OTRA EXPRESIÓN ÚTIL</Text><Text style={s.related}>{guide.original}</Text><Copy>{guide.translation}</Copy></>}
    {showApproximate && guide && <View style={s.approximateBox}>
      <Text style={s.label}>Pronunciación aproximada · español</Text>
      <Text style={s.approximate}>{guide.approximate}</Text>
      <Text style={s.note}>Orientación, no fonética exacta. El original y su audio son la referencia.</Text>
    </View>}
    {compact ? <View style={s.row}><SpeechButton text={original} language={locale} label={`«${original}»`} /><SpeechButton text={original} language={locale} rate={SLOW_RATE} label={`«${original}» más despacio`} /></View> : <StudyAudio text={original} language={locale} />}
    {!guide && !related && <Text style={s.note}>Esta respuesta todavía no tiene una guía aproximada revisada. Escuchá el audio original; podés continuar sin ella.</Text>}
    {guide && <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={open ? `Cerrar cómo se pronuncia ${guide.original}` : `¿Cómo se pronuncia ${guide.original}?`} onPress={() => { if (!open) onHelp(); setOpen(!open); }} style={s.toggle}>
      <Text style={s.toggleText}>{open ? 'Cerrar pronunciación' : '¿Cómo se pronuncia?'}</Text>
    </Pressable>}
    {guide && open && <View style={s.panel}>
      <Text accessibilityRole="header" style={s.label}>POR PARTES</Text>
      {guide.units.map((unit, i) => <View key={`${i}:${unit.text}`} style={s.unit}>
        <Text style={s.unitText}>{unit.text}</Text>
        <Text style={s.meaning}>{unit.meaning}</Text>
        {Boolean(unit.approximate) && <Text style={s.unitApproximate}>≈ {unit.approximate}</Text>}
        {guide.units.length > 1 && <View style={s.row}>
          <SpeechButton text={unit.text} language={locale} label={`«${unit.text}»`} />
          <SpeechButton text={unit.text} language={locale} rate={SLOW_RATE} label={`«${unit.text}» más despacio`} />
        </View>}
      </View>)}
      {guide.units.length === 1 && <Text style={s.note}>Se practica completa para conservar sus sonidos; no se divide en sílabas artificiales.</Text>}
      {guide.units.length > 1 && <Text style={s.note}>Escuchá cada parte y después la frase completa: al unirse, los sonidos pueden cambiar.</Text>}
      <Text accessibilityRole="header" style={s.label}>SONIDOS PARA PRESTAR ATENCIÓN</Text>
      {guide.focus.map(item => <Text key={item} style={s.body}>{item}</Text>)}
      {guide.tips.map(tip => <View key={tip.id} style={s.tip}><Text style={s.tipLabel}>{tip.label}</Text><Text style={s.body}>{tip.explanation}</Text></View>)}
      {Boolean(guide.caveat) && <Text style={s.note}>{guide.caveat}</Text>}
      <Text style={s.note}>Escuchar y repetir es práctica personal: no se graba, no se califica tu pronunciación y no suma errores.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Volver a la conversación" onPress={() => setOpen(false)} style={s.toggle}><Text style={s.toggleText}>Volver a la conversación</Text></Pressable>
    </View>}
  </View>;
}
const s = StyleSheet.create({
  coach: { gap: 10 },
  label: { color: t.color.teal, fontSize: 11, lineHeight: 18, fontWeight: '800', letterSpacing: 0.5 },
  related: { color: t.color.ink, fontSize: 18, lineHeight: 27, fontWeight: '600' },
  approximateBox: { gap: 4 },
  approximate: { color: t.color.ink, fontSize: 18, lineHeight: 26, fontWeight: '600' },
  note: { color: t.color.muted, fontSize: 13, lineHeight: 20 },
  body: { color: t.color.ink, fontSize: 15, lineHeight: 23 },
  toggle: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  toggleText: { color: t.color.teal, fontSize: 15, fontWeight: '700' },
  panel: { gap: 10, padding: 14, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D3E2DF' },
  unit: { gap: 4, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#E3ECEA' },
  unitText: { color: t.color.ink, fontSize: 19, lineHeight: 27, fontWeight: '600' },
  meaning: { color: t.color.muted, fontSize: 14, lineHeight: 21 },
  unitApproximate: { color: t.color.ink, fontSize: 15, lineHeight: 22 },
  // Column, not row: each SpeechButton already lays out its own row; nesting rows let long labels overflow at 320 px.
  row: { gap: 6 },
  tip: { gap: 2 },
  tipLabel: { color: t.color.ink, fontSize: 14, lineHeight: 20, fontWeight: '700' },
});
