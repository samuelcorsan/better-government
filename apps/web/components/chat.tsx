'use client';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  Check,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Square,
  X,
  ChevronDown,
  RotateCcw,
  FileText,
  CircleAlert,
  Info,
  PencilLine,
} from 'lucide-react';
import type { Evidence, SearchResult, Stage, VerifiedClaim } from '@reforma-digital/core';
import { ProjectBrand } from './project-header';
import { AttachmentPicker } from './attachment-picker';
import type { PdfContext } from '../lib/attachment';
import { protectMessages, ProtectionTimeoutError, warm } from '../lib/pii';
import type { HiddenRange, ProtectedText } from '../lib/pii-display';
import { ProtectedQuestion } from './protected-question';
import { readChatStream } from '../lib/chat-stream';

type Result = SearchResult & { feedbackToken: string | null };
type Turn = {
  id: string;
  query: string;
  state: 'loading' | 'done' | 'stopped' | 'error';
  stage: Stage;
  protecting?: boolean;
  hiddenData?: HiddenRange[];
  evidence: Evidence[];
  blocks: VerifiedClaim[];
  result?: Result;
  error?: string;
  attachment?: PdfContext;
};
type SourceView = { evidence: Evidence[]; selected?: Evidence };
const stages: Record<Stage, string> = {
  understandQuery: 'Entendiendo tu pregunta',
  retrieval: 'Consultando fuentes oficiales',
  generation: 'Redactando y verificando la respuesta',
  evaluation: 'Comprobando referencias',
};
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((s) => s.length > 3)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase() || 'ES';
function Badge({ name }: { name: string }) {
  return (
    <span className="agency-badge" aria-hidden="true">
      {initials(name)}
    </span>
  );
}
function SourceDialog({
  view,
  close,
  select,
}: {
  view: SourceView | null;
  close: () => void;
  select: (e?: Evidence) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (view && !dialog.current?.open) dialog.current?.showModal();
    if (!view) dialog.current?.close();
  }, [view]);
  const groups = new Map<string, Evidence[]>();
  for (const e of view?.evidence ?? []) {
    const host = new URL(e.canonicalUrl).hostname.replace(/^www\./, '');
    groups.set(host, [...(groups.get(host) ?? []), e]);
  }
  return (
    <dialog
      ref={dialog}
      className="chat-source-dialog"
      aria-labelledby="source-modal-title"
      onCancel={close}
      onClose={close}
      onClick={(event) => {
        if (event.target === dialog.current) close();
      }}
    >
      <div className="source-modal-inner">
        <div className="source-modal-header">
          {view?.selected && (
            <button
              className="chat-icon source-back"
              onClick={() => select()}
              aria-label="Todas las fuentes"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h2 id="source-modal-title">{view?.selected ? 'Fragmento citado' : 'Fuentes'}</h2>
          <button className="chat-icon source-close" onClick={close} aria-label="Cerrar fuentes">
            <X size={19} />
          </button>
        </div>
        {view?.selected ? (
          <div className="source-detail">
            <div className="source-detail-agency">
              <Badge name={view.selected.organization} />
              {view.selected.organization}
            </div>
            <h3>{view.selected.title}</h3>
            <p className="source-heading">{view.selected.heading}</p>
            <blockquote>
              <Markdown
                remarkPlugins={[remarkGfm]}
                skipHtml
                components={{
                  a: ({ children }) => <span>{children}</span>,
                  img: () => null,
                }}
              >
                {view.selected.content}
              </Markdown>
            </blockquote>
            <dl>
              <div>
                <dt>Ámbito</dt>
                <dd>{view.selected.jurisdiction}</dd>
              </div>
              <div>
                <dt>Consultado</dt>
                <dd>{new Date(view.selected.crawledAt).toLocaleDateString('es-ES')}</dd>
              </div>
              <div>
                <dt>Actualización de origen</dt>
                <dd>
                  {view.selected.sourceUpdatedAt
                    ? new Date(view.selected.sourceUpdatedAt).toLocaleDateString('es-ES')
                    : 'No indicada'}
                </dd>
              </div>
            </dl>
            <a
              href={view.selected.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="chat-official-link"
            >
              Abrir documento oficial <ArrowUpRight size={15} />
            </a>
          </div>
        ) : (
          <div className="source-groups">
            {[...groups].map(([host, evidence]) => {
              const documents = [...new Map(evidence.map((e) => [e.documentId, e])).values()];
              return (
                <details key={host} className="source-group">
                  <summary>
                    <Badge name={evidence[0]!.organization} />
                    <span>
                      {host}
                      <small>
                        {documents.length} {documents.length === 1 ? 'fuente' : 'fuentes'}
                      </small>
                    </span>
                    <ChevronDown size={18} />
                  </summary>
                  <div className="source-documents">
                    {documents.map((doc) => (
                      <div key={doc.documentId}>
                        <a href={doc.canonicalUrl} target="_blank" rel="noopener noreferrer">
                          {doc.title} <ArrowUpRight size={14} />
                        </a>
                        {evidence
                          .filter((e) => e.documentId === doc.documentId)
                          .map((e, i) => (
                            <button key={e.chunkId} onClick={() => select(e)}>
                              Ver fragmento citado
                              {evidence.filter((item) => item.documentId === doc.documentId)
                                .length > 1
                                ? ` ${i + 1}`
                                : ''}
                            </button>
                          ))}
                      </div>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </div>
    </dialog>
  );
}
function AnswerActions({
  turn,
  showSources,
}: {
  turn: Turn;
  showSources: (evidence: Evidence[], selected?: Evidence) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState<1 | -1>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [negative, setNegative] = useState(false);
  const [reason, setReason] = useState('incorrect');
  const evidence = turn.evidence.filter((e) =>
    turn.blocks.some((b) => b.citations.some((c) => c.chunkId === e.chunkId)),
  );
  const agencies = [...new Set(evidence.map((e) => e.organization))];
  async function vote(value: 1 | -1) {
    if (!turn.result?.feedbackToken) return;
    setBusy(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchId: turn.result.id,
          token: turn.result.feedbackToken,
          rating: value,
          ...(value === -1 ? { reason } : {}),
        }),
      });
      if (!response.ok) throw new Error();
      setRating(value);
      setNegative(false);
      setMessage('Gracias por tu valoración.');
    } catch {
      setMessage('No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        [
          turn.blocks.map((b) => b.claim.text).join('\n\n'),
          ...[...new Set(evidence.map((e) => e.canonicalUrl))],
        ].join('\n\n'),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage('No se pudo copiar. Puedes seleccionar el texto de la respuesta.');
    }
  }
  // Sources, votes and copy only make sense next to verified claims.
  if (!turn.blocks.length) return null;
  return (
    <>
      <div className="chat-actions">
        {evidence.length > 0 && (
          <button className="chat-sources-pill" onClick={() => showSources(evidence)}>
            <span className="agency-stack">
              {agencies.slice(0, 3).map((name) => (
                <Badge key={name} name={name} />
              ))}
            </span>
            Fuentes
          </button>
        )}
        {turn.result?.feedbackToken && (
          <div className="chat-votes">
            <button
              className="chat-icon"
              disabled={busy}
              aria-label="Respuesta útil"
              aria-pressed={rating === 1}
              onClick={() => void vote(1)}
            >
              <ThumbsUp size={16} />
            </button>
            <button
              className="chat-icon"
              disabled={busy}
              aria-label="Respuesta no útil"
              aria-pressed={rating === -1}
              onClick={() => setNegative(!negative)}
            >
              <ThumbsDown size={16} />
            </button>
          </div>
        )}
        <button
          className="chat-icon chat-copy"
          onClick={() => void copy()}
          aria-label={copied ? 'Copiado' : 'Copiar respuesta'}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      {negative && (
        <form
          className="chat-feedback"
          onSubmit={(e) => {
            e.preventDefault();
            void vote(-1);
          }}
        >
          <label htmlFor={`reason-${turn.id}`}>¿Qué falló?</label>
          <select
            id={`reason-${turn.id}`}
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
      {message && (
        <p className="chat-action-message" role="status">
          {message}
        </p>
      )}
    </>
  );
}
export default function Chat({
  initialQuestion,
  onNewConversation,
  onGoHome,
  header,
  footer,
}: {
  initialQuestion: string;
  onNewConversation: () => void;
  onGoHome: () => void;
  header?: ReactNode;
  footer?: ReactNode;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [sourceView, setSourceView] = useState<SourceView | null>(null);
  const [showJump, setShowJump] = useState(false);
  const [attachment, setAttachment] = useState<PdfContext>();
  const [attachmentBusy, setAttachmentBusy] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');
  const active = useRef<AbortController | null>(null);
  const history = useRef<Turn[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDetailsElement>(null);
  const nearBottom = useRef(true);
  const loading = turns.some((t) => t.state === 'loading');
  function update(id: string, change: Partial<Turn> | ((turn: Turn) => Partial<Turn>)) {
    setTurns((previous) => {
      const next = previous.map((t) =>
        t.id === id ? { ...t, ...(typeof change === 'function' ? change(t) : change) } : t,
      );
      history.current = next;
      return next;
    });
  }
  function jump() {
    nearBottom.current = true;
    bottom.current?.scrollIntoView({ behavior: 'instant', block: 'end' });
    setShowJump(false);
  }
  async function send(question: string, retryId?: string) {
    const query = question.trim();
    if (query.length < 4 || active.current || attachmentBusy) return;
    const controller = new AbortController();
    active.current = controller;
    const id = retryId ?? crypto.randomUUID();
    const prior = retryId
      ? history.current.slice(
          0,
          history.current.findIndex((t) => t.id === retryId),
        )
      : history.current;
    const attached = retryId
      ? history.current.find((t) => t.id === retryId)?.attachment
      : attachment;
    const documentContext = attached ?? [...prior].reverse().find((t) => t.attachment)?.attachment;
    const turn: Turn = {
      id,
      query,
      attachment: attached,
      state: 'loading',
      stage: 'understandQuery',
      protecting: true,
      evidence: [],
      blocks: [],
    };
    history.current = [...prior, turn];
    setTurns(history.current);
    setInput('');
    setAttachment(undefined);
    setAttachmentError('');
    nearBottom.current = true;
    try {
      const outgoing = [query, ...prior.slice(-6).map((t) => t.query)];
      if (documentContext) outgoing.push(documentContext.text);
      let protectedMessages: ProtectedText[];
      try {
        protectedMessages = await protectMessages(outgoing, controller.signal);
      } catch (error) {
        if (controller.signal.aborted || error instanceof ProtectionTimeoutError) throw error;
        throw new Error(
          'No hemos podido proteger tus datos personales en este dispositivo, así que no se ha enviado la consulta. Inténtalo de nuevo.',
        );
      }
      controller.signal.throwIfAborted();
      const safe = protectedMessages.map((message) => message.text);
      update(id, { protecting: false, hiddenData: protectedMessages[0]?.ranges ?? [] });
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: safe[0],
          attachmentContext: documentContext ? safe.at(-1) : undefined,
          context: safe.slice(1, outgoing.length - (documentContext ? 1 : 0)),
        }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const text = await response.text();
        let message = 'No se ha podido consultar las fuentes.';
        try {
          const body = JSON.parse(text) as { error?: string };
          if (body.error) message = body.error;
        } catch {
          /* HTML or empty error bodies are not shown to the user. */
        }
        throw new Error(message);
      }
      if (!response.body) throw new Error('No se ha recibido una respuesta.');
      await readChatStream(response.body, (event, data) => {
        if (controller.signal.aborted) return;
        if (event === 'stage') update(id, { stage: data as Stage });
        if (event === 'evidence') update(id, { evidence: data as Evidence[] });
        if (event === 'claim')
          update(id, (t) => ({ blocks: [...t.blocks, data as VerifiedClaim] }));
        if (event === 'result') {
          const result = data as Result;
          update(id, {
            result,
            evidence: result.evidence,
            blocks: result.answer.claims.map((claim) => ({
              claim,
              citations: result.answer.citations.filter((c) => c.claimId === claim.id),
            })),
            state: 'done',
          });
        }
      });
    } catch (error) {
      update(id, {
        state: controller.signal.aborted ? 'stopped' : 'error',
        error: controller.signal.aborted
          ? undefined
          : error instanceof Error
            ? error.message
            : 'No se ha podido completar la respuesta.',
      });
    } finally {
      if (active.current === controller) active.current = null;
    }
  }
  useEffect(() => {
    let cancelled = false;
    if (!initialQuestion) inputRef.current?.focus({ preventScroll: true });
    if (initialQuestion)
      queueMicrotask(() => {
        if (!cancelled) {
          void send(initialQuestion);
        }
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
    const dismissMenu = (event: PointerEvent) => {
      if (menu.current?.open && !menu.current.contains(event.target as Node))
        menu.current.open = false;
    };
    const escapeMenu = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', dismissMenu);
    document.addEventListener('keydown', escapeMenu);
    return () => {
      document.removeEventListener('pointerdown', dismissMenu);
      document.removeEventListener('keydown', escapeMenu);
      window.removeEventListener('scroll', onScroll);
      active.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (nearBottom.current) jump();
  }, [turns]);
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
    void send(input);
  }
  const showSources = (evidence: Evidence[], selected?: Evidence) =>
    setSourceView({ evidence, selected });
  return (
    <div className="chat-page">
      {header ?? (
        <header className="chat-header">
          <Link
            href="/"
            onClick={(event) => {
              event.preventDefault();
              onGoHome();
            }}
            className="project-brand"
            aria-label="Reforma Digital, inicio"
          >
            <ProjectBrand />
          </Link>
          <details ref={menu} className="chat-menu">
            <summary>Menú</summary>
            <nav aria-label="Navegación del chat">
              <Link
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  onNewConversation();
                }}
              >
                Nueva conversación
              </Link>
              <Link href="/#texto">La iniciativa</Link>
              <Link href="/sources">Fuentes oficiales</Link>
              <Link href="/how-it-works">Cómo funciona</Link>
              <Link href="/privacy">Privacidad</Link>
              <small>
                Proyecto independiente.
                <br />
                No es una sede oficial.
              </small>
            </nav>
          </details>
        </header>
      )}
      <a className="skip-link" href="#chat-input">
        Ir al cuadro de mensaje
      </a>
      <main id="main" className="chat-conversation" aria-label="Conversación">
        {!turns.length && (
          <div className="chat-empty">
            <h1>¿Qué necesitas hacer?</h1>
            <p>Pregunta con tus palabras. Te acercamos a las fuentes oficiales.</p>
            <div className="chat-followups">
              {['¿Cómo me hago autónomo?', '¿Cómo me empadrono en Madrid?'].map((q) => (
                <button key={q} onClick={() => void send(q)}>
                  {q}
                  <ArrowUpRight size={17} />
                </button>
              ))}
            </div>
          </div>
        )}
        {turns.map((turn, turnIndex) => (
          <section className="chat-turn" key={turn.id} aria-label={`Pregunta ${turnIndex + 1}`}>
            <div className="chat-user">
              <p>
                {turn.attachment && (
                  <span className="chat-attached-message">
                    <FileText size={16} /> {turn.attachment.name}
                  </span>
                )}
                <ProtectedQuestion text={turn.query} ranges={turn.hiddenData ?? []} id={turn.id} />
              </p>
              {!!turn.hiddenData?.length && (
                <small className="chat-hidden-summary">
                  {turn.hiddenData.length === 1
                    ? '1 dato personal ocultado al modelo'
                    : `${turn.hiddenData.length} datos personales ocultados al modelo`}
                </small>
              )}
            </div>
            <div className="chat-assistant">
              {turn.blocks.map((block, index) => {
                const citations = [
                  ...new Map(
                    block.citations.map((c) => [
                      c.chunkId,
                      turn.evidence.find(
                        (e) => e.chunkId === c.chunkId && e.documentId === c.documentId,
                      ),
                    ]),
                  ).values(),
                ].filter((e): e is Evidence => !!e);
                const previousKind = turn.blocks[index - 1]?.claim.kind;
                const heading =
                  block.claim.kind !== previousKind
                    ? (
                        {
                          document: 'Documentación',
                          cost: 'Coste',
                          deadline: 'Plazos',
                        } as Record<string, string>
                      )[block.claim.kind]
                    : undefined;
                return (
                  <div className="chat-claim" key={block.claim.id}>
                    {heading && <h2>{heading}</h2>}
                    <div className={block.claim.kind === 'step' ? 'chat-step' : 'chat-fact'}>
                      {block.claim.kind === 'step' && (
                        <span className="chat-step-number">
                          {
                            turn.blocks.slice(0, index + 1).filter((b) => b.claim.kind === 'step')
                              .length
                          }
                          .
                        </span>
                      )}
                      <p>
                        {block.claim.text}
                        {citations.map((e) => (
                          <span key={e.chunkId}>
                            {' '}
                            <button
                              className="chat-inline-citation"
                              onClick={() =>
                                showSources(
                                  turn.evidence.filter((source) =>
                                    turn.blocks.some((b) =>
                                      b.citations.some((c) => c.chunkId === source.chunkId),
                                    ),
                                  ),
                                  e,
                                )
                              }
                              title={`Ver evidencia: ${e.title}`}
                            >
                              {e.organization}
                              <ArrowUpRight size={13} />
                            </button>
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                );
              })}
              {turn.state === 'loading' && (
                <div className="chat-thinking" role="status">
                  <span aria-hidden="true">
                    {turn.protecting ? 'Preparando todo…' : 'Pensando…'}
                  </span>
                  <span className="sr-only">
                    {turn.protecting ? 'Preparando todo.' : stages[turn.stage]}
                  </span>
                </div>
              )}
              {turn.result &&
                !turn.blocks.length &&
                (turn.result.answer.status === 'answered' ? (
                  <p>{turn.result.answer.answer}</p>
                ) : (
                  <div className="chat-notice" role="status">
                    <Info size={20} aria-hidden="true" />
                    <div>
                      <h2>
                        {turn.result.answer.status === 'needs_clarification'
                          ? 'Necesitamos un poco más de detalle'
                          : 'No hemos encontrado una respuesta verificada'}
                      </h2>
                      <p>{turn.result.answer.answer}</p>
                      <div className="chat-notice-actions">
                        {turnIndex === turns.length - 1 && (
                          <button className="chat-link-button" onClick={() => rephrase(turn.query)}>
                            <PencilLine size={15} aria-hidden="true" />
                            Reformular la pregunta
                          </button>
                        )}
                        {turn.evidence.length > 0 && (
                          <button
                            className="chat-link-button"
                            onClick={() => showSources(turn.evidence)}
                          >
                            Ver lo consultado ({turn.evidence.length})
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              {turn.result?.answer.incomplete && (
                <p className="chat-partial">
                  Las fuentes no permiten confirmar todos los detalles. Aquí aparecen únicamente los
                  que hemos podido verificar.
                </p>
              )}
              {turn.state === 'stopped' && (
                <div className="chat-stopped">
                  <p className="chat-partial" role="status">
                    Respuesta detenida.
                    {turn.blocks.length > 0 && ' Los fragmentos mostrados ya están verificados.'}
                  </p>
                  {turnIndex === turns.length - 1 && (
                    <button
                      className="chat-retry"
                      disabled={loading}
                      onClick={() => void send(turn.query, turn.id)}
                    >
                      <RotateCcw size={14} /> Volver a intentar
                    </button>
                  )}
                </div>
              )}
              {turn.state === 'error' && (
                <div className="chat-notice chat-error" role="alert">
                  <CircleAlert size={20} aria-hidden="true" />
                  <div>
                    <h2>No se ha podido completar la respuesta</h2>
                    <p>{turn.error}</p>
                    {turn.blocks.length > 0 && (
                      <p>
                        La respuesta está incompleta. Los fragmentos mostrados están verificados.
                      </p>
                    )}
                    {turnIndex === turns.length - 1 && (
                      <button disabled={loading} onClick={() => void send(turn.query, turn.id)}>
                        <RotateCcw size={15} /> Volver a intentar
                      </button>
                    )}
                  </div>
                </div>
              )}
              {turn.state !== 'loading' && <AnswerActions turn={turn} showSources={showSources} />}
              {turn.state === 'done' &&
                turn.result?.answer.status === 'answered' &&
                turnIndex === turns.length - 1 && (
                  <div className="chat-followups">
                    {['¿Qué documentación necesito?', '¿Dónde lo puedo tramitar?'].map((q) => (
                      <button key={q} onClick={() => void send(q)}>
                        {q}
                        <ArrowUpRight size={17} />
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </section>
        ))}
        <div ref={bottom} className="chat-bottom" />
      </main>
      <div ref={dock} className="chat-composer-dock">
        {showJump && (
          <button className="chat-jump" onClick={jump} aria-label="Ir al último mensaje">
            <ArrowDown size={18} />
          </button>
        )}
        {attachmentError && (
          <p className="chat-composer-error" role="alert">
            {attachmentError}
          </p>
        )}
        {(attachment || attachmentBusy) && (
          <div className="chat-attachment-preview">
            <div>
              <FileText size={20} />
              <span>{attachmentBusy ? 'Leyendo PDF…' : attachment?.name}</span>
              {attachment && !attachmentBusy && (
                <button
                  className="chat-icon"
                  onClick={() => setAttachment(undefined)}
                  aria-label="Quitar PDF"
                >
                  <X size={16} />
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
            </div>
            {loading ? (
              <button
                className="chat-send"
                type="button"
                onClick={() => active.current?.abort()}
                aria-label="Detener respuesta"
              >
                <Square size={13} fill="currentColor" />
              </button>
            ) : (
              <button
                className="chat-send"
                disabled={input.trim().length < 4 || attachmentBusy}
                aria-label="Enviar pregunta"
              >
                <ArrowUp size={20} />
              </button>
            )}
          </div>
        </form>
        {footer}
        <span className="sr-only">
          Las respuestas se basan en fuentes oficiales. Comprueba las citas antes de realizar el
          trámite.
        </span>
      </div>
      <SourceDialog
        view={sourceView}
        close={() => setSourceView(null)}
        select={(selected) => setSourceView((view) => (view ? { ...view, selected } : null))}
      />
    </div>
  );
}
