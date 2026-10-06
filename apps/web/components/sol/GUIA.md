# Sistema Sol: guía de uso

Fuentes de verdad: `tokens.css`, `botones.css` e `icono.tsx`. Si algo no está aquí, usa un token y no un valor suelto.

## Montaje

El layout de `app/layout.tsx` monta `fuentesSol`, `.sol-raiz`, `tokens.css` y `botones.css` una sola vez. Las páginas no importan las fuentes ni crean otro contenedor de tema. Usa `Cabecera`, `Pie` y `PaginaInformativa` para las páginas interiores. La cabecera del hero sigue dentro del propio gradiente.

La referencia general es [DESIGN.md](../../../../DESIGN.md#8-web-pública-sistema-sol). No se mantienen rutas de variantes o prototipos.

## Tipografía

| Rol                                                              | Clase o token                     | Familia                                |
| ---------------------------------------------------------------- | --------------------------------- | -------------------------------------- |
| Titular de portada                                               | `.t-titular-xl` (44–92 px)        | `--font-titular` (Timeless Serif)      |
| Titular de sección                                               | `.t-titular-m` (32–52 px)         | Timeless Serif                         |
| Titular de tarjeta                                               | `.t-titular-s` (24–30 px)         | Timeless Serif                         |
| Entradilla                                                       | `.t-texto-l` (17–19 px)           | `--font-lectura` (Timeless Serif Text) |
| Cuerpo                                                           | `.t-texto` (16 px)                | `--font-texto` (Timeless Sans)         |
| Cifra grande de marca (89, 83, 20)                               | `.t-cifra`                        | `--font-cifra` (hoy Timeless Serif)    |
| Dato operativo: contadores, «3 de 89», fechas, dominios, puestos | `.t-dato`                         | `--font-mono` (Geist Mono)             |
| Etiqueta de estado o de sección                                  | `.t-etiqueta` (12 px, mayúsculas) | Geist Mono                             |
| Logotipo                                                         | `.marca`                          | `--font-logo` (Timeless Sans Bold)     |

- `h1` y `h2` salen en Timeless Serif por defecto. `h3` en adelante sale en Timeless Sans.
- El logotipo siempre con el componente `Logotipo` (R roja sobre claro; en currentColor sobre rojo, tinta o amarillo).
- Para probar las cifras en mono basta con cambiar `--font-cifra: var(--font-mono)` en `tokens.css`.
- Por debajo de 14 px, solo `.t-etiqueta`, que va en mayúsculas.
- Pon un ancho máximo a los párrafos: entre 58 y 65 ch.

## Color

Rojo `--rojo`, doblez `--doblez`, amarillo `--amarillo`, tinta `--tinta` / `--tinta-2` / `--tinta-3`, superficie `--superficie`, línea `--linea`, ámbar `--ambar-claro` / `--ambar-texto` y azul `--azul` / `--azul-claro`.

- El naranja `--naranja` va solo dentro de degradados: `--atardecer` (hero y fondos grandes) y `--atardecer-boton`.
- Sobre naranja o amarillo, el texto va siempre en tinta, nunca en blanco (blanco sobre naranja da 2,61).
- El texto rojo pequeño sobre `--superficie` no llega a 4,5. Usa `--doblez` o pon el texto sobre blanco.
- El azul es el color de «resuelto»: paso completado, dato verificado y enlace secundario (`.enlace`). No sirve como color de marca ni para botones.
- Para el estado desactivado se usan `--apagado` y `--apagado-texto`, nunca opacidad.

Contraste WCAG medido:

| Par                                   | Ratio       | Uso permitido               |
| ------------------------------------- | ----------- | --------------------------- |
| `--azul` #2346E8 sobre blanco         | 6,75        | texto e iconos              |
| `--azul` sobre `--superficie` #F2F2F2 | 6,03        | texto e iconos              |
| `--azul` sobre `--azul-claro` #EDF1FE | 5,98        | texto en `.caja-resuelto`   |
| `--azul` sobre `--ambar-claro`        | 6,10        | texto                       |
| blanco sobre `--rojo`                 | 4,92        | texto (AA justo)            |
| `--rojo` sobre blanco                 | 4,92        | texto e iconos              |
| `--rojo` sobre `--superficie`         | 4,39        | solo ≥ 24 px o iconos       |
| `--doblez` sobre `--superficie`       | 7,03        | texto                       |
| tinta sobre `--amarillo`              | 9,56        | texto                       |
| tinta sobre `--naranja`               | 6,10        | texto                       |
| blanco sobre `--naranja`              | 2,61        | **prohibido**               |
| `--ambar-texto` sobre `--ambar-claro` | 7,29        | texto                       |
| `--tinta-2` sobre `--superficie`      | 7,55        | texto secundario            |
| `--tinta-3` sobre blanco / superficie | 5,33 / 4,76 | marcadores, texto terciario |
| blanco sobre `--tinta`                | 15,91       | texto                       |

El azul es un cobalto propio, `oklch(0.492 0.244 266.4)`. No es el azul de la AEAT (#0B57A8).

## Cajas

Todas: radio 20 y relleno 24 (20 en móvil). El prefijo `caja-` está reservado.

| Clase            | Cuándo                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| `.caja-plana`    | Tarjeta sobre blanco con línea: listas, opciones, fuentes                                            |
| `.caja-gris`     | Agrupar sin elevar; fondo de bloques secundarios                                                     |
| `.caja-sol`      | Un único dato o llamada destacada por vista                                                          |
| `.caja-tinta`    | Cierres y llamadas fuertes. Cambia `--foco` a blanco                                                 |
| `.caja-flota`    | Lo que flota sobre otra cosa: el chat, los paneles y las tarjetas de ilustración (sombra cálida)     |
| `.caja-aviso`    | Aclaración o aviso sin urgencia (ámbar)                                                              |
| `.caja-error`    | Fallo. Siempre con `<Icono n="error" />`, un titular en `<strong>` (sale en doblez) y una salida     |
| `.caja-resuelto` | Paso completado o dato verificado. Con `<Icono n="hecho" />`; el icono y el `<strong>` salen en azul |

**Anidado:** si una caja contiene directamente otra, el contenedor pasa solo a radio 28 y relleno 12, y la hija a radio 16 (28 − 12). Así no hay que tocar nada. No anides más de dos niveles.

## Botones

| Clase             | Cuándo                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `.boton`          | Acción principal. **Uno por vista.** Tinta; al pasar el ratón sube el atardecer                               |
| `.boton-claro`    | Acción secundaria, y la principal sobre rojo                                                                  |
| `.boton-fantasma` | Terciaria o enlace con forma de botón; hereda el color del fondo                                              |
| `.boton-icono`    | 44×44, solo icono. **Obligatorio `aria-label`** con la acción («Copiar respuesta»)                            |
| `.boton-enviar`   | Enviar o detener en el compositor: círculo de 52 px en tinta con el mismo atardecer. `aria-label` obligatorio |
| `.pildora`        | Preguntas de ejemplo y citas de fuentes. 36 px a la vista y 44 de área táctil. Para dominios, añade `.t-dato` |

- Todos los botones tienen un área táctil mínima de 44 px, se encogen a 0,96 al pulsarlos y muestran el foco con `--foco`.
- Para desactivarlos se usa el atributo `disabled`, no una clase.
- Sobre el rojo del hero, el hover de `.boton` se confunde con el fondo. Ahí usa `.boton-claro` y pon `--foco: var(--blanco)` en el contenedor rojo.
- El hover vive en una capa `::before` (opacity y transform). En `.boton` y `.boton-enviar` es un degradado radial de bordes suaves, sin `filter`, que sube desde el borde inferior: entra en 420 ms y sale en 180 ms, y el texto queda siempre sobre tinta o rojo. La capa ocupa el botón y hereda su radio para conservar el recorte en Safari. No añadas `transition: all` ni animes colores.
- Da clase a cada botón y reutiliza los estilos del sistema; el reset global no añade animaciones.

## Iconos

`<Icono n="…" size={14–20} />` (por defecto 18). Los chevrons (`derecha`, `abajo`, `enviar`) son pixelados; el resto usa Nucleo UI Essential outline 18. Los iconos son decorativos (`aria-hidden`); el nombre lo da el texto o el `aria-label` del control.

Nombres: enviar, detener, copiar, util, noUtil, reintentar, nueva · cerrar, abajo, derecha · buscar, fuentes, contacto, externo, descargar · protegido, info, error, nunca, hecho, candado · calendario, documento, ubicacion, usuario, tarjeta, telefono. Solo los que se usan: si necesitas otro, añádelo desde la misma familia.

Sustituciones: `detener` es un cuadrado redondeado propio; `noUtil`, el pulgar de `util` girado 180°; `nunca`, la equis; `externo`, el eslabón.

Si falta un icono, búscalo primero en `nucleo-ui-essential-outline-18`. No mezcles Lucide en Sol.

## Retícula

Todas las secciones usan `max-width: var(--ancho)` (1200 px, con el margen dentro) y `padding-inline: var(--margen)` (20–24 px). Los titulares arrancan en la misma línea; el pie la sigue con su relleno lateral.

## Movimiento y superficies

- `--t-rapido` (160 ms: hover, pulsación), `--t-medio` (200 ms: capas, aparición), `--curva-salida` (entradas), `--curva-cajon` (paneles). Solo `transform` y `opacity`; toda animación con alternativa quieta bajo `prefers-reduced-motion: reduce`. Las secuencias de más de 5 s deben ofrecer pausa (WCAG 2.2.2); las demás se reproducen una vez y paran.
- Sombras: solo `--sombra-suave` o `--sombra-flota` (marrón cálido, por capas). Listas y tablas se separan con `--linea`; las tarjetas se elevan con sombra.
- Capturas oficiales: `outline: 1px solid rgba(0,0,0,.1); outline-offset: -1px`. Nunca se recolorean.
