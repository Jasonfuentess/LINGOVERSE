import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Copy } from '../../components/ui';
import type { BeginnerPhrase } from '../../content/beginner';
import { advancePreparation, pedagogicalMode, type LanguageSupport, type PreparationStep } from '../../domain/learning/support';
import { tokens as t } from '../../theme/tokens';
import { StudyAudio } from '../voice/VoiceControls';

export interface PreparationProps {
  phrase: BeginnerPhrase; step: PreparationStep; language: 'fr-FR' | 'en-GB'; saving: boolean;
  onStep: (step: PreparationStep) => void; answered: boolean;
}
export function BeginnerPreparation({ phrase, step, language, saving, onStep, answered }: PreparationProps) {
  const [transferHelp, setTransferHelp] = useState<string | null>(null);
  if (answered) return step === 'done' ? <View accessibilityLiveRegion="polite" style={s.panel}><Text style={s.label}>PRÁCTICA GUARDADA</Text><Copy>{phrase.transfer.choices.find(choice => choice.correct)?.explanation}</Copy><Copy>Podés continuar tu historia. Esto no certifica pronunciación ni dominio.</Copy></View> : <View style={s.panel}>
    <Text style={s.label}>OTRA SITUACIÓN · PROBALO</Text><Copy>{phrase.transfer.context}</Copy>
    {phrase.transfer.choices.map(choice => <Button key={choice.text} variant="secondary" label={choice.text} disabled={saving} onPress={() => { setTransferHelp(choice.explanation); if (choice.correct) onStep('done'); }} />)}
    {transferHelp && <View accessibilityLiveRegion="polite"><Copy>{transferHelp}</Copy></View>}
    <Copy>Práctica breve, sin nota ni certificación. Podés continuar la historia cuando quieras.</Copy>
  </View>;
  if (step === 'done' || step === 'respond') return <View style={s.ready}><Copy>Ya podés responder al personaje. El micrófono es opcional.</Copy><Button variant="text" label="Volver a escuchar y practicar" disabled={saving} onPress={() => onStep('listen')} /></View>;
  const labels = { listen: '01 / ESCUCHÁ EL MODELO', meaning: '02 / COMPRENDÉ', parts: '03 / POR PARTES', rehearse: '04 / REPETÍ A TU RITMO' };
  const actions = { listen: 'Ver significado', meaning: 'Practicar por partes', parts: 'Repetir la frase completa', rehearse: 'Estoy listo para responder' };
  return <View style={s.panel}>
    <Text accessibilityRole="header" style={s.label}>{labels[step]}</Text>
    <Text style={s.phrase}>{phrase.text}</Text>
    {step === 'meaning' && <Copy>{phrase.meaning}</Copy>}
    {step === 'parts' ? <>{phrase.parts.map(part => <View key={part.text} style={s.part}><Text style={s.partText}>{part.text}</Text><Copy>{part.meaning}</Copy><StudyAudio text={part.text} language={language} /></View>)}<Copy>{phrase.note}</Copy></> : <StudyAudio text={phrase.text} language={language} />}
    {step === 'listen' && <Copy>Escuchá antes de intentarlo. Podés repetir el modelo cuantas veces necesités; no tenés que grabar tu voz.</Copy>}
    {step === 'rehearse' && <Copy>Repetí la frase completa sin grabar o simplemente escuchá otra vez. Este paso es práctica personal, sin evaluación de pronunciación.</Copy>}
    <Button label={saving ? 'Guardando preparación…' : actions[step]} disabled={saving} onPress={() => onStep(advancePreparation(step))} />
    <Copy>Avanzar guarda el paso que elegiste, no demuestra que hayas escuchado o pronunciado la frase.</Copy>
  </View>;
}
export function SupportSelector({ entry, disabled, onChange, initiallyOpen = false }: { entry: LanguageSupport; disabled: boolean; onChange: (stage: LanguageSupport['stage'], mode: LanguageSupport['mode']) => void; initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  return <View style={s.settings}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={s.summary}><Text style={s.label}>{pedagogicalMode(entry)==='starter'?'DESDE CERO / PRE-A1':pedagogicalMode(entry)==='a1'?'PRINCIPIANTE / A1':'AUTÓNOMO'} · {open ? 'CERRAR' : 'CAMBIAR'}</Text></Pressable>
    {open && <><Copy>¿Cómo querés empezar en este idioma? Es una preferencia de ayuda, no una evaluación de nivel.</Copy>
      <View accessibilityRole="radiogroup" accessibilityLabel="Punto de partida en este idioma" style={s.options}>{([{ id:'starter',stage:'pre-a1',mode:'guided',label:'Desde cero / Pre-A1 · modelos antes de responder' },{id:'a1',stage:'a1',mode:'guided',label:'Principiante / A1 · orientación y ayudas opcionales'},{id:'autonomous',stage:entry.stage,mode:'independent',label:'Autónomo · intentar primero, ayuda a demanda'}] as const).map(option=><Pressable key={option.id} accessibilityRole="radio" accessibilityState={{checked:pedagogicalMode(entry)===option.id,disabled}} disabled={disabled} onPress={()=>onChange(option.stage,option.mode)} style={[s.option,pedagogicalMode(entry)===option.id&&s.selected]}><Text style={s.optionText}>{pedagogicalMode(entry)===option.id?'● ':'○ '}{option.label}</Text></Pressable>)}</View>
      <Copy>Se guarda por idioma y conserva tu recorrido. Son modos pedagógicos, no certificaciones CEFR. Podés aprender una respuesta o usar ayuda en cualquier turno de las tres aventuras.</Copy>
    </>}
  </View>;
}
const s = StyleSheet.create({
  panel: { backgroundColor: '#E8F1F1', borderWidth: 1, borderColor: '#BBD4D0', borderRadius: 22, padding: 18, gap: 14 },
  label: { color: t.color.teal, fontSize: 11, lineHeight: 18, fontWeight: '800', letterSpacing: 1 },
  phrase: { color: t.color.ink, fontSize: 27, lineHeight: 36, fontWeight: '600' },
  part: { gap: 6, padding: 12, borderRadius: 14, backgroundColor: '#FFFFFF' }, partText: { color: t.color.ink, fontSize: 22, lineHeight: 30, fontWeight: '600' },
  ready: { gap: 6 }, settings: { gap: 12 }, summary: { minHeight: 44, justifyContent: 'center' }, options: { gap: 10 },
  option: { padding: 14, minHeight: 52, borderWidth: 1, borderColor: t.color.line, borderRadius: 14, backgroundColor: t.color.white },
  selected: { borderColor: t.color.teal, backgroundColor: t.color.tint }, optionText: { color: t.color.ink, fontSize: 16, lineHeight: 24 },
});
