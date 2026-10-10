'use client';
import { Fragment, type ReactNode } from 'react';
import type { ClaimKind, Evidence, VerifiedClaim } from '@reforma-digital/core';
import { Button } from '@reforma-digital/design/sol';
import {
  Answer,
  DetailCard,
  DetailGrid,
  Fact,
  Notice,
  Response,
  SourceChip,
  Step,
  StepList,
  WhereCard,
  withCitations,
} from '@reforma-digital/design/sol/chat';
import { Icon } from './sol/icon';
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

function sourcesOf(block: VerifiedClaim, evidence: Evidence[]): Evidence[] {
  return block.citations
    .map((c) => evidence.find((e) => e.chunkId === c.chunkId && e.documentId === c.documentId))
    .filter((e): e is Evidence => !!e);
}

type Section = 'steps' | 'details' | 'notice' | 'fact';

function sectionOf(kind: ClaimKind): Section {
  switch (kind) {
    case 'step':
      return 'steps';
    case 'document':
    case 'cost':
    case 'deadline':
      return 'details';
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

/**
 * Consecutive steps share one list. Documentation, cost and deadline share one grid, placed where
 * the first of them arrived, so the cards stay together however the model orders them.
 */
function sections(blocks: VerifiedClaim[]) {
  const out: { section: Section; blocks: VerifiedClaim[] }[] = [];
  for (const block of blocks) {
    const section = sectionOf(block.claim.kind);
    const target =
      section === 'details'
        ? out.find((s) => s.section === 'details')
        : section === 'steps' && out.at(-1)?.section === 'steps'
          ? out.at(-1)
          : undefined;
    if (target) target.blocks.push(block);
    else out.push({ section, blocks: [block] });
  }
  return out;
}

export function AnswerBlocks({
  view,
  onCite,
}: {
  view: AnswerView;
  onCite: (selected: Evidence) => void;
}) {
  if (!view.blocks.length) return null;
  let stepNumber = 0;
  const text = (block: VerifiedClaim) => {
    const first = sourcesOf(block, view.evidence)[0];
    if (!first) return <Response>{block.claim.text}</Response>;
    return (
      <Response
        renderCitation={(_, label) => (
          <SourceChip
            icon={<Icon name="arrowUpRight" size={12} />}
            title={`Ver el fragmento citado: ${first.title}`}
            onOpen={() => onCite(first)}
          >
            {label}
          </SourceChip>
        )}
      >
        {withCitations(block.claim.text, [first.organization])}
      </Response>
    );
  };
  const card = (kind: ClaimKind, label: string, blocks: VerifiedClaim[]) => {
    const ofKind = blocks.filter((b) => b.claim.kind === kind);
    if (!ofKind.length) return null;
    return (
      <DetailCard
        label={label}
        highlight={kind === 'cost'}
        figure={ofKind.length === 1 ? ofKind[0]!.claim.figure : undefined}
      >
        {ofKind.map((block) => (
          <Fragment key={block.claim.id}>{text(block)}</Fragment>
        ))}
      </DetailCard>
    );
  };
  // The page where the first step is done: the citation of that step.
  const firstStep = view.blocks.find((b) => b.claim.kind === 'step');
  const where = firstStep && sourcesOf(firstStep, view.evidence)[0];
  return (
    <Answer>
      {sections(view.blocks).map(({ section, blocks }) => {
        let content: ReactNode;
        switch (section) {
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
          case 'details':
            content = (
              <DetailGrid>
                {card('document', 'Documentación', blocks)}
                {card('cost', 'Coste', blocks)}
                {card('deadline', 'Plazos', blocks)}
              </DetailGrid>
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
            const unhandled: never = section;
            throw new Error(`Unhandled section: ${String(unhandled)}`);
          }
        }
        return <Fragment key={blocks[0]!.claim.id}>{content}</Fragment>;
      })}
      {where && (
        <WhereCard
          label="Dónde se hace"
          title={`${where.title} · ${where.organization}`}
          description={<span className="t-dato">{new URL(where.canonicalUrl).hostname}</span>}
          action={
            <Button href={where.canonicalUrl} target="_blank" rel="noopener noreferrer">
              Abrir la web oficial
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
              <Icon name="arrowUpRight" size={16} />
            </Button>
          }
        />
      )}
    </Answer>
  );
}
