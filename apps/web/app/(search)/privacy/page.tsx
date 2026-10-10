import type { Metadata } from 'next';
import { InfoPage } from '../../../components/sol/info-page';
import { JsonLd } from '../../../components/json-ld';
import { breadcrumbs, pageMetadata, webPage } from '../../../lib/seo';

const title = 'Privacidad · Reforma Digital';
const description =
  'Pregunta sin cuenta y sin identificarte. Qué datos se procesan en el buscador, cómo se ocultan los datos personales y qué servicios externos intervienen.';

export const metadata: Metadata = pageMetadata({
  title,
  description,
  path: '/privacy',
  og: 'privacidad',
});

const graph = [
  webPage({ name: title, description, path: '/privacy' }),
  breadcrumbs('Privacidad', '/privacy'),
];

export default function Privacy() {
  return (
    <InfoPage narrow>
      <JsonLd graph={graph} />
      <span className="t-etiqueta info-etiqueta">TUS DATOS, CON CUIDADO</span>
      <h1>Pregunta sin identificarte.</h1>
      <p className="info-entradilla">
        No necesitas una cuenta. No incluyas tu DNI, dirección, información médica, datos bancarios
        ni otros datos personales en la consulta.
      </p>
      <h2>Qué se procesa</h2>
      <p>
        En el modo conectado, tu pregunta se envía al proveedor de IA configurado para interpretar y
        responder con evidencias. Los fragmentos oficiales también se incluyen en esa petición. Si
        Langfuse está configurado, registra la consulta y las etapas de la respuesta para evaluar
        fallos.
      </p>
      <p>
        Antes de enviarla, tu navegador intenta detectar nombres, direcciones, DNI, correos,
        teléfonos y datos bancarios y sustituye los datos detectados por marcadores. Puede pasar por
        alto información personal: esto reduce la exposición, pero no garantiza el anonimato. Si la
        protección falla o tarda demasiado, la consulta no se envía. La primera vez se descargan el
        modelo de Hugging Face y su runtime de jsDelivr; el análisis del texto se realiza en tu
        dispositivo.
      </p>
      <p>
        Los iconos de las fuentes se cargan desde Google. Esta petición comunica el dominio de la
        fuente y tu dirección IP; no incluye tu pregunta, el contenido del documento ni la dirección
        de esta conversación.
      </p>
      <p>
        Las fotos de la página del equipo vienen de GitHub y los contributors se consultan en su API
        pública. Nuestro servidor descarga y optimiza esas imágenes, así que tu navegador no se
        conecta con GitHub para verlas. Esas peticiones no incluyen preguntas ni documentos del
        chat.
      </p>
      <h2>Documentos adjuntos</h2>
      <p>
        El PDF se lee en tu navegador. Al enviar una pregunta, se procesa un máximo de 6.000
        caracteres de su texto para entender el contexto, con los mismos proveedores y registros de
        la consulta. No se guarda el archivo PDF ni se incorpora al registro de fuentes oficiales.
        Evita documentos con datos personales.
      </p>
      <h2>Qué se guarda</h2>
      <p>
        Cuando el feedback está habilitado, se guardan la consulta, los documentos recuperados, la
        respuesta y tu valoración. Esto permite revisar errores. Se intenta ocultar patrones
        habituales de DNI, correo, teléfono e IBAN; no es una garantía de anonimización.
      </p>
      <p>
        El operador debe aplicar la política de retención configurada y ofrecer un canal de contacto
        antes del lanzamiento público. Esta vista previa es un entorno de desarrollo, no una sede
        administrativa ni un servicio público desplegado.
      </p>
      <h2>Tu ubicación</h2>
      <p>
        No solicitamos permisos de localización. Solo utilizamos la localidad que indiques
        expresamente en tu pregunta. No instalamos cookies publicitarias. El área interna utiliza
        una cookie de sesión protegida para el acceso del administrador.
      </p>
    </InfoPage>
  );
}
