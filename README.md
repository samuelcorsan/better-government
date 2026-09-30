# Reforma Digital

Monorepo de interfaces comunitarias para páginas de la Administración. Una extensión de Chrome aplica los subproyectos incluidos en cada versión. Las interfaces se desarrollan con React, TypeScript y Tailwind, y siguen un único sistema de diseño ([DESIGN.md](DESIGN.md)).

La extensión funciona localmente. Los formularios, las sesiones y las solicitudes siguen perteneciendo a la web original. Solo se guardan preferencias de activación y, si reportas una pantalla pendiente, un informe ya censurado al buzón privado configurado con `BG_INTAKE_ORIGIN` (ver [SECURITY.md](SECURITY.md)).

## Organización

```text
apps/
  extension/                Extensión Chrome Manifest V3 y popup
  landing/                  Web pública del proyecto (Astro)
  playground/               Laboratorio local con datos ficticios
packages/
  bridge/                   Conexiones con controles originales
  design/                   Sistema de diseño: tokens, componentes y temas (DESIGN.md)
  react/                    Componentes y hooks conectados
  registry/                 Contratos y selección de portales/pantallas
  runtime/                  Montaje, estilos compartidos y restauración
sites/
  dni/                      Cita previa DNI y pasaporte, experimental
  extranjeria/              Cita previa de Extranjería, experimental
  hacienda/                 Subproyecto preparado, desactivado
  registro-asociaciones/    Subproyecto preparado, desactivado
```

Cada portal es un workspace de npm y tiene la misma estructura:

```text
sites/<portal>/
  package.json
  site.config.json          Dominio, rutas, estado y activación
  src/
    adapter.ts              Entrada del subproyecto
    pages/
      index.ts              Registro de pantallas
      <pantalla>/
        page.tsx            Interfaz React de esa pantalla
        bindings.ts         Conexiones con la web original
    components/             Componentes propios compartidos
    styles/                 Estilos propios
  fixtures/                 Páginas de prueba sin datos personales
  tests/                    Pruebas del portal
  flow.ts                   Opcional: recorrido de la web real para site:live/record/preview
  README.md                 Cobertura y límites de la integración
```

El build descubre `sites/*/site.config.json`. Solo incluye los portales con `enabled: true`. Añadir un portal no requiere escribir condiciones específicas en la extensión. Todas las interfaces activadas se distribuyen dentro del mismo paquete de extensión, cada una en su propio content script que solo se inyecta en sus rutas. Cómo encaja todo: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Desarrollo

Requiere Node.js 22.12 o posterior y npm. Desde la raíz:

```sh
npm ci
npm run dev
```

Abre el laboratorio en `http://127.0.0.1:4173`. Usa datos ficticios. Permite editar controles React y originales, comparar sus valores, restablecer el formulario y comprobar qué recibe el formulario original. No reserva citas.

```sh
npm run check         # Tipos, estructura, pruebas y compilación
npx playwright install chromium
npm run test:e2e      # Pruebas de la extensión en Chromium
npm run package      # ZIP instalable en artifacts/
```

La web pública del proyecto está en `apps/landing` (Astro, sin JavaScript de terceros ni fuentes remotas):

```sh
npm run landing:dev     # http://127.0.0.1:4321
npm run landing:build   # HTML estático en apps/landing/dist/
```

Para trabajar con la web oficial real (ventana visible, un solo recorrido, nunca datos personales ni CAPTCHA):

```sh
npm run site:live -- extranjeria      # Comprobaciones, capturas y fixtures desde la web real
npm run site:record -- extranjeria    # Graba una visita para trabajar sin conexión
npm run site:preview -- extranjeria   # Reproduce la grabación con la extensión y guarda capturas
```

Para cargarla en Chrome, ejecuta `npm run build`, abre `chrome://extensions`, activa el modo de desarrollador y elige **Cargar descomprimida** con la carpeta `dist/`. El build de pruebas `dist-test/` añade acceso al servidor local; no se distribuye.

## Añadir un portal

```sh
npm run site:new -- nombre-del-portal
npm install
```

El generador crea un workspace completo y desactivado. También admite un dominio HTTPS exacto y un prefijo de ruta como segundo y tercer argumentos. Se desarrolla dentro de su carpeta y se activa en `site.config.json` cuando sus rutas y conexiones estén preparadas. Lee [CONTRIBUTING.md](CONTRIBUTING.md).

## Estado real

La base se compila y dispone de pruebas unitarias y pruebas con la extensión cargada. El 10 de septiembre de 2026 se comprobó la extensión instalada en Chrome de pruebas sobre el portal oficial: se montaron los cinco campos React de identificación y se verificó que un valor ficticio introducido en la nueva interfaz llegaba al input original, sin enviar el formulario. La adaptación es parcial: quedan la maquetación antigua y alguna etiqueta duplicada. **No se ha validado el trámite oficial completo**. Las pantallas no reconocidas mantienen su interfaz original.

El 27 de septiembre de 2026 se recorrió la web oficial de cita previa de Extranjería con la extensión cargada: página informativa, provincia, oficina y trámite, e información del trámite con la elección con o sin Cl@ve (Madrid, «Toma de huellas»). La interfaz se detiene antes del formulario de datos personales. Sus fixtures son HTML real de esas páginas públicas. Consulta [la cobertura de Extranjería](sites/extranjeria/README.md).

CAPTCHA, audio, certificados, firma, archivos y controles de navegador se mantienen como controles originales. No se simulan ni se sustituyen genéricamente. Conservar esos controles no demuestra por sí solo que todos los flujos de un portal funcionen: cada integración requiere verificación. Consulta [SECURITY.md](SECURITY.md) y [la cobertura del DNI](sites/dni/README.md).

Código bajo licencia [MIT](LICENSE). Proyecto independiente, sin vinculación con la Administración.
