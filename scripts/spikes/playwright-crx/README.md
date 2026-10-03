# Spike de Playwright dentro de Manifest V3 — #50

Resultado: `playwright-crx@0.15.0` ejecuta acciones dentro del service worker de
una extensión, sin un helper que reciba valores. Esta prueba **no autoriza su
integración como ejecutor general**: falla el frame de distinto origen/sitio,
el empaquetado con Vite 8 y la compatibilidad con la auditoría de producción.
T-015 (#51) necesita resolver esos límites o documentar una decisión de alcance
antes de integrar esta candidata. Este spike no cambia su estado en GitHub.

## Reproducir

Desde la raíz del repositorio:

```sh
pnpm install --frozen-lockfile
npm ci --prefix scripts/spikes/playwright-crx --ignore-scripts --workspaces=false
node scripts/spikes/playwright-crx/run.mjs
```

El runner utiliza `@playwright/test` existente únicamente para abrir un Chromium
temporal, pulsar el botón de la página de control y leer un informe sin valores.
Las acciones sobre la fixture se ejecutan mediante la candidata **dentro de
Manifest V3**. La página sintética genera sus valores con `crypto.randomUUID()`;
el controlador Node no los proporciona ni lee campos/DOM de la fixture.

Si el Chromium requerido por Playwright no está instalado, instalarlo con
`pnpm exec playwright install chromium`. El runner también admite el mismo
`BG_CHROMIUM_PATH` que los E2E existentes para identificar expresamente un
ejecutable instalado. No cambia el ejecutable por defecto del repositorio.

Comando ejecutado el 3 y el 4 de octubre de 2026:

```sh
BG_CHROMIUM_PATH=/home/ro/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
  node scripts/spikes/playwright-crx/run.mjs
```

Entorno: base `4aa5af5`, Node 26.2.0, pnpm 11.1.1,
`@playwright/test` 1.63.0 y Chrome for Testing 151.0.7922.34 en Linux.
La dependencia candidata está fijada y su integridad npm figura en el lockfile
local del laboratorio; no se añade a producción ni al lockfile de pnpm.

El proceso devuelve un JSON y termina con código **1** si falla alguna capacidad
o comprobación de privacidad. Es el resultado negativo observado, no una
exclusión de tests ni una afirmación de compatibilidad. Si no alcanza una fase,
la identifica como no completada y las posteriores permanecen sin verificar.

## Resultados ejecutados

| Comprobación                                                                   | Resultado                                         |
| ------------------------------------------------------------------------------ | ------------------------------------------------- |
| Carga de los módulos ESM distribuidos en un service worker MV3                 | Funciona                                          |
| Leer un valor sintético, rellenar otro campo y pulsar el control original      | Funciona                                          |
| Frame del mismo origen                                                         | Funciona                                          |
| Frame `127.0.0.1` → `localhost`, otro origen/sitio                             | `TimeoutError`; no se completa el relleno         |
| Dos pestañas                                                                   | Funciona                                          |
| Acción inexistente con timeout explícito                                       | Error controlado                                  |
| Cancelación de operación pendiente mediante detach                             | Funciona; termina antes de 2 segundos             |
| Reattach después de cancelar                                                   | Funciona; una acción posterior alcanza el control |
| Cierre de pestaña durante una operación pendiente                              | Rechaza la operación                              |
| Close y liberación del debugger propio de la extensión                         | Funciona                                          |
| Contexto en requests/logs, escrituras en storage/archivos o lectura de cookies | No observado en el recorrido instrumentado        |

Las operaciones tienen un timeout de 2 segundos para registrar un fallo de una
capacidad y continuar midiendo las demás; las acciones deliberadamente pendientes
tienen 5 segundos. Estos límites pertenecen al spike, no cambian el harness del
repositorio. El informe cuenta también las respuestas de fixture por origen,
para distinguir el fallo de un frame de un servidor que no lo hubiese servido.
En la ejecución observada `crossSiteFrame: 1`: el servidor entregó ese iframe,
y el runner exige un contador mayor que cero. La desconexión exige que la segunda
pestaña siga existiendo y que Chrome rechace un comando con
`Debugger is not attached`; no basta con rechazar una promesa por otro error.

El tamaño de los módulos ESM publicados copiados sin modificaciones es
**5.382.126 bytes**. El heap de la pestaña sintética observado ronda **2,8 MB**,
con aproximadamente 4 MB reservados; varía entre ejecuciones. **No es el heap de
la extensión**: `performance.memory` no está disponible en su service worker y
se informa `extensionHeap: null`. No se infiere consumo total desde ese dato.

## Empaquetado y auditoría

El primer intento usando Vite 8.2.2/Rolldown del repo falló con:

```text
Could not resolve '../playwright' in .../lib/index-DedCW3aV.mjs
Could not resolve './bidiOverCdp' in .../lib/index-DedCW3aV.mjs
```

Puede repetirse, desde la raíz, sin modificar la dependencia:

```sh
node --input-type=module -e '
import { build } from "vite";
await build({
  configFile: false,
  build: {
    outDir: ".cache/crx-build-probe",
    lib: {
      entry: "scripts/spikes/playwright-crx/node_modules/playwright-crx/lib/index.mjs",
      formats: ["es"],
      fileName: () => "candidate.js"
    }
  }
});'
```

El laboratorio copia los dos módulos ESM ya publicados a su extensión temporal;
no parchea imports, no instala stubs y no excluye ramas para hacer pasar Vite.
No guarda sourcemaps. Esta es una prueba de empaquetado ESM nativo diferente de
la integración con el pipeline de producción.

La inspección estática no encontró imports remotos. Sí encontró capacidades de
red, recorder y tracing incluidas en el módulo de la biblioteca. **No se llaman
recorder, tracing, HAR, screenshots, exports ni descargas**. Su presencia y el
nuevo permiso `debugger` impiden afirmar que el bundle satisfaga la auditoría
actual de producción; el runner lo reporta, no convierte esas capacidades en
features autorizadas. `scripts/audit-bundle.mjs` permanece intacto.

## Permisos y canales de datos

El manifest existe únicamente en el directorio temporal del laboratorio:

- `debugger`: transporte CDP desde la extensión hacia sus pestañas sintéticas.
- `tabs`: creación/cierre de pestañas de la fixture; no hay navegación de portales.
- `storage`: permite instrumentar y comprobar que las tres áreas están vacías.
- Service worker de módulos empaquetados; sin `nativeMessaging`, código remoto,
  servidor de sesión ni `host_permissions` de producción.
- CSP de la extensión con `connect-src 'none'` y scripts locales.

El transporte utiliza `Runtime`, `DOM`, `Input` y habilita también `Network`,
`Log` y autoattach de targets. El informe conserva **solo nombres y número de
comandos**, nunca sus parámetros/resultados. La biblioteca puede recibir eventos
de red: no se ha demostrado todavía que un portal real no entregue cookies,
cabeceras o identificadores a esos eventos. Prohibir consultas explícitas de
cookies no acredita que todos los eventos estén libres de datos de sesión.

Antes de iniciar las acciones se bloquean fetch de la extensión, escrituras de
storage y archivos de memfs, y comandos explícitos de lectura de cookies. Los
logs que contienen el prefijo sintético se cuentan y se suprimen. El controlador
vigila requests/logs del navegador y el servidor cuenta el prefijo si llegase en
URL/cuerpo. Ningún contador observado indica un intento en este recorrido.
Estos guards son instrumentación del laboratorio; no prueban ausencia de todos
los canales posibles ni equivalencia con un portal autenticado.

Los valores circulan entre controles originales, transporte Chrome y memoria de
la extensión. El informe Node recibe estados, clases de error y cantidades;
no recibe los valores ni su tabla de correspondencia. El servidor escucha solo
en loopback y no recibe valores de formularios: el submit sintético se intercepta
**en la fixture**, sin replicar peticiones de un portal oficial.

Al terminar, incluso con resultado negativo, se cierran las conexiones y se
eliminan perfil, manifest, módulos y extensión temporales. No se guardan HAR,
trace, capturas, logs de DOM ni contexto. El runner solo imprime el informe
sanitizado; los archivos de fixture contienen código que genera datos sintéticos,
no capturas de personas.

## Límites y siguientes decisiones

No se verificaron CAPTCHA, certificados, firma, archivos, controles de frameworks,
login, reinicio del service worker, navegación entre portales reales ni
Chrome/Edge de otras versiones. La prueba tampoco impone todavía un allowlist
de mapas/acciones de producción: únicamente puede arrancar desde su página de
control empaquetada y acepta un origen loopback de laboratorio.

Antes de T-015: resolver el frame cross-site y Vite; limitar targets y comandos
al flujo autorizado; demostrar separación de eventos de red/datos de sesión;
definir cancelación por pérdida de mapa/versión y suspensión del service worker;
y diseñar una auditoría que reemplace explícitamente los contratos que esta nueva
capacidad modifica. Este spike aporta evidencia para esa decisión, no la toma.

Fuentes primarias:
[API de la candidata](https://github.com/ruifigueira/playwright-crx#api),
[chrome.debugger](https://developer.chrome.com/docs/extensions/reference/api/debugger)
y [ciclo de vida MV3](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle).

Implementación y comprobaciones preparadas con asistencia de Codex.

Validación del repositorio: `pnpm check` pasa (incluye lint, contratos de
workspaces, typecheck, 170 tests, builds y auditoría del bundle de producción).
`pnpm exec prettier --check scripts/spikes/playwright-crx/README.md scripts/spikes/playwright-crx/package.json scripts/spikes/playwright-crx/worker.js scripts/spikes/playwright-crx/control.html scripts/spikes/playwright-crx/control.js scripts/spikes/playwright-crx/run.mjs`
pasa. El runner sintético devuelve 1 por el frame cross-origin, como se detalla
arriba; no se presenta ese resultado como un test de integración aprobado.
