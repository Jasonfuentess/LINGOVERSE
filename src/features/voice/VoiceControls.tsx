import { useEffect, useId, useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { selectVoice } from '../../domain/voice/playback';
import { tokens as t } from '../../theme/tokens';
import { useVoice } from './VoiceProvider';
import { voiceController } from './service';

export function SpeechButton({ text, language, label, adult = false, rate }: { text: string; language: string; label: string; adult?: boolean; rate?: number }) {
  const { state } = useVoice();
  const id = useId();
  const [played, setPlayed] = useState(false);
  const voice = selectVoice(state.voices, language, state.allowNetworkVoices);
  const active = state.activeId === id;
  useEffect(() => () => { if (voiceController.snapshot().activeId === id) void voiceController.stop(); }, [id, text, language, adult, rate]);
  const disabled = state.muted || !voice;
  return <View style={styles.controls}>
    <Pressable accessibilityRole="button" accessibilityLabel={`${played ? 'Repetir' : 'Escuchar'} ${label}`} accessibilityState={{ disabled }} disabled={disabled} onPress={() => { setPlayed(true); void voiceController.play({ id, text, language, adult, rate }); }} style={[styles.button, active && styles.active]}>
      <Text style={[styles.buttonText, disabled && styles.disabled]}>{active ? state.status === 'speaking' ? 'Reproduciendo · Repetir' : 'Preparando voz…' : `${played ? 'Repetir' : 'Escuchar'} ${label}`}</Text>
    </Pressable>
    {active && <Pressable accessibilityRole="button" accessibilityLabel={`Detener ${label}`} onPress={() => { void voiceController.stop(); }} style={styles.button}><Text style={styles.buttonText}>Detener</Text></Pressable>}
  </View>;
}
export function CoachSpeech({ text, adult = false }: { text: string; adult?: boolean }) {
  const { coachLocale } = useVoice();
  return <SpeechButton text={text} language={coachLocale} label="al entrenador" adult={adult} />;
}
export function StudyAudio({ text, language, segments }: { text: string; language: 'fr-FR' | 'en-GB'; segments?: string[] }) {
  const [fallback,setFallback]=useState(false);
  const [advanced,setAdvanced]=useState(false);
  const { state, saving, toggleMute } = useVoice();
  const available = selectVoice(state.voices, language, state.allowNetworkVoices);
  return <View style={{ gap: 8 }}>
    {state.muted && <Pressable accessibilityRole="button" accessibilityState={{ disabled: saving }} disabled={saving} style={styles.button} onPress={() => { void toggleMute(); }}><Text style={styles.buttonText}>Activar audio para practicar</Text></Pressable>}
    <SpeechButton text={text} language={language} label="el modelo" />
    <Pressable accessibilityRole="button" accessibilityState={{expanded:advanced}} onPress={()=>setAdvanced(!advanced)} style={styles.button}><Text style={styles.buttonText}>{advanced?'Cerrar opciones de audio':segments?'Audio lento y grupos':'Audio lento'}</Text></Pressable>
    {advanced&&<>
    <SpeechButton text={text} language={language} rate={0.65} label="más despacio (según voz)" />
    {segments && <Pressable accessibilityRole="button" accessibilityState={{ expanded:fallback }} onPress={()=>setFallback(!fallback)} style={styles.button}><Text style={styles.buttonText}>{fallback?'Cerrar grupos de escucha':'Si suena igual: escuchar por grupos'}</Text></Pressable>}
    {fallback && segments?.map((segment,i)=><SpeechButton key={`${i}:${segment}`} text={segment} language={language} label={`el grupo ${i+1}`} />)}
    </>}
    <Text style={styles.copy}>{!available ? 'No hay voz compatible con estos ajustes. Revisá Voces del dispositivo; podés leer y seguir mientras tanto.' : `La velocidad lenta depende de la voz. Si no notás diferencia, ${segments ? 'usá los grupos de escucha' : 'escuchá por partes'}. No mide pronunciación.`}</Text>
  </View>;
}
// `leading` lets a screen share the row (e.g. back navigation) so the active turn stays near the top.
export function VoiceToolbar({ language = 'fr-FR', leading }: { language?: 'fr-FR' | 'en-GB'; leading?: ReactNode }) {
  const { state, coachLocale, saving, preferenceError, toggleMute, toggleNetwork } = useVoice();
  const [details, setDetails] = useState(false);
  const spanish = selectVoice(state.voices, coachLocale, state.allowNetworkVoices);
  return <View style={styles.toolbar}>
    <View style={[styles.controls, leading ? { alignItems: 'center' } : null]}>
      {leading}
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: saving }} disabled={saving} onPress={() => { void toggleMute(); }} style={styles.button}><Text style={styles.buttonText}>{state.muted ? 'Activar audio' : 'Silenciar audio'}</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: details }} onPress={() => setDetails(!details)} style={styles.button}><Text style={styles.buttonText}>Voces del dispositivo</Text></Pressable>
      {state.activeId && <Pressable accessibilityRole="button" onPress={() => { void voiceController.stop(); }} style={styles.button}><Text style={styles.buttonText}>Detener audio</Text></Pressable>}
    </View>
    {details && <View style={styles.details}>
      {(['fr-FR', 'en-GB', coachLocale] as const).map(language => {
        const selected = selectVoice(state.voices, language, state.allowNetworkVoices);
        return <Text key={language} style={styles.copy}>{language}: {selected ? `${selected.voice.name} (${selected.voice.language})${selected.voice.local === false ? ' · requiere Internet' : ''}` : 'sin voz compatible disponible'}</Text>;
      })}
      <Text style={styles.copy}>{spanish?.regionalFallback ? `No hay voz ${coachLocale}; se usa ${spanish.voice.language}. ` : ''}La personalidad regional está en el texto; la voz es sintética y depende del dispositivo. Escuchar no evalúa pronunciación.</Text>
      <Text style={styles.copy}>Preferimos voces locales. Podés permitir las voces del navegador que requieren Internet: el navegador enviará únicamente el texto editorial que elijas escuchar a su servicio de voz, nunca tu respuesta escrita. En móvil, el funcionamiento sin conexión depende de las voces instaladas y del motor TTS del sistema.</Text>
      {Platform.OS === 'web' && <Pressable accessibilityRole="button" accessibilityState={{ disabled: saving }} disabled={saving} onPress={() => { void toggleNetwork(); }} style={styles.button}><Text style={styles.buttonText}>{state.allowNetworkVoices ? 'Usar solo voces locales' : 'Permitir voces del navegador con Internet'}</Text></Pressable>}
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: state.status === 'loading' }} disabled={state.status === 'loading'} onPress={() => { void voiceController.refresh(); }} style={styles.button}><Text style={styles.buttonText}>{state.status === 'loading' ? 'Consultando voces…' : 'Revisar voces disponibles'}</Text></Pressable>
    </View>}
    {!state.muted && !selectVoice(state.voices, language, state.allowNetworkVoices) && <Text style={styles.copy}>Voz {language === 'en-GB' ? 'inglesa' : 'francesa'} no disponible con estos ajustes. Podés seguir leyendo o revisar «Voces del dispositivo».</Text>}
    {state.error && <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>}
    {preferenceError && <Text accessibilityRole="alert" style={styles.error}>{preferenceError}</Text>}
  </View>;
}
const styles = StyleSheet.create({
  toolbar: { gap: 8 }, controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: { minHeight: 44, justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 12, flexShrink: 1, backgroundColor: '#E7EFF2', borderRadius: 12, borderWidth: 1, borderColor: '#CFDDE3' },
  active: { backgroundColor: '#D1EADF', borderColor: t.color.teal },
  buttonText: { color: t.color.teal, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  disabled: { color: t.color.muted }, details: { gap: 8, padding: 12, backgroundColor: t.color.tint, borderRadius: 12 },
  copy: { color: t.color.muted, fontSize: 14, lineHeight: 21 }, error: { color: t.color.error, fontSize: 14, lineHeight: 21 },
});
