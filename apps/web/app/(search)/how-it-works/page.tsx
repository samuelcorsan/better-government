import type { Metadata } from 'next';
import { PaginaInformativa } from '../../../components/sol/pagina-informativa';
export const metadata: Metadata = { title: 'Cómo funciona · Reforma Digital' };
export default function How() {
  return (
    <PaginaInformativa lectura>
      <span className="t-etiqueta info-etiqueta">MENOS BUROCRACIA. MÁS CLARIDAD.</span>
      <h1>De la pregunta al trámite.</h1>
      <p className="info-entradilla">
        Un punto de partida para entender la Administración, con el documento oficial siempre al
        alcance.
      </p>
      <ol>
        <li>
          <strong>Pregunta con tus palabras.</strong> Indica el trámite y, cuando sea necesario, el
          municipio o la comunidad autónoma. No usamos la ubicación de tu dispositivo.
        </li>
        <li>
          <strong>Buscamos evidencias oficiales.</strong> La búsqueda combina palabras y significado
          dentro de un índice de fuentes aprobadas. Una página municipal solo se utiliza donde
          corresponde.
        </li>
        <li>
          <strong>Comprueba las referencias.</strong> Cada afirmación incluye una cita. Puedes
          abrirla, leer su fragmento y visitar el documento original.
        </li>
        <li>
          <strong>Continúa en la sede oficial.</strong> No presentamos solicitudes ni recogemos
          documentos de identidad. El trámite lo realizas directamente con el organismo responsable.
        </li>
      </ol>
      <h2 id="quality">Medir antes de prometer.</h2>
      <p>
        Evaluamos por separado la recuperación de documentos, las citas, la fidelidad a las fuentes,
        los requisitos y la jurisdicción. Los errores reales se revisan y pueden incorporarse a los
        casos de evaluación.
      </p>
      <p>
        La versión inicial incluye 150 casos candidatos y 50 propuestos para revisión humana. Hasta
        completar esa revisión y las pruebas con los servicios conectados, no publicamos un
        porcentaje de calidad de producción.
      </p>
      <h2>También sabemos decir «no lo sé».</h2>
      <p>
        Si una fuente falta, está desactualizada o no permite responder a tu caso, pedimos más
        información o explicamos la limitación. Una respuesta con IA puede contener errores:
        comprueba el documento oficial antes de presentar tu trámite.
      </p>
    </PaginaInformativa>
  );
}
