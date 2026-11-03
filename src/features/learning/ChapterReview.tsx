import { StyleSheet, Text, View } from 'react-native';
import type { ConversationTurn } from '../../domain/conversation/presentation';
import { tokens as t } from '../../theme/tokens';

const objectiveLabels: Record<string, string> = { bonjour: 'Saludar al entrar', commande: 'Pedir una bebida', lieu: 'Elegir dónde tomarla', sucre: 'Aceptar o rechazar azúcar', prix: 'Preguntar el precio', paiement: 'Comprender el importe', merci: 'Agradecer', depart: 'Despedirte' };

/** Only lived turns; never offers expressions from an unvisited branch. */
export function ChapterReview({ turns, language = 'fr', adventure = 'cafe' }: { turns: ConversationTurn[]; language?: 'fr' | 'en'; adventure?: 'cafe' | 'rendezvous' }) {
  const meeting = language === 'fr' && adventure === 'rendezvous';
  const meetingObjectives: Record<string, string> = { greet: 'Saludar', confirm: 'Confirmar el encuentro', identify: 'Reconocer el lugar de reunión', ask: 'Pedir indicaciones', distance: 'Comprender si está cerca', route: 'Elegir el camino', clarify: 'Confirmar un movimiento', follow: 'Interpretar indicaciones', meet: 'Saludar al encontrarse', plan: 'Proponer una actividad' };
  const englishObjectives: Record<string, string> = { greet: 'Saludar', introduce: 'Presentarte', help: 'Pedir ayuda', where: 'Preguntar dónde está un lugar', choose: 'Elegir un camino', confirm: 'Confirmar una ubicación', direction: 'Comprender indicaciones', thanks: 'Agradecer', bye: 'Despedirte' };
  const expressions = turns.filter(turn => language === 'en' ? /:(where|direction-[ab]|bye-[ab])$/.test(turn.id) : meeting ? /:(ask|follow-[ab]|plan-[ab])$/.test(turn.id) : /:(commande|prix|depart)$/.test(turn.id));
  return <View style={styles.chapter}>
    <Text style={styles.eyebrow}>{language === 'en' ? 'CAPÍTULO COMPLETADO · LONDRES' : meeting ? 'ENCUENTRO COMPLETADO · PARÍS' : 'CAPÍTULO COMPLETADO · PARÍS'}</Text>
    <Text accessibilityRole="header" style={styles.title}>{language === 'en' ? 'Encontraste el camino. Y tus palabras.' : meeting ? 'Un encuentro que pudiste construir.' : 'Te llevás más que un café.'}</Text>
    <Text style={styles.copy}>Estas palabras ya fueron parte de tu conversación. Probá decirlas otra vez sin mirar la ayuda.</Text>
    {expressions.map(turn => <View key={turn.id} style={styles.expression}>
      <Text style={styles.expressionText}>{turn.messages.find(message => message.role === 'student')?.text}</Text>
      <Text style={styles.copy}>{turn.feedback.explanation}</Text>
    </View>)}
    <Text style={styles.eyebrow}>LO QUE PRACTICASTE</Text>
    {turns.map(turn => <Text key={turn.id} style={styles.copy}>✓ {(language === 'en' ? englishObjectives : meeting ? meetingObjectives : objectiveLabels)[turn.id.split(':').at(-1)!.split('-')[0]!] ?? turn.feedback.explanation}</Text>)}
    <Text style={styles.copy}>Recorrido guardado en este dispositivo. Podés revisar la conversación, volver a practicar con «Reiniciar aventura» o continuar explorando.</Text>
  </View>;
}
const styles = StyleSheet.create({
  chapter: { backgroundColor: '#E8EDE2', borderRadius: 22, padding: 20, gap: 14 },
  eyebrow: { color: t.color.teal, fontSize: 12, letterSpacing: 1, fontWeight: '700' },
  title: { color: t.color.ink, fontSize: 28, lineHeight: 34, fontWeight: '700' },
  copy: { color: t.color.muted, fontSize: 16, lineHeight: 24 },
  expression: { borderLeftWidth: 2, borderLeftColor: '#B57245', paddingLeft: 12, gap: 5 },
  expressionText: { color: t.color.ink, fontSize: 20, lineHeight: 28, fontWeight: '600' },
});
