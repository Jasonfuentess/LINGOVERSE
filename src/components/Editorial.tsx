import type { PropsWithChildren } from 'react';
import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CharacterPortrait, SceneArtwork } from './AdventureArt';
import { tokens as t } from '../theme/tokens';

export function Eyebrow({ children }: PropsWithChildren) { return <Text style={e.eyebrow}>{children}</Text>; }
export function SectionTitle({ number, title, detail }: { number: string; title: string; detail?: string }) {
  return <View style={e.section}><Text style={e.number}>{number}</Text><View style={{ flex: 1, gap: 4 }}><Text accessibilityRole="header" style={e.sectionTitle}>{title}</Text>{detail && <Text style={e.detail}>{detail}</Text>}</View></View>;
}
export function Intro({ label, title, description }: { label: string; title: string; description: string }) {
  const { width } = useWindowDimensions();
  return <View style={e.intro}><Eyebrow>{label}</Eyebrow><Text accessibilityRole="header" style={[e.title, width < 600 && { fontSize: 36, lineHeight: 42 }]}>{title}</Text><Text style={e.description}>{description}</Text></View>;
}
export function RoastInvitation() {
  const router = useRouter();
  return <Pressable accessibilityRole="button" accessibilityLabel="Conocer Roast Me" onPress={() => router.push('/roast')} style={({ pressed }) => [e.roast, pressed && { opacity: 0.85 }]}>
    <View style={e.roastTop}><Text style={e.roastTag}>MODO SIN PENA · ADULTOS</Text><Text accessible={false} style={e.arrow}>↗</Text></View>
    <Text style={e.roastTitle}>{'Un poco de francés.\nCero solemnidad.'}</Text>
    <Text style={e.roastCopy}>Tu entrenador tiene algo que decir. Humor intenso, solo si lo elegís.</Text>
    <View style={e.coachRow}>{['Luz', 'Toño', 'Vale', 'Romi'].map(name => <CharacterPortrait key={name} name={name} size={42} />)}<Text style={e.roastCopy}>Conocer Roast Me →</Text></View>
  </Pressable>;
}
export function DestinationLinks() {
  const router = useRouter();
  return <View style={e.destinations}>{([{ language: 'fr', title: 'París', caption: 'FRANCÉS A1 · 2 AVENTURAS', path: '/rendezvous' }, { language: 'en', title: 'Londres', caption: 'INGLÉS A1 · 1 AVENTURA', path: '/london' }] as const).map(city => <Pressable key={city.title} accessibilityRole="button" accessibilityLabel={`Explorar ${city.title}: ${city.caption}`} onPress={() => router.push(city.path)} style={({ pressed }) => [e.destination, pressed && { opacity: 0.8 }]}>
    <SceneArtwork language={city.language} adventure={city.language === 'fr' ? 'rendezvous' : 'cafe'} />
    <View style={e.destinationBody}><Text style={e.destinationTitle}>{city.title} <Text style={{ color: t.color.teal }}>↗</Text></Text><Text style={e.destinationCaption}>{city.caption}</Text></View>
  </Pressable>)}</View>;
}
export const e = StyleSheet.create({
  intro: { gap: 12, paddingVertical: 8 }, eyebrow: { color: t.color.teal, fontSize: 11, fontWeight: '800', letterSpacing: 2, lineHeight: 18 },
  title: { color: t.color.ink, fontSize: 44, lineHeight: 49, letterSpacing: -1.5, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }) },
  description: { color: t.color.muted, fontSize: 17, lineHeight: 27, maxWidth: 640 },
  section: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 10 }, number: { color: t.color.teal, fontWeight: '700', fontSize: 12, paddingTop: 6 }, sectionTitle: { color: t.color.ink, fontSize: 24, lineHeight: 30, fontWeight: '700', letterSpacing: -0.5 },
  detail: { color: t.color.muted, fontSize: 14, lineHeight: 22 },
  roast: { backgroundColor: '#452B39', borderRadius: 26, padding: 24, gap: 16, borderTopWidth: 3, borderTopColor: '#DE957D' },
  roastTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, roastTag: { color: '#F3BD9E', fontSize: 10, letterSpacing: 1.5, fontWeight: '800', flexShrink: 1 }, arrow: { color: '#F3BD9E', fontSize: 24 },
  roastTitle: { color: '#FFF4EB', fontSize: 30, lineHeight: 37, fontWeight: '700', letterSpacing: -0.7 }, roastCopy: { color: '#F1D9D5', fontSize: 14, lineHeight: 22, flexShrink: 1 },
  coachRow: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  destinations: { flexDirection: 'row', gap: 18, flexWrap: 'wrap' }, destination: { flexGrow: 1, flexBasis: 280, maxWidth: '100%', backgroundColor: t.color.white, borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: t.color.line }, destinationBody: { padding: 20, gap: 6 }, destinationTitle: { color: t.color.ink, fontSize: 28, fontWeight: '700' }, destinationCaption: { color: t.color.muted, fontSize: 10, letterSpacing: 1.2, lineHeight: 17 },
});
