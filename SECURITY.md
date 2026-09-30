# Seguridad y privacidad

La extensión modifica la interfaz dentro de la página. No termina TLS, no actúa como proxy y no reproduce las solicitudes del portal. El navegador y el portal siguen gestionando las conexiones HTTPS, la sesión y los envíos originales.

Esto no hace inocua cualquier modificación del DOM. Una extensión tiene acceso a los valores que conecta. Un error en una interfaz puede cambiar qué se envía, impedir una validación o mostrar información equivocada. No afirmamos una equivalencia de seguridad auditada con el portal original.

## Medidas implementadas

- Scripts empaquetados en Manifest V3, en el mundo aislado de Chrome.
- Coincidencia de dominios HTTPS exactos y prefijos de ruta por portal.
- Un único permiso de API fijo, `storage`, utilizado para preferencias de activación y límites de avisos. Los datos de los formularios no se guardan.
- Sin código remoto, analítica, lectura de cookies ni APIs de peticiones en los content scripts ni en el popup.
- Los controles originales conservan sus formularios, campos ocultos y listeners. Las acciones se delegan al elemento original.
- Los controles de seguridad se conservan originales. No se falsifica `isTrusted`.
- Restauración manual, ante cambios de identidad o desaparición de controles, navegación y validación nativa.
- Mensajes del popup y de `report.html` aceptados solo desde esas URLs empaquetadas. No existe un puente de órdenes mediante `window.postMessage`.
- Un content script por portal, inyectado solo en sus rutas exactas. Una ruta no puede cubrir un dominio entero.
- Las acciones sobre elementos no nativos (`custom` en `DomBridge`) se declaran una a una tras revisarlas.
- Las herramientas de la web real (`site:live`, `site:record`) recorren una vez páginas públicas, sin datos personales, y no eluden comprobaciones anti‑bot. Los fixtures se guardan sin scripts, tokens anti‑CSRF ni `jsessionid`; las grabaciones quedan en `.cache/`, fuera de git.

### Reportes de pantallas pendientes

El botón «Reportar pantalla sin adaptar» (popup → `report.html`) captura HTML/CSS **en memoria** en el content script, aplica una lista permitida de elementos/atributos, vacía formularios y censura identificadores españoles (`packages/capture`). Después [Rampart](https://github.com/nationaldesignstudio/rampart) (CC BY 4.0, modo heuristics en el dispositivo) vuelve a censurar. El usuario revisa una vista previa y confirma antes de enviar.

El envío es un único POST al origen configurado con `BG_INTAKE_ORIGIN` (permiso opcional de host pedido en el momento del envío). **No hay token en la extensión.** El intake re-sanitiza, rechaza restos prohibidos y guarda el informe en un repositorio **privado**. Solo tras una etiqueta de quien mantiene el repo se abre una PR draft en `sites/<id>/fixtures/inbox/` del repositorio público.

Rampart documenta ~98,4 % de recall en escrituras latinas y no cubre escrituras no latinas; por eso la captura sustituye esos textos por `[TEXTO]` y la revisión humana es obligatoria. No pegues HTML ni datos personales en issues públicos.

El Shadow DOM aísla estilos; no es una barrera de seguridad frente a la página. El aislamiento de JavaScript tampoco oculta el DOM a los scripts del portal.

## Qué se comprueba

Las pruebas automatizadas usan datos ficticios. El chequeo del bundle detecta APIs de red y persistencia prohibidas (salvo `fetch` en el bundle de `report.html` hacia el intake) y revisa el manifest. Es un control estático limitado, no una auditoría de seguridad.

La compatibilidad con validaciones personalizadas, restricciones del navegador, certificados, firmas, iframes y estados autenticados requiere pruebas del portal concreto. Los cambios programáticos no tienen idéntico comportamiento a la escritura física para todas las restricciones nativas o frameworks. Mantén el control original cuando no puedas demostrar equivalencia.

No incluyas sesiones, documentos personales, tokens reales o datos identificativos en issues, fixtures, logs ni capturas. Para un fallo de seguridad, utiliza el canal privado de reporte del repositorio cuando esté habilitado; evita publicar detalles que expongan datos de usuarios.

Referencias técnicas consultadas:

- [Content scripts y aislamiento de Chrome](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
- [Permisos de extensiones](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions)
- [Restricciones de código remoto](https://developer.chrome.com/docs/extensions/develop/migrate/remote-hosted-code)
- [Eventos e isTrusted](https://developer.mozilla.org/en-US/docs/Web/API/Event/isTrusted)
