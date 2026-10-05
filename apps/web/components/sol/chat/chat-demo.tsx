'use client';

// Chat de demostración con respuestas guionizadas: no llama a la API ni da respuestas reales.
// Modo «pagina»: pantalla completa. Modo «panel»: 380 px, la visión de la extensión junto a la web.
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { normalize } from '../../../landing/site';
import { Icono, type NombreIcono } from '../icono';
import { Logotipo } from '../marca';
import './chat.css';

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
const pag: Fuente = {
  org: 'Punto de Acceso General',
  sigla: 'PA',
  title: 'Empadronamiento',
  host: 'administracion.gob.es',
  quote:
    'Texto de ejemplo: cada ayuntamiento lleva su padrón y tramita las altas de quienes viven en el municipio.',
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
  padronOtro: {
    claims: [
      {
        kind: 'step',
        text: 'Busca la sede electrónica de tu ayuntamiento o pide cita en su oficina.',
        fuente: 0,
      },
      { kind: 'step', text: 'Presenta la solicitud de alta en el Padrón.', fuente: 0 },
      {
        kind: 'document',
        text: 'DNI o NIE y contrato de alquiler o escritura de la vivienda.',
        fuente: 0,
      },
    ],
    fuentes: [pag],
    seguimiento: ['¿Cómo me empadrono en Madrid?'],
  },
};

export const preparadas = [
  '¿Cómo renuevo el DNI?',
  '¿Cómo me hago autónomo?',
  '¿Cómo me empadrono?',
];

const datosRotulo: Record<Exclude<Kind, 'step'>, { rotulo: string; icono: NombreIcono }> = {
  document: { rotulo: 'Documentación', icono: 'documento' },
  cost: { rotulo: 'Coste', icono: 'tarjeta' },
  deadline: { rotulo: 'Plazo', icono: 'calendario' },
};

function elegir(query: string): Guion | undefined {
  const q = normalize(query);
  if (/dni|pasaporte/.test(q)) return guiones.dni;
  if (/autonom/.test(q)) return guiones.autonomo;
  if (/madrid/.test(q)) return guiones.padronMadrid;
  if (/otro municipio/.test(q)) return guiones.padronOtro;
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
  marcados: number[];
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
    marcados: [],
  };
}

function Pregunta({ id, texto, datos }: { id: string; texto: string; datos: string[] }) {
  if (!datos.length) return <>{texto}</>;
  const partes = texto.split(
    new RegExp(`(${datos.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`),
  );
  // Una sola nota por pregunta, anclada al titular: así no se sale por la derecha en móvil.
  return (
    <>
      {partes.map((parte, i) =>
        parte && datos.includes(parte) ? (
          <span key={i} className="ch-oculto" tabIndex={0} aria-describedby={id}>
            {parte}
          </span>
        ) : (
          parte
        ),
      )}
      <span role="tooltip" id={id} className="ch-oculto-nota">
        Este dato no se ha enviado al modelo.
      </span>
    </>
  );
}

export function ChatDemo({
  modo = 'pagina',
  inicial,
  onHome,
}: {
  modo?: 'pagina' | 'panel';
  inicial?: string;
  onHome?: () => void;
}) {
  const panel = modo === 'panel';
  const uid = useId();
  const [turnos, setTurnos] = useState<Turno[]>(() =>
    inicial?.trim() ? [nuevoTurno(1, inicial.trim())] : [],
  );
  const [texto, setTexto] = useState('');
  const [aviso, setAviso] = useState<{ id: number; texto: string } | null>(null);
  const [abiertas, setAbiertas] = useState<{ turno: number; fuente: number } | null>(null);
  const dialogo = useRef<HTMLDialogElement>(null);
  const conversacion = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLTextAreaElement>(null);
  const siguiente = useRef(1);
  const relojAviso = useRef(0);

  const activo = turnos.at(-1);
  const ocupado = activo?.estado === 'pensando' || activo?.estado === 'escribiendo';
  const fuentesAbiertas = turnos.find((t) => t.id === abiertas?.turno)?.guion?.fuentes;

  function actualizar(id: number, cambio: Partial<Turno>) {
    setTurnos((ts) => ts.map((t) => (t.id === id ? { ...t, ...cambio } : t)));
  }

  // Avanza el guion: tres etapas de búsqueda y luego una afirmación cada 180 ms.
  useEffect(() => {
    if (!activo || (activo.estado !== 'pensando' && activo.estado !== 'escribiendo')) return;
    const total = activo.guion?.claims.length ?? 0;
    let cambio: Partial<Turno>;
    let ms = 180;
    if (activo.estado === 'pensando') {
      ms = 560;
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

  // Panel de fuentes: modal en la página; en el panel, hoja dentro del propio panel.
  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (!abiertas) {
      d.close();
      return;
    }
    if (!d.open) {
      if (panel) d.show();
      else d.showModal();
    }
    d.querySelector(`[data-fuente="${abiertas.fuente}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [abiertas, panel]);

  function enviar(query: string) {
    const q = query.trim();
    if (q.length < 2 || ocupado) return;
    const id = ++siguiente.current;
    setTurnos((ts) => [...ts, nuevoTurno(id, q)]);
    setTexto('');
    // La nueva pregunta sube arriba; la respuesta se escribe debajo.
    requestAnimationFrame(() => {
      const turno = conversacion.current?.querySelector<HTMLElement>(`[data-turno="${id}"]`);
      const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!turno) return;
      if (panel && conversacion.current) {
        conversacion.current.scrollTo({
          top: turno.offsetTop - 16,
          behavior: suave ? 'smooth' : 'auto',
        });
      } else {
        turno.scrollIntoView({ block: 'start', behavior: suave ? 'smooth' : 'auto' });
      }
    });
  }

  useEffect(() => () => window.clearTimeout(relojAviso.current), []);

  function avisar(id: number, texto: string) {
    setAviso({ id, texto });
    window.clearTimeout(relojAviso.current);
    relojAviso.current = window.setTimeout(() => setAviso(null), 1800);
  }

  function copiar(turno: Turno) {
    const lineas = turno.guion?.claims.slice(0, turno.vistos).map((c) => c.text) ?? [];
    void navigator.clipboard?.writeText(`${turno.query}\n\n${lineas.join('\n')}`);
    avisar(turno.id, 'Copiado');
  }

  function votar(turno: Turno, voto: 'si' | 'no') {
    const nuevo = turno.voto === voto ? undefined : voto;
    actualizar(turno.id, { voto: nuevo });
    if (nuevo) avisar(turno.id, 'Gracias por decírnoslo');
  }

  function marcar(turno: Turno, paso: number) {
    actualizar(turno.id, {
      marcados: turno.marcados.includes(paso)
        ? turno.marcados.filter((m) => m !== paso)
        : [...turno.marcados, paso],
    });
  }

  return (
    <div className="ch" data-modo={modo}>
      <header className="ch-cab">
        {!panel && <h1 className="sr-only">Asistente de Reforma Digital</h1>}
        {onHome ? (
          <button
            type="button"
            className="ch-marca marca"
            onClick={onHome}
            aria-label="Reforma Digital, volver al inicio"
          >
            <Logotipo size={24} />
          </button>
        ) : (
          <span className="ch-marca marca">
            <Logotipo size={24} />
          </span>
        )}
        <p className="ch-aviso">
          <span className="t-etiqueta">Demo</span>
          <span>Respuestas de ejemplo, no verificadas</span>
        </p>
        <button
          type="button"
          className={panel ? 'boton-icono ch-nueva' : 'boton-claro ch-nueva'}
          onClick={() => {
            setTurnos([]);
            setTexto('');
            setAbiertas(null);
          }}
          aria-label={panel ? 'Nueva conversación' : undefined}
        >
          <Icono n="nueva" />
          {!panel && <span className="ch-nueva-texto">Nueva conversación</span>}
        </button>
      </header>

      <div className="ch-conversacion" ref={conversacion} role="log">
        {!turnos.length && (
          <div className="ch-vacio">
            <span className="ch-sol" data-etapa="2" aria-hidden="true">
              <i />
            </span>
            <h2 className={panel ? 't-titular-s' : 't-titular-m'}>¿Qué necesitas hacer?</h2>
            <p>Esta demo tiene respuestas preparadas para estas preguntas:</p>
            <div className="ch-sugerencias">
              {preparadas.map((q) => (
                <button type="button" className="pildora" key={q} onClick={() => enviar(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {turnos.map((t, ti) => {
          const visibles = t.guion?.claims.slice(0, t.vistos) ?? [];
          const pasos = visibles.filter((c) => c.kind === 'step');
          const totalPasos = t.guion?.claims.filter((c) => c.kind === 'step').length ?? 0;
          const datos = visibles.filter(
            (c): c is Guion['claims'][number] & { kind: Exclude<Kind, 'step'> } =>
              c.kind !== 'step',
          );
          const ultimo = ti === turnos.length - 1;
          const hecho = t.estado === 'hecho';
          const fuentes = t.guion?.fuentes ?? [];
          const actual = Array.from({ length: totalPasos }, (_, i) => i).find(
            (i) => !t.marcados.includes(i),
          );
          return (
            <section
              className="ch-turno"
              key={t.id}
              data-turno={t.id}
              aria-label={`Pregunta ${ti + 1}`}
            >
              <h2 className="ch-pregunta">
                <Pregunta id={`${uid}-nota-${t.id}`} texto={t.query} datos={t.datos} />
              </h2>
              {!!t.datos.length && (
                <p className="ch-protegido">
                  <Icono n="protegido" size={16} />
                  {t.datos.length === 1
                    ? '1 dato personal ocultado al modelo'
                    : `${t.datos.length} datos personales ocultados al modelo`}
                </p>
              )}

              {t.estado === 'pensando' && (
                <div className="ch-pensando" role="status">
                  <span className="ch-sol" data-etapa={t.etapa} aria-hidden="true">
                    <i />
                  </span>
                  <ol>
                    {etapas.map((e, i) => (
                      <li
                        key={e}
                        data-estado={i < t.etapa ? 'hecho' : i === t.etapa ? 'ahora' : 'luego'}
                      >
                        <span className="ch-etapa-marca" aria-hidden="true">
                          {i < t.etapa && <Icono n="hecho" size={14} />}
                        </span>
                        {e}
                        {i < t.etapa && <span className="sr-only"> (hecho)</span>}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {!!pasos.length && panel && (
                <div className="ch-progreso" data-completo={actual === undefined || undefined}>
                  <span className="t-dato">
                    {actual === undefined
                      ? `Hecho · ${totalPasos} de ${totalPasos}`
                      : `Paso ${actual + 1} de ${totalPasos}`}
                  </span>
                  <span className="ch-barra" aria-hidden="true">
                    <i style={{ transform: `scaleX(${t.marcados.length / totalPasos})` }} />
                  </span>
                </div>
              )}

              {!!pasos.length && (
                <ol className="ch-pasos">
                  {pasos.map((c, i) => {
                    const fuente = fuentes[c.fuente];
                    const cita = fuente && (
                      <button
                        type="button"
                        className="pildora t-dato ch-cita"
                        onClick={() => setAbiertas({ turno: t.id, fuente: c.fuente })}
                        aria-label={`Ver fuente: ${fuente.org}, ${fuente.host}`}
                      >
                        <i aria-hidden="true">{fuente.sigla}</i>
                        {fuente.host}
                      </button>
                    );
                    return (
                      <li key={c.text}>
                        {panel ? (
                          <>
                            <label className="ch-casilla">
                              <input
                                type="checkbox"
                                checked={t.marcados.includes(i)}
                                onChange={() => marcar(t, i)}
                              />
                              <span className="ch-casilla-caja" aria-hidden="true">
                                <Icono n="hecho" size={14} />
                              </span>
                              <span className="ch-paso-texto">{c.text}</span>
                            </label>
                            {cita}
                          </>
                        ) : (
                          <>
                            <span className="t-etiqueta ch-paso-num">
                              Paso {i + 1} de {totalPasos}
                            </span>
                            <div className="ch-paso-cuerpo">
                              <p className="ch-paso-texto">{c.text}</p>
                              {cita}
                            </div>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}

              {!!datos.length && (
                <dl className="ch-datos">
                  {datos.map((c) => {
                    const { rotulo, icono } = datosRotulo[c.kind];
                    return (
                      <div
                        key={c.kind}
                        className={c.kind === 'cost' ? 'caja-sol' : 'caja-gris'}
                        data-kind={c.kind}
                        data-numerico={(c.kind === 'cost' && /\d/.test(c.text)) || undefined}
                      >
                        <dt className="t-etiqueta">
                          <Icono n={icono} size={14} /> {rotulo}
                        </dt>
                        <dd>{c.text}</dd>
                      </div>
                    );
                  })}
                </dl>
              )}

              {hecho && t.guion?.aclarar && (
                <div className="caja-aviso ch-nota" role="status">
                  <Icono n="info" size={20} />
                  <div>
                    <h3>Necesitamos un poco más de detalle</h3>
                    <p>{t.guion.aclarar.pregunta}</p>
                    {ultimo && (
                      <div className="ch-opciones">
                        {t.guion.aclarar.opciones.map((o) => (
                          <button
                            type="button"
                            className="boton-claro"
                            key={o.texto}
                            onClick={() => enviar(o.pregunta)}
                          >
                            {o.texto}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {hecho && !t.guion && (
                <div className="caja-aviso ch-nota" role="status">
                  <Icono n="info" size={20} />
                  <div>
                    <h3>Esta demo no tiene respuesta para esa pregunta</h3>
                    <p>
                      Prueba con una de las preparadas. El chat real consulta las fuentes oficiales.
                    </p>
                    {ultimo && (
                      <div className="ch-opciones">
                        {preparadas.map((o) => (
                          <button
                            type="button"
                            className="boton-claro"
                            key={o}
                            onClick={() => enviar(o)}
                          >
                            {o}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {t.estado === 'detenido' && (
                <div className="ch-detenido" role="status">
                  <p>Respuesta detenida.</p>
                  <button type="button" className="boton-fantasma" onClick={() => enviar(t.query)}>
                    <Icono n="reintentar" size={16} /> Volver a preguntar
                  </button>
                </div>
              )}

              {hecho && t.guion?.destino && (
                <div className="caja-plana ch-destino">
                  <div className="ch-destino-texto">
                    <span className="t-etiqueta">Dónde se hace</span>
                    <strong>{t.guion.destino.title}</strong>
                    <span className="t-dato ch-host">{new URL(t.guion.destino.url).host}</span>
                  </div>
                  <a
                    className="boton ch-destino-boton"
                    href={t.guion.destino.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir la web oficial <Icono n="externo" size={16} />
                    <span className="sr-only">(se abre en otra pestaña)</span>
                  </a>
                </div>
              )}

              {hecho && !!t.guion?.claims.length && (
                <>
                  <div className="caja-resuelto ch-resuelto">
                    <Icono n="hecho" size={20} />
                    <div>
                      <strong>
                        Respuesta de ejemplo con{' '}
                        {fuentes.length === 1
                          ? '1 fuente oficial'
                          : `${fuentes.length} fuentes oficiales`}
                      </strong>
                      <p>En esta demo las fuentes no se han consultado.</p>
                    </div>
                  </div>
                  <div className="ch-acciones">
                    <button
                      type="button"
                      className="pildora ch-fuentes"
                      onClick={() => setAbiertas({ turno: t.id, fuente: 0 })}
                    >
                      <span className="ch-siglas" aria-hidden="true">
                        {fuentes.map((f) => (
                          <i key={f.sigla}>{f.sigla}</i>
                        ))}
                      </span>
                      <span className="t-dato">Fuentes · {fuentes.length}</span>
                    </button>
                    <div className="ch-votos">
                      <span className="t-dato ch-confirmacion" role="status">
                        {aviso?.id === t.id ? aviso.texto : ''}
                      </span>
                      <button
                        type="button"
                        className="boton-icono"
                        aria-label="Respuesta útil"
                        aria-pressed={t.voto === 'si'}
                        onClick={() => votar(t, 'si')}
                      >
                        <Icono n="util" />
                      </button>
                      <button
                        type="button"
                        className="boton-icono"
                        aria-label="Respuesta no útil"
                        aria-pressed={t.voto === 'no'}
                        onClick={() => votar(t, 'no')}
                      >
                        <Icono n="noUtil" />
                      </button>
                      <button
                        type="button"
                        className="boton-icono"
                        aria-label="Copiar respuesta"
                        data-copiado={
                          (aviso?.id === t.id && aviso.texto === 'Copiado') || undefined
                        }
                        onClick={() => copiar(t)}
                      >
                        <span className="ch-copiar">
                          <Icono n="copiar" />
                          <Icono n="hecho" />
                        </span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {hecho && ultimo && !!t.guion?.seguimiento.length && (
                <div className="ch-seguir">
                  <span className="t-etiqueta">Puedes seguir con</span>
                  <div className="ch-sugerencias">
                    {t.guion.seguimiento.map((q) => (
                      <button type="button" className="pildora" key={q} onClick={() => enviar(q)}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="ch-dock">
        <form
          className="ch-compositor"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            enviar(texto);
          }}
        >
          <label htmlFor={`${uid}-entrada`} className="sr-only">
            Pregunta sobre trámites
          </label>
          <textarea
            ref={entrada}
            id={`${uid}-entrada`}
            rows={1}
            value={texto}
            placeholder={panel ? 'Pregunta sobre esta página' : 'Pregunta aquí'}
            autoComplete="off"
            enterKeyHint="send"
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              // Intro envía y Mayús+Intro salta de línea. ⌘/Ctrl+Intro también envía.
              if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
              if (e.shiftKey && !(e.metaKey || e.ctrlKey)) return;
              e.preventDefault();
              enviar(texto);
            }}
          />
          {ocupado ? (
            <button
              type="button"
              className="boton-enviar ch-enviar"
              onClick={() => {
                if (activo) actualizar(activo.id, { estado: 'detenido' });
                // El botón pasa a «Enviar» deshabilitado y soltaría el foco en <body>.
                entrada.current?.focus();
              }}
              aria-label="Detener respuesta"
            >
              <Icono n="detener" size={18} />
            </button>
          ) : (
            <button
              type="submit"
              className="boton-enviar ch-enviar"
              disabled={texto.trim().length < 2}
              aria-label="Enviar pregunta"
            >
              <Icono n="enviar" size={18} />
            </button>
          )}
        </form>
        {!panel && (
          <small className="ch-pie">
            Demo con respuestas de ejemplo. En el chat real, comprueba siempre las citas.
          </small>
        )}
      </div>

      <dialog
        ref={dialogo}
        className="ch-panel"
        aria-labelledby={`${uid}-fuentes`}
        onClose={() => setAbiertas(null)}
        onKeyDown={(e) => {
          // El modal cierra con Esc de forma nativa; la hoja no modal del panel, aquí.
          if (e.key === 'Escape' && panel) {
            e.preventDefault();
            setAbiertas(null);
          }
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setAbiertas(null);
        }}
      >
        <div className="ch-panel-cuerpo">
          <div className="ch-panel-barra">
            <h2 id={`${uid}-fuentes`} className="t-etiqueta">
              Fuentes · {fuentesAbiertas?.length ?? 0}
            </h2>
            <button
              type="button"
              className="boton-icono"
              aria-label="Cerrar fuentes"
              onClick={() => setAbiertas(null)}
            >
              <Icono n="cerrar" />
            </button>
          </div>
          {fuentesAbiertas?.map((f, i) => (
            <article
              key={f.sigla}
              className="ch-fuente"
              data-fuente={i}
              data-activa={abiertas?.fuente === i || undefined}
            >
              <p className="ch-fuente-org">
                <i aria-hidden="true">{f.sigla}</i> {f.org}
              </p>
              <h3 className={panel ? undefined : 't-titular-s'}>{f.title}</h3>
              <blockquote>{f.quote}</blockquote>
              <dl>
                <div>
                  <dt>Web</dt>
                  <dd className="t-dato">{f.host}</dd>
                </div>
                <div>
                  <dt>Consultado</dt>
                  <dd className="t-dato">Demo · sin consulta real</dd>
                </div>
              </dl>
              <a
                className="boton-claro ch-fuente-abrir"
                href={`https://${f.host}`}
                target="_blank"
                rel="noreferrer"
              >
                Abrir la web oficial <Icono n="externo" size={16} />
                <span className="sr-only">(se abre en otra pestaña)</span>
              </a>
            </article>
          ))}
        </div>
      </dialog>
    </div>
  );
}
