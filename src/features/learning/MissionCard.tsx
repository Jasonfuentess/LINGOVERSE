import { useRouter } from 'expo-router';
import { Children, type PropsWithChildren } from 'react';
import { Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Button, Notice } from '../../components/ui';
import { SceneArtwork } from '../../components/AdventureArt';
import { tokens as t } from '../../theme/tokens';
import { useMission } from './MissionProvider';

function AdventureCard({ language = 'fr', adventure = 'cafe', featured = false }: { language?: 'fr' | 'en'; adventure?: 'cafe' | 'rendezvous'; featured?: boolean }) {
  const { progress, loading, loadError } = useMission(language, adventure);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const split = featured && width >= 900;
  const english = language === 'en';
  const meeting = adventure === 'rendezvous';
  const total = english ? 9 : meeting ? 10 : 8;
  const done = progress?.completedObjectives.length ?? 0;
  const title = english ? 'Lost in London' : meeting ? 'Un rendez-vous à Paris' : 'Un café en París';
  const label = english ? progress?.status === 'active' ? 'Continuar Lost in London' : progress?.status === 'completed' ? 'Ver mi aventura en Londres' : 'Comenzar Lost in London' : meeting ? progress?.status === 'active' ? 'Continuar mi encuentro' : progress?.status === 'completed' ? 'Revisar mi encuentro' : 'Comenzar el encuentro' : progress?.status === 'active' ? 'Continuar aventura francesa' : progress?.status === 'completed' ? 'Ver resultado y volver a practicar' : 'Abrir aventura francesa';
  return <View style={[s.card, featured && s.featured, split && { flexDirection: 'row' }]}>
    <View style={[s.art, split && { width: '50%' }]}><SceneArtwork language={language} adventure={adventure} height={split ? 420 : featured ? 200 : 180} /><View style={s.tag}><Text style={s.tagText}>{english ? 'LONDRES' : 'PARÍS'}  /  {language.toUpperCase()} A1</Text></View></View>
    <View style={[s.body, featured && s.featuredBody, split && { flex: 1, justifyContent: 'center' }]}>
      <Text style={[s.kicker, featured && s.light]}>{featured ? 'TU PRÓXIMO CAPÍTULO' : english ? '02 / INGLÉS · AVENTURA URBANA' : meeting ? '01 / FRANCÉS · ENCUENTRO' : '03 / FRANCÉS · CAFETERÍA'}</Text>
      <Text accessibilityRole="header" style={[s.title, featured && s.lightTitle]}>{title}</Text>
      <Text style={[s.description, featured && s.light]}>{english ? 'Una ciudad nueva. Una dirección. Las personas que conocés cambian tu camino.' : meeting ? 'Un mensaje perdido y una amistad que te espera. Tu próxima historia empieza en París.' : 'Una mesa junto a la ventana. El aroma del café. Tu primera conversación en francés.'}</Text>
      {loading ? <Text style={[s.status, featured && s.light]}>Cargando avance de la aventura…</Text> : loadError ? <View style={{ backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12 }}><Notice message="El progreso necesita revisión. Abrí la aventura para reintentar o reiniciar." /></View> : <>
        <View style={s.progressHeading}><Text style={[s.status, featured && s.light]}>{progress?.status === 'completed' ? 'Recorrido completado' : progress ? 'Recorrido en curso' : 'Por descubrir'}</Text><Text style={[s.count, featured && s.light]}>{done}/{total} momentos</Text></View>
        <View accessibilityRole="progressbar" accessibilityLabel={`Progreso de ${title}`} accessibilityValue={{ min: 0, max: total, now: done }} style={[s.track, featured && { backgroundColor: '#3B5260' }]}><View style={[s.fill, { width: `${done / total * 100}%` }, featured && { backgroundColor: t.color.gold }]} /></View>
      </>}
      <Button label={label} disabled={loading} onPress={() => router.push(english ? '/london' : meeting ? '/rendezvous' : '/mission')} />
    </View>
  </View>;
}
export function MissionCard({ featured = false }: { featured?: boolean }) { return <AdventureCard featured={featured} />; }
export function EnglishMissionCard({ featured = false }: { featured?: boolean }) { return <AdventureCard language="en" featured={featured} />; }
export function RendezvousMissionCard({ featured = false }: { featured?: boolean }) { return <AdventureCard adventure="rendezvous" featured={featured} />; }
export function AdventureCollection({ children }: PropsWithChildren) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>{Children.map(children, card => <View style={{ flexBasis: 300, flexGrow: 1, maxWidth: '100%' }}>{card}</View>)}</View>;
}
const s = StyleSheet.create({
  card: { backgroundColor: t.color.white, borderRadius: 26, overflow: 'hidden', borderWidth: 1, borderColor: t.color.line },
  featured: { backgroundColor: t.color.night, borderColor: t.color.night }, art: { position: 'relative' },
  tag: { position: 'absolute', top: 16, left: 16, backgroundColor: '#102838', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }, tagText: { color: '#F0C987', fontSize: 10, letterSpacing: 1.8, fontWeight: '800' },
  body: { padding: 22, gap: 14 }, featuredBody: { padding: 24 },
  kicker: { color: t.color.teal, fontSize: 10, fontWeight: '800', letterSpacing: 1.8 },
  title: { color: t.color.ink, fontSize: 30, lineHeight: 37, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }), letterSpacing: -0.5 },
  lightTitle: { color: '#FFFFFF', fontSize: 36, lineHeight: 43 }, light: { color: '#CCDEE5' },
  description: { color: t.color.muted, fontSize: 16, lineHeight: 25, maxWidth: 680 },
  progressHeading: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }, status: { color: t.color.muted, fontSize: 12, lineHeight: 19 }, count: { color: t.color.teal, fontSize: 12, lineHeight: 19, fontWeight: '700' },
  track: { height: 4, backgroundColor: t.color.mist, borderRadius: 3 }, fill: { height: 4, backgroundColor: t.color.teal, borderRadius: 3 },
});
