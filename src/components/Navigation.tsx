import { usePathname, useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens as t } from '../theme/tokens';

const sections: { label: string; path: Href; symbol: string }[] = [
  { label: 'Inicio', path: '/', symbol: '⌂' },
  { label: 'Explorar', path: '/explore', symbol: '◇' },
  { label: 'Practicar', path: '/practice', symbol: '◉' },
  { label: 'Trabajo', path: '/work', symbol: '▣' },
  { label: 'Perfil', path: '/profile', symbol: '◎' },
];
export function Navigation() {
  const current = usePathname();
  const router = useRouter();
  return <View accessibilityRole="tablist" accessibilityLabel="Secciones de LingoVerse" style={s.bar}>
    {sections.map(item => <Pressable key={item.label} accessibilityRole="tab" accessibilityState={{ selected: current === item.path }} accessibilityLabel={item.label} onPress={() => router.navigate(item.path)} style={({ pressed }) => [s.tab, current === item.path && s.active, pressed && { opacity: 0.65 }]}>
      <Text accessible={false} style={[s.icon, current === item.path && s.selected]}>{item.symbol}</Text>
      <Text style={[s.label, current === item.path && s.selected]}>{item.label}</Text>
    </Pressable>)}
  </View>;
}
const s = StyleSheet.create({
  bar: { flexDirection: 'row', width: '100%', maxWidth: 1080, alignSelf: 'center', backgroundColor: t.color.white, borderTopWidth: 1, borderColor: t.color.line, paddingHorizontal: 4, paddingVertical: 6 },
  tab: { flex: 1, minHeight: 60, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, gap: 3, borderRadius: 14 },
  active: { backgroundColor: t.color.tint }, icon: { fontSize: 23, color: t.color.muted },
  label: { fontSize: 11, lineHeight: 16, color: t.color.muted, fontWeight: '600', textAlign: 'center', flexShrink: 1 },
  selected: { color: t.color.teal, fontWeight: '800' },
});
