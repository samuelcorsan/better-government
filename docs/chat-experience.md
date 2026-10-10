# Chat y streaming con evidencia

Referencia revisada en el navegador: `https://america.gov/chat`, 30-09-2026. Se observaron el estado de espera, la llegada de la respuesta, preguntas de seguimiento, enlaces y modal de fuentes, compositor y error. Se tomaron medidas de CSS y capturas de escritorio y móvil.

## Diseño aplicado

- La conversación sustituye a la portada en `/`, sin ruta propia. Columna exterior de 688 px e interior de 664 px, cuerpo 16/24.
- Pregunta alineada a la derecha sobre burbuja gris azulada; compositor fijo de 86 px con borde y radio amplio; envío, parada y dictado donde Web Speech está disponible.
- «Pensando…» reproduce el gradiente de 250% de anchura, brillo de 28 px y ciclo lineal de 1,6 s observado. La aparición de bloques tiene un fundido breve y respeta movimiento reducido.
- Citas azules subrayadas, acciones compactas para fuentes, valoración y copia, sugerencias de seguimiento en píldoras con borde.
- Fuentes en diálogo centrado de 432 px, radio 40 px y fondo desenfocado 8 px. Documentos agrupados por dominio, sin duplicarlos por fragmento.
- Cada cita abre su evidencia exacta con organismo, ámbito, fechas y URL canónica. El documento oficial se abre en otra pestaña. Esta inspección conserva el requisito de trazabilidad del producto español.
- Adaptación a 390 px sin scroll horizontal, navegación por teclado y cierre del diálogo con Escape, gestión de foco nativa y salto al último mensaje sin forzar a quien está leyendo arriba.

No es una copia literal de todos los servicios de America.gov: se utiliza Arial en lugar de su fuente Helvetica Now Text; las insignias son monogramas de organismos, no sus sellos oficiales. El clip permite adjuntar PDF con texto seleccionable (5 MB, 20 páginas). El archivo se procesa en el navegador mediante unpdf, cargado bajo demanda; se envían como máximo 6.000 caracteres al preguntar, exclusivamente como contexto. Se muestran archivo, estado de lectura, retirada y errores, y el aviso de truncamiento. No se indexan documentos del usuario ni se citan como fuentes oficiales. El dictado depende del soporte del navegador y requiere que el usuario active el micrófono.

## Comportamiento

La portada pasa la pregunta al chat mediante contexto React; no aparece en la URL ni en almacenamiento persistente del navegador. Los seis últimos mensajes del usuario permiten resolver referencias como «¿Dónde lo puedo tramitar?». La consulta actual prevalece. La consulta, el contexto y el texto del PDF se redactan en el navegador antes de enviarse y de nuevo en servidor antes de usar el modelo ([datos personales](search.md#datos-personales)). El contexto no se usa como evidencia oficial.

El prompt `evidence-v2` genera un array de bloques estructurados mediante Vercel AI SDK. Cada elemento completo pasa validación Zod, comprobación de registro oficial, jurisdicción y referencias, y un verificador semántico antes de publicarse como parte `data-claim` del stream de mensajes de AI SDK (`createUIMessageStream`). El navegador usa `useChat` con un transporte propio que protege los textos con Rampart, envía solo las preguntas y antepone a la respuesta una parte `data-privacy` con los tramos ocultados. La etapa viaja como parte transitoria `data-stage`; las evidencias, como `data-evidence`; el estado final, el token de valoración y la región, como metadatos del mensaje. Cada `kind` de claim se pinta con su componente de `@reforma-digital/design/sol/chat` (DESIGN.md §8.3). La UI muestra esos bloques sin esperar al final. No se muestran tokens sin verificar ni se simula escritura de una respuesta ya completa. Las partes no respaldadas se omiten y se señala cuando el resultado es parcial. `evidence-v1` permanece disponible para experimentos.

Detener aborta la petición y las llamadas al proveedor; los bloques ya verificados permanecen visibles con estado de respuesta detenida. Una interrupción conserva el contenido validado y permite reintentar. Copiar incluye el texto y los enlaces oficiales. La valoración mantiene el token HMAC y el flujo de feedback existente.

## Verificación

- Pruebas de transporte con fragmentación byte a byte UTF-8 y SSE, errores y conexión incompleta.
- Pruebas de publicación antes de finalizar el generador, exclusión de claims sin respaldo, referencias falsas, ausencia de citas y jurisdicciones incompatibles, y respuesta parcial.
- Navegador: portada → pregunta sobre SL → chat; modal agrupado → fragmento → documento oficial; copia; parada; cambio de tema a vida laboral y seguimiento «¿Dónde lo puedo tramitar?». Comprobación de escritorio a 1280 px y móvil a 390 px. Se restauró el tamaño del navegador al terminar.
- API real de vida laboral: bloques a 7.632, 8.705 y 9.922 ms; resultado a 9.940 ms. Medición puntual, no un benchmark.
- Seis regresiones: ejecución `e4e1ce5b-9276-4c59-b00a-416947c519dd`, sin fallos; fidelidad, precisión y completitud 100% en ese conjunto pequeño.
- 50 candidatos golden: ejecución `a16c2637-f173-4651-9de5-c92ea6554da2`, sin errores de ejecución, Recall@5 100% en los 30 casos con documento esperado, jurisdicción incompatible 0%, fidelidad 100%, precisión de citas 98,6%, completitud 78,8%, decisión de abstención correcta 92%. Persisten fallos críticos. La comparación con el baseline advierte cambios de corpus y código: no aísla el efecto del prompt. Los candidatos siguen pendientes de revisión humana y no se ha aprobado ningún baseline.

Se añadió unpdf como dependencia de producción para los adjuntos PDF. No se añadieron cambios de configuración ni harnesses temporales para hacer pasar la verificación. Los experimentos y trazas quedan en los almacenes existentes.

Después de la evaluación ampliada se ajustó el tratamiento de consultas de varias partes: una señal de falta de evidencia no descarta las partes respaldadas. La repetición de los cinco casos de citas (`c748663e-267c-48ae-bce9-137ebff38f54`) elimina las abstenciones inesperadas y obtiene 100% de integridad, cobertura, fidelidad y precisión de citas. Siguen faltando hechos esperados (completitud 23,3% en ese subconjunto) y hay un fallo semántico de ámbito; no se ocultan ni se consideran resueltos. La ejecución ampliada anterior no representa exactamente este último ajuste del prompt.

Comprobación final: nueve paquetes pasan TypeScript, 94 pruebas pasan Vitest y el build de producción finaliza correctamente. No se modificaron los expected outputs del dataset para acomodar el cambio.

Adjuntos verificados con un PDF sintético de una página sin datos personales: extracción en el navegador, chip de archivo y consulta contextual. El PDF temporal de `/tmp` fue eliminado; no se conserva ningún workaround ni fixture temporal en el proyecto.
