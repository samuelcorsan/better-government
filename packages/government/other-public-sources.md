# Lector de otros organismos públicos — T-007 / #43

Contrato público: `@reforma-digital/government/other-public-sources`.
`otherPublicSources` registra documentos y canales exactos;
`extractOtherPublicSource(documentId, response)` extrae una respuesta pública
inerte del constructor de conocimiento. No realiza peticiones ni recibe el
contexto de una persona. Tampoco modifica el registro `sources` de la búsqueda
remota, publica guías ni asigna estado `verified` de `Guide`.

## Canales representativos

| ID                             | Canal y documento aprobado                                                                                                                                          | Organismo competente / publicador                   | Ámbito, idioma, ejercicio | Papel documental                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------- |
| `aeat-renta-2025-presentacion` | [Presentación del manual IRPF 2025](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/presentacion.html), HTML | AEAT / AEAT                                         | ES, es, 2025              | Guía general informativa; no norma ni ficha de un trámite                       |
| `bdns-consolidat-2025`         | [Convocatoria BDNS 845745](https://www.infosubvenciones.es/bdnstrans/api/convocatorias?numConv=845745), JSON                                                        | Generalitat, Departament d’Empresa i Treball / IGAE | ES-CT, es, 2025           | Convocatoria específica Consolida’t; no ayuda universal para cualquier autónomo |

La referencia de ejercicio de Consolida’t procede de su
[publicación oficial de recursos del SOC](https://serveiocupacio.gencat.cat/web/.content/03_Empreses/02_Serveis-per-a-les-empreses/Recull-empresa/Recull-de-recursos-per-a-empreses.pdf),
no del año de recepción ni del host estatal de BDNS. Se comprueban además código,
órgano y región del registro JSON; no se asigna competencia estatal por su
publicador. Una nueva fuente exige comprobar su canal, documento, competencia,
idioma, fechas y condiciones de reutilización antes de añadirla al catálogo.
Los dominios completos, otras convocatorias, concesiones y beneficiarios no
están aprobados. Los tickets de dominio incorporarán sus propias fuentes.

No se presupone una API uniforme: AEAT exige un documento HTML con una única
raíz `#acc-main`, encabezado e idioma esperados y referencia al ejercicio;
BDNS exige los campos de convocatoria publicados en su
[contrato OpenAPI](https://www.infosubvenciones.es/bdnstrans/estaticos/doc/snpsap-api.json).
De BDNS se extraen título y metadatos seleccionados; no se descargan documentos,
extractos completos, bases reguladoras ni enlaces de presentación. Ese registro
no basta para derivar condiciones de una subvención o generar sus pasos.

## Entrada y límites

El constructor aporta `status`, `finalUrl`, `contentType`, `consultedAt` y
`targetExercise`. Según el canal aporta un `Document` HTML o JSON como `unknown`.
El documento debe crearse de forma inerte con su URL real, sin ejecutar scripts
ni cargar recursos; no es el DOM de una sesión autenticada de una persona.
La adquisición debe hacer una sola petición al URL declarado, sin credenciales
ni cookies, sin seguir redirecciones y con límites de tamaño/tiempo. El transporte
y la planificación de consultas quedan en la composición del constructor,
fuera de este extractor y del runtime de la extensión.

Se exige igualdad exacta del URL final, incluido el query de BDNS. Se excluyen
host, ruta, parámetros, usuario/contraseña, redirección o canal diferentes.
HTTP 401/403 y documentos con controles de identificación quedan fuera;
errores HTTP, extracción vacía/duplicada o respuesta ambigua producen `gap`
con un motivo explícito. El HTML se limpia sobre una copia separada, conservando
el documento original. No se ejecutan scripts, formularios ni acciones.

## Fechas y resultados

Las fechas son días ISO reales `YYYY-MM-DD`; se rechazan fechas imposibles.
Consulta, actualización y recepción son conceptos separados. La actualización
desconocida permanece `null`; no se sustituye por la consulta. Para BDNS se
conservan las fechas de publicación/modificación de cada documento y el aviso
de reutilización original, sin inferir de ellas vigencia jurídica.

- `acquired`: extracción consistente con el ejercicio solicitado del manual,
  o con una ventana explícita de la convocatoria. Es una observación, no
  aprobación para publicar conocimiento ni confirmación de elegibilidad.
- `reference`: manual de otro ejercicio, convocatoria cerrada o futura,
  o ventana sin determinar. No se presenta como información actual.
- `gap`: origen/canal no aprobado, login, fecha inválida, extracción fallida
  o contradicción. No se elige un plazo entre señales distintas.

El campo BDNS `abierto` significa solicitud indefinida según el OpenAPI; `false`
no significa convocatoria cerrada. Se comparan las fechas ISO cuando existen.
Fechas relativas no se calculan y las ventanas sin límites suficientes quedan
como referencia. En los propios días de apertura/cierre no se confirma una
ventana abierta sin información de hora. Texto y fechas estructuradas distintos
producen `gap`, aunque parezcan poder interpretarse como equivalentes.

## Reutilización

La [cesión de manuales AEAT](https://sede.agenciatributaria.gob.es/Sede/condiciones-uso-sede-electronica/aviso-legal/cesion-manuales-programas-ayuda.html)
impone condiciones específicas de reproducción: gratuidad, atribución,
integridad y ausencia de publicidad. El catálogo conserva la atribución exigida
y el enlace a esas condiciones. La regla general de
[reutilización AEAT](https://sede.agenciatributaria.gob.es/Sede/condiciones-uso-sede-electronica/aviso-legal/utilizacion-informacion-contenida-web-aeat.html)
no se interpreta como permiso para alterar o redistribuir cualquier manual.
El lector no reproduce un manual completo ni autoriza su transformación o venta.

El [aviso legal BDNS](https://www.infosubvenciones.es/bdnstrans/GE/es/avisolegal)
requiere mantener el significado, la atribución, las fechas y condiciones de
reutilización, sin sugerir respaldo de IGAE. El snapshot conserva origen,
aviso recibido y fechas declaradas. No incorpora datos de concesiones ni
personas beneficiarias. Estos términos deben seguirse también al publicar;
la existencia de un URL público no aprueba otros usos o derechos de terceros.

## Evidencia y límites

El 4 de octubre de 2026 se hicieron consultas puntuales de los canales públicos y sus
contratos/avisos oficiales, sin login ni guardar respuestas reales en fixtures.
El HTML AEAT contiene la raíz `#acc-main`; BDNS devuelve el código y el órgano
esperados. La respuesta de BDNS 845745 observada contiene `fechaFinSolicitud`
de 2025 y `textFin` de 2021: ese conflicto se excluye, no se publica como plazo
vigente. No se trasladó ese contenido real a los tests.
La ejecución puntual del extractor con esas respuestas confirmó `acquired`
para el manual solicitando ejercicio 2025 (`updatedAt: null`) y `gap` con
`ambiguous-response` para BDNS. No certifica reglas vigentes de 2026 ni una
pantalla privada de ningún trámite.

Los tests usan texto, fechas y registros sintéticos. Cubren ambos canales,
identidad/ámbito, host/ruta/query, login, fechas imposibles/futuras, límites
temporales, errores de extracción y contradicciones. No prueban condiciones
legales reales ni la elegibilidad de ningún perfil.

Pendientes de composición: transporte público sin credenciales, actualización
periódica, normalización y gates de `Guide` en T-008/#44, publicación/retirada e
índice local. Otros idiomas, organismos, rutas y documentos necesitan contratos
específicos; estos dos ejemplos no amplían automáticamente la cobertura.

Implementación y verificación preparadas con asistencia de Codex.

Verificación ejecutada: typecheck del workspace y 15 tests focalizados pasan;
lint y `pnpm build && pnpm audit:bundle` pasan. `pnpm check` no terminó aprobado:
252/253 tests pasan, y `sites/hacienda/tests/hacienda.test.ts:60` agotó su límite
existente de 5 segundos. Ese archivo no se modificó; no se cambiaron límites,
configuración ni aserciones para admitir el lector. Se retiró el cambio de
`apps/web/next-env.d.ts` generado por el build.

Ponytail Review y la revisión de correctitud/seguridad se hicieron como
auto-revisión, sin presentarlas como revisión independiente. Se reutilizan
`normalizeText`, fechas nativas y las herramientas de test existentes; no se
añaden dependencias, un framework de scraping ni transporte genérico.
