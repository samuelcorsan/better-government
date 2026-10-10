'use client';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useChat } from '@ai-sdk/react';
import { APICallError } from 'ai';
import { Icon } from './sol/icon';
import './chat.css';
import type { Region, Stage } from '@reforma-digital/core';
import { Button } from '@reforma-digital/design/sol';
import {
  IconSwap,
  JumpButton,
  Notice,
  Response,
  Suggestion,
  Suggestions,
  Thinking,
  UserMessage,
} from '@reforma-digital/design/sol/chat';
import { AttachmentPicker } from './attachment-picker';
import type { PdfContext } from '../lib/attachment';
import { warm } from '../lib/pii';
import { ProtectedQuestion } from './protected-question';
import { chatTransport, textOf } from '../lib/chat-transport';
import type { ChatMessage } from '../lib/chat-message';
import { AnswerBlocks, citedEvidence, readAnswer, type AnswerView } from './chat-answer';
import dynamic from 'next/dynamic';
import './sources-map.css';
import { AgencyBadge, SourcePopover } from './source-popover';
// The map geometry is only downloaded when the coverage dialog opens.
const SourcesMap = dynamic(() => import('./sources-map'), {
  loading: () => (
    <section className="sources-map sources-map-cargando" aria-labelledby="sources-map-title">
      <h2 id="sources-map-title">Fuentes por territorio</h2>
    </section>
  ),
});

const stages: Record<Stage, string> = {
  understandQuery: 'Entendiendo tu pregunta',
  retrieval: 'Consultando fuentes oficiales',
  generation: 'Redactando y verificando la respuesta',
  evaluation: 'Comprobando referencias',
};
const fallbackError = 'No se ha podido completar la respuesta.';
export type LimitedRegion = { id: Region; name: string; sourceCount: number };

function describeError(error: Error | undefined): string {
  if (!error) return fallbackError;
  if (APICallError.isInstance(error)) {
    try {
      const body = JSON.parse(error.responseBody ?? '') as { error?: unknown };
      if (typeof body.error === 'string') return body.error;
    } catch {
      /* HTML or empty error bodies are not shown to the user. */
    }
    return 'No se ha podido consultar las fuentes.';
  }
  if (error instanceof TypeError)
    return 'No se ha podido conectar. Comprueba tu conexión e inténtalo de nuevo.';
  return error.message || fallbackError;
}

function CoverageNotice({
  region,
  openMap,
}: {
  region: LimitedRegion | undefined;
  openMap: (regionId: string) => void;
}) {
  if (!region) return null;
  return (
    <p className="chat-coverage-note chat-enter">
      Nuestra cobertura territorial en {region.name} es limitada: {region.sourceCount}{' '}
      {region.sourceCount === 1 ? 'fuente registrada' : 'fuentes registradas'}.{' '}
      <Button
        variant="secondary"
        aria-haspopup="dialog"
        aria-controls="chat-coverage-dialog"
        onClick={() => openMap(region.id)}
      >
        Ver mapa de fuentes
      </Button>
    </p>
  );
}
function AnswerActions({ message, view }: { message: ChatMessage; view: AnswerView }) {
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState<1 | -1>();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [negative, setNegative] = useState(false);
  const [reason, setReason] = useState('incorrect');
  const evidence = citedEvidence(view);
  const agencies = [
    ...new Map(evidence.map((e) => [new URL(e.canonicalUrl).hostname, e])).values(),
  ];
  const { searchId, feedbackToken } = message.metadata ?? {};
  async function vote(value: 1 | -1) {
    if (!searchId || !feedbackToken) return;
    setBusy(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchId,
          token: feedbackToken,
          rating: value,
          ...(value === -1 ? { reason } : {}),
        }),
      });
      if (!response.ok) throw new Error();
      setRating(value);
      setNegative(false);
      setNote('Gracias por tu valoración.');
    } catch {
      setNote('No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        [
          view.blocks.map((b) => b.claim.text).join('\n\n'),
          ...new Set(evidence.map((e) => e.canonicalUrl)),
        ].join('\n\n'),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setNote('No se pudo copiar. Puedes seleccionar el texto de la respuesta.');
    }
  }
  // Sources, votes and copy only make sense next to verified claims.
  if (!view.blocks.length) return null;
  return (
    <>
      <div className="chat-actions chat-enter">
        {evidence.length > 0 && (
          <SourcePopover className="chat-sources-pill" evidence={evidence}>
            <span className="agency-stack">
              {agencies.slice(0, 3).map((source) => (
                <AgencyBadge
                  key={new URL(source.canonicalUrl).hostname}
                  name={source.organization}
                  url={source.canonicalUrl}
                />
              ))}
            </span>
            Fuentes
          </SourcePopover>
        )}
        {feedbackToken && (
          <div className="chat-votes">
            <button
              className="chat-icon"
              disabled={busy}
              aria-label="Respuesta útil"
              aria-pressed={rating === 1}
              onClick={() => void vote(1)}
            >
              <Icon name="util" size={16} />
            </button>
            <button
              className="chat-icon"
              disabled={busy}
              aria-label="Respuesta no útil"
              aria-pressed={rating === -1}
              onClick={() => setNegative(!negative)}
            >
              <Icon name="noUtil" size={16} />
            </button>
          </div>
        )}
        <button
          className="chat-icon chat-copy"
          onClick={() => void copy()}
          aria-label={copied ? 'Copiado' : 'Copiar respuesta'}
        >
          <IconSwap
            active={copied ? 'b' : 'a'}
            a={<Icon name="copiar" size={16} />}
            b={<Icon name="hecho" size={16} />}
          />
        </button>
      </div>
      {negative && (
        <form
          className="chat-feedback chat-enter"
          onSubmit={(e) => {
            e.preventDefault();
            void vote(-1);
          }}
        >
          <label htmlFor={`reason-${message.id}`}>¿Qué falló?</label>
          <select
            id={`reason-${message.id}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="incorrect">Respuesta incorrecta</option>
            <option value="source">Fuente incorrecta</option>
            <option value="outdated">Información desactualizada</option>
            <option value="unanswered">No respondió</option>
            <option value="other">Otro motivo</option>
          </select>
          <button disabled={busy}>Enviar</button>
          <button type="button" onClick={() => setNegative(false)}>
            Cancelar
          </button>
        </form>
      )}
      {note && (
        <p className="chat-action-message chat-enter" role="status">
          {note}
        </p>
      )}
    </>
  );
}
export default function Chat({
  initialQuestion,
  header,
  footer,
  limitedRegions,
}: {
  initialQuestion: string;
  header: ReactNode;
  footer?: ReactNode;
  limitedRegions: readonly LimitedRegion[];
}) {
  const [input, setInput] = useState('');
  const [stage, setStage] = useState<Stage>('understandQuery');
  const [stopped, setStopped] = useState<ReadonlySet<string>>(new Set());
  const [showJump, setShowJump] = useState(false);
  const [attachment, setAttachment] = useState<PdfContext>();
  const [attachmentBusy, setAttachmentBusy] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const coverageDialog = useRef<HTMLDialogElement>(null);
  const [coverageRegionId, setCoverageRegionId] = useState<string | null>(null);
  const [coverageOpened, setCoverageOpened] = useState(false);
  const nearBottom = useRef(true);
  const { messages, sendMessage, regenerate, stop, status, error } = useChat<ChatMessage>({
    transport: chatTransport,
    onData: (part) => {
      if (part.type === 'data-stage') setStage(part.data.stage);
    },
  });
  const loading = status === 'submitted' || status === 'streaming';
  const turns: { user: ChatMessage; assistant?: ChatMessage }[] = [];
  for (const message of messages) {
    if (message.role === 'user') turns.push({ user: message });
    else if (message.role === 'assistant' && turns.length) turns.at(-1)!.assistant = message;
  }
  function jump() {
    nearBottom.current = true;
    bottom.current?.scrollIntoView({ behavior: 'instant', block: 'end' });
    setShowJump(false);
  }
  function send(question: string) {
    const query = question.trim();
    if (query.length < 4 || loading || attachmentBusy) return;
    nearBottom.current = true;
    setStage('understandQuery');
    void sendMessage({ text: query, ...(attachment ? { metadata: { attachment } } : {}) });
    setInput('');
    setAttachment(undefined);
    setAttachmentError('');
  }
  function retry() {
    const last = turns.at(-1);
    if (!last || loading) return;
    setStopped((ids) => new Set([...ids].filter((id) => id !== last.user.id)));
    setStage('understandQuery');
    nearBottom.current = true;
    void regenerate();
  }
  function halt() {
    const last = turns.at(-1);
    if (last) setStopped((ids) => new Set(ids).add(last.user.id));
    void stop();
  }
  useEffect(() => {
    let cancelled = false;
    if (!initialQuestion) inputRef.current?.focus({ preventScroll: true });
    if (initialQuestion)
      queueMicrotask(() => {
        if (!cancelled) send(initialQuestion);
      });
    return () => {
      cancelled = true;
    };
    // A pending landing question is consumed once; conversation state is deliberately kept in memory.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);
  useEffect(() => {
    const onScroll = () => {
      nearBottom.current =
        document.documentElement.scrollHeight - window.scrollY - window.innerHeight < 150;
      setShowJump(!nearBottom.current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  // «Nueva conversación» remounts the chat: the pending search and its model calls must stop.
  useEffect(() => () => void stop(), [stop]);
  // Errors and stops change the status without a new message part; follow them too.
  useEffect(() => {
    if (nearBottom.current) jump();
  }, [messages, status]);
  useEffect(() => {
    const el = inputRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
      el.style.overflowY = el.scrollHeight > 200 ? 'auto' : 'hidden';
    }
  }, [input]);
  useEffect(() => {
    const el = dock.current;
    if (!el) return;
    const root = document.documentElement;
    let height = 0;
    const observer = new ResizeObserver(() => {
      const nextHeight = el.offsetHeight;
      if (nextHeight === height) return;
      height = nextHeight;
      const follow = nearBottom.current;
      root.style.setProperty('--chat-dock-height', `${height}px`);
      // Keep the last response visible as the composer grows, unless reading older turns.
      if (follow) jump();
    });
    observer.observe(el);
    let resizeFrame = 0;
    const onResize = () => {
      if (!nearBottom.current) return;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(jump);
    };
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
      observer.disconnect();
      root.style.removeProperty('--chat-dock-height');
    };
  }, []);
  function rephrase(query: string) {
    setInput(query);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      el?.focus();
      el?.setSelectionRange(query.length, query.length);
    });
  }
  function submit(e?: FormEvent) {
    e?.preventDefault();
    send(input);
  }
  function openCoverage(regionId: string | null = null) {
    setCoverageRegionId(regionId);
    setCoverageOpened(true);
    coverageDialog.current?.showModal();
  }
  return (
    <div className="chat-page">
      {header}
      <a className="skip-link" href="#chat-input">
        Ir al cuadro de mensaje
      </a>
      <main id="main" className="chat-conversation" aria-label="Conversación">
        {!turns.length && (
          <div className="chat-empty">
            <h1>¿Qué necesitas hacer?</h1>
            <p>Pregunta con tus palabras. Te acercamos a las fuentes oficiales.</p>
            <Suggestions>
              {['¿Cómo me hago autónomo?', '¿Cómo me empadrono en Madrid?'].map((q, i) => (
                <Suggestion
                  key={q}
                  index={i}
                  icon={<Icon name="derecha" size={17} />}
                  onSelect={send}
                >
                  {q}
                </Suggestion>
              ))}
            </Suggestions>
          </div>
        )}
        {turns.map(({ user, assistant }, turnIndex) => {
          const last = turnIndex === turns.length - 1;
          const pending = last && loading;
          const failed = last && status === 'error';
          const halted = !pending && stopped.has(user.id);
          const view = readAnswer(assistant);
          const meta = assistant?.metadata;
          const question = textOf(user);
          // A reply that ends without its final metadata was cut off on the way.
          const interrupted = !pending && !failed && !halted && !meta?.status;
          return (
            <section className="chat-turn" key={user.id} aria-label={`Pregunta ${turnIndex + 1}`}>
              <UserMessage
                attachment={
                  user.metadata?.attachment && (
                    <>
                      <Icon name="documento" size={16} /> {user.metadata.attachment.name}
                    </>
                  )
                }
                note={
                  view.hidden.length > 0 && (
                    <>
                      <Icon name="protegido" size={14} />
                      {view.hidden.length === 1
                        ? '1 dato personal ocultado al modelo'
                        : `${view.hidden.length} datos personales ocultados al modelo`}
                    </>
                  )
                }
              >
                <ProtectedQuestion text={question} ranges={view.hidden} id={user.id} />
              </UserMessage>
              <div className="chat-assistant">
                <AnswerBlocks view={view} />
                {pending && (
                  <Thinking
                    label={assistant ? 'Pensando…' : 'Preparando todo…'}
                    stage={assistant ? stages[stage] : undefined}
                  />
                )}
                {meta?.status === 'answered' && !view.blocks.length && (
                  <Response streaming={view.streaming} className="chat-enter">
                    {view.text}
                  </Response>
                )}
                {meta?.status && meta.status !== 'answered' && (
                  <Notice
                    tone="info"
                    role="status"
                    icon={<Icon name="info" size={20} />}
                    title={
                      meta.status === 'needs_clarification'
                        ? 'Necesitamos un poco más de detalle'
                        : 'No hemos encontrado una respuesta verificada'
                    }
                    actions={
                      (last || view.evidence.length > 0) && (
                        <>
                          {last && (
                            <Button variant="secondary" onClick={() => rephrase(question)}>
                              <Icon name="nueva" size={15} />
                              Reformular la pregunta
                            </Button>
                          )}
                          {view.evidence.length > 0 && (
                            <SourcePopover className="boton-claro" evidence={view.evidence}>
                              Ver lo consultado ({view.evidence.length})
                            </SourcePopover>
                          )}
                        </>
                      )
                    }
                  >
                    <Response streaming={view.streaming}>{view.text}</Response>
                  </Notice>
                )}
                {meta?.incomplete && (
                  <p className="chat-partial chat-enter">
                    Las fuentes no permiten confirmar todos los detalles. Aquí aparecen únicamente
                    los que hemos podido verificar.
                  </p>
                )}
                {meta?.status && (
                  <CoverageNotice
                    region={limitedRegions.find((region) => region.id === meta.region)}
                    openMap={openCoverage}
                  />
                )}
                {halted && (
                  <div className="chat-stopped chat-enter">
                    <p className="chat-partial" role="status">
                      Respuesta detenida.
                      {view.blocks.length > 0 && ' Los fragmentos mostrados ya están verificados.'}
                    </p>
                    {last && (
                      <Button variant="secondary" disabled={loading} onClick={retry}>
                        <Icon name="reintentar" size={14} /> Volver a intentar
                      </Button>
                    )}
                  </div>
                )}
                {(failed || interrupted) && (
                  <Notice
                    tone="error"
                    role="alert"
                    icon={<Icon name="error" size={20} />}
                    title="No se ha podido completar la respuesta"
                    actions={
                      last && (
                        <Button variant="secondary" disabled={loading} onClick={retry}>
                          <Icon name="reintentar" size={15} /> Volver a intentar
                        </Button>
                      )
                    }
                  >
                    <p>
                      {failed
                        ? describeError(error)
                        : 'La conexión se interrumpió. Puedes volver a intentarlo.'}
                    </p>
                    {view.blocks.length > 0 && (
                      <p>
                        La respuesta está incompleta. Los fragmentos mostrados están verificados.
                      </p>
                    )}
                  </Notice>
                )}
                {assistant && !pending && <AnswerActions message={assistant} view={view} />}
                {last && !pending && meta?.status === 'answered' && (
                  <Suggestions>
                    {['¿Qué documentación necesito?', '¿Dónde lo puedo tramitar?'].map((q, i) => (
                      <Suggestion
                        key={q}
                        index={i}
                        icon={<Icon name="derecha" size={17} />}
                        onSelect={send}
                      >
                        {q}
                      </Suggestion>
                    ))}
                  </Suggestions>
                )}
              </div>
            </section>
          );
        })}
        <div ref={bottom} className="chat-bottom" />
      </main>
      <div ref={dock} className="chat-composer-dock">
        <JumpButton visible={showJump} onClick={jump}>
          <Icon name="abajo" size={18} />
        </JumpButton>
        {attachmentError && (
          <p className="chat-composer-error chat-enter" role="alert">
            {attachmentError}
          </p>
        )}
        {(attachment || attachmentBusy) && (
          <div className="chat-attachment-preview chat-enter">
            <div>
              <Icon name="documento" size={20} />
              <span>{attachmentBusy ? 'Leyendo PDF…' : attachment?.name}</span>
              {attachment && !attachmentBusy && (
                <button
                  className="chat-icon"
                  onClick={() => setAttachment(undefined)}
                  aria-label="Quitar PDF"
                >
                  <Icon name="cerrar" size={16} />
                </button>
              )}
            </div>
            <small>
              {attachment?.truncated ? 'Se usarán los primeros 6.000 caracteres. ' : ''}
              Al enviar, el texto se usará como contexto; nunca como fuente oficial.
            </small>
          </div>
        )}
        <form
          className="chat-composer"
          onSubmit={submit}
          onClick={(event) => {
            if (
              event.target instanceof Element &&
              !event.target.closest('button, input, textarea, a')
            ) {
              inputRef.current?.focus();
            }
          }}
        >
          <label htmlFor="chat-input" className="sr-only">
            Pregunta sobre trámites, ayudas o impuestos
          </label>
          <textarea
            id="chat-input"
            ref={inputRef}
            rows={2}
            value={input}
            maxLength={1200}
            placeholder="Pregunta aquí"
            autoComplete="off"
            enterKeyHint="send"
            onChange={(e) => {
              warm();
              setInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                if (!loading) submit();
              }
            }}
          />
          <div className="composer-controls">
            <div className="composer-tools">
              <AttachmentPicker
                busy={attachmentBusy}
                disabled={loading}
                onBusy={setAttachmentBusy}
                onAttachment={setAttachment}
                onError={setAttachmentError}
              />
              <button
                className="chat-icon"
                type="button"
                aria-label="Mapa de fuentes"
                aria-haspopup="dialog"
                aria-controls="chat-coverage-dialog"
                onClick={() => openCoverage()}
              >
                <Icon name="fuentes" size={20} />
              </button>
            </div>
            {/* One button for both states so the control never jumps; the glyphs crossfade. */}
            <button
              className="chat-send"
              type={loading ? 'button' : 'submit'}
              onClick={loading ? halt : undefined}
              disabled={!loading && (input.trim().length < 4 || attachmentBusy)}
              aria-label={loading ? 'Detener respuesta' : 'Enviar pregunta'}
            >
              <IconSwap
                active={loading ? 'b' : 'a'}
                a={<Icon name="enviar" size={20} />}
                b={<Icon name="detener" size={13} />}
              />
            </button>
          </div>
        </form>
        {footer}
        <span className="sr-only">
          Las respuestas se basan en fuentes oficiales. Comprueba las citas antes de realizar el
          trámite.
        </span>
      </div>
      <dialog
        ref={coverageDialog}
        id="chat-coverage-dialog"
        className="chat-source-dialog chat-coverage-dialog"
        aria-labelledby="sources-map-title"
        onClick={(event) => {
          if (event.target === coverageDialog.current) coverageDialog.current.close();
        }}
      >
        <div className="source-modal-inner">
          <button
            type="button"
            className="chat-icon source-close"
            aria-label="Cerrar mapa de fuentes"
            onClick={() => coverageDialog.current?.close()}
          >
            <Icon name="cerrar" size={19} />
          </button>
          {coverageOpened && (
            <SourcesMap selectedId={coverageRegionId} onSelect={setCoverageRegionId} />
          )}
        </div>
      </dialog>
    </div>
  );
}
