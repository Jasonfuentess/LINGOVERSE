import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { KeyboardScroll } from './KeyboardScroll';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokens as t } from '../theme/tokens';

export function Page({ children }: PropsWithChildren) {
  return <SafeAreaView style={styles.safe}><KeyboardScroll contentContainerStyle={styles.page}><Text style={styles.brand}>LV / LINGOVERSE</Text>{children}</KeyboardScroll></SafeAreaView>;
}
export function Heading({ children }: PropsWithChildren) { return <Text accessibilityRole="header" style={styles.heading}>{children}</Text>; }
export function Copy({ children }: PropsWithChildren) { return <Text style={styles.copy}>{children}</Text>; }
export function Card({ children }: PropsWithChildren) { return <View style={styles.card}>{children}</View>; }
export function Button({ label, onPress, disabled = false, variant = 'primary' }: { label: string; onPress: () => void; disabled?: boolean; variant?: 'primary' | 'secondary' }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, variant === 'secondary' && styles.secondaryButton, (disabled || pressed) && { opacity: 0.65 }]}><Text style={[styles.buttonText, variant === 'secondary' && styles.secondaryButtonText]}>{label}</Text></Pressable>;
}
export function Choice({ label, detail, selected, onPress, disabled }: { label: string; detail: string; selected: boolean; onPress: () => void; disabled: boolean }) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected, disabled }} accessibilityLabel={`${label}, ${detail}`} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.choice, selected && styles.selected, pressed && { opacity: 0.75 }]}><Text style={styles.choiceTitle}>{selected ? '● ' : '○ '}{label}</Text><Text style={styles.copy}>{detail}</Text></Pressable>;
}
export function Notice({ message }: { message: string }) { return <Text accessibilityRole="alert" style={styles.notice}>{message}</Text>; }
export function Loading() { return <Page><ActivityIndicator accessibilityLabel="Cargando preferencias" color={t.color.teal} /><Copy>Preparando tu espacio…</Copy></Page>; }
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.color.paper },
  page: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: t.space.md, gap: t.space.md, paddingBottom: t.space.xl },
  brand: { color: t.color.teal, fontWeight: '800', letterSpacing: 2, fontSize: t.type.small, marginTop: 12 },
  heading: { fontSize: t.type.title, fontWeight: '800', color: t.color.ink, lineHeight: 41 },
  copy: { color: t.color.muted, fontSize: t.type.body, lineHeight: 26, flexShrink: 1 },
  card: { backgroundColor: t.color.white, borderRadius: t.radius.card, padding: t.space.md, gap: t.space.sm, borderWidth: 1, borderColor: t.color.line },
  button: { backgroundColor: t.color.teal, minHeight: 52, padding: 16, borderRadius: t.radius.sm, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: t.type.body, color: t.color.white, fontWeight: '700', textAlign: 'center' },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: t.color.line },
  secondaryButtonText: { color: t.color.teal },
  choice: { borderWidth: 2, borderColor: t.color.line, padding: 16, borderRadius: t.radius.sm, gap: 4, minHeight: 72 },
  selected: { borderColor: t.color.teal, backgroundColor: t.color.tint },
  choiceTitle: { color: t.color.ink, fontSize: t.type.body, fontWeight: '700' },
  notice: { color: t.color.error, fontSize: t.type.body, lineHeight: 26 },
});
