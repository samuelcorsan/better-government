'use client';
import { memo, type ComponentProps, type CSSProperties, type ReactNode } from 'react';
import { Streamdown, type Components, type ExtraProps } from 'streamdown';

/**
 * Sol chat building blocks (GUIA.md · Chat). Presentational only: the app decides which verified
 * block each one renders and passes the icons in (Icon lives in apps/web). Styles in chat.css.
 */

const join = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

/* ─── Markdown ─────────────────────────────────────────────────────────────── */

const prose: Components = {
  p: ({ children }) => <p>{children}</p>,
  h1: ({ children }) => <h1 className="chat-md-heading">{children}</h1>,
  h2: ({ children }) => <h2 className="chat-md-heading">{children}</h2>,
  h3: ({ children }) => <h3 className="chat-md-heading">{children}</h3>,
  h4: ({ children }) => <h4 className="chat-md-heading">{children}</h4>,
  h5: ({ children }) => <h5 className="chat-md-heading">{children}</h5>,
  h6: ({ children }) => <h6 className="chat-md-heading">{children}</h6>,
  ul: ({ children }) => <ul>{children}</ul>,
  ol: ({ children }) => <ol>{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => <strong>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  hr: () => <hr />,
  table: ({ children }) => (
    <div className="chat-md-table">
      <table>{children}</table>
    </div>
  ),
  inlineCode: ({ children }) => <code>{children}</code>,
  // Quoted content is read here and opened on the official site: no links, images or checkboxes.
  a: ({ children }) => <span>{children}</span>,
  img: () => null,
  input: () => null,
};

type CitationTag = ComponentProps<'span'> & ExtraProps & { index?: string };

/**
 * Markdown for answers and official excerpts, rendered with Streamdown. While tokens arrive it
 * repairs unterminated syntax and reveals each word; finished content renders in static mode.
 */
export const Response = memo(function Response({
  children,
  streaming = false,
  skipHtml = false,
  renderCitation,
  className,
}: {
  children: string;
  streaming?: boolean;
  /** HTML from official sites is never rendered. */
  skipHtml?: boolean;
  /** Renders the `<rd-cite index="n">` tags added by withCitations, never by the model. */
  renderCitation?: (index: number, label: ReactNode) => ReactNode;
  className?: string;
}) {
  return (
    <Streamdown
      className={join('chat-md', className)}
      mode={streaming ? 'streaming' : 'static'}
      isAnimating={streaming}
      animated={{ animation: 'reveal', duration: 240, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
      skipHtml={skipHtml}
      controls={false}
      {...(renderCitation
        ? {
            allowedTags: { 'rd-cite': ['index'] },
            literalTagContent: ['rd-cite'],
            components: {
              ...prose,
              'rd-cite': ({ index, children: label }: CitationTag) =>
                renderCitation(Number(index), label),
            },
          }
        : { components: prose })}
    >
      {children}
    </Streamdown>
  );
});

const escapeTag = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Appends citations after the verified text so they flow with its last line. */
export function withCitations(text: string, labels: readonly string[]): string {
  return labels.reduce(
    (out, label, index) => `${out} <rd-cite index="${index}">${escapeTag(label)}</rd-cite>`,
    text,
  );
}

/* ─── Conversation ─────────────────────────────────────────────────────────── */

export function UserMessage({
  children,
  attachment,
  note,
}: {
  children: ReactNode;
  attachment?: ReactNode;
  /** Summary under the bubble, e.g. the personal data hidden from the model. */
  note?: ReactNode;
}) {
  return (
    <div className="chat-user">
      <p className="chat-bubble">
        {attachment && <span className="chat-attached-message">{attachment}</span>}
        {children}
      </p>
      {note && <small className="chat-note chat-enter">{note}</small>}
    </div>
  );
}

/** Activity indicator: the shimmer says work is pending; the stage crossfades when it changes. */
export function Thinking({ label, stage }: { label: string; stage?: string }) {
  return (
    <div className="chat-thinking" role="status">
      <span className="chat-shimmer">{label}</span>
      {stage && (
        <span key={stage} className="chat-stage">
          {stage}
        </span>
      )}
    </div>
  );
}

const noticeBoxes = { info: 'caja-plana', warning: 'caja-aviso', error: 'caja-error' } as const;

export function Notice({
  tone,
  icon,
  title,
  children,
  actions,
  role,
}: {
  tone: keyof typeof noticeBoxes;
  icon: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  role?: 'status' | 'alert';
}) {
  return (
    <div className={join('chat-notice chat-enter', noticeBoxes[tone])} role={role}>
      {icon}
      <div>
        {title && <strong className="chat-notice-title">{title}</strong>}
        {children}
        {actions && <div className="chat-notice-actions">{actions}</div>}
      </div>
    </div>
  );
}

/* ─── Answer blocks ────────────────────────────────────────────────────── */

export function Answer({ children }: { children: ReactNode }) {
  return <div className="chat-answer">{children}</div>;
}

export function AnswerHeading({ children }: { children: ReactNode }) {
  return <h2 className="chat-section-label t-etiqueta chat-enter">{children}</h2>;
}

export function StepList({ start, children }: { start: number; children: ReactNode }) {
  return (
    <ol className="chat-steps" start={start}>
      {children}
    </ol>
  );
}

export function Step({ number, children }: { number: number; children: ReactNode }) {
  return (
    <li className="chat-step chat-enter">
      <span className="chat-step-number t-dato">
        {number}
        <span className="sr-only">.</span>
      </span>
      <div>{children}</div>
    </li>
  );
}

export function DocumentList({ children }: { children: ReactNode }) {
  return <ul className="chat-documents">{children}</ul>;
}

export function DocumentItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="chat-document chat-enter">
      {icon}
      <div>{children}</div>
    </li>
  );
}

export function FigureGrid({ children }: { children: ReactNode }) {
  return <div className="chat-figures">{children}</div>;
}

/** Cost or deadline: the literal figure set large, with the sentence that cites it below. */
export function KeyFigure({
  label,
  figure,
  children,
}: {
  label: string;
  figure?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="chat-figure caja-gris chat-enter">
      <p className="t-etiqueta">{label}</p>
      {figure && <p className="chat-figure-value t-cifra">{figure}</p>}
      <div className={figure ? 'chat-figure-detail' : undefined}>{children}</div>
    </div>
  );
}

export function Fact({ children }: { children: ReactNode }) {
  return <div className="chat-fact chat-enter">{children}</div>;
}

/* ─── Controls ─────────────────────────────────────────────────────────────── */

export function Suggestions({ children }: { children: ReactNode }) {
  return <div className="chat-followups">{children}</div>;
}

/** Example or follow-up question. `index` staggers its entrance after the previous one. */
export function Suggestion({
  children,
  icon,
  index = 0,
  onSelect,
}: {
  children: string;
  icon: ReactNode;
  index?: number;
  onSelect: (question: string) => void;
}) {
  return (
    <button
      type="button"
      className="chat-suggestion"
      style={{ '--index': index } as CSSProperties}
      onClick={() => onSelect(children)}
    >
      {children}
      {icon}
    </button>
  );
}

/**
 * Two glyphs in the same spot: the inactive one shrinks and blurs out as the other arrives, so
 * send/stop and copy/copied switch without the control jumping.
 */
export function IconSwap({ active, a, b }: { active: 'a' | 'b'; a: ReactNode; b: ReactNode }) {
  return (
    <span className="icon-swap" data-active={active}>
      <span className="icon-swap-a">{a}</span>
      <span className="icon-swap-b">{b}</span>
    </span>
  );
}

/** Jump to the latest message. Stays mounted so showing and hiding can interrupt each other. */
export function JumpButton({
  visible,
  onClick,
  children,
}: {
  visible: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="chat-jump"
      data-visible={visible}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      onClick={onClick}
      aria-label="Ir al último mensaje"
    >
      {children}
    </button>
  );
}
