'use client';
import type { Evidence } from '@reforma-digital/core';
import { Button } from '@reforma-digital/design/sol';
import {
  Response,
  SourceCard,
  SourceDetail,
  SourceList,
  SourceSheet,
} from '@reforma-digital/design/sol/chat';
import { Icon } from './sol/icon';

export type SourceView = { evidence: Evidence[]; selected?: Evidence };

const longDate = (value: string) =>
  new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
const host = (url: string) => new URL(url).hostname.replace(/^www\./, '');
// Jurisdictions are ES, ES-<region> or ES-<region>-<municipality>.
const scope = (jurisdiction: string) =>
  ['Estatal', 'Autonómico', 'Local'][jurisdiction.split('-').length - 1] ?? jurisdiction;

export function Sources({
  view,
  onClose,
  onSelect,
}: {
  view: SourceView | null;
  onClose: () => void;
  onSelect: (selected?: Evidence) => void;
}) {
  const evidence = view?.evidence ?? [];
  const selected = view?.selected;
  const card = (e: Evidence) => (
    <SourceCard
      key={e.chunkId}
      title={e.title}
      meta={`${host(e.canonicalUrl)} · Fragmento ${evidence.indexOf(e) + 1}`}
      icon={<Icon name="chevronRight" size={16} />}
      onOpen={() => onSelect(e)}
    />
  );
  return (
    <SourceSheet
      open={!!view}
      view={selected ? `detail-${selected.chunkId}` : 'list'}
      title={selected ? 'Fragmento citado' : 'Fuentes'}
      onClose={onClose}
      back={
        selected && (
          <button type="button" className="chat-sheet-back" onClick={() => onSelect()}>
            <Icon name="chevronLeft" size={14} />
            Todas las fuentes
          </button>
        )
      }
      close={
        <button
          type="button"
          className="chat-sheet-close"
          onClick={onClose}
          aria-label="Cerrar fuentes"
        >
          <Icon name="cerrar" size={16} />
        </button>
      }
    >
      {selected ? (
        <SourceDetail
          eyebrow={`Fragmento citado · ${evidence.indexOf(selected) + 1}`}
          organization={selected.organization}
          title={selected.title}
          excerpt={<Response skipHtml>{selected.content}</Response>}
          meta={[
            { label: 'Ámbito', value: scope(selected.jurisdiction) },
            { label: 'Consultado', value: longDate(selected.crawledAt) },
            {
              label: 'Actualización de origen',
              value: selected.sourceUpdatedAt ? longDate(selected.sourceUpdatedAt) : 'No indicada',
            },
          ]}
          action={
            <Button href={selected.canonicalUrl} target="_blank" rel="noopener noreferrer">
              Abrir documento oficial
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
              <Icon name="arrowUpRight" size={16} />
            </Button>
          }
        >
          {evidence.length > 1 && (
            <SourceList title="Otras fuentes de esta respuesta">
              {evidence.filter((e) => e !== selected).map(card)}
            </SourceList>
          )}
        </SourceDetail>
      ) : (
        <>
          <h2 className="chat-sheet-title">Fuentes</h2>
          <SourceList
            title={`${evidence.length} ${evidence.length === 1 ? 'fragmento consultado' : 'fragmentos consultados'}`}
          >
            {evidence.map(card)}
          </SourceList>
        </>
      )}
    </SourceSheet>
  );
}
