'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent,
  type FocusEvent,
} from 'react';
import { createPortal } from 'react-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Icono } from './sol/icono';
import type { Evidence } from '@reforma-digital/core';
import './source-popover.css';

export function AgencyBadge({ name, url }: { name: string; url: string }) {
  const domain = new URL(url).hostname;
  const [failedDomain, setFailedDomain] = useState<string | null>(null);
  const initials =
    name
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'ES';
  return (
    <span className="agency-badge" aria-hidden="true">
      {failedDomain === domain ? (
        initials
      ) : (
        <img
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`}
          alt=""
          width={32}
          height={32}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailedDomain(domain)}
        />
      )}
    </span>
  );
}

export function SourcePopover({
  evidence,
  children,
  className,
  href,
}: {
  evidence: Evidence[];
  children: ReactNode;
  className: string;
  href?: string;
}) {
  const id = useId();
  const trigger = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => clearTimeout(closeTimer.current);
  }, []);
  useEffect(() => {
    if (!open) return;
    function dismiss(event: Event) {
      if (event.target instanceof Node && panel.current?.contains(event.target)) return;
      if (panel.current?.matches(':popover-open')) panel.current.hidePopover();
    }
    window.addEventListener('resize', dismiss);
    window.addEventListener('scroll', dismiss, true);
    return () => {
      window.removeEventListener('resize', dismiss);
      window.removeEventListener('scroll', dismiss, true);
    };
  }, [open]);

  function keepOpen() {
    clearTimeout(closeTimer.current);
  }
  function closeLater() {
    keepOpen();
    closeTimer.current = setTimeout(() => {
      if (
        trigger.current === document.activeElement ||
        panel.current?.contains(document.activeElement)
      )
        return;
      if (panel.current?.matches(':popover-open')) panel.current.hidePopover();
    }, 180);
  }
  function position() {
    const button = trigger.current;
    const popover = panel.current;
    if (!button || !popover) return;
    const rect = button.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - 24;
    const above = rect.top - 24;
    const showBelow = below >= 200 || below >= above;
    popover.style.left = `${Math.max(16, Math.min(rect.left, window.innerWidth - Math.min(320, window.innerWidth - 32) - 16))}px`;
    popover.style.top = showBelow ? `${rect.bottom + 8}px` : 'auto';
    popover.style.bottom = showBelow ? 'auto' : `${window.innerHeight - rect.top + 8}px`;
    popover.style.maxHeight = `${Math.min(360, Math.max(0, showBelow ? below : above))}px`;
  }
  function show(source: HTMLElement) {
    keepOpen();
    if (!panel.current?.matches(':popover-open')) panel.current?.showPopover({ source });
  }
  const triggerProps = {
    className,
    'aria-haspopup': 'dialog' as const,
    'aria-controls': id,
    'aria-expanded': open,
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse') show(event.currentTarget);
    },
    onPointerLeave: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse') closeLater();
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      keepOpen();
      if (href) show(event.currentTarget);
    },
    onBlur: closeLater,
  };
  const documents = new Map<string, Evidence>();
  for (const item of evidence) {
    if (!documents.has(item.documentId)) documents.set(item.documentId, item);
  }
  return (
    <>
      {href ? (
        <a
          ref={(element) => {
            trigger.current = element;
          }}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          {...triggerProps}
        >
          {children}
        </a>
      ) : (
        <button
          ref={(element) => {
            trigger.current = element;
          }}
          type="button"
          popoverTarget={id}
          popoverTargetAction="show"
          {...triggerProps}
        >
          {children}
        </button>
      )}
      {mounted &&
        createPortal(
          <div
            ref={panel}
            id={id}
            popover="auto"
            role="dialog"
            aria-label="Fuentes oficiales"
            className="source-popover"
            onBeforeToggle={(event) => {
              if (event.newState === 'open') position();
            }}
            onToggle={(event) => setOpen(event.newState === 'open')}
            onPointerEnter={keepOpen}
            onPointerLeave={(event) => {
              if (event.pointerType === 'mouse') closeLater();
            }}
            onFocus={keepOpen}
            onBlur={closeLater}
          >
            <ul>
              {[...documents.values()].map((source) => (
                <li key={source.documentId}>
                  <a
                    href={source.canonicalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="source-popover-card"
                  >
                    <div className="source-popover-agency">
                      <AgencyBadge name={source.organization} url={source.canonicalUrl} />
                      <span>
                        {source.organization}
                        <small>{new URL(source.canonicalUrl).hostname}</small>
                      </span>
                    </div>
                    <strong className="source-popover-title">
                      {source.title} <Icono n="derecha" size={14} />
                    </strong>
                    <div className="source-popover-excerpt">
                      <Markdown
                        remarkPlugins={[remarkGfm]}
                        skipHtml
                        components={{
                          a: ({ children: text }) => <span>{text}</span>,
                          img: () => null,
                          input: () => null,
                        }}
                      >
                        {source.content}
                      </Markdown>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
}
