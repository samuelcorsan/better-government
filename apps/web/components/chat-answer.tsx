'use client';
import { Fragment, type ReactNode } from 'react';
import type { ClaimKind, Evidence, VerifiedClaim } from '@reforma-digital/core';
import {
  Answer,
  AnswerHeading,
  DocumentItem,
  DocumentList,
  Fact,
  FigureGrid,
  KeyFigure,
  Notice,
  Response,
  Step,
  StepList,
  withCitations,
} from '@reforma-digital/design/sol/chat';
import { Icon } from './sol/icon';
import { AgencyBadge, SourcePopover } from './source-popover';
import type { ChatMessage } from '../lib/chat-message';
import type { HiddenRange } from '../lib/pii-display';

export type AnswerView = {
  blocks: VerifiedClaim[];
  evidence: Evidence[];
  hidden: HiddenRange[];
  text: string;
  streaming: boolean;
};

/** Collects the verified parts of an answer. A new part type does not compile without a case. */
export function readAnswer(message: ChatMessage | undefined): AnswerView {
  const view: AnswerView = { blocks: [], evidence: [], hidden: [], text: '', streaming: false };
  for (const part of message?.parts ?? []) {
    switch (part.type) {
      case 'data-claim':
        view.blocks.push(part.data);
        break;
      case 'data-evidence':
        view.evidence = part.data.items;
        break;
      case 'data-privacy':
        view.hidden = part.data.hidden;
        break;
      case 'text':
        view.text += part.text;
        view.streaming ||= part.state === 'streaming';
        break;
      // Stages are transient and the route never emits the remaining part types.
      case 'data-stage':
      case 'step-start':
      case 'reasoning':
      case 'reasoning-file':
      case 'source-url':
      case 'source-document':
      case 'file':
      case 'custom':
      case 'dynamic-tool':
        break;
      default: {
        const unhandled: never = part;
        throw new Error(`Unhandled message part: ${JSON.stringify(unhandled)}`);
      }
    }
  }
  return view;
}

/** Evidence cited by any block, in arrival order. */
export function citedEvidence(view: AnswerView): Evidence[] {
  const ids = new Set(view.blocks.flatMap((b) => b.citations.map((c) => c.chunkId)));
  return view.evidence.filter((e) => ids.has(e.chunkId));
}

type Layout = 'steps' | 'documents' | 'figures' | 'notice' | 'fact';

function layoutOf(kind: ClaimKind): Layout {
  switch (kind) {
    case 'step':
      return 'steps';
    case 'document':
      return 'documents';
    case 'cost':
    case 'deadline':
      return 'figures';
    case 'warning':
      return 'notice';
    case 'fact':
      return 'fact';
    default: {
      const unhandled: never = kind;
      throw new Error(`Unhandled claim kind: ${String(unhandled)}`);
    }
  }
}

/** Consecutive blocks that share a list or grid render inside one container. */
function group(blocks: VerifiedClaim[]) {
  const groups: { layout: Layout; blocks: VerifiedClaim[] }[] = [];
  for (const block of blocks) {
    const layout = layoutOf(block.claim.kind);
    const last = groups.at(-1);
    if (last?.layout === layout && layout !== 'notice' && layout !== 'fact')
      last.blocks.push(block);
    else groups.push({ layout, blocks: [block] });
  }
  return groups;
}

function BlockText({ block, evidence }: { block: VerifiedClaim; evidence: Evidence[] }) {
  const citations = [
    ...new Map(
      block.citations.map((c) => [
        c.chunkId,
        evidence.find((e) => e.chunkId === c.chunkId && e.documentId === c.documentId),
      ]),
    ).values(),
  ].filter((e): e is Evidence => !!e);
  const first = citations[0];
  if (!first) return <Response>{block.claim.text}</Response>;
  const sourceCount = new Set(citations.map((source) => source.documentId)).size;
  return (
    <Response
      renderCitation={() => (
        <SourcePopover
          className="chat-inline-citation"
          evidence={citations}
          href={first.canonicalUrl}
        >
          <AgencyBadge name={first.organization} url={first.canonicalUrl} />
          <span>{first.organization}</span>
          {sourceCount > 1 && <small>+{sourceCount - 1}</small>}
        </SourcePopover>
      )}
    >
      {withCitations(block.claim.text, [first.organization])}
    </Response>
  );
}

const figureLabels = { cost: 'Coste', deadline: 'Plazo' } as const;

export function AnswerBlocks({ view }: { view: AnswerView }) {
  if (!view.blocks.length) return null;
  let stepNumber = 0;
  const text = (block: VerifiedClaim) => <BlockText block={block} evidence={view.evidence} />;
  return (
    <Answer>
      {group(view.blocks).map(({ layout, blocks }) => {
        let content: ReactNode;
        switch (layout) {
          case 'steps':
            content = (
              <StepList start={stepNumber + 1}>
                {blocks.map((block) => (
                  <Step key={block.claim.id} number={++stepNumber}>
                    {text(block)}
                  </Step>
                ))}
              </StepList>
            );
            break;
          case 'documents':
            content = (
              <>
                <AnswerHeading>Documentación</AnswerHeading>
                <DocumentList>
                  {blocks.map((block) => (
                    <DocumentItem key={block.claim.id} icon={<Icon name="documento" size={18} />}>
                      {text(block)}
                    </DocumentItem>
                  ))}
                </DocumentList>
              </>
            );
            break;
          case 'figures':
            content = (
              <FigureGrid>
                {blocks.map((block) => (
                  <KeyFigure
                    key={block.claim.id}
                    label={block.claim.kind === 'cost' ? figureLabels.cost : figureLabels.deadline}
                    figure={block.claim.figure}
                  >
                    {text(block)}
                  </KeyFigure>
                ))}
              </FigureGrid>
            );
            break;
          case 'notice':
            content = (
              <Notice tone="warning" icon={<Icon name="info" size={20} />}>
                {text(blocks[0]!)}
              </Notice>
            );
            break;
          case 'fact':
            content = <Fact>{text(blocks[0]!)}</Fact>;
            break;
          default: {
            const unhandled: never = layout;
            throw new Error(`Unhandled layout: ${String(unhandled)}`);
          }
        }
        return <Fragment key={blocks[0]!.claim.id}>{content}</Fragment>;
      })}
    </Answer>
  );
}
