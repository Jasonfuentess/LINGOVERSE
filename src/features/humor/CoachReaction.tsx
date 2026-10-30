import { Text, View } from 'react-native';
import { CoachCharacter } from './CoachCharacter';
import { coaches } from '../../content/humor';
import { useMission } from '../learning/MissionProvider';
import { usePreferences } from '../preferences/PreferencesProvider';
import { useHumorPreferences } from './HumorPreferencesProvider';
import type { Evaluation } from '../../domain/learning/models';
import { EducationalFeedback } from '../learning/EducationalFeedback';
import { canRoast } from '../../domain/humor/access';
export function CoachReaction({ feedback, submittedText, speaker = '' }: { feedback?: Evaluation | null; submittedText?: string; speaker?: string }) {
  const { reaction, mode = 'friendly' } = useMission();
  const profile = usePreferences();
  const { settings, loading } = useHumorPreferences();
  const fallback = feedback ? <EducationalFeedback feedback={feedback} submittedText={submittedText} speaker={speaker} /> : null;
  if (!reaction || loading || reaction.locale !== profile.preferences?.coachLocale) return fallback;
  if (mode === 'roast' ? !canRoast(settings) || reaction.mode !== 'roast' : !settings?.enabled || (settings.intensity === 'gentle' && reaction.intensity === 'playful') || reaction.explicit || reaction.mode !== 'friendly') return fallback;
  const coach = coaches.find(coach => coach.locale === reaction.locale);
  if (!coach) return fallback;
  const resultLabel = feedback ? feedback.correct
    ? mode === 'roast' || reaction.category === 'recovery' ? '¡Ahora sí, bien resuelto!' : '¡Bien resuelto!'
    : reaction.category === 'retry' || reaction.category === 'recurring' ? 'Probemos de nuevo' : 'Vamos por partes'
    : reaction.category === 'celebration' ? '¡Aventura completada!' : undefined;
  return <View accessibilityLiveRegion="polite"><CoachCharacter name={coach.name} locale={reaction.locale} text={mode === 'roast' && feedback ? '' : reaction.text}>
    {feedback ? <EducationalFeedback embedded coachExplanation={mode === 'roast' ? reaction.educational ? reaction.text : `${reaction.text} ${feedback.explanation}` : undefined} resultLabel={resultLabel} feedback={feedback} submittedText={mode === 'roast' ? undefined : submittedText} speaker={speaker} /> : resultLabel ? <Text accessibilityRole="header" style={{ fontSize: 24, fontWeight: '700' }}>{resultLabel}</Text> : null}
  </CoachCharacter></View>;
}
