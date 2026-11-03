import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AnswerTextInput, KeyboardAnswerGroup } from '../../components/KeyboardScroll';
import { Button, Card, Choice, Copy, Heading, Notice } from '../../components/ui';
import type { AnswerSupport, Evaluation, Exercise, LearnerAnswer } from '../../domain/learning/models';
import { tokens as t } from '../../theme/tokens';
import { CoachReaction } from '../humor/CoachReaction';
import { ConversationMessage } from './Conversation';
import { verifiedWrittenText } from '../../domain/conversation/presentation';
import { SpeechButton } from '../voice/VoiceControls';
import { SpeechInput } from '../voice/SpeechInput';
import { matchSpokenChoice } from '../../domain/voice/choiceMatching';
import { inspectTranscript } from '../../domain/voice/transcriptReview';
import { BeginnerPreparation, type PreparationProps } from './BeginnerPreparation';
import { LearningRescue, type RescueProps } from './LearningRescue';
import { ChoiceListening } from './ChoiceListening';

export function ExerciseView({ exercise, feedback, submittedAnswer, saving, error, onAnswer, onContinue, conversational = false, language = 'fr', adventure = 'cafe', preparation, rescue }: {
  exercise: Exercise; feedback: Evaluation | null; saving: boolean; error: string | null;
  submittedAnswer?: LearnerAnswer;
  conversational?: boolean; language?: 'fr' | 'en'; adventure?: 'cafe' | 'rendezvous';
  onAnswer: (answer: LearnerAnswer, support?: AnswerSupport) => Promise<boolean>; onContinue: () => Promise<boolean>;
  preparation?: Omit<PreparationProps, 'language' | 'answered'>;
  rescue?: RescueProps;
}) {
  const voiceLanguage = language === 'en' ? 'en-GB' : 'fr-FR';
  const [selected, setSelected] = useState<string | null>(feedback && submittedAnswer?.kind === 'choice' ? submittedAnswer.choiceId : null);
  const [text, setText] = useState(feedback && submittedAnswer?.kind === 'text' ? submittedAnswer.text : '');
  const [helpOpen, setHelpOpen] = useState(false);
  const [expressionsOpen, setExpressionsOpen] = useState(false);
  const [usedHelp,setUsedHelp]=useState(rescue ? rescue.mode!=='autonomous' : false);
  const [oralAnswerOpen,setOralAnswerOpen]=useState(false);
  const markHelp=useCallback(()=>setUsedHelp(true),[]);
  const locked = saving || feedback?.correct === true;
  const answerReady = !preparation || preparation.step === 'respond' || preparation.step === 'done' || feedback !== null;
  const canSubmit = exercise.kind === 'choice' ? selected !== null : text.trim().length > 0;
  const submittedText = submittedAnswer?.kind === 'text' ? submittedAnswer.text : submittedAnswer?.kind === 'choice' && exercise.kind === 'choice' ? exercise.choices.find(option => option.id === submittedAnswer.choiceId)?.label : undefined;
  return <View style={conversational ? local.conversation : local.standalone}>
    {saving && <Text accessibilityLiveRegion="polite" style={local.saving}>Guardando tu avance…</Text>}
    {conversational && <Text style={local.turnTitle}>{exercise.title}</Text>}
    {conversational ? <ConversationMessage role="npc" speaker={exercise.speaker} text={exercise.prompt} translation={feedback || expressionsOpen || rescue?.mode==='starter' ? exercise.promptTranslation : undefined} language={voiceLanguage} /> : <>
      <Heading>{exercise.title}</Heading><Copy>{exercise.scene}</Copy>
      <Card><Copy>{exercise.speaker.toLocaleUpperCase()}</Copy><Heading>{exercise.prompt}</Heading><Copy>{exercise.promptTranslation}</Copy><SpeechButton text={exercise.prompt} language={voiceLanguage} label={`a ${exercise.speaker}`} /></Card>
    </>}
    {rescue?.mode==='a1'&&!feedback?.correct&&<Copy>{exercise.instruction}</Copy>}
    {rescue&&!feedback?.correct&&<LearningRescue key={`${rescue.plan.id}:${rescue.mode}`} {...rescue} language={voiceLanguage} disabled={locked} onHelp={markHelp} onUse={answer=>{markHelp();if(answer.kind==='text')setText(answer.text);else setSelected(answer.choiceId);}} />}
    {preparation && !feedback?.correct && <BeginnerPreparation {...preparation} language={voiceLanguage} answered={false} />}
    {(!conversational || !feedback?.correct) && <View style={conversational ? local.help : undefined}>
      {conversational ? <Pressable accessibilityRole="button" accessibilityState={{ expanded: helpOpen }} onPress={() => { markHelp();setHelpOpen(!helpOpen); }} style={local.helpButton}><Text style={local.helpLabel}>{helpOpen ? 'Cerrar ayuda' : 'Necesito una pista'}</Text></Pressable> : <Copy>ANTES DE RESPONDER</Copy>}
      {conversational && helpOpen && <>{rescue?.mode !== 'a1' && <Copy>{exercise.instruction}</Copy>}<Pressable accessibilityRole="button" accessibilityState={{ expanded: expressionsOpen }} onPress={() => setExpressionsOpen(!expressionsOpen)} style={local.helpButton}><Text style={local.helpLabel}>{expressionsOpen ? 'Ocultar expresiones' : 'Ver traducción y expresiones'}</Text></Pressable></>}
      {(!conversational || (helpOpen && expressionsOpen)) && <Copy>{exercise.teaching}</Copy>}
    </View>}
    {answerReady && (!conversational || !feedback?.correct) && <>
    {conversational ? <Text style={local.responseLabel}>TU TURNO · {exercise.kind === 'choice' ? 'Elegí qué decir' : `Respondé en ${language === 'en' ? 'inglés' : 'francés'}`}</Text> : <Copy>{exercise.instruction}</Copy>}
    <KeyboardAnswerGroup compact={conversational}>
    {exercise.kind === 'choice' ? <View accessibilityRole="radiogroup" accessibilityLabel={exercise.instruction} style={local.options}>
      {exercise.choices.map(option => conversational ? <Pressable key={option.id} accessibilityRole="radio" accessibilityState={{ checked: selected === option.id, disabled: locked }} disabled={locked} onPress={() => setSelected(option.id)} style={({ pressed }) => [local.replyOption, selected === option.id && local.selectedReply, pressed && { opacity: 0.7 }]}><Text style={local.replyText}>{option.label}</Text><Text accessible={false} style={local.replyMark}>{selected === option.id ? '●' : '○'}</Text></Pressable> : <Choice key={option.id} label={option.label} detail={selected === option.id ? 'Respuesta seleccionada' : 'Seleccionar esta respuesta'} selected={selected === option.id} disabled={locked} onPress={() => setSelected(option.id)} />)}
    </View> : <>
      {!conversational && <Copy>Tu respuesta escrita (máximo 400 caracteres)</Copy>}
      <AnswerTextInput accessibilityLabel={exercise.instruction} value={text} onChangeText={setText} editable={!locked} maxLength={400} multiline autoCorrect={false} autoCapitalize="sentences" style={local.input} placeholder={language === 'en' ? 'Escribí en inglés…' : 'Escribí en francés…'} placeholderTextColor={t.color.muted} />
    </>}
    {conversational && exercise.kind === 'choice' && !feedback?.correct && <ChoiceListening key={exercise.id} choices={exercise.choices} language={voiceLanguage} mode={rescue?.mode ?? 'autonomous'} onHelp={markHelp} />}
    {rescue&&<Button variant="text" label={oralAnswerOpen?'Cerrar respuesta por micrófono':'Responder usando micrófono'} onPress={()=>setOralAnswerOpen(!oralAnswerOpen)} />}
    {(!rescue||oralAnswerOpen)&&<SpeechInput key={`${language}:${exercise.id}`} language={voiceLanguage} disabled={locked} inspect={(transcript, evidence) => inspectTranscript(exercise, transcript, voiceLanguage, evidence)} onUse={transcript => {
      markHelp();
      if (exercise.kind === 'text') { setText(transcript); return true; }
      const choiceId = matchSpokenChoice(exercise, transcript);
      if (!choiceId) return false;
      setSelected(choiceId);
      return true;
    }} />}
    {!feedback?.correct && <Button label={saving ? 'Guardando…' : (preparation||rescue) ? feedback ? 'Probar otra respuesta' : 'Responder al personaje' : feedback ? 'Volver a comprobar' : 'Comprobar respuesta'} disabled={!canSubmit || saving} onPress={() => {
      const answer: LearnerAnswer = exercise.kind === 'choice' ? { kind: 'choice', choiceId: selected ?? '' } : { kind: 'text', text };
      void onAnswer(answer,rescue ? rescue.mode!=='autonomous'||usedHelp||feedback!==null ? 'assisted':'independent' : undefined);
    }} />}
    </KeyboardAnswerGroup>
    </>}
    {conversational && feedback?.correct && <ConversationMessage role="student" speaker="Vos · respuesta verificada" language={voiceLanguage} verifiedExample text={exercise.kind === 'text' ? verifiedWrittenText(exercise, submittedAnswer) : submittedText ?? 'Respuesta verificada'} />}
    {conversational && feedback?.reply ? <ConversationMessage role="npc" speaker={exercise.speaker} text={feedback.reply} language={voiceLanguage} /> : null}
    <CoachReaction language={language} adventure={adventure} feedback={feedback} submittedText={conversational ? undefined : submittedText} speaker={exercise.speaker} separateReply={conversational} />
    {preparation && feedback?.correct && <BeginnerPreparation {...preparation} language={voiceLanguage} answered />}
    {error ? <Notice message={error} /> : null}
    {feedback?.correct && <Button label={saving ? 'Guardando…' : (feedback.next === null || exercise.id === 'depart') ? 'Terminar aventura' : 'Continuar conversación'} disabled={saving} onPress={() => { void onContinue(); }} />}
  </View>;
}
const local = StyleSheet.create({
  standalone: { gap: t.space.md },
  conversation: { gap: 12 },
  saving: { color: t.color.teal, fontSize: 14, fontWeight: '600', padding: 12, backgroundColor: t.color.tint, borderRadius: 12 },
  turnTitle: { color: t.color.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 8 },
  responseLabel: { color: t.color.teal, fontSize: 12, letterSpacing: 1, fontWeight: '700', marginTop: 4 },
  replyOption: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: t.color.line, borderRadius: 16, backgroundColor: t.color.white },
  selectedReply: { backgroundColor: t.color.tint, borderColor: t.color.teal, borderWidth: 2, paddingVertical: 13, paddingHorizontal: 15 },
  replyText: { flex: 1, color: t.color.ink, fontSize: 17, lineHeight: 25, fontWeight: '600' },
  replyMark: { color: t.color.teal, fontSize: 20 },
  help: { paddingLeft: 14, borderLeftWidth: 2, borderLeftColor: t.color.line, gap: 6 },
  helpButton: { minHeight: 48, justifyContent: 'center' },
  helpLabel: { color: t.color.teal, fontSize: 16, fontWeight: '700' },
  options: { gap: t.space.sm },
  input: { minHeight: 88, padding: 16, backgroundColor: t.color.white, color: t.color.ink, borderWidth: 2, borderColor: t.color.teal, borderRadius: 18, fontSize: t.type.body, lineHeight: 26, textAlignVertical: 'top' },
});
