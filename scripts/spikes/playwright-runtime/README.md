# Investigación del runtime Playwright — T-015 / #51

**T-015 sigue bloqueado.** Una adaptación experimental de
`playwright-crx@0.15.0` ejecuta Playwright dentro de MV3 y funciona al conectarse
antes de navegar. En una pestaña previamente cargada, la sesión del iframe de
distinto origen ya se puede inicializar, leer y rellenar, pero el click original
agota el timeout al comprobar visibilidad. Tampoco se ha demostrado el firewall
de mapas, rutas, acciones y eventos requerido para producción.

Este laboratorio continúa [el spike de #50](../playwright-crx/README.md),
conservando su dependencia fijada y su prueba original para comparar resultados.
No activa el runtime, añade permisos ni incorpora la biblioteca al bundle de
producción. El único cambio productivo amplía `scripts/audit-bundle.mjs` a los
archivos `.mjs`: los módulos ESM locales necesitan el mismo control que `.js`.
No introduce excepciones en esa auditoría.

## Reproducción

Desde la raíz del repositorio:

```sh
pnpm install --frozen-lockfile
npm ci --prefix scripts/spikes/playwright-crx --ignore-scripts --workspaces=false

# Pestaña completamente cargada antes de conectar: resultado negativo observado.
node scripts/spikes/playwright-runtime/run.mjs

# Conectar a una pestaña nueva antes de navegar: resultado positivo observado.
node scripts/spikes/playwright-runtime/run.mjs --before-navigation
```

Si falta Chromium, instalarlo con `pnpm exec playwright install chromium`,
o identificar un ejecutable instalado mediante `BG_CHROMIUM_PATH`, igual que
en los E2E del repositorio. Comandos ejecutados el 4 de octubre de 2026:

```sh
BG_CHROMIUM_PATH=/home/ro/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
  node scripts/spikes/playwright-runtime/run.mjs

BG_CHROMIUM_PATH=/home/ro/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
  node scripts/spikes/playwright-runtime/run.mjs --before-navigation
```

Entorno: base `a5d8a1e`, Node 26.2.0, pnpm 11.1.1,
Vite 8.2.2, `@playwright/test` 1.63.0 y Chrome for Testing 151.0.7922.34.
El lockfile npm del laboratorio de #50 fija versión e integridad; el runner
comprueba la versión y cada sustitución exige una coincidencia exacta.

El runner Node abre un perfil Chromium temporal, pulsa el control de la extensión
y recibe estados, contadores y clases de error. Playwright ejecuta las acciones
en su service worker MV3. Los valores sintéticos se generan en el navegador;
el runner no lee campos ni el DOM de las pestañas de fixture.

El modo predeterminado espera explícitamente `chrome.tabs.status === 'complete'`
antes de arrancar la candidata y adjuntarse a la pestaña. El segundo modo conecta
a una pestaña vacía y después navega. Adjuntarse durante la carga no acredita el
primer caso. No se recarga la pestaña existente para hacer pasar su prueba.

## Evidencia ejecutada

| Comprobación                                                      | Página ya cargada                                | Conexión antes de navegar         |
| ----------------------------------------------------------------- | ------------------------------------------------ | --------------------------------- |
| Carga del módulo MV3 y acciones sobre campos/controles originales | Pasa                                             | Pasa                              |
| Frame del mismo origen                                            | Pasa                                             | Pasa                              |
| Frame `127.0.0.1` → `localhost`                                   | Lectura y relleno pasan; click da `TimeoutError` | Pasa                              |
| Navegación mediante el enlace original                            | Pasa                                             | Pasa                              |
| Dos pestañas y error por control inexistente                      | Pasa                                             | Pasa                              |
| Cancelación por detach y acción tras reattach                     | Pasa                                             | Pasa                              |
| Cierre de pestaña durante una operación                           | Rechaza la operación                             | Rechaza la operación              |
| Cierre del motor y desconexión real del debugger                  | Pasa                                             | Pasa                              |
| Eventos `Network`, `Fetch`, `Storage` o `Log`                     | 0 observados                                     | 0 observados                      |
| Marcador en requests/logs, escrituras y comandos bloqueados       | 0 observados                                     | 0 observados                      |
| Resultado del proceso                                             | Código 1                                         | Código 0; 13 comprobaciones pasan |

En ambos modos `fixtureResponses.crossSiteFrame` vale **1**: el servidor entregó
el frame. El runner lo exige para evitar confundir un fallo de conectividad con
un fallo del runtime. El experimento inicial recibía `Target.attachedToTarget`
pero no eventos de sesión hija. Un contador temporal dentro de `FrameSession`
mostró `frameManager.frame(targetId) === null` una vez y
`targetInfo.parentFrameId` presente: `_onAttachedToTarget` salía sin iniciar la
sesión. La adaptación actual registra el frame solo si su padre ya existe. Así
llegan `Page.lifecycleEvent` y `Runtime.executionContextCreated` desde la sesión
hija, y la lectura y el relleno funcionan. El contador temporal se retiró.

El siguiente fallo es distinto: el click de Playwright agota su timeout con la
frase fija «waiting for element to be visible». Después del fallo,
`button.isVisible()` y la visibilidad del iframe padre dan `true`. Esperar antes
con `button.waitFor({ state: 'visible' })` tampoco lo resuelve. En tres ejecuciones
con pestaña ya cargada el click falló **3/3**; con conexión antes de navegar
pasó **3/3**. Una prueba aislada con sondeos extra de visibilidad y geometría
pasó **1/1**, insuficiente para atribuirle una solución; esos sondeos se
retiraron. No se cambiaron los timeouts ni se oculta la fase fallida. La
incoherencia exacta entre acción y visibilidad queda por diagnosticar. En las
ejecuciones iniciales también variaron fallos del frame del mismo origen o de
la navegación; la matriz 3/3 anterior solo corresponde a la adaptación actual.

Los timeouts pertenecen al laboratorio: 2 segundos por acción ordinaria,
100 ms para el error intencionado y 5 segundos para acciones pendientes.
La cancelación debe rechazar la acción antes de 2 segundos. Para acreditar la
desconexión se comprueba que la pestaña aún existe y que Chrome rechaza un comando
con `Debugger is not attached`; otro error no satisface la comprobación.
El proceso conserva el resultado negativo y no omite fases fallidas. Si una
fase no se ejecuta, falta su resultado exigido o se informa un error de arranque.

## Adaptación y empaquetado

Solo en el directorio temporal se modifica el `FrameSession` distribuido:

- Esperar a que se consuma `Page.getFrameTree` antes de `Target.setAutoAttach`.
- Si `Target.attachedToTarget` entrega un iframe aún ausente del árbol de
  Playwright, registrar `targetId` bajo `targetInfo.parentFrameId` solo cuando
  ese padre ya está registrado. No se crea un frame raíz ni se recarga la pestaña.
- Retirar la habilitación de `Log` y del gestor de sesiones de red.
- Desactivar `grantUniveralAccess` al crear el mundo aislado.

Esta adaptación parcial evita comandos de los dominios prohibidos durante el
recorrido instrumentado. No elimina sus implementaciones de la biblioteca.
No modifica `node_modules` ni parchea dependencias instaladas; la licencia
Apache-2.0 se copia junto a los módulos en la extensión temporal.

Vite empaqueta el worker propio dejando `./candidate/index.mjs` como import ESM
local; los dos módulos publicados se copian como assets locales. Se verifica la
carga real del resultado. Así se evita el rebundling que falló en #50 por los
imports `../playwright` y `./bidiOverCdp`. El
[Vite config de la candidata](https://github.com/ruifigueira/playwright-crx/blob/main/vite.config.mts)
excluye esos puntos de CommonJS; el laboratorio usa la configuración
[build.rolldownOptions](https://vite.dev/config/build-options) para conservar
los assets ya distribuidos. No sustituye imports ausentes por stubs.

Los módulos adaptados suman **5.382.072 bytes** y conservan APIs de red, recorder,
tracing y otras capacidades que la auditoría prohíbe. El empaquetado observado
**no equivale** a aceptación del bundle de producción. No se llama a recorder,
tracing, HAR, snapshots, screenshots, exports ni descargas.

## Frontera de privacidad y límites

La extensión temporal tiene `debugger`, `tabs` y `storage` para las mediciones;
no tiene `host_permissions`, `nativeMessaging` ni código remoto. Su CSP prohíbe
conexiones de red de la extensión. Se rechazan fetch, escrituras de storage y
memfs, comandos `Network`, `Fetch`, `Storage`, `Log` y consultas de cookies.
Los tres almacenes se comprueban vacíos al terminar. Los informes solo contienen
nombres y cantidades de comandos/eventos, sin parámetros, resultados, DOM,
URLs de sesión ni valores de campo.

Estos guards son instrumentación, **no un firewall de producción**. La candidata
mantiene un transporte CDP general y puede recibir otros eventos de `Runtime` o
`Target`; no se ha demostrado que sus payloads estén acotados a las acciones
permitidas. La ausencia de `Network` en estos casos no demuestra ausencia de
datos de sesión en todos los canales. El
[transporte upstream](https://github.com/ruifigueira/playwright-crx/blob/main/src/server/transport/crxTransport.ts)
necesita un límite explícito antes de aceptar un portal autenticado.
El [protocolo Network de Chrome](https://github.com/ChromeDevTools/devtools-protocol/blob/master/pdl/domains/Network.pdl)
incluye eventos de cabeceras y cookies: habilitarlo indiscriminadamente sería
incompatible con el contrato del proyecto.

Los perfiles temporales del navegador pueden escribir su funcionamiento interno
en disco. Este laboratorio con datos sintéticos los elimina al finalizar;
**no demuestra ausencia de persistencia interna del navegador**. No crea HAR,
traces ni capturas. El heap de unos 2,7 MB corresponde a una pestaña sintética,
no al worker; `extensionHeap: null` impide estimar consumo de la extensión.

No se verificaron portales reales, firmas, CAPTCHA, certificados, archivos,
contraseñas, suspensión/reinicio del worker, pérdida de integridad/versiones de
mapas ni otras versiones de Chrome/Edge. Ningún control oficial se reemplazó.
La fixture intercepta su submit local; no reproduce peticiones de un portal.

## Decisión y trabajo pendiente

Mantener producción deshabilitada y #51 abierto. La evidencia permite seguir
investigando una adaptación de Playwright real, pero no entregar el motor seguro.
El ticket no exige expresamente adjuntarse a una pestaña ya cargada: un flujo
que abra una pestaña del mismo perfil, conecte antes de navegar y preserve los
controles originales podría declararlo no soportado y dejar intacta una pestaña
preexistente. Eso requiere un contrato explícito de producto y no elimina los
bloqueadores de seguridad, empaquetado y auditoría siguientes.
Antes de hacerlo hacen falta:

1. Resolver el click y la geometría del iframe de distinto origen tras
   adjuntarse a una página ya cargada, sin recargarla ni omitir la comprobación
   de visibilidad de Playwright.
2. Consumir mapas validados de `@reforma-digital/registry/flow-map`, sin API de
   selectores/acciones arbitrarias ni rutas ajenas al trámite iniciado.
3. Acotar targets, sesiones, comandos y payloads de eventos CDP, detener y
   desconectar ante pérdida de autorización/integridad y preservar controles.
4. Empaquetar solo capacidades autorizadas y satisfacer una auditoría explícita
   sin excepciones para admitir la biblioteca completa.
5. Validar pausa/retirada/restauración, ciclo de vida MV3 y frontera de memoria.

La [API chrome.debugger](https://developer.chrome.com/docs/extensions/reference/api/debugger)
documenta sesiones hijas y targets fuera de proceso; su soporte no acredita la
inicialización que este paquete realiza. El
[ciclo de vida MV3](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)
también exige tratar reinicios del worker, todavía sin comprobar aquí.

## Verificación del cambio

- En esta iteración, tres ejecuciones por modo con espera explícita de selector
  visible: `existing-loaded` falló 3/3 en el click cross-origin y
  `--before-navigation` pasó 3/3. Con el sondeo retirado, la ejecución final
  volvió a fallar/pasar respectivamente. Se conservó el código de salida 1.
- `node --check` de `run.mjs` y `worker.js`, Oxlint focalizado, Prettier y
  `git diff --check`: pasan. No se repitió `pnpm check` ni la auditoría del
  bundle productivo en esta iteración; no se modificó producción.
- `pnpm check`: no aprobado en dos ejecuciones. Lint, contratos de workspaces
  y typecheck pasan; la última ejecución termina con 196/199 tests aprobados y
  tres timeouts de 5 segundos en archivos no modificados: Extranjería
  `pages.test.ts:52` y Hacienda `hacienda.test.ts:60` y `:71`. La primera tuvo
  cuatro timeouts. No se modificaron configuración, límites ni aserciones.
- `pnpm exec vitest run sites/extranjeria/tests/pages.test.ts sites/hacienda/tests/hacienda.test.ts --no-file-parallelism`: no aprobado;
  7/12 tests pasan y cinco tests de Hacienda agotan el límite existente.
  La comprobación focalizada tampoco permite afirmar que la suite pase.
- `pnpm build && pnpm audit:bundle`: pasa; se construye la extensión y se
  reutiliza el resultado de build de la web mediante la caché de Turbo.
- El auditor rechaza un archivo temporal `dist/__runtime-audit-probe.mjs` con
  una llamada a `fetch`. Ese código sintético no se ejecuta. Se retira el archivo
  y la auditoría vuelve a pasar; no queda una excepción ni un fixture en `dist`.
- Prettier, `node --check` de los tres scripts y `git diff --check`: pasan.

Ponytail Review y la revisión de correctitud/seguridad se realizaron como
auto-revisión, sin presentarlas como revisión independiente. Se reutilizan el
HTML de control y la dependencia fijada de #50; no se conserva el prototipo de
firewall incompleto, ni se propone una excepción por hash para la biblioteca.

Investigación, adaptación y revisión preparadas con asistencia de Codex.
