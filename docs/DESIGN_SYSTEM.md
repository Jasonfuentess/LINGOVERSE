# Diseño · LV-001

## Feedback de aventura · LV-004A-UI-01 / UI-02

Una sola respuesta visual por evaluación. `CoachReaction` compone `EducationalFeedback` dentro de la burbuja de `CoachCharacter` si el snapshot regional es visible según las preferencias existentes. Orden: identidad, resultado, respuesta enviada, explicación completa, corrección si corresponde, respuesta del interlocutor y comentario contextual. Continuar queda después de la burbuja; no se repite una tarjeta educativa externa. Sin humor, durante carga de ajustes o sin snapshot compatible, se presenta únicamente el feedback educativo tradicional. Sin feedback puede aparecer la reacción persistida de progreso; al finalizar se identifica la celebración.

Estados expresados mediante texto y símbolo: acierto, error amable, reintento y recuperación. No se recortan textos educativos ni se cambian evaluación, respuestas o intentos. El color acompaña al estado sin ser su única señal. Encabezado del resultado de 24 px, cuerpo de 17 px, superficies suaves sin sombra. El feedback tradicional usa verde suave para acierto y papel ámbar para reintento.

Avatares locales con inicial, forma y acento: Luz verde, Toño tierra, Vale violeta y Romi azul; nombre, país y bandera siempre acompañan. `CoachCharacter.avatar` admite una ilustración futura sin modificar motores. La bandera es decorativa; el país escrito permanece disponible. La burbuja y la identidad comparten la misma composición en toda la aventura. No hay imágenes remotas ni dependencias nuevas.

Botones secundarios para volver y reiniciar, manteniendo confirmación y bloqueo durante guardado. Continúa el botón principal existente de 52 px mínimo. No se agregan animaciones, temporizadores ni scroll automático: no hay espera artificial y reduced motion no requiere un camino alternativo. Se mantienen safe areas, columna fluida y textos sin límites de líneas. Disponibilidad honesta de audio en Perfil y presentación inicial de misión, fuera de cada reacción.

Validación de layout real, foco, lectores, zoom, 320 px, orientación y dispositivos pendiente; las pruebas de renderizado con primitivas sustituidas no certifican layout nativo o navegador.

Identidad editorial de viaje: papel cálido `#F6F1E8`, tinta `#172D35`, verde petróleo `#12645E`, superficies blancas y selección verde clara. Marca tipográfica LV, sin mascotas infantiles ni recursos externos. El coral queda reservado como token de acento; no comunica estados de evaluación.

Fuente del sistema para no descargar ni licenciar recursos. Cuerpo 17, texto secundario 14, título 34, encabezado 24; títulos con rol header. Escala espacial 6/12/20/28/40; radios 12 y 24. Tokens en `src/theme/tokens.ts`, componentes en `src/components/ui.tsx`.

Columna fluida con ancho máximo 640, padding 20, scroll vertical y safe areas. Botones de al menos 52 px y opciones de al menos 72 px, texto escalable y sin alturas fijas para contenido. La selección usa texto y símbolo además de color. Opciones con roles radio y checked; grupos etiquetados; botones identificables y deshabilitados durante guardado; errores con rol alert; confirmación de guardado con región viva.

Onboarding presenta idioma y región en una pantalla. Inicio comunica siguiente acción real: editar Perfil. Misiones y progreso aparecen como pendientes sin enlaces engañosos. Perfil conserva borradores si guardar falla, muestra confirmación solo después de persistir y vuelve a Inicio con las preferencias vigentes.

Diseño previsto para móvil primero. Contraste, foco por teclado, VoiceOver/TalkBack, zoom, tamaños extremos, rotación y Safari aún requieren revisión visual y funcional en plataformas reales. No se generaron capturas porque la interfaz no pudo arrancar sin dependencias. No se afirma accesibilidad certificada.
