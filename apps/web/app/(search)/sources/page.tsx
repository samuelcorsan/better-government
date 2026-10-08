import type { Metadata } from 'next';
import { sources } from '@reforma-digital/government';
import { InfoPage } from '../../../components/sol/info-page';
import { Icon } from '../../../components/sol/icon';
import { SourcesMapPanel } from '../../../components/sources-map-panel';
export const metadata: Metadata = { title: 'Fuentes oficiales · Reforma Digital' };
export default function Sources() {
  return (
    <InfoPage>
      <span className="t-etiqueta info-etiqueta">INFORMACIÓN CON ORIGEN</span>
      <h1>Las fuentes importan.</h1>
      <p className="info-entradilla">
        Un registro limitado de organismos oficiales. No buscamos en toda Internet: cada respuesta
        se construye a partir de documentos de estas fuentes aprobadas.
      </p>
      <SourcesMapPanel />
      <div className="registry-grid">
        {sources.map((s) => (
          <article className="registry-card" key={s.id}>
            <Icon name="fuentes" size={24} />
            <h2>{s.name}</h2>
            <p>
              {s.jurisdictionType === 'country'
                ? 'Ámbito estatal'
                : s.jurisdictionType === 'region'
                  ? 'Comunidad de Madrid'
                  : 'Municipio de Madrid'}
            </p>
            <span className="registry-meta">
              Fuente aprobada · Web oficial
              <br />
              Consultada mediante búsqueda web
            </span>
            <a href={s.baseUrl} target="_blank" rel="noopener noreferrer">
              Visitar organismo <Icon name="derecha" size={16} />
            </a>
          </article>
        ))}
      </div>
      <div className="info-prosa">
        <h2>Las respuestas dependen de la evidencia disponible.</h2>
        <p>
          Buscamos en la web de estos organismos para cada consulta. Si la información recuperada no
          basta, el buscador lo indica. La fecha de consulta y el fragmento utilizado se muestran en
          cada cita.
        </p>
      </div>
    </InfoPage>
  );
}
