# España, en claro

El chat busca información de trámites españoles en la web y responde con fuentes oficiales. Es un proyecto independiente, no una sede del Gobierno.

## Puesta en marcha

Requiere Node 22+, pnpm 11 y `OPENROUTER_API_KEY`.

```sh
pnpm install --frozen-lockfile
# Configurar OPENROUTER_API_KEY en .env, sin subir credenciales al repositorio.
pnpm dev
```

Con una clave configurada, la web utiliza el modo real automáticamente. `SEARCH_MODE=preview` selecciona explícitamente los ejemplos locales y no hace llamadas a proveedores ni genera respuestas. `SEARCH_MODE=live` fuerza la búsqueda web.

PostgreSQL es opcional para guardar consultas, feedback e informes y compartir los límites de peticiones. La búsqueda y la generación no dependen de la base. Para configurar ese almacenamiento:

```sh
docker compose up -d
pnpm db:migrate
```

Las instalaciones existentes aplican una migración que retira las tablas del antiguo índice. Las bases nuevas crean únicamente las tablas de consultas, feedback, informes y límites de peticiones.

## Modelos y fuentes

Toda la IA utiliza OpenRouter mediante Vercel AI SDK. El modelo por defecto es `openai/gpt-6-luna`, con razonamiento `high`, para búsqueda, generación, verificación de citas y evaluadores.

1. Entregar la pregunta original, hasta seis turnos anteriores (preguntas y respuestas) y el texto protegido del PDF al modelo. No se reescribe la pregunta ni se reduce el documento a una reformulación.
2. El modelo interpreta el trámite, la ubicación relevante y el año, y decide si falta un dato imprescindible. En esa misma llamada busca mediante `openrouter:web_search` con el motor Parallel o devuelve una pregunta concreta de aclaración. La herramienta se limita a los dominios oficiales registrados; la interpretación se valida con un esquema, sin usar regex para decidir intención, ubicación o aclaraciones en modo real.
3. Convertir los fragmentos originales de las citas web en hasta ocho evidencias. Descartar dominios no autorizados, duplicados, ámbitos incompatibles y resultados sin fragmento original. No usar el resumen generado como evidencia.
4. Generar afirmaciones estructuradas con referencias a esas evidencias, conservando la pregunta original, la conversación y el texto protegido del PDF. El servidor resuelve los enlaces y el texto citado.
5. Comprobar formato, dominio, jurisdicción y respaldo de cada afirmación antes de publicarla. Si falta evidencia, abstenerse o indicar que la respuesta es parcial.

La API transmite etapas, evidencias y afirmaciones completas mediante SSE. Detener una respuesta cancela las llamadas en curso. La conversación y los documentos del usuario sirven como contexto, nunca como evidencia oficial. La última pregunta prevalece; el modelo debe distinguir el municipio del trámite de otras ubicaciones mencionadas, sin inferirlo de la IP. Una fecha de consulta reciente no demuestra que un plazo o una norma sigan vigentes. Las heurísticas de palabras y lugares se conservan únicamente para la vista previa offline, que no certifica la comprensión del modelo real.

## Datos personales

Antes de enviar, el navegador aplica a la consulta, a las preguntas y respuestas anteriores y al texto del PDF las reglas de correo, DNI, NIE, IBAN y teléfono, y después [Rampart](https://github.com/nationaldesignstudio/rampart) (CC BY 4.0), que sustituye los identificadores detectados por marcadores como `[GIVEN_NAME_1]`. El correo se censura antes que los identificadores para no partir direcciones cuyo nombre contiene un DNI o un teléfono. Se mantienen las reglas españolas: una comprobación de Rampart 0.1.3 en CPU dejó intactos un DNI sin contexto y un IBAN separado por espacios. Puede pasar por alto otros datos: no garantiza anonimización. Si Rampart no carga, falla o supera los 60 segundos para el lote completo, la consulta no se envía. Detener libera el chat y descarta resultados tardíos; no interrumpe necesariamente la descarga interna de Rampart. El modelo se descarga de `huggingface.co` y su runtime de `cdn.jsdelivr.net`; el chat avisa durante esta fase.

Los límites originales del formulario (1.200 caracteres) y del PDF (6.000) se mantienen. La API permite hasta 6.000 caracteres por pregunta protegida y 30.000 por respuesta anterior o PDF protegido, doce mensajes de contexto (hasta seis turnos enviados por el chat) y 300.000 bytes por cuerpo JSON, para permitir la expansión de marcadores sin aceptar cuerpos ilimitados. Solo admite los roles `user` y `assistant`; no acepta instrucciones de sistema aportadas por el cliente. Si se supera ese margen, se rechaza la petición; no se recortan los marcadores.

El servidor repite las reglas de patrones, incluida la de correo, pero no ejecuta Rampart: una petición directa a la API solo recibe esa capa. Es reducción de daño, no anonimización.

Tras proteger una pregunta, el chat subraya los fragmentos retirados del envío y muestra su cantidad. Cada marca explica, al pasar el cursor o enfocarla con el teclado, que ese dato no se ha enviado al modelo. Los originales y sus posiciones se conservan solo en el navegador; la API recibe el texto protegido, sin estos metadatos. El contador corresponde a la pregunta visible, no al historial ni al PDF. No se marca texto si no se puede reconstruir con certeza su correspondencia con el resultado protegido.

## Credenciales

- `OPENROUTER_API_KEY`: búsqueda web y llamadas de modelos.
- `DATABASE_URL`: almacenamiento opcional en PostgreSQL.
- `FEEDBACK_SECRET`: firma del feedback y anonimización de los límites de peticiones.
- `ADMIN_TOKEN`: acceso al laboratorio; no se incorpora al navegador.
- `APP_ORIGIN`: origen autorizado del frontend.
- `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_BASE_URL`: trazas y experimentos opcionales.

Los costes proceden de los metadatos reales de OpenRouter; un coste desconocido se muestra como N/A.

## Evaluación

```sh
pnpm test
pnpm typecheck
pnpm eval --mode preview --retrieval-only --limit 5
pnpm eval --mode live --dataset regressions --judges
pnpm eval --mode live --dataset golden --judges --save-baseline
```

Las evaluaciones reales requieren OpenRouter, sin depender de un índice ni de PostgreSQL. Los informes se guardan en `artifacts/runs/` y, si se configura la base, también en PostgreSQL. Incluyen modelo, configuración, versión y hash del dataset, código, fuentes autorizadas, latencias, tokens y costes. Los resultados de búsqueda web pueden cambiar entre ejecuciones.

`--retrieval-only` ejecuta la búsqueda sin generar respuestas ni llamar a los evaluadores de respuestas. Las métricas de documentos requieren referencias revisadas que correspondan a las fuentes web actuales; los datasets pendientes no certifican calidad. El baseline del sistema anterior se ha retirado y debe generarse y revisarse uno nuevo antes de habilitar la puerta de calidad real.

`--publish` sincroniza el experimento con Langfuse. `pnpm eval:approve` sigue requiriendo una persona identificada y casos revisados. Los evaluadores y las comprobaciones de citas se mantienen porque verifican el comportamiento actual del chat.
