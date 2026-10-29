# Diseño · LV-001

Identidad editorial de viaje: papel cálido `#F6F1E8`, tinta `#172D35`, verde petróleo `#12645E`, superficies blancas y selección verde clara. Marca tipográfica LV, sin mascotas infantiles ni recursos externos. El coral queda reservado como token de acento; no comunica estados de evaluación.

Fuente del sistema para no descargar ni licenciar recursos. Cuerpo 17, texto secundario 14, título 34, encabezado 24; títulos con rol header. Escala espacial 6/12/20/28/40; radios 12 y 24. Tokens en `src/theme/tokens.ts`, componentes en `src/components/ui.tsx`.

Columna fluida con ancho máximo 640, padding 20, scroll vertical y safe areas. Botones de al menos 52 px y opciones de al menos 72 px, texto escalable y sin alturas fijas para contenido. La selección usa texto y símbolo además de color. Opciones con roles radio y checked; grupos etiquetados; botones identificables y deshabilitados durante guardado; errores con rol alert; confirmación de guardado con región viva.

Onboarding presenta idioma y región en una pantalla. Inicio comunica siguiente acción real: editar Perfil. Misiones y progreso aparecen como pendientes sin enlaces engañosos. Perfil conserva borradores si guardar falla, muestra confirmación solo después de persistir y vuelve a Inicio con las preferencias vigentes.

Diseño previsto para móvil primero. Contraste, foco por teclado, VoiceOver/TalkBack, zoom, tamaños extremos, rotación y Safari aún requieren revisión visual y funcional en plataformas reales. No se generaron capturas porque la interfaz no pudo arrancar sin dependencias. No se afirma accesibilidad certificada.
