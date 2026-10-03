# Reforma Digital · Sistema de diseño

Versión 1.0 · 2026‑09‑27

Este documento es la referencia visual de **todo** lo que Reforma Digital pinta: los paneles, el popup, la capa de estilo que viste la web oficial y la web pública (`apps/web`: landing, chat y páginas informativas). Ningún portal (`sites/<id>`) ni la landing definen colores, tamaños ni componentes propios: usan los de aquí. Las demostraciones de la landing se pintan con las mismas clases que la extensión, así que lo que enseña la portada es lo que se instala.

| Qué                                    | Dónde vive en el código                                                                                                                                                                                                                                                       |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tokens (color, forma, tipografía)      | [`packages/design/src/tokens.css`](packages/design/src/tokens.css)                                                                                                                                                                                                            |
| Componentes (botones, campos, avisos…) | [`packages/design/tailwind-preset.js`](packages/design/tailwind-preset.js)                                                                                                                                                                                                    |
| Componentes React                      | [`packages/design/src/ui/components.tsx`](packages/design/src/ui/components.tsx) · campos conectados en [`packages/react`](packages/react/src/index.tsx)                                                                                                                      |
| Temas para webs oficiales              | [`themes/morfos.css`](packages/design/themes/morfos.css) (framework Morfos de la AGE) · [`themes/aeat.css`](packages/design/themes/aeat.css) (Agencia Tributaria) · [`themes/sede-interior.css`](packages/design/themes/sede-interior.css) (Sede del Ministerio del Interior) |

Los componentes se definen **una sola vez** en el preset. Los paneles los usan como clases (`bg-btn bg-btn-primary`) y los temas los aplican a los elementos oficiales con `@apply`. Así, un botón oficial y un botón del panel son idénticos por construcción.

---

## 1. Principios

1. **La web oficial manda.** Toda la información sale de la página oficial y todas las acciones ejecutan controles oficiales. El diseño lo deja claro: etiqueta «Interfaz comunitaria · sitio oficial», dominio visible y bloques de «Información oficial».
2. **Una sola voz visual.** Mientras la mejora está activa, toda la página (panel, contenido oficial, cabecera, pie) usa los mismos tokens y componentes. No hay «islas» con estilos distintos.
3. **Claridad antes que decoración.** Una acción principal por pantalla, jerarquía tipográfica corta, mucho aire y nada de ornamentos.
4. **Nada importante se oculta.** Los avisos legales, errores, condiciones y requisitos se re‑maquetan, pero nunca se esconden, se acortan ni se reordenan.
5. **Accesible por defecto.** Todo cumple WCAG 2.2 AA: contraste, foco visible, objetivos de 44 px y controles nativos.
6. **Privado por diseño.** Sin fuentes, imágenes ni scripts remotos. Todo va dentro del paquete.

## 2. Tokens

### 2.1 Color

Los valores están en `packages/design/src/tokens.css` como canales RGB (`--bg-brand-600: 20 20 20`). El contraste está medido sobre blanco salvo que se indique otra cosa.

| Token              | Hex                               | Uso                                                                      | Contraste             |
| ------------------ | --------------------------------- | ------------------------------------------------------------------------ | --------------------- |
| `ink`              | `#141414`                         | Texto principal, títulos                                                 | 18.4:1 sobre blanco   |
| `ink-muted`        | `#555555`                         | Texto secundario, ayudas                                                 | 7.5:1 sobre blanco    |
| `ink-subtle`       | `#696969`                         | Metadatos, eyebrow                                                       | 5.5:1 sobre blanco    |
| `canvas`           | `#F7F7F8`                         | Fondo de página                                                          | —                     |
| `surface`          | `#FFFFFF`                         | Tarjetas, campos                                                         | —                     |
| `surface-muted`    | `#F4F4F5`                         | Zonas secundarias, avisos neutros                                        | —                     |
| `line`             | `#EBEBEB`                         | Bordes de tarjeta, separadores                                           | decorativo            |
| `line-strong`      | `#DCDCDC`                         | Borde de opciones seleccionables                                         | decorativo            |
| `line-control`     | `#808080`                         | Borde de campos y botón secundario                                       | 3.9:1 sobre blanco    |
| `brand-600`        | `#141414`                         | **Acción principal**, enlaces, foco                                      | 18.4:1 sobre blanco   |
| `brand-700`        | `#2D2D2D`                         | Hover de acción/enlace                                                   | 13.8:1 sobre blanco   |
| `brand-50/100/200` | `#F7F7F7` `#EEEEEE` `#CDCDCD`     | Badge, selección y paso actual (`100`), anillo de foco de campos (`200`) | —                     |
| `brand-900`        | `#141414`                         | Texto sobre `brand-50`                                                   | 17.2:1 sobre brand-50 |
| `info-*`           | `#EFF6FF` · `#BFDBFE` · `#1E3A8A` | Aviso informativo (fondo · borde · texto)                                | 9.5:1                 |
| `warning-*`        | `#FFFBEB` · `#FCD34D` · `#78350F` | «Lee esto antes de continuar»                                            | 8.8:1                 |
| `danger-*`         | `#FEF2F2` · `#FCA5A5` · `#991B1B` | Errores y énfasis rojo de la web oficial                                 | 7.6:1                 |
| `success-*`        | `#ECFDF3` · `#A6F4C5` · `#05603A` | Confirmaciones                                                           | 7.3:1                 |

Reglas:

- Solo hay **un color de acción**: `brand-600`. No hay botones rojos, verdes ni del color corporativo de la web oficial.
- El color nunca es el único indicador: la selección lleva borde, fondo **y** peso de fuente; el estado del paso lleva número o ✓ **y** texto oculto para lectores de pantalla.
- Modo oscuro: **no** en la v1. El contenido oficial (tablas, imágenes, estilos inline) no se puede invertir con garantías.

### 2.2 Tipografía

Fuente: Helvetica Neue, Helvetica y Arial como alternativa. No se cargan fuentes remotas (§1.6).

| Clase                  | Tamaño / interlineado       | Peso | Uso                                                 |
| ---------------------- | --------------------------- | ---- | --------------------------------------------------- |
| `bg-h1`                | 28/1.2 (24 en móvil)        | 500  | Título del panel, uno por página                    |
| `bg-h2`                | 20/1.3                      | 650  | Secciones, títulos oficiales re‑maquetados          |
| `bg-h3`                | 17/1.4                      | 600  | Subsecciones, grupos de opciones                    |
| `bg-lead`              | 17/1.6                      | 400  | Entradilla bajo el título                           |
| `bg-text`              | 16/1.6                      | 400  | Cuerpo. **Mínimo absoluto para lectura**            |
| `bg-small` / `bg-hint` | 14/1.5                      | 400  | Ayudas y metadatos. Nunca para información esencial |
| `bg-eyebrow`           | 12/1.4, mayúsculas, +0.06em | 600  | Rótulos («Información oficial», «Paso 2 de 5»)      |

- Las líneas de lectura no pasan de unos 75 caracteres (`max-width: 70ch` en el cuerpo).
- Los textos oficiales en MAYÚSCULAS se muestran tal cual: no se reescriben.

### 2.3 Espaciado, forma y elevación

- Retícula de **4 px**. Escala habitual: 4, 8, 12, 16, 20, 24, 32, 48.
- Entre bloques de un panel: 20 px. Relleno de tarjeta: 16 px en móvil y 24 px desde 640 px.
- `--bg-radius-control`: **16 px** (campos, opciones, avisos, pasos). `--bg-radius-card`: **24 px** (tarjetas y panel). Píldora (`999px`) para botones, buscador y badge.
- Tarjetas **sin borde ni sombra**: una superficie blanca sobre el `canvas` gris. La línea (`line`) solo separa elementos dentro de una tarjeta. `shadow-raised` queda para el aviso flotante de fallback; nada más flota.
- Ancho máximo del contenido: **1120 px** (`--bg-content-max`).
- Puntos de corte: `sm` 640 px (una a varias columnas) y `lg` 1024 px (aparece la barra lateral oficial). Todo se diseña primero a **375 px**.

### 2.4 Movimiento

- Solo transiciones de color de 150 ms en hover. Sin animaciones de entrada.
- `prefers-reduced-motion: reduce` desactiva todas las transiciones y el desplazamiento suave.

## 3. Componentes

Los nombres de clase son los del preset. En React se usan los componentes que exporta `@reforma-digital/design`.

| Componente               | Clases                                                                             | React                                   | Reglas                                                                                                                                                                                                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Barra superior**       | `bg-badge` + `bg-btn-secondary`                                                    | `Shell` (runtime) + `CommunityBadge`    | La pinta el runtime en toda página mejorada: «Interfaz comunitaria · sitio oficial», el dominio actual y el botón «Ver original». Ningún portal la repite.                                                                                                         |
| **Panel**                | `bg-card`                                                                          | `Panel`                                 | Uno por página, justo después del título oficial. Contiene: `bg-h1` → `bg-lead` → progreso → contenido.                                                                                                                                                            |
| **Campo conectado**      | `bg-bound` + `bg-label` + `bg-field` + `bg-hint`                                   | `BoundField` (`@reforma-digital/react`) | Sustituye un control oficial en su sitio (slot) y lo sincroniza mediante `DomBridge`.                                                                                                                                                                              |
| **Progreso**             | `bg-step` (+`bg-step-current`, `bg-step-done`, `bg-step-todo`) + `bg-step-num`     | `ProgressSteps`                         | Fichas sin borde con `aria-current="step"` desde 640 px: el paso actual lleva fondo `brand-100`, número en negro y peso 600; los hechos, ✓. En móvil, una barra segmentada más «Paso N de M: nombre». Los pasos fuera del alcance llevan «solo en la web oficial». |
| **Botón principal**      | `bg-btn bg-btn-primary` (+`bg-btn-lg`)                                             | `PrimaryAction`                         | Uno por pantalla. Verbo más destino («Continuar con Madrid»). Deshabilitado solo con una ayuda que diga por qué. Si la web oficial ofrece opciones equivalentes (p. ej. con o sin Cl@ve), **ninguna** se destaca: todas van como secundarias.                      |
| **Botón secundario**     | `bg-btn bg-btn-secondary`                                                          | `SecondaryAction`                       | «Volver» y acciones alternativas.                                                                                                                                                                                                                                  |
| **Enlace**               | `bg-link`                                                                          | `LinkButton`, `ExternalLink`            | Siempre subrayado. Los externos llevan ↗ y «(se abre en una pestaña nueva)» para lectores de pantalla.                                                                                                                                                             |
| **Campo**                | `bg-label` + `bg-field` + `bg-hint`                                                | —                                       | Etiqueta visible siempre; el placeholder solo pone ejemplos.                                                                                                                                                                                                       |
| **Buscador**             | `bg-field bg-field-search`                                                         | `SearchField`                           | El mismo campo en píldora. Busca sin tildes ni símbolos («clave» encuentra «Cl@ve») y dice cuántos resultados hay.                                                                                                                                                 |
| **Opción seleccionable** | `bg-choice` (+`bg-choice-checked`)                                                 | `Choice`                                | `radio` nativo dentro de `label`. Seleccionada: borde `brand-600`, fondo `brand-100` y peso 600. Se usa en listas largas con buscador; con menos de 7 opciones, radios sin buscador.                                                                               |
| **Aviso**                | `bg-callout bg-callout-{info,warning,danger,success,neutral}` + `bg-callout-title` | `Callout`                               | `warning` = «lee esto antes de seguir»; `danger` = errores (con `role="alert"`); `neutral` = texto legal.                                                                                                                                                          |
| **Bloque oficial**       | `bg-eyebrow`                                                                       | `OfficialDivider`                       | Separa el panel del contenido oficial: «Información oficial de esta página».                                                                                                                                                                                       |
| **Aviso de fallback**    | `bg-card shadow-raised`                                                            | `FallbackNotice`                        | Esquina inferior izquierda, se puede cerrar y no bloquea nada.                                                                                                                                                                                                     |

## 4. Cómo se viste la web oficial

Mientras la interfaz está activa, el runtime (`packages/runtime`) añade `data-bg-site="<portal>"` y `data-bg-page="<pantalla>"` al `<html>` e inyecta los `pageStyles` de la pantalla. Al pulsar «Ver original», desactivar el portal o si falla un control oficial, **se quita todo** y la página vuelve a ser la original.

### 4.1 Qué se re‑estiliza

| Zona oficial                                                                 | Se muestra como                                                                                        |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Fondo, tipografía y color del texto                                          | `canvas`, `bg-text`, `ink`                                                                             |
| Cabecera (logotipos oficiales, título de la sede y menú)                     | Barra blanca con borde; los **logotipos oficiales se mantienen** intactos y el menú pasa a texto `ink` |
| Migas de pan y rótulos                                                       | `bg-small` / `bg-eyebrow`                                                                              |
| Título oficial de la página («CITA PREVIA EXTRANJERÍA»)                      | `bg-eyebrow`: queda como rótulo sobre el panel                                                         |
| Contenedor principal y barra lateral                                         | `bg-card`                                                                                              |
| Títulos oficiales (`h2`, `h3`, `.mf-paragraph-header`)                       | `bg-h2` / `bg-h3`                                                                                      |
| Párrafos y listas                                                            | `bg-text`, `max-width: 70ch`                                                                           |
| Enlaces                                                                      | `bg-link`                                                                                              |
| Notas (`.mf-note`) y listas de avisos                                        | `bg-callout-warning` o `bg-callout-neutral`                                                            |
| Aviso de protección de datos (`fieldset` con estilo inline)                  | `bg-callout-neutral`                                                                                   |
| Texto en rojo inline (`style="color: red"`)                                  | `danger-fg`: **se mantiene el énfasis**                                                                |
| Errores oficiales (`.error_list`, `.mf-msg__error`)                          | `danger-fg`                                                                                            |
| Botones oficiales (`.mf-button`, `input[type=submit]`, `input[type=button]`) | `bg-btn` primario o secundario                                                                         |
| Campos oficiales (`select`, `input`)                                         | `bg-field`                                                                                             |
| Opciones con/sin Cl@ve (`.mf-button__primary/secondary` en `acInfo`)         | `bg-card` interactiva                                                                                  |
| Barra de cookies                                                             | Tarjeta fija abajo con botones `bg-btn`. **No se oculta ni se acepta.**                                |
| Pie                                                                          | `bg-small` sobre `surface`                                                                             |

### 4.2 Controles oficiales duplicados

Si un panel ofrece un control sincronizado con uno oficial (el desplegable de provincias, el de oficinas, el de trámites o el botón «Aceptar»), el tema puede ocultar **solo ese control oficial** mientras el panel está montado. Nunca se ocultan:

- mensajes de error ni sus contenedores,
- avisos, notas, textos legales ni requisitos,
- controles oficiales que el panel no replica (p. ej. `#divSubTramites`),
- nada en pantallas que el portal no tenga registradas.

«Ver original» (barra comunitaria o popup) y «Desactivar en este portal» los recuperan al instante.

### 4.3 Lo que nunca hace un tema

- `display: none`, `visibility: hidden` u `opacity: 0` sobre contenido informativo (solo se permite en controles duplicados, §4.2).
- Truncar texto (`line-clamp`, `text-overflow`), cambiar el orden del contenido oficial o bajar de 14 px.
- Cambiar o tapar los logotipos institucionales, o imitar la identidad de la Administración en elementos propios.
- Pintar botones propios con apariencia de botón oficial fuera del panel.

## 5. Contenido y tono

- **Tú**, frases cortas y verbos en imperativo amable: «Elige la provincia», «Lee los avisos oficiales».
- Atribuye siempre: «según la web oficial», «la web oficial indica».
- No prometas nada: nunca digas «hay citas», «es rápido» ni «tendrás cita». Tampoco inventes requisitos, plazos ni documentos.
- Nombra las cosas como la web oficial («Presentación sin Cl@ve»), aunque suenen raro, para que la persona las reconozca.
- Los números de paso, en cifras: «Paso 2 de 5».

## 6. Accesibilidad (lista de comprobación)

- [ ] Contraste AA en texto (4.5:1) y bordes de controles (3:1).
- [ ] Foco visible: contorno de 3 px `brand-600` con separación de 2 px en botones y enlaces, y anillo de 3 px `brand-200` más borde `brand-600` en campos.
- [ ] Objetivos táctiles de al menos 44 × 44 px.
- [ ] Controles nativos (`button`, `select`, `input[type=radio]`, `fieldset`/`legend`).
- [ ] Un solo `h1` visual por panel; en el HTML el panel usa `h2`, porque la página oficial ya tiene su `h1`.
- [ ] Cambios dinámicos anunciados con `aria-live` o `role="alert"` (errores oficiales).
- [ ] Sin scroll horizontal a 375 px.
- [ ] Se respeta `prefers-reduced-motion`.

## 7. Cómo añadir o cambiar algo

1. ¿Existe ya un token o componente? Úsalo.
2. Si no existe, añádelo **aquí primero** (tabla correspondiente), después en `tokens.css` o en el preset, y por último úsalo.
3. Revisa el resultado con `npm run site:preview -- <portal>`, que reproduce una visita grabada con `site:record` sin conexión y guarda capturas a 1280 y 390 px en `.cache/preview/<portal>/`. Para los campos conectados, usa el laboratorio (`npm run dev`).
4. Un PR que cambie el diseño debe incluir capturas y, si toca tokens de color, el contraste medido.

## 8. Landing

La web pública (`apps/web`: landing, chat y páginas informativas) usa los mismos tokens y el mismo preset que la extensión; no tiene una guía aparte.

- **Componentes.** Las demostraciones (portada y Fig. 5) se montan con las clases del preset (`bg-card`, `bg-step`, `bg-field-search`, `bg-choice`, `bg-btn`). La hoja de la landing solo añade lo que la extensión no tiene: el marco de navegador (contenedor gris de 28 px de radio con 10 px de relleno y panel interior de 18 px) y la maquetación del artículo.
- **Tipografía.** Es la única diferencia: la landing carga Inter Variable en local (títulos con el diseño óptico Display, `opsz: 32`; cuerpo con `opsz: 14`) redefiniendo `--bg-font`. La extensión sigue con las fuentes del sistema para no empaquetar ni pedir fuentes dentro de una web oficial (§1.6).
- **Iconos.** `lucide-react`, trazo 1.65–1.7. La marca se gira −90° con el texto horizontal.
- **Figuras.** Blanco y negro, sin marcos decorativos. Las capturas de webs oficiales no se recolorean y van dentro del marco de navegador; las notas sobre una captura son píldoras negras con número, y en móvil pasan a lista bajo la imagen. Rojo (`danger-fg`) y verde (`success-fg`) solo rotulan «sin» y «con» Reforma Digital.
- **Movimiento.** La portada admite una animación de entrada en sus dos previsualizaciones; se desactiva con `prefers-reduced-motion`. El resto sigue §2.4.
- Las demostraciones no solicitan citas ni envían datos.

### 8.1 Buscador y conversación

- La landing, el chat, las citas y las páginas informativas comparten `apps/web/styles/theme.css`: Inter local y los tokens originales de `packages/design`. La propuesta se explica en la misma landing; `/propuesta` baja a `#texto`. El chat conserva los tokens originales; la portada añade acentos editoriales propios.
- Títulos con Inter Display (`opsz: 32`), peso 500 y espaciado compacto; cuerpo con Inter Text (`opsz: 14`), 16 px como mínimo. Metadatos a 14 px y rótulos a 12 px. El titular de la iniciativa puede crecer hasta 72 px (40 px en móvil); la descripción principal mide de 18 a 24 px y se separa de la fotografía por 40 px. Las secciones mantienen la escala editorial de la propuesta.
- Lienzo `canvas`, superficies blancas, radios de 16/24 px y acciones negras. En portada, el composer va sobre la fotografía del hero, sin borde y con anillo de foco; no lleva píldoras ni texto auxiliar de fuentes. Las citas son enlaces subrayados en `brand-600`; el fragmento se presenta en una superficie neutra. Los errores usan los tokens `danger`.
- El hero usa exclusivamente los tokens neutros: `surface-muted` en el fondo, `ink` en el titular y `brand-600` en las acciones. La fotografía de Madrid conserva su tratamiento en blanco y negro; la descripción de las herramientas aparece dentro de la imagen, en `ink-inverse`, sobre un degradado oscuro para mantener el contraste. La foto crece si el composer o la descripción necesitan más espacio. Las sedes de la demo mantienen sus colores oficiales.
- La portada es el ensayo de `apps/web/landing`. El hero centra el mensaje sobre la fotografía de Madrid, con el composer en su borde superior y el enlace de descarga debajo. Su marco mide hasta 1472 px, tiene 32 px de radio y márgenes de 32 px; la fotografía mide hasta 1016 px. En móvil, los márgenes son de 20 px, el fondo neutro empieza bajo la navegación y la foto tiene 24 px de radio. El composer conserva el campo nativo, crece con el texto hasta 140 px y muestra foco visible. Hasta 1023 px, el menú conserva el icono de hamburguesa con un objetivo táctil de 44 × 44 px. La demo de la extensión es `DemoTransform`: Original y Mejorada a la vez en la figura del artículo, y una sola vista en `/demo`. No alterna sola. No se usa un saludo de chatbot. Las demostraciones de sedes conservan sus colores oficiales y los componentes compartidos.
- La respuesta aparece según llega, sin animaciones de entrada. Como indicador de actividad, el texto «Pensando» conserva un brillo neutro mientras hay trabajo pendiente; queda estático con `prefers-reduced-motion`. No se anima el resto del contenido al entrar.
- El mapa de fuentes de la portada usa cuatro intensidades neutras: `surface-muted` para 0, `brand-200` para 1–2, `line-control` para 3–5 y `brand-600` para 6 o más fuentes territoriales. La leyenda y las cantidades expresan el dato también sin color; la selección tiene contorno y una lista de botones accesibles. Las fuentes estatales se muestran aparte.
