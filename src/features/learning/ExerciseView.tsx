import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AnswerTextInput, KeyboardAnswerGroup } from '../../components/KeyboardScroll';
import { Button, Card, Choice, Copy, Heading, Notice } from '../../components/ui';
import type { Evaluation, Exercise, LearnerAnswer } from '../../domain/learning/models';
import { tokens as t } from '../../theme/tokens';
import { CoachReaction } from '../humor/CoachReaction';

export function ExerciseView({ exercise, feedback, submittedAnswer, saving, error, onAnswer, onContinue }: {
  exercise: Exercise; feedback: Evaluation | null; saving: boolean; error: string | null;
  submittedAnswer?: LearnerAnswer;
  onAnswer: (answer: LearnerAnswer) => Promise<boolean>; onContinue: () => Promise<boolean>;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState('');
  const locked = saving || feedback?.correct === true;
  const canSubmit = exercise.kind === 'choice' ? selected !== null : text.trim().length > 0;
  const submittedText = submittedAnswer?.kind === 'text' ? submittedAnswer.text : submittedAnswer?.kind === 'choice' && exercise.kind === 'choice' ? exercise.choices.find(option => option.id === submittedAnswer.choiceId)?.label : undefined;
  return <>
    <Heading>{exercise.title}</Heading><Copy>{exercise.scene}</Copy>
    <Card><Copy>{exercise.speaker.toLocaleUpperCase()}</Copy><Heading>{exercise.prompt}</Heading><Copy>{exercise.promptTranslation}</Copy></Card>
    <Card><Copy>ANTES DE RESPONDER</Copy><Copy>{exercise.teaching}</Copy></Card>
    <Copy>{exercise.instruction}</Copy>
    <KeyboardAnswerGroup>
    {exercise.kind === 'choice' ? <View accessibilityRole="radiogroup" accessibilityLabel={exercise.instruction} style={local.options}>
      {exercise.choices.map(option => <Choice key={option.id} label={option.label} detail={selected === option.id ? 'Respuesta seleccionada' : 'Seleccionar esta respuesta'} selected={selected === option.id} disabled={locked} onPress={() => setSelected(option.id)} />)}
    </View> : <>
      <Copy>Tu respuesta escrita (máximo 400 caracteres)</Copy>
      <AnswerTextInput accessibilityLabel={exercise.instruction} value={text} onChangeText={setText} editable={!locked} maxLength={400} multiline autoCorrect={false} autoCapitalize="sentences" style={local.input} placeholder="Escribí en francés…" placeholderTextColor={t.color.muted} />
    </>}
    {!feedback?.correct && <Button label={saving ? 'Guardando…' : feedback ? 'Volver a comprobar' : 'Comprobar respuesta'} disabled={!canSubmit || saving} onPress={() => {
      const answer: LearnerAnswer = exercise.kind === 'choice' ? { kind: 'choice', choiceId: selected ?? '' } : { kind: 'text', text };
      void onAnswer(answer);
    }} />}
    </KeyboardAnswerGroup>
    <CoachReaction feedback={feedback} submittedText={submittedText} speaker={exercise.speaker} />
    {error && <Notice message={error} />}
    {feedback?.correct && <Button label={saving ? 'Guardando…' : exercise.id === 'depart' ? 'Terminar aventura' : 'Continuar conversación'} disabled={saving} onPress={() => { void onContinue(); }} />}
  </>;
}
const local = StyleSheet.create({
  options: { gap: t.space.sm },
  input: { minHeight: 100, padding: t.space.md, backgroundColor: t.color.white, color: t.color.ink, borderWidth: 2, borderColor: t.color.teal, borderRadius: t.radius.sm, fontSize: t.type.body, textAlignVertical: 'top' },
});
