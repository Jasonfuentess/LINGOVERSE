import { StyleSheet, Text, View } from 'react-native';
import { Copy } from '../../components/ui';
import type { Evaluation } from '../../domain/learning/models';
import { tokens as t } from '../../theme/tokens';
import { CoachSpeech, SpeechButton } from '../voice/VoiceControls';

export function EducationalFeedback({ feedback, submittedText, speaker, embedded = false, resultLabel, coachExplanation, language = 'fr' }: {
  feedback: Evaluation; submittedText?: string; speaker: string;
  embedded?: boolean; resultLabel?: string;
  coachExplanation?: string; language?: 'fr' | 'en';
}) {
  return <View accessibilityLiveRegion={embedded ? undefined : 'polite'} style={embedded ? styles.embedded : [styles.panel, !feedback.correct && styles.retry, feedback.writtenIssue === 'unknown' && styles.unknown]}>
    <View style={styles.header}>
      <Text accessible={false} style={[styles.symbol, !feedback.correct && styles.retrySymbol]}>{feedback.correct ? '✓' : feedback.writtenIssue === 'unknown' ? '?' : '↻'}</Text>
      <Text accessibilityRole="header" style={styles.title}>{resultLabel ?? (feedback.correct ? '¡Bien resuelto!' : feedback.writtenIssue === 'unknown' ? 'Aún no podemos verificarla' : 'Vamos por partes')}</Text>
    </View>
    {submittedText && <Copy>Tu respuesta: {submittedText}</Copy>}
    <Copy>{coachExplanation ?? feedback.explanation}</Copy>
    {!embedded && <CoachSpeech text={feedback.spokenExplanation ?? feedback.explanation} />}
    {(!feedback.correct || coachExplanation) && <View style={styles.correction}><Text style={styles.label}>UNA FORMA DE RESPONDER</Text><Text style={styles.answer}>{feedback.correction}</Text></View>}
    {(!feedback.correct || coachExplanation) && <SpeechButton text={feedback.correction.split('→')[0]!.split(' / ')[0]!.trim()} language={language === 'en' ? 'en-GB' : 'fr-FR'} label={`el ejemplo en ${language === 'en' ? 'inglés' : 'francés'}`} />}
    {feedback.reply.length > 0 && <Copy>{speaker}: {feedback.reply.replace('→', '—')}</Copy>}
    {feedback.reply.length > 0 && <SpeechButton text={feedback.reply.split('→')[0]!.trim()} language={language === 'en' ? 'en-GB' : 'fr-FR'} label={`la respuesta de ${speaker}`} />}
    {!feedback.correct && <Copy>Podés volver a intentarlo con la ayuda de arriba.</Copy>}
  </View>;
}

const styles = StyleSheet.create({
  embedded: { gap: t.space.sm },
  panel: { padding: t.space.md, gap: t.space.sm, borderRadius: t.radius.sm, backgroundColor: t.color.tint, borderLeftWidth: 3, borderLeftColor: t.color.teal },
  retry: { backgroundColor: '#FFF5E9', borderLeftColor: '#87501F' },
  unknown: { backgroundColor: '#E8F0F9', borderLeftColor: '#42658A' },
  header: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
  symbol: { color: t.color.teal, fontSize: 24, fontWeight: '700' },
  retrySymbol: { color: '#87501F' },
  title: { flex: 1, fontSize: t.type.heading, color: t.color.ink, fontWeight: '700' },
  correction: { gap: t.space.xs, borderTopWidth: 1, borderTopColor: t.color.line, paddingTop: t.space.sm },
  label: { fontSize: t.type.small, color: t.color.muted, fontWeight: '700' },
  answer: { fontSize: t.type.body, lineHeight: 26, fontWeight: '600', color: t.color.ink },
});
