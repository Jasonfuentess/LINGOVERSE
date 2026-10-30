import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CoachLocale } from '../../domain/preferences';
import { tokens as t } from '../../theme/tokens';

// Presentación local: se puede reemplazar avatar por una ilustración sin tocar motores.
const appearance: Record<CoachLocale, { region: string; flag: string; initial: string; color: string; background: string; radius: number }> = {
  'es-SV': { region: 'El Salvador', flag: '🇸🇻', initial: 'L', color: '#12645E', background: '#E2EFE8', radius: 24 },
  'es-MX': { region: 'México', flag: '🇲🇽', initial: 'T', color: '#774723', background: '#F6E8D5', radius: 12 },
  'es-CO': { region: 'Colombia', flag: '🇨🇴', initial: 'V', color: '#514276', background: '#EEE8F6', radius: 20 },
  'es-AR': { region: 'Argentina', flag: '🇦🇷', initial: 'R', color: '#285C79', background: '#E4EEF5', radius: 16 },
};

export function CoachCharacter({ name, locale, text, avatar, children }: { name: string; locale: CoachLocale; text: string; avatar?: ReactNode; children?: ReactNode }) {
  const look = appearance[locale];
  return <View style={styles.character}>
    <View style={styles.identity}>
      <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.avatar, { backgroundColor: look.background, borderRadius: look.radius }]}>
        {avatar ?? <Text style={[styles.initial, { color: look.color }]}>{look.initial}<Text style={styles.spark}>·</Text></Text>}
      </View>
      <View style={styles.names}><Text style={styles.name}>{name}</Text><Text style={styles.region}><Text accessible={false}>{look.flag} </Text>{look.region}</Text></View>
    </View>
    <View style={[styles.bubble, { borderLeftColor: look.color }]}>{children}{text.length > 0 && <Text style={[styles.dialogue, children ? styles.reaction : undefined]}>{text}</Text>}</View>
  </View>;
}

const styles = StyleSheet.create({
  character: { gap: t.space.sm },
  identity: { flexDirection: 'row', gap: t.space.sm, alignItems: 'center' },
  avatar: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  initial: { fontSize: 28, fontWeight: '800' },
  spark: { fontSize: 20 },
  names: { flex: 1, gap: 2 },
  name: { fontSize: t.type.body, fontWeight: '800', color: t.color.ink },
  region: { fontSize: t.type.small, color: t.color.muted },
  bubble: { padding: t.space.md, gap: t.space.sm, backgroundColor: t.color.white, borderRadius: t.radius.sm, borderTopLeftRadius: 0, borderLeftWidth: 3 },
  reaction: { borderTopWidth: 1, borderTopColor: t.color.line, paddingTop: t.space.sm },
  dialogue: { fontSize: t.type.body, lineHeight: 27, color: t.color.ink },
});
