import { Text, View } from 'react-native';
import { CoachCharacter } from './CoachCharacter';
import { coaches } from '../../content/humor';
import { useMission } from '../learning/MissionProvider';
import { usePreferences } from '../preferences/PreferencesProvider';
import { useHumorPreferences } from './HumorPreferencesProvider';
import type { Evaluation } from '../../domain/learning/models';
import { EducationalFeedback } from '../learning/EducationalFeedback';
import { canRoast } from '../../domain/humor/access';
import { CoachSpeech } from '../voice/VoiceControls';
export function CoachReaction({ feedback: originalFeedback, submittedText, speaker = '', separateReply = false, language = 'fr', adventure = 'cafe' }: { feedback?: Evaluation | null; submittedText?: string; speaker?: string; separateReply?: boolean; language?: 'fr' | 'en'; adventure?: 'cafe' | 'rendezvous' }) {
  const feedback = originalFeedback && separateReply ? { ...originalFeedback, reply: '' } : originalFeedback;
  const { reaction, mode: missionMode = 'friendly' } = useMission(language, adventure);
  const profile = usePreferences();
  const { settings, loading } = useHumorPreferences();
  const mode = missionMode === 'roast' || (settings?.adventureRoast && settings.enabled && canRoast(settings)) ? 'roast' : 'friendly';
  const fallback = feedback ? <EducationalFeedback feedback={feedback} submittedText={submittedText} speaker={speaker} language={language} /> : null;
  if (!reaction || loading || reaction.locale !== profile.preferences?.coachLocale) return fallback;
  if (mode === 'roast' ? !canRoast(settings) || reaction.mode !== 'roast' : !settings?.enabled || (settings.intensity === 'gentle' && reaction.intensity === 'playful') || reaction.explicit || reaction.mode !== 'friendly') return fallback;
  const coach = coaches.find(coach => coach.locale === reaction.locale);
  if (!coach) return fallback;
  const resultLabel = feedback?.writtenIssue === 'unknown' ? 'Aún no podemos verificarla' : feedback ? feedback.correct
    ? mode === 'roast' || reaction.category === 'recovery' ? '¡Ahora sí, bien resuelto!' : '¡Bien resuelto!'
    : reaction.category === 'retry' || reaction.category === 'recurring' ? 'Probemos de nuevo' : 'Vamos por partes'
    : reaction.category === 'celebration' ? '¡Aventura completada!' : undefined;
  const spoken = feedback ? mode === 'roast' ? reaction.educational ? reaction.text : `${reaction.text} ${feedback.spokenExplanation ?? feedback.explanation}` : `${feedback.spokenExplanation ?? feedback.explanation} ${reaction.text}` : reaction.text;
  return <View accessibilityLiveRegion="polite"><CoachCharacter name={coach.name} locale={reaction.locale} tone={mode === 'roast' ? 'roast' : feedback?.correct ? 'success' : feedback?.writtenIssue === 'unknown' ? 'unknown' : feedback ? 'retry' : undefined} text={mode === 'roast' && feedback ? '' : reaction.text}>
    {feedback ? <EducationalFeedback embedded coachExplanation={mode === 'roast' ? reaction.educational ? reaction.text : `${reaction.text} ${feedback.explanation}` : undefined} resultLabel={resultLabel} language={language} feedback={feedback} submittedText={mode === 'roast' ? undefined : submittedText} speaker={speaker} /> : resultLabel ? <Text accessibilityRole="header" style={{ fontSize: 24, fontWeight: '700' }}>{resultLabel}</Text> : null}
    <CoachSpeech text={spoken} adult={mode === 'roast' || reaction.explicit} />
  </CoachCharacter></View>;
}
