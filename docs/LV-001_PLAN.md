# Plan de ejecución LV-001

Especificación: `tasks/LV-001.md`, bajo `docs/MASTER_PROMPT.md`.
Objetivo: base Expo local con onboarding invitado, Inicio y Perfil; sin implementar LV-002.

Decisiones de implementación: Expo SDK 57 como objetivo por disponibilidad de Expo Go; StyleSheet y tokens TypeScript; React Context para este estado pequeño; dominio TypeScript sin React; SQLite kv-store nativo y localStorage web con resolución diferida. No instalar motores, animación, audio ni servicios aún sin uso.

- [x] Inspeccionar archivos existentes, Git, Node/npm y herramientas Android.
- [x] Crear pruebas de defaults, cambios, serialización, restauración, fallos y datos inválidos; observar fallo antes de implementación.
- [x] Implementar modelo v1 y repositorio inyectable; verificar pruebas y typecheck del núcleo.
- [x] Crear tokens, componentes, rutas y formulario compartido de onboarding/perfil.
- [x] Añadir adaptadores por plataforma y proveedor con carga, error, reintento y guardado antes de actualizar UI.
- [x] Documentar arquitectura, diseño, ejecución y resultados reales.
- [ ] Instalar y fijar versiones efectivas con lockfile: bloqueado por EACCES al registro npm.
- [ ] Verificar typecheck completo, lint, Expo Doctor y compilación web con dependencias instaladas.
- [ ] Ejecutar navegación, recarga, almacenamiento bloqueado y diseño a 320 px en navegador real; capturar pantalla.
- [ ] Verificar cierre/reapertura en Android y dispositivo iOS real.

Revisión: comprobar tipos inválidos, datos dañados/futuros, errores de cuota, SSR sin window y doble pulsación de guardado. La revisión local detectó coerción de arrays a strings en el validador; se añadió regresión, se observó fallo y se corrigió mediante comprobación explícita de tipo.

Adaptación: no se crea Git ni se hace commit en este directorio sin repositorio. No se requiere nueva aprobación de diseño: el usuario autorizó implementar la especificación completa. No se despliega ni se publica. LV-001 continúa pendiente de aceptación técnica hasta ejecutar las comprobaciones bloqueadas.
