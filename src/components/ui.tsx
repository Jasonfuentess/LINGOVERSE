import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname } from 'expo-router';
import { Navigation } from './Navigation';
import { KeyboardScroll } from './KeyboardScroll';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokens as t } from '../theme/tokens';

export function Page({ children, compact = false, wide = false }: PropsWithChildren<{ compact?: boolean; wide?: boolean }>) {
  const path = usePathname();
  const mainSection = ['/', '/explore', '/practice', '/work', '/profile'].includes(path);
  return <SafeAreaView style={styles.safe}><KeyboardScroll contentContainerStyle={[styles.page, wide && { maxWidth: 1080 }, compact && { gap: 12, paddingTop: 10 }]}>
    <View style={styles.masthead}><View style={styles.brandMark}><Text accessible={false} style={styles.compass}>✦</Text></View><View><Text style={styles.brand}>lingoverse</Text>{!compact && <Text style={styles.brandCaption}>APRENDÉ. EXPLORÁ. VIVÍ.</Text>}</View><Text accessible={false} style={styles.edition}>ATLAS / 01</Text></View>{children}</KeyboardScroll>{mainSection && <Navigation />}</SafeAreaView>;
}
export function Heading({ children }: PropsWithChildren) { return <Text accessibilityRole="header" style={styles.heading}>{children}</Text>; }
export function Copy({ children }: PropsWithChildren) { return <Text style={styles.copy}>{children}</Text>; }
export function Card({ children }: PropsWithChildren) { return <View style={styles.card}>{children}</View>; }
export function Button({ label, onPress, disabled = false, variant = 'primary' }: { label: string; onPress: () => void; disabled?: boolean; variant?: 'primary' | 'secondary' | 'text' }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, variant !== 'primary' && styles.secondaryButton, variant === 'text' && { borderWidth: 0, padding: 6, minHeight: 44, alignSelf: 'flex-start' }, (disabled || pressed) && { opacity: 0.65 }]}><Text style={[styles.buttonText, variant !== 'primary' && styles.secondaryButtonText]}>{label}</Text></Pressable>;
}
export function Choice({ label, detail, selected, onPress, disabled }: { label: string; detail: string; selected: boolean; onPress: () => void; disabled: boolean }) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected, disabled }} accessibilityLabel={`${label}, ${detail}`} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.choice, selected && styles.selected, pressed && { opacity: 0.75 }]}><Text style={styles.choiceTitle}>{selected ? '● ' : '○ '}{label}</Text><Text style={styles.copy}>{detail}</Text></Pressable>;
}
export function Notice({ message }: { message: string }) { return <Text accessibilityRole="alert" style={styles.notice}>{message}</Text>; }
export function Loading() { return <Page><ActivityIndicator accessibilityLabel="Cargando preferencias" color={t.color.teal} /><Copy>Preparando tu espacio…</Copy></Page>; }
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.color.paper },
  page: { width: '100%', maxWidth: 720, alignSelf: 'center', padding: t.space.md, gap: 24, paddingBottom: 44 },
  masthead: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  brandMark: { width: 40, height: 40, borderRadius: 13, backgroundColor: t.color.night, justifyContent: 'center', alignItems: 'center' },
  compass: { color: t.color.gold, fontSize: 28 },
  brand: { color: t.color.ink, fontWeight: '800', letterSpacing: -0.8, fontSize: 24 },
  brandCaption: { color: t.color.muted, fontSize: 8, letterSpacing: 1.8, fontWeight: '700', marginTop: 2 },
  edition: { marginLeft: 'auto', fontSize: 9, letterSpacing: 1, color: t.color.muted, flexShrink: 1 },
  heading: { fontSize: t.type.title, fontWeight: '700', fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }), color: t.color.ink, lineHeight: 42, letterSpacing: -0.7 },
  copy: { color: t.color.muted, fontSize: t.type.body, lineHeight: 26, flexShrink: 1 },
  card: { backgroundColor: t.color.white, borderRadius: t.radius.card, padding: t.space.md, gap: t.space.sm, borderWidth: 1, borderColor: t.color.line },
  button: { backgroundColor: t.color.teal, minHeight: 52, padding: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 3, borderBottomColor: '#104D47' },
  buttonText: { fontSize: t.type.body, color: t.color.white, fontWeight: '700', textAlign: 'center' },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: t.color.line },
  secondaryButtonText: { color: t.color.teal },
  choice: { borderWidth: 2, borderColor: t.color.line, padding: 16, borderRadius: t.radius.sm, gap: 4, minHeight: 72 },
  selected: { borderColor: t.color.teal, backgroundColor: t.color.tint },
  choiceTitle: { color: t.color.ink, fontSize: t.type.body, fontWeight: '700' },
  notice: { color: t.color.error, fontSize: t.type.body, lineHeight: 26 },
});
