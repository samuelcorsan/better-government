'use client';
import { useRef } from 'react';
import { Icono } from './sol/icono';
import { readPdfContext, type PdfContext } from '../lib/attachment';
export function AttachmentPicker({
  busy,
  disabled,
  onBusy,
  onAttachment,
  onError,
}: {
  busy: boolean;
  disabled: boolean;
  onBusy: (v: boolean) => void;
  onAttachment: (value: PdfContext) => void;
  onError: (v: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        type="file"
        accept="application/pdf,.pdf"
        ref={input}
        hidden
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (!file) return;
          onBusy(true);
          onError('');
          try {
            if (file.size > 5 * 1024 * 1024)
              throw new Error('El PDF debe ocupar como máximo 5 MB.');
            onAttachment(await readPdfContext(file.name, new Uint8Array(await file.arrayBuffer())));
          } catch (error) {
            onError(error instanceof Error ? error.message : 'No se ha podido leer el PDF.');
          } finally {
            onBusy(false);
          }
        }}
      />
      <button
        type="button"
        className="chat-icon chat-attach"
        disabled={disabled || busy}
        onClick={() => input.current?.click()}
        aria-label="Adjuntar PDF"
        title="Adjuntar PDF · Hasta 5 MB y 20 páginas"
      >
        <Icono n="documento" size={21} />
      </button>
    </>
  );
}
