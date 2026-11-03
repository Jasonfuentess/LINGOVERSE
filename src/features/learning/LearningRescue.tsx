import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Copy } from '../../components/ui';
import type { LearnerAnswer } from '../../domain/learning/models';
import type { PedagogicalMode } from '../../domain/learning/support';
import type { RescuePlan } from '../../content/rescue';
import { containsPhrase, pronunciationFor } from '../../content/pronunciation';
import { PronunciationCoach } from './PronunciationCoach';
import { tokens as t } from '../../theme/tokens';
import { SpeechInput } from '../voice/SpeechInput';
export interface RescueProps { plan: RescuePlan; mode: PedagogicalMode }
export function LearningRescue({ plan, mode, language, disabled, onUse, onHelp }: RescueProps & { language:'fr-FR'|'en-GB'; disabled:boolean; onUse:(answer:LearnerAnswer)=>void; onHelp:()=>void }) {
  const [open,setOpen]=useState(mode==='starter');
  const [details,setDetails]=useState(false);
  const [build,setBuild]=useState(false);
  const [added,setAdded]=useState(0);
  const [practice,setPractice]=useState(false);
  const [practiceText,setPracticeText]=useState('');
  const [alternatives,setAlternatives]=useState(false);
  const [index,setIndex]=useState(()=>Math.max(0,plan.alternatives.findIndex(model=>model.text===plan.text)));
  const model=plan.alternatives[index]??plan;
  const guide=pronunciationFor(model.text,language==='fr-FR'?'fr':'en');
  const contextualGuide=!guide?plan.usefulGuides.find(item=>containsPhrase(model.text,item.original)):null;
  const segments=guide?.segments??[model.text];
  useEffect(()=>{ if(mode!=='autonomous') onHelp(); },[mode,onHelp]);
  const prepare=()=>{onHelp();onUse(model.answer);};
  return <View style={s.wrapper}>
    {!open && <Button variant="secondary" label="Aprender cómo responder" disabled={disabled} onPress={()=>{onHelp();setOpen(true);}} />}
    {open && <View style={s.panel}>
      <View style={s.header}><Text accessibilityRole="header" style={s.label}>ESCUCHÁ · COMPRENDÉ · PREPARÁ</Text><Pressable accessibilityRole="button" accessibilityLabel="Cerrar preparación" onPress={()=>setOpen(false)} style={s.close}><Text style={s.link}>Cerrar</Text></Pressable></View>
      <Text style={s.original}>{model.text}</Text>
      {guide ? <><Copy>{`Significa: ${guide.translation}`}</Copy><Text style={s.note}>{`Sirve para: ${guide.purpose}`}</Text></> : <Copy>{`Para: ${plan.meaning}`}</Copy>}
      <PronunciationCoach key={`model:${model.text}`} guide={guide} text={model.text} language={language} mode={mode} onHelp={onHelp} />
      {contextualGuide&&<PronunciationCoach key={`related:${contextualGuide.id}`} related guide={contextualGuide} text={contextualGuide.original} language={language} mode={mode} onHelp={onHelp} />}
      <Button label="Preparar esta respuesta con ayuda" disabled={disabled} onPress={prepare} />
      <Text style={s.note}>Prepara tu borrador; después elegís enviarlo. Podés continuar con ayuda aunque el micrófono no entienda.</Text>
      <Button variant="text" label={details?'Cerrar práctica':'Practicar y construir mi respuesta'} onPress={()=>{onHelp();setDetails(!details);}} />
      {details&&<><Button variant="text" label={build?'Cerrar construcción':'Construir mi respuesta'} onPress={()=>{onHelp();setBuild(!build);}} />
      {build && <View style={s.section}><Copy>Agregá los grupos en orden. Podés escuchar cada uno antes.</Copy><View style={s.tokens}>{segments.map((part,i)=><Button key={`${i}:${part}`} variant="secondary" label={i<added?`✓ ${part}`:`Añadir ${part}`} disabled={disabled||i!==added} onPress={()=>{onHelp();setAdded(i+1);}} />)}</View><Text style={s.partText}>{segments.slice(0,added).join(' ')||'Tu respuesta aparecerá aquí.'}</Text><Button label="Usar respuesta construida" disabled={disabled||added!==segments.length} onPress={prepare} /><Button variant="text" label="Volver a construir" onPress={()=>setAdded(0)} /></View>}
      <Button variant="text" label={practice?'Cerrar práctica oral':'Practicar hablando sin enviar'} onPress={()=>{onHelp();setPractice(!practice);}} />
      {practice && <View style={s.section}><SpeechInput language={language} disabled={disabled} purpose="practice" onUse={text=>{setPracticeText(text);return true;}} /><Button variant="secondary" label="Confirmar: intentaba decir el modelo" disabled={disabled} onPress={()=>setPracticeText(model.text)} />{practiceText.length>0&&<View accessibilityLiveRegion="polite"><Copy>Práctica en pantalla: {practiceText}</Copy></View>}<Copy>Confirmar lo que intentabas decir no verifica sonidos ni envía una respuesta educativa.</Copy></View>}
      {plan.alternatives.length>1&&<><Button variant="text" label={alternatives?'Ocultar otras formas':'Ver otras respuestas válidas'} onPress={()=>{onHelp();setAlternatives(!alternatives);}} />{alternatives&&plan.alternatives.map((alternative,i)=><Button key={`${i}:${alternative.text}`} variant="secondary" label={alternative.text} disabled={disabled} onPress={()=>{onHelp();setIndex(i);setAdded(0);setPracticeText('');}} />)}</>}
      </>}
    </View>}
  </View>;
}
const s=StyleSheet.create({
  wrapper:{gap:10},panel:{gap:12,padding:16,borderRadius:22,backgroundColor:'#E8F1F1',borderWidth:1,borderColor:'#BBD4D0'},header:{flexDirection:'row',alignItems:'center',gap:8},label:{color:t.color.teal,fontSize:11,lineHeight:18,fontWeight:'800',letterSpacing:0.5,flexShrink:1},close:{marginLeft:'auto',minHeight:44,justifyContent:'center'},link:{color:t.color.teal,fontSize:14,fontWeight:'700'},original:{color:t.color.ink,fontSize:25,lineHeight:33,fontWeight:'600'},guide:{gap:5},approximate:{color:t.color.ink,fontSize:18,lineHeight:26,fontWeight:'600'},note:{color:t.color.muted,fontSize:13,lineHeight:20},section:{gap:12},part:{padding:12,gap:8,backgroundColor:t.color.white,borderRadius:14},partText:{color:t.color.ink,fontSize:18,lineHeight:27},tokens:{gap:8},
});
