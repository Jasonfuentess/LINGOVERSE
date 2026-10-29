import { useRouter } from 'expo-router';
import { Button, Card, Copy, Heading, Notice } from '../../components/ui';
import { useMission } from './MissionProvider';

export function MissionCard() {
  const { progress, loading, loadError } = useMission();
  const router = useRouter();
  return <Card><Copy>FRANCÉS / A1 · PRÁCTICA GUIADA</Copy><Heading>Un café en París</Heading>
    <Copy>Pedí tu bebida, decidí si te quedás y cerrá la conversación. Ocho interacciones con ayuda y correcciones.</Copy>
    {loading ? <Copy>Cargando avance de la aventura…</Copy> : loadError ? <Notice message="El progreso necesita revisión. Abrí la aventura para reintentar o reiniciar." /> : progress ? <Copy>{progress.status === 'completed' ? 'Recorrido completado' : 'Recorrido en curso'} · {progress.completedObjectives.length}/8 pasos completados.</Copy> : <Copy>Todavía no comenzaste esta aventura.</Copy>}
    <Button label={progress?.status === 'active' ? 'Continuar aventura francesa' : progress?.status === 'completed' ? 'Ver resultado y volver a practicar' : 'Abrir aventura francesa'} disabled={loading} onPress={() => router.push('/mission')} />
  </Card>;
}
