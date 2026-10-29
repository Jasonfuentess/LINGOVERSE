# Prueba manual de LV-002

Con LV-003, los pasos que esperan Lucie al iniciar o Samir al reiniciar ya no exigen esos personajes específicos: puede elegirse cualquiera de seis variantes y puede repetirse una. Anotar el personaje seleccionado y comprobar que se conserva al recargar. El dato de persistencia es ahora una envoltura v2 con progress e history, bajo la misma clave. Al reiniciar se conserva memoria agregada. Consultar VARIETY_ENGINE.md para migración, simulación y procedimiento vigente.

Estado: este procedimiento NO acredita pruebas realizadas. El servidor y la exportación fueron comprobados, pero el navegador headless del entorno falló antes de cargar la app. Android/iOS no ejecutados.

## Arranque y comprobaciones

Con dependencias locales existentes:

```powershell
npm.cmd test
npm.cmd run typecheck:core
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run export:web
$env:EXPO_OFFLINE='1'
npm.cmd run web -- --host localhost --port 8083
```

Abrir `http://localhost:8083` en un perfil de navegador dedicado a pruebas. No borrar datos personales de un perfil habitual. Expo no acepta combinar los flags `--offline` y `--host`; por eso se usa la variable de entorno del proceso. Para teléfono en red local usar `npm.cmd start` y Expo Go compatible con SDK 57, según README; este flujo no se verificó aquí.

## Recorrido principal

1. Si no hay onboarding, elegir francés y una región y entrar como invitado. Confirmar que Perfil permite cambiar a inglés y conservar la región. La aventura francesa sigue accesible sin cambiar la preferencia.
2. Inicio → Explorar aventuras → Abrir aventura francesa → Comenzar aventura. Confirmar estado inicial 0/8 y variante Una mañana con Lucie.
3. Elegir deliberadamente Merci al saludar. Comprobar explicación, ejemplo Bonjour, sin avance. Recargar: el feedback incorrecto debe seguir visible.
4. Elegir Bonjour y volver a comprobar. Leer feedback y pulsar Continuar conversación. Confirmar 1/8.
5. Elegir té; continuar y comprobar que la siguiente escena reconoce el té. Elegir À emporter; comprobar la escena del vaso para llevar. Rechazar azúcar con Non, merci; leer la réplica Sans sucre.
6. Preguntar `C'est combien ?` (también acepta `Combien ça coûte ?`). Probar primero una respuesta incorrecta, corregir y continuar.
7. Elegir Trois euros y continuar. Escribir Merci beaucoup y continuar. Despedirse con Bonne journée (también Au revoir).
8. Recargar con el último acierto todavía en feedback: debe seguir pendiente Terminar aventura, sin otorgar aún 8/8. Terminar: 8/8 y contador real de intentos. Recargar: resultado conservado.
9. Volver a Explorar/Inicio: mostrar recorrido completado. Perfil debe mantener idioma/región originales.
10. Reiniciar aventura → Conservar mi avance: no cambia nada. Reiniciar → Confirmar: 0/8 y variante Mediodía con Samir. Recargar conserva esa variante. Repetir con café, Sur place y Oui, s’il vous plaît para comprobar las otras ramas.

## Errores y accesibilidad

- Respuesta vacía: Comprobar deshabilitado. Pulsar dos veces: no duplicar avance ni saltar escena. Atrás del navegador/dispositivo y Volver a Explorar: conservar lo guardado. Abrir `/mission` directamente antes del onboarding: volver al onboarding.
- En el perfil de prueba, DevTools → Storage, editar solo `lingoverse.mission.fr-a1-paris-cafe.v1` a `{` y recargar: error de lectura sin borrado automático; reintentar no inventa avance; confirmar reinicio reemplaza el registro y conserva preferencias.
- Simular cuota desde consola del perfil de prueba: `Storage.prototype.setItem = function () { throw new DOMException('Prueba', 'QuotaExceededError'); }`. Intentar responder/continuar/reiniciar: mostrar error sin actualizar avance ni afirmar guardado. Recargar restaura el método; volver a intentar. No usar este procedimiento sobre datos personales.
- Denegar almacenamiento en el navegador: debe haber error/reintento. Rehabilitarlo y reintentar sin progreso ficticio.
- Revisar 320 px, zoom/texto grande, teclado, foco visible, lector de pantalla, desplazamiento y teclado virtual. Las opciones tienen rol radio, los botones estado disabled y el feedback región viva. Estos atributos no sustituyen una prueba de accesibilidad real.
- Abrir la misión en dos pestañas con el mismo avance. Avanzar en A, después responder desde B: debe informar que el avance cambió y ofrecer Reintentar lectura; no reemplazar el avance de A. Releer B debe mostrar ese avance. Validar también dos escrituras simultáneas en un navegador con Web Locks disponible.

## Prueba automatizada de navegador opcional

No descarga herramientas ni añade dependencias. Requiere Node 22+, exportación actual y Chrome/Edge/Chromium local compatible con CDP:

```powershell
npm.cmd run export:web
$env:LV_BROWSER_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'
npm.cmd run test:web
```

El script sirve `dist` en un puerto local, crea un perfil nuevo en `.web-check`, recorre la interfaz y pide una captura móvil solo al completar la prueba. Conserva artefactos y no borra perfiles existentes. Cierra su navegador y servidor al salir. Un fallo de arranque no es una prueba de la UI aprobada. Aquí Chromium 156 falló en Page.enable por cierre fatal del proceso gráfico, incluso con renderizado sin GPU; no se obtuvo captura ni se comprobó el flujo. No desactivar sandbox o controles de seguridad para hacerlo pasar.
