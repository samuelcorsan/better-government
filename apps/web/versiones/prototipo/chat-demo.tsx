'use client';

// Chat de demostración con respuestas guionizadas: no llama a la API ni da respuestas reales.
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { normalize } from '../../landing/site';
import { Marca } from './shared';
import { Icono } from './iconos';

type Kind = 'step' | 'document' | 'cost' | 'deadline';
interface Fuente {
  org: string;
  sigla: string;
  title: string;
  host: string;
  quote: string;
}
interface Guion {
  claims: { kind: Kind; text: string; fuente: number }[];
  fuentes: Fuente[];
  destino?: { title: string; url: string };
  aclarar?: { pregunta: string; opciones: { texto: string; pregunta: string }[] };
  seguimiento: string[];
}

const policia: Fuente = {
  org: 'Policía Nacional',
  sigla: 'PN',
  title: 'Expedición y renovación del DNI',
  host: 'dnielectronico.es',
  quote:
    'Texto de ejemplo: para renovar el documento es necesario pedir cita previa y acudir en persona a una oficina de expedición.',
};
const aeat: Fuente = {
  org: 'Agencia Tributaria',
  sigla: 'AT',
  title: 'Alta en el censo de empresarios',
  host: 'sede.agenciatributaria.gob.es',
  quote: 'Texto de ejemplo: el alta censal se presenta con el modelo 036 o 037 antes de empezar.',
};
const seguridad: Fuente = {
  org: 'Seguridad Social',
  sigla: 'SS',
  title: 'Alta en el régimen de autónomos',
  host: 'portal.seg-social.gob.es',
  quote: 'Texto de ejemplo: el alta en el régimen especial se tramita por internet con Cl@ve.',
};
const madrid: Fuente = {
  org: 'Ayuntamiento de Madrid',
  sigla: 'AM',
  title: 'Alta en el Padrón',
  host: 'madrid.es',
  quote:
    'Texto de ejemplo: el alta se solicita con cita previa en una oficina de atención a la ciudadanía.',
};

const guiones: Record<string, Guion> = {
  dni: {
    claims: [
      { kind: 'step', text: 'Pide cita previa en la web de la Policía Nacional.', fuente: 0 },
      {
        kind: 'step',
        text: 'Acude a la oficina de expedición el día de la cita, en persona.',
        fuente: 0,
      },
      {
        kind: 'document',
        text: 'Tu DNI anterior y una fotografía reciente en color, con fondo blanco.',
        fuente: 0,
      },
      { kind: 'cost', text: '12 €', fuente: 0 },
      {
        kind: 'deadline',
        text: 'Puedes renovarlo desde 180 días antes de que caduque.',
        fuente: 0,
      },
    ],
    fuentes: [policia],
    destino: {
      title: 'Cita previa del DNI · Policía Nacional',
      url: 'https://www.dnielectronico.es',
    },
    seguimiento: ['¿Qué foto necesito?', '¿Puedo renovarlo si estoy fuera de España?'],
  },
  autonomo: {
    claims: [
      { kind: 'step', text: 'Date de alta en Hacienda con el modelo 036 o 037.', fuente: 0 },
      { kind: 'step', text: 'Date de alta en la Seguridad Social como autónomo.', fuente: 1 },
      { kind: 'document', text: 'DNI o NIE y acceso con Cl@ve o certificado digital.', fuente: 1 },
      { kind: 'cost', text: 'Según ingresos', fuente: 1 },
      { kind: 'deadline', text: 'Antes de empezar la actividad.', fuente: 0 },
    ],
    fuentes: [aeat, seguridad],
    destino: {
      title: 'Alta de autónomos · Seguridad Social',
      url: 'https://portal.seg-social.gob.es',
    },
    seguimiento: ['¿Qué diferencia hay entre el 036 y el 037?', '¿Hay cuota reducida?'],
  },
  padron: {
    claims: [],
    fuentes: [madrid],
    aclarar: {
      pregunta:
        '¿En qué municipio quieres empadronarte? Los requisitos y la oficina dependen del ayuntamiento.',
      opciones: [
        { texto: 'En Madrid', pregunta: '¿Cómo me empadrono en Madrid?' },
        { texto: 'En otro municipio', pregunta: '¿Cómo me empadrono en otro municipio?' },
      ],
    },
    seguimiento: [],
  },
  padronMadrid: {
    claims: [
      { kind: 'step', text: 'Pide cita en una oficina de atención a la ciudadanía.', fuente: 0 },
      {
        kind: 'step',
        text: 'Presenta la solicitud de alta en el Padrón el día de la cita.',
        fuente: 0,
      },
      {
        kind: 'document',
        text: 'DNI o NIE y contrato de alquiler o escritura de la vivienda.',
        fuente: 0,
      },
      { kind: 'cost', text: 'Gratis', fuente: 0 },
    ],
    fuentes: [madrid],
    destino: { title: 'Alta en el Padrón · Ayuntamiento de Madrid', url: 'https://www.madrid.es' },
    seguimiento: ['¿Puedo empadronarme en una habitación alquilada?'],
  },
};

const preparadas = ['¿Cómo renuevo el DNI?', '¿Cómo me hago autónomo?', '¿Cómo me empadrono?'];

function elegir(query: string): Guion | undefined {
  const q = normalize(query);
  if (/dni|pasaporte/.test(q)) return guiones.dni;
  if (/autonom/.test(q)) return guiones.autonomo;
  if (/madrid/.test(q)) return guiones.padronMadrid;
  if (/padron|empadron/.test(q)) return guiones.padron;
  return undefined;
}

// Detecta un nombre tras «me llamo» y un DNI, para enseñar la protección de datos.
function ocultos(query: string) {
  const datos: string[] = [];
  const nombre = query.match(/[Mm]e llamo ([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?: [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/);
  if (nombre?.[1]) datos.push(nombre[1]);
  for (const dni of query.match(/\b\d{8}[A-Za-z]\b/g) ?? []) datos.push(dni);
  return datos;
}

const etapas = [
  'Entendiendo tu pregunta',
  'Consultando fuentes oficiales',
  'Redactando y verificando la respuesta',
];

interface Turno {
  id: number;
  query: string;
  datos: string[];
  guion?: Guion;
  etapa: number;
  vistos: number;
  estado: 'pensando' | 'escribiendo' | 'hecho' | 'detenido';
  voto?: 'si' | 'no';
}

function Pregunta({ texto, datos }: { texto: string; datos: string[] }) {
  if (!datos.length) return <>{texto}</>;
  const partes = texto.split(
    new RegExp(`(${datos.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`),
  );
  return (
    <>
      {partes.map((parte, i) =>
        parte && datos.includes(parte) ? (
          <span key={i} className="sp-oculto" tabIndex={0}>
            {parte}
            <span role="tooltip" className="sp-oculto-nota">
              Este dato no se ha enviado al modelo.
            </span>
          </span>
        ) : (
          parte
        ),
      )}
    </>
  );
}

function nuevoTurno(id: number, query: string): Turno {
  return {
    id,
    query,
    datos: ocultos(query),
    guion: elegir(query),
    etapa: 0,
    vistos: 0,
    estado: 'pensando',
  };
}

export default function ChatDemo({ inicial, onHome }: { inicial: string; onHome: () => void }) {
  const [turnos, setTurnos] = useState<Turno[]>(() => [nuevoTurno(1, inicial.trim())]);
  const [texto, setTexto] = useState('');
  const [copiado, setCopiado] = useState<number | null>(null);
  const [fuente, setFuente] = useState<Fuente | null>(null);
  const dialogo = useRef<HTMLDialogElement>(null);
  const siguiente = useRef(1);

  const activo = turnos.at(-1);
  const ocupado = activo?.estado === 'pensando' || activo?.estado === 'escribiendo';

  function actualizar(id: number, cambio: Partial<Turno>) {
    setTurnos((ts) => ts.map((t) => (t.id === id ? { ...t, ...cambio } : t)));
  }

  // Avanza el guion paso a paso: etapas de búsqueda y luego una afirmación cada 320 ms.
  useEffect(() => {
    if (!activo || (activo.estado !== 'pensando' && activo.estado !== 'escribiendo')) return;
    const total = activo.guion?.claims.length ?? 0;
    let cambio: Partial<Turno>;
    let ms = 320;
    if (activo.estado === 'pensando') {
      ms = 650;
      cambio =
        activo.etapa < 2
          ? { etapa: activo.etapa + 1 }
          : { estado: total ? 'escribiendo' : 'hecho' };
    } else {
      const vistos = activo.vistos + 1;
      cambio = vistos >= total ? { vistos: total, estado: 'hecho' } : { vistos };
    }
    const reloj = window.setTimeout(() => actualizar(activo.id, cambio), ms);
    return () => window.clearTimeout(reloj);
  }, [activo]);

  useEffect(() => {
    if (fuente) dialogo.current?.showModal();
    else dialogo.current?.close();
  }, [fuente]);

  function enviar(query: string) {
    const q = query.trim();
    if (q.length < 2 || ocupado) return;
    const id = ++siguiente.current;
    setTurnos((ts) => [...ts, nuevoTurno(id, q)]);
    setTexto('');
  }

  function detener() {
    if (activo) actualizar(activo.id, { estado: 'detenido' });
  }

  function copiar(turno: Turno) {
    const lineas = turno.guion?.claims.slice(0, turno.vistos).map((c) => c.text) ?? [];
    void navigator.clipboard?.writeText(`${turno.query}\n\n${lineas.join('\n')}`);
    setCopiado(turno.id);
    window.setTimeout(() => setCopiado((c) => (c === turno.id ? null : c)), 1500);
  }

  function nueva() {
    setTurnos([]);
    setTexto('');
  }

  return (
    <div className="sp">
      <header className="sp-cab">
        <button
          type="button"
          className="sp-marca"
          onClick={onHome}
          aria-label="Reforma Digital, inicio"
        >
          <Marca /> Reforma Digital
        </button>
        <span className="sp-aviso">Demo · respuestas de ejemplo, no verificadas</span>
        <button type="button" className="sp-pildora" onClick={nueva}>
          <Icono n="nueva" /> Nueva conversación
        </button>
      </header>

      <main className="sp-conversacion" aria-live="polite">
        {!turnos.length && (
          <div className="sp-vacio">
            <h1>¿Qué necesitas hacer?</h1>
            <p>En esta demo hay respuestas preparadas para estas preguntas:</p>
            <div className="sp-sugerencias">
              {preparadas.map((q) => (
                <button type="button" key={q} onClick={() => enviar(q)}>
                  {q} <Icono n="enviar" size={16} />
                </button>
              ))}
            </div>
          </div>
        )}
        {turnos.map((t, ti) => {
          const visibles = t.guion?.claims.slice(0, t.vistos) ?? [];
          const pasos = visibles.filter((c) => c.kind === 'step');
          const datos = visibles.filter((c) => c.kind !== 'step');
          const ultimo = ti === turnos.length - 1;
          return (
            <section className="sp-turno" key={t.id} aria-label={`Pregunta ${ti + 1}`}>
              <h2 className="sp-pregunta">
                <Pregunta texto={t.query} datos={t.datos} />
              </h2>
              {!!t.datos.length && (
                <p className="sp-protegido">
                  <Icono n="protegido" size={16} />
                  {t.datos.length === 1
                    ? '1 dato personal ocultado al modelo'
                    : `${t.datos.length} datos personales ocultados al modelo`}
                </p>
              )}

              {t.estado === 'pensando' && (
                <div className="sp-pensando" role="status">
                  <span className="sp-sol" aria-hidden="true" />
                  <ol>
                    {etapas.map((e, i) => (
                      <li
                        key={e}
                        data-estado={i < t.etapa ? 'hecho' : i === t.etapa ? 'ahora' : 'luego'}
                      >
                        {i < t.etapa && <Icono n="hecho" size={15} />} {e}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {!!pasos.length && (
                <ol className="sp-pasos">
                  {pasos.map((c, i) => (
                    <li key={c.text}>
                      <span className="sp-num" aria-hidden="true">
                        {i + 1}
                      </span>
                      <p>
                        {c.text}{' '}
                        <button
                          type="button"
                          className="sp-cita"
                          onClick={() => setFuente(t.guion?.fuentes[c.fuente] ?? null)}
                        >
                          {t.guion?.fuentes[c.fuente]?.org} <Icono n="externo" size={13} />
                        </button>
                      </p>
                    </li>
                  ))}
                </ol>
              )}
              {!!datos.length && (
                <dl className="sp-datos">
                  {datos.map((c) => (
                    <div key={c.kind} data-kind={c.kind}>
                      <dt>
                        {
                          {
                            document: 'Documentación',
                            cost: 'Coste',
                            deadline: 'Plazos',
                            step: '',
                          }[c.kind]
                        }
                      </dt>
                      <dd>{c.text}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {t.estado === 'hecho' && t.guion?.aclarar && (
                <div className="sp-nota" role="status">
                  <Icono n="info" size={20} />
                  <div>
                    <h3>Necesitamos un poco más de detalle</h3>
                    <p>{t.guion.aclarar.pregunta}</p>
                    {ultimo && (
                      <div className="sp-opciones">
                        {t.guion.aclarar.opciones.map((o) => (
                          <button type="button" key={o.texto} onClick={() => enviar(o.pregunta)}>
                            {o.texto}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {t.estado === 'hecho' && !t.guion && (
                <div className="sp-nota" role="status">
                  <Icono n="info" size={20} />
                  <div>
                    <h3>Esta demo no tiene respuesta para esa pregunta</h3>
                    <p>
                      Prueba con una de las preparadas. El chat real consulta las fuentes oficiales.
                    </p>
                    {ultimo && (
                      <div className="sp-opciones">
                        {preparadas.map((o) => (
                          <button type="button" key={o} onClick={() => enviar(o)}>
                            {o}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {t.estado === 'detenido' && (
                <p className="sp-detenido" role="status">
                  Respuesta detenida.
                  {t.vistos > 0 && ' Los fragmentos mostrados ya están verificados.'}{' '}
                  <button type="button" onClick={() => enviar(t.query)}>
                    Volver a preguntar
                  </button>
                </p>
              )}

              {t.estado === 'hecho' && t.guion?.destino && (
                <div className="sp-destino">
                  <div>
                    <span>Dónde se hace</span>
                    <b>{t.guion.destino.title}</b>
                    <small>Con la extensión, esa página se ve ordenada y paso a paso.</small>
                  </div>
                  <a href={t.guion.destino.url} target="_blank" rel="noreferrer">
                    Abrir la web oficial <Icono n="externo" />
                  </a>
                </div>
              )}

              {t.estado === 'hecho' && !!t.guion?.claims.length && (
                <div className="sp-acciones">
                  <button
                    type="button"
                    className="sp-fuentes"
                    onClick={() => setFuente(t.guion?.fuentes[0] ?? null)}
                  >
                    <span aria-hidden="true">
                      {t.guion.fuentes.map((f) => (
                        <i key={f.sigla}>{f.sigla}</i>
                      ))}
                    </span>
                    Fuentes · {t.guion.fuentes.length}
                  </button>
                  <div>
                    <button
                      type="button"
                      className="sp-icono"
                      aria-label="Respuesta útil"
                      aria-pressed={t.voto === 'si'}
                      onClick={() => actualizar(t.id, { voto: t.voto === 'si' ? undefined : 'si' })}
                    >
                      <Icono n="util" />
                    </button>
                    <button
                      type="button"
                      className="sp-icono"
                      aria-label="Respuesta no útil"
                      aria-pressed={t.voto === 'no'}
                      onClick={() => actualizar(t.id, { voto: t.voto === 'no' ? undefined : 'no' })}
                    >
                      <Icono n="noUtil" />
                    </button>
                    <button
                      type="button"
                      className="sp-icono"
                      aria-label={copiado === t.id ? 'Copiado' : 'Copiar respuesta'}
                      onClick={() => copiar(t)}
                    >
                      {copiado === t.id ? <Icono n="hecho" /> : <Icono n="copiar" />}
                    </button>
                  </div>
                </div>
              )}

              {t.estado === 'hecho' && ultimo && !!t.guion?.seguimiento.length && (
                <div className="sp-sugerencias">
                  {t.guion.seguimiento.map((q) => (
                    <button type="button" key={q} onClick={() => enviar(q)}>
                      {q} <Icono n="enviar" size={16} />
                    </button>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </main>

      <div className="sp-dock">
        <form
          className="sp-compositor"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            enviar(texto);
          }}
        >
          <label htmlFor="sp-entrada" className="sr-only">
            Pregunta sobre trámites
          </label>
          <textarea
            id="sp-entrada"
            rows={1}
            value={texto}
            placeholder="Pregunta aquí"
            autoComplete="off"
            enterKeyHint="send"
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                enviar(texto);
              }
            }}
          />
          {ocupado ? (
            <button
              type="button"
              className="sp-enviar"
              onClick={detener}
              aria-label="Detener respuesta"
            >
              <Icono n="detener" size={14} />
            </button>
          ) : (
            <button
              type="submit"
              className="sp-enviar"
              disabled={texto.trim().length < 2}
              aria-label="Enviar pregunta"
            >
              <Icono n="enviar" size={20} />
            </button>
          )}
        </form>
        <small>Demo con respuestas de ejemplo. En la web real, comprueba siempre las citas.</small>
      </div>

      <dialog
        ref={dialogo}
        className="sp-panel"
        onClose={() => setFuente(null)}
        aria-label="Fragmento citado"
      >
        {fuente && (
          <div className="sp-panel-cuerpo">
            <div className="sp-panel-barra">
              <span>Fragmento citado</span>
              <button
                type="button"
                className="sp-icono"
                aria-label="Cerrar fuentes"
                onClick={() => setFuente(null)}
              >
                <Icono n="cerrar" />
              </button>
            </div>
            <p className="sp-panel-org">
              <i aria-hidden="true">{fuente.sigla}</i> {fuente.org}
            </p>
            <h3>{fuente.title}</h3>
            <blockquote>{fuente.quote}</blockquote>
            <dl>
              <div>
                <dt>Web</dt>
                <dd>{fuente.host}</dd>
              </div>
              <div>
                <dt>Consultado</dt>
                <dd>Demo, sin consulta real</dd>
              </div>
            </dl>
            <a
              className="sp-panel-boton"
              href={`https://${fuente.host}`}
              target="_blank"
              rel="noreferrer"
            >
              Abrir la web oficial <Icono n="adelante" />
            </a>
          </div>
        )}
      </dialog>
    </div>
  );
}
