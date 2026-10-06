'use client';

import { sources } from '@reforma-digital/government';
import { Icono } from './sol/icono';
import { sourceBand, sourceCoverage } from '../lib/source-coverage';
import './sources-map.css';

const coverage = sourceCoverage(sources);
const bands = ['0 fuentes', '1–2 fuentes', '3–5 fuentes', '6 o más fuentes'];

export default function SourcesMap({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const selected = coverage.regions.find((region) => region.id === selectedId);

  return (
    <section className="sources-map" aria-labelledby="sources-map-title">
      <h2 id="sources-map-title">Fuentes por territorio</h2>
      <p className="sources-map-intro">
        Cada zona muestra cuántas fuentes oficiales habilitadas tenemos registradas. Contamos
        organismos, no documentos ni trámites; su presencia no garantiza una respuesta.
      </p>
      <p className="sources-map-national">
        <strong>{coverage.national.length} fuentes estatales</strong> para toda España, además de
        las territoriales. <a href="/sources">Ver todas las fuentes</a>.
      </p>

      <div className="sources-map-content">
        <div>
          <svg
            className="sources-map-svg"
            viewBox="0 0 600 520"
            role="group"
            aria-labelledby="sources-map-graphic-title sources-map-graphic-description"
          >
            <title id="sources-map-graphic-title">Fuentes por comunidad y ciudad autónoma</title>
            <desc id="sources-map-graphic-description">
              Elige una zona para ver sus fuentes. También puedes usar los botones bajo el mapa.
              Canarias está representada en un recuadro separado.
            </desc>
            <rect className="sources-map-inset" x="12" y="420" width="180" height="94" />
            <text className="sources-map-label" x="24" y="411" aria-hidden="true">
              Canarias
            </text>
            {coverage.regions.map((region) => (
              <a
                key={region.id}
                href="#sources-map-detail"
                className="sources-map-region"
                aria-label={`${region.name}: ${region.sources.length} fuentes`}
                aria-current={selectedId === region.id ? 'true' : undefined}
                aria-controls="sources-map-detail"
                onClick={(event) => {
                  event.preventDefault();
                  onSelect(region.id);
                }}
              >
                {region.id === 'ES-CE' && (
                  <rect x="180" y="405" width="100" height="100" fill="transparent" />
                )}
                {region.id === 'ES-ML' && (
                  <rect x="283" y="420" width="100" height="100" fill="transparent" />
                )}
                <path
                  d={region.path}
                  data-band={sourceBand(region.sources.length)}
                  fillRule="evenodd"
                  vectorEffect="non-scaling-stroke"
                >
                  <title>{`${region.name}: ${region.sources.length} fuentes`}</title>
                </path>
                {region.id === 'ES-CE' && (
                  <text className="sources-map-label" x="202" y="433" aria-hidden="true">
                    Ceuta
                  </text>
                )}
                {region.id === 'ES-ML' && (
                  <text className="sources-map-label" x="294" y="464" aria-hidden="true">
                    Melilla
                  </text>
                )}
              </a>
            ))}
          </svg>
          <ul className="sources-map-legend" aria-label="Fuentes registradas por zona">
            {bands.map((label, band) => (
              <li key={label}>
                <span className="sources-map-swatch" data-band={band} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
          <p className="sources-map-credit">
            Cartografía: Instituto Geográfico Nacional, vía{' '}
            <a href="https://www.geoboundaries.org/">geoBoundaries</a>.{' '}
            <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Geometría
            simplificada y adaptada.
          </p>
        </div>

        <div id="sources-map-detail" className="sources-map-detail" aria-live="polite" aria-atomic>
          {selected ? (
            <>
              <h3>{selected.name}</h3>
              <p>
                {selected.sources.length}{' '}
                {selected.sources.length === 1
                  ? 'fuente territorial registrada'
                  : 'fuentes territoriales registradas'}
              </p>
              {selected.sources.length ? (
                <ul>
                  {selected.sources.map((source) => (
                    <li key={source.id}>
                      <a
                        href={source.baseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="enlace"
                      >
                        {source.name} <Icono n="derecha" size={16} />
                        <span className="sr-only"> (se abre en una pestaña nueva)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Todavía no tenemos fuentes autonómicas o municipales registradas aquí.</p>
              )}
            </>
          ) : (
            <p>Elige una comunidad o ciudad autónoma para ver sus fuentes oficiales.</p>
          )}
        </div>
      </div>

      <ul className="sources-map-list" aria-label="Comunidades y ciudades autónomas">
        {coverage.regions.map((region) => (
          <li key={region.id}>
            <button
              type="button"
              className="boton-fantasma"
              aria-pressed={selectedId === region.id}
              aria-controls="sources-map-detail"
              onClick={() => onSelect(region.id)}
            >
              <span>{region.name}</span>
              <span>
                {region.sources.length}
                <span className="sr-only"> fuentes</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
