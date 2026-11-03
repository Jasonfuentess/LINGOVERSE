import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Copy } from '../../components/ui';
import type { ConversationBeat, ConversationTurn, Intervention } from '../../domain/conversation/presentation';
import { tokens as t } from '../../theme/tokens';
import { CharacterPortrait, SceneArtwork } from '../../components/AdventureArt';
import { SpeechButton } from '../voice/VoiceControls';

export function ConversationMessage({ role, speaker, text, translation, language = 'fr-FR', verifiedExample = false }: Omit<Intervention, 'id'> & { language?: string; verifiedExample?: boolean }) {
  const parts = text.split('→');
  const dialogue = parts[0]?.trim() ?? text;
  const explanation = translation ?? parts.slice(1).join('→').trim();
  return <View style={[styles.messageRow, role === 'student' && styles.studentRow]}>
    {role === 'npc' && <View style={styles.speakerHeader}><CharacterPortrait name={speaker} size={72} /><View style={{ flex: 1, gap: 4 }}><Text style={styles.speakerKicker}>EN LA CONVERSACIÓN</Text><Text style={styles.speakerName}>{speaker}</Text></View></View>}
    <View style={[styles.message, role === 'student' ? styles.student : styles.npc]}>
    {role === 'student' && <Text style={styles.label}>{speaker}</Text>}
    <Text style={styles.dialogue}>{dialogue}</Text>
    {explanation ? <Text style={styles.translation}>{explanation}</Text> : null}
    {role === 'npc' && <SpeechButton text={dialogue} language={language} label={`a ${speaker}`} />}
    {role === 'student' && verifiedExample && <SpeechButton text={dialogue} language={language} label="el modelo de tu respuesta" />}
  </View></View>;
}

/** A short bridge between scenes, derived strictly from the previous verified exchange. */
export function ConversationBridge({ beat, language }: { beat: ConversationBeat | null; language: 'fr-FR' | 'en-GB' }) {
  if (!beat) return null;
  const npc = beat.reply ?? beat.prompt;
  const spokenText = npc.text.split('→')[0]?.trim() ?? npc.text;
  const line = <View style={styles.bridgeReply}>
    <Text style={styles.bridgeSpeaker}>{npc.speaker}</Text>
    <Text style={styles.bridgeDialogue}>{spokenText}</Text>
  </View>;
  return <View style={styles.bridge} accessibilityLabel="Último intercambio completado">
    <Text style={styles.bridgeEyebrow}>HACE UN MOMENTO · TU HISTORIA</Text>
    {!beat.reply && line}
    <Text style={styles.bridgeStudent}>Vos: {beat.student.text}</Text>
    {beat.reply && line}
    <SpeechButton text={spokenText} language={language} label={`el diálogo anterior de ${npc.speaker}`} />
  </View>;
}

export function CafeScene({ title, scene, completed, language = 'fr', adventure = 'cafe', variantId, total = 8 }: { title: string; speaker: string; scene: string; completed: number; language?: 'fr' | 'en'; adventure?: 'cafe' | 'rendezvous'; variantId?: string; total?: number }) {
  return <View style={styles.scene}>
    <SceneArtwork language={language} adventure={adventure} variantId={variantId} compact />
    <View style={styles.sceneBody}>
    <Text style={styles.eyebrow}>{language === 'en' ? 'LONDRES · AVENTURA / ENGLISH A1' : adventure === 'rendezvous' ? 'PARÍS · RENDEZ-VOUS / FRANÇAIS A1' : 'PARÍS · CAFÉ / FRANÇAIS A1'}</Text>
    <Text accessibilityRole="header" style={styles.sceneTitle}>{title}</Text>
    <Text style={styles.sceneCopy}>{scene}</Text>
    <Text style={styles.sceneDetail}>{completed}/{total} momentos completados · A tu ritmo</Text>
    <View accessibilityRole="progressbar" accessibilityLabel="Momentos completados" accessibilityValue={{ min: 0, max: total, now: completed }} style={styles.progress}><View style={[styles.progressFill, { width: `${completed / total * 100}%` }]} /></View>
    </View>
  </View>;
}

export function ConversationHistory({ turns, language = 'fr-FR' }: { turns: ConversationTurn[]; language?: string }) {
  const [open, setOpen] = useState(false);
  if (!turns.length) return null;
  return <View style={styles.history}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={styles.historyButton}>
      <Text style={styles.historyLabel}>{open ? 'Cerrar' : 'Revisar'} conversación anterior · {turns.length}</Text>
    </Pressable>
    {open && turns.map(turn => <View key={turn.id} style={styles.turn}>
      <Copy>{turn.scene}</Copy>
      {turn.messages.map(message => <ConversationMessage key={message.id} {...message} language={language} verifiedExample={message.role === 'student'} />)}
      <View style={styles.note}><Text style={styles.label}>LO QUE PRACTICASTE · {turn.attempts} {turn.attempts === 1 ? 'intento' : 'intentos'}</Text><Copy>{turn.feedback.explanation}</Copy></View>
    </View>)}
  </View>;
}
const styles = StyleSheet.create({
  bridge: { backgroundColor: '#E7EDF2', borderLeftWidth: 2, borderColor: '#96ADBF', borderRadius: 14, padding: 14, gap: 6 },
  bridgeEyebrow: { color: t.color.teal, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  bridgeStudent: { color: t.color.muted, fontSize: 13, lineHeight: 19 },
  bridgeReply: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 8 },
  bridgeSpeaker: { color: t.color.teal, fontWeight: '700', fontSize: 14 },
  bridgeDialogue: { color: t.color.ink, fontWeight: '600', fontSize: 16, lineHeight: 23, flexShrink: 1 },
  scene: { backgroundColor: t.color.night, borderRadius: 22, overflow: 'hidden' },
  sceneBody: { padding: 16, gap: 7 },
  progress: { height: 3, backgroundColor: '#3B5260', borderRadius: 2, marginTop: 4 },
  progressFill: { height: 3, backgroundColor: t.color.gold, borderRadius: 2 },
  messageRow: { gap: 10 },
  studentRow: { alignItems: 'flex-end' },
  speakerHeader: { flexDirection: 'row', gap: 14, alignItems: 'center', paddingTop: 8 },
  speakerKicker: { color: t.color.muted, fontSize: 9, letterSpacing: 1.5, fontWeight: '700' },
  speakerName: { color: t.color.ink, fontSize: 23, fontWeight: '700' },
  eyebrow: { color: t.color.gold, fontSize: 10, letterSpacing: 1.5, fontWeight: '700', lineHeight: 17 },
  sceneTitle: { color: '#FFFFFF', fontSize: 22, lineHeight: 28, fontWeight: '700' },
  sceneDetail: { color: '#BCD1DC', fontSize: 12, lineHeight: 18 },
  sceneCopy: { color: '#E4EDF2', fontSize: 14, lineHeight: 21 },
  message: { padding: 20, gap: 8, flexShrink: 1, borderRadius: 22 },
  npc: { backgroundColor: t.color.white, borderTopLeftRadius: 4, borderWidth: 1, borderColor: t.color.line },
  student: { backgroundColor: t.color.tint, borderBottomRightRadius: 4, borderWidth: 1, borderColor: '#BDD8CB' },
  label: { fontSize: 13, fontWeight: '700', color: t.color.teal, lineHeight: 20 },
  dialogue: { color: t.color.ink, fontSize: 21, lineHeight: 30, fontWeight: '600' },
  translation: { color: t.color.muted, fontSize: 16, lineHeight: 24 },
  history: { gap: 14 },
  historyButton: { minHeight: 48, paddingVertical: 12, justifyContent: 'center' },
  historyLabel: { color: t.color.teal, fontWeight: '700', fontSize: 16 },
  turn: { gap: 14, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: t.color.line },
  note: { gap: 6, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: t.color.line },
});
