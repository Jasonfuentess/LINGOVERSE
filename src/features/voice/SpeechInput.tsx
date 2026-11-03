import { useEffect, useState, useSyncExternalStore } from 'react';
import { AppState, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { AnswerTextInput } from '../../components/KeyboardScroll';
import { RecognitionController } from '../../domain/voice/recognition';
import { tokens as t } from '../../theme/tokens';
import { recognitionDriver } from './recognitionDriver';
import { voiceController } from './service';
import type { TranscriptEvidence, TranscriptReview } from '../../domain/voice/transcriptReview';

/** Explicit microphone action -> editable transcript -> existing educational answer path. */
export function SpeechInput({ onUse, disabled, language = 'fr-FR', inspect, purpose = 'answer' }: { onUse: (text: string) => boolean; disabled: boolean; language?: 'fr-FR' | 'en-GB'; purpose?: 'practice'|'answer'; inspect?: (text: string, evidence: TranscriptEvidence) => TranscriptReview }) {
  const [controller] = useState(() => new RecognitionController(recognitionDriver));
  const state = useSyncExternalStore(controller.subscribe, controller.snapshot, controller.snapshot);
  const [editedTranscript, setEditedTranscript] = useState<string | null>(null);
  const [matchingError, setMatchingError] = useState<string | null>(null);
  const languageLabel = language === 'en-GB' ? 'inglés' : 'francés';
  const supported = Platform.OS === 'web' && controller.available();
  const recording = state.status === 'listening' || state.status === 'stopping';
  const draft = editedTranscript ?? state.finalText;
  const tooLong = draft.length > 400;
  const review = inspect?.(draft, state.evidence);
  useEffect(() => {
    const sub = AppState.addEventListener('change', next => { if (next !== 'active') controller.cancel(); });
    const hide = () => { if (document.visibilityState !== 'visible') controller.cancel(); };
    const leave = () => controller.cancel();
    if (Platform.OS === 'web') {
      document.addEventListener('visibilitychange', hide);
      window.addEventListener('pagehide', leave);
    }
    const stopOnPlayback = voiceController.subscribe(() => { if (voiceController.snapshot().activeId) controller.cancel(); });
    return () => {
      stopOnPlayback();
      sub.remove();
      if (Platform.OS === 'web') { document.removeEventListener('visibilitychange', hide); window.removeEventListener('pagehide', leave); }
      controller.dispose();
    };
  }, [controller]);
  useEffect(() => { if (disabled) controller.cancel(); }, [controller, disabled]);
  if (!supported) return <View style={styles.box}><Text style={styles.copy}>Reconocimiento de voz no disponible aquí. Podés escuchar los modelos y responder por teclado o con opciones. No calificamos tu pronunciación.</Text></View>;
  return <View style={[styles.box, recording && styles.recording, !recording && draft.length > 0 && styles.transcribed]}>
    <Text accessibilityLiveRegion="polite" style={styles.label}>{recording ? '● MICRÓFONO ACTIVO' : draft.length > 0 ? '✓ TRANSCRIPCIÓN PARA REVISAR' : purpose==='practice'?'PRÁCTICA ORAL · NO ENVÍA RESPUESTAS':'RESPONDER HABLANDO · OPCIONAL'}</Text>
    {purpose==='practice'&&<Text style={styles.copy}>Si el texto no coincide con lo que intentaste, el navegador podría no haber entendido. Podés editar, repetir o confirmar manualmente el modelo sin evaluación.</Text>}
    <Text style={styles.copy}>Al activar el micrófono, el navegador puede enviar tu voz a su servicio de reconocimiento. LingoVerse no guarda grabaciones. No calificamos tu pronunciación.</Text>
    <Text style={styles.copy}>Idioma del reconocimiento: {languageLabel} ({language}). Si aparece otro idioma, reintentá; no podemos detectar con certeza qué idioma hablaste.</Text>
    <View style={styles.actions}>
      {!recording ? <Pressable accessibilityRole="button" accessibilityLabel={`Empezar a hablar en ${languageLabel}`} accessibilityState={{ disabled }} disabled={disabled} style={styles.button} onPress={() => { void voiceController.stop(); setEditedTranscript(null); setMatchingError(null); controller.start(language); }}><Text style={styles.buttonLabel}>🎙 Hablar en {languageLabel}</Text></Pressable>
        : <Pressable accessibilityRole="button" accessibilityLabel="Terminar reconocimiento de voz" accessibilityState={{ disabled: state.status === 'stopping' }} disabled={state.status === 'stopping'} style={styles.button} onPress={() => controller.stop()}><Text style={styles.buttonLabel}>{state.status === 'stopping' ? 'Terminando…' : 'Terminar grabación'}</Text></Pressable>}
      {recording && <Pressable accessibilityRole="button" accessibilityLabel="Cancelar reconocimiento" style={styles.button} onPress={() => controller.cancel()}><Text style={styles.buttonLabel}>Cancelar</Text></Pressable>}
    </View>
    {recording && <Text accessibilityLiveRegion="polite" style={styles.copy}>{state.status === 'stopping' ? 'Finalizando reconocimiento…' : state.interimText ? `Escuchando: ${state.interimText}` : 'Escuchando… hablá ahora.'}</Text>}
    {!recording && (draft.length > 0 || state.finalText.length > 0) && <>
      <Text style={styles.copy}>Revisá y corregí la transcripción antes de utilizarla:</Text>
      {review && <Text accessibilityLiveRegion="polite" style={styles.copy}>{review.message}</Text>}
      <AnswerTextInput accessibilityLabel="Transcripción editable" style={styles.input} multiline maxLength={400} autoCorrect={false} value={draft} onChangeText={value => { setEditedTranscript(value); setMatchingError(null); }} />
      {tooLong && <Text accessibilityRole="alert" style={styles.error}>La transcripción supera 400 caracteres. Reducila antes de usarla.</Text>}
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || tooLong || !draft.trim() || review?.kind === 'wrong-language' }} disabled={disabled || tooLong || !draft.trim() || review?.kind === 'wrong-language'} style={styles.button} onPress={() => {
        if (onUse(draft.trim())) { setMatchingError(null); controller.cancel(); setEditedTranscript(null); }
        else setMatchingError('La transcripción no coincide exactamente con una opción. Podés corregirla o elegir la respuesta con los botones.');
      }}><Text style={[styles.buttonLabel, (disabled || tooLong || !draft.trim()) && styles.disabled]}>Confirmar y usar texto revisado</Text></Pressable>
      <Text style={styles.copy}>Solo prepara tu respuesta. Después elegís si querés enviarla al personaje.</Text>
    </>}
    {state.error && <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>}
    {matchingError && <Text accessibilityRole="alert" style={styles.error}>{matchingError}</Text>}
  </View>;
}
const styles = StyleSheet.create({
  box: { gap: 8, padding: 14, backgroundColor: '#EAF0F5', borderRadius: 18, borderWidth: 1, borderColor: '#CFDEE8' },
  recording: { backgroundColor: '#FFF0E7', borderColor: '#A3603A' },
  transcribed: { backgroundColor: t.color.tint, borderColor: t.color.teal },
  label: { fontWeight: '700', fontSize: 12, letterSpacing: 0.5, color: t.color.teal },
  copy: { color: t.color.muted, fontSize: 13, lineHeight: 19 },
  actions: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  button: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: t.color.white, borderRadius: 12, borderWidth: 1, borderColor: t.color.line },
  buttonLabel: { color: t.color.teal, fontSize: 15, fontWeight: '700' },
  disabled: { color: t.color.muted },
  input: { minHeight: 64, borderRadius: 10, backgroundColor: t.color.white, borderColor: t.color.teal, borderWidth: 1, padding: 10, fontSize: 16, color: t.color.ink },
  error: { color: t.color.error, fontSize: 13, lineHeight: 19 },
});
