# Contenido de la cafetería · LV-002

Vigente desde LV-003B: `cafe.v2.ts` conserva las seis identidades y ocho objetivos con seis conversaciones centrales diferentes, ayuda/traducción explícita e importes ficticios uno/dos/tres euros ligados a su opción correcta. Los diálogos completos están en LV-003B_CONVERSATIONS.md. `cafe.v1.ts` queda congelado; registros contentVersion 1 siguen usando sus textos/calificación, sin actualización automática. cafe.ts resuelve la versión; solo un nuevo recorrido usa v2. Las notas siguientes describen etapas anteriores.

Actualización LV-003: seis variantes finitas. Se conservan intactas matin-lucie y midi-samir; se añaden pluie-camille, carnet-alex, balade-noemie y lecture-hugo con nuevas situaciones editoriales y preguntas equivalentes ya enseñadas. Todas las ayudas, respuestas, calificación y ramas se conservan. Selección ponderada al iniciar, no alternancia obligatoria; reanudar mantiene variante exacta. El contenido sigue en versión 1 porque los IDs/contenidos antiguos permanecen compatibles y el cambio solo agrega variantes. Downgrade a un cliente sin los nuevos IDs no está soportado.

Paquete editorial propio: `src/content/cafe.ts`, `schemaVersion: 1`, `version: 1`, ID `fr-a1-paris-cafe`, francés, objetivo A1. No incluye textos de una fuente copiada, audio ni recursos de terceros. La denominación A1 describe la intención de la práctica; no acredita nivel ni revisión docente independiente.

Dos variantes finitas: `matin-lucie` (mañana con Lucie) y `midi-samir` (mediodía con Samir). Cambian personaje, ambientación y algunas preguntas con traducción. Las expresiones enseñadas, respuestas aceptadas y objetivos son los mismos. Reiniciar alterna variantes incluso si se abandona el recorrido previo; continuar nunca cambia la variante.

| Paso | Objetivo estable | Interacción |
| --- | --- | --- |
| 1 | saluer | Bonjour al entrar |
| 2 | commander | Je voudrais un café / un thé, s’il vous plaît |
| 3 | choisir-lieu | Sur place / à emporter |
| 4 | repondre | Oui, s’il vous plaît / Non, merci al ofrecer azúcar |
| 5 | demander-prix | C’est combien ? / Combien ça coûte ? (texto) |
| 6 | comprendre-prix | Comprender trois euros |
| 7 | remercier | Merci / Merci beaucoup (texto) |
| 8 | saluer-depart | Au revoir / Bonne journée (texto) |

Cada ruta tiene exactamente ocho interacciones: cinco de selección y tres escritas, con enseñanza visible, contexto y feedback. Hay diez nodos por variante porque lugar y servicio tienen versiones de rama; un usuario no recorre todas las ramas en una sesión. Café/té lleva a distinta confirmación y escena; quedarse/llevar cambia el servicio; aceptar/rechazar azúcar cambia la réplica. Después las ramas se reúnen para conservar los objetivos.

Todas las instrucciones y traducciones están en español; el francés se presenta con significado antes de evaluarlo. Las variantes usan el mismo conjunto de respuestas y ayudas; no prueban vocabulario nuevo por sorpresa. Los distractores se explican después de fallar. El precio de tres euros es un dato ficticio explícito de la historia, no información sobre precios actuales en París.

Ayudas siempre visibles: se trata de práctica guiada con reintentos, no una evaluación inicial independiente. Pendiente revisión por docente francófono y comprobación de usabilidad/accesibilidad en plataformas reales. No hay curso completo A1, misión inglesa, IT Support, entrenador humorístico o voces disponibles en LV-002.
