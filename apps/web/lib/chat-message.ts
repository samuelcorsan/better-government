import type { UIMessage } from 'ai';
import type { Answer, Evidence, Region, Stage, VerifiedClaim } from '@reforma-digital/core';
import type { PdfContext } from './attachment';
import type { HiddenRange } from './pii-display';

export type ChatMetadata = {
  /** Set by the server on assistant messages. */
  searchId?: string;
  feedbackToken?: string | null;
  status?: Answer['status'];
  incomplete?: boolean;
  region?: Region | null;
  /** Kept in the browser on user messages; only its protected text is sent as context. */
  attachment?: PdfContext;
};

export type ChatData = {
  /** Written by the browser transport: spans of the question that never left the device. */
  privacy: { hidden: HiddenRange[] };
  /** Transient: only delivered through onData while the answer is being prepared. */
  stage: { stage: Stage };
  evidence: { items: Evidence[] };
  /** One verified answer block; its part id is the claim id. */
  claim: VerifiedClaim;
};

/** The chat exposes no model tools: every component comes from a verified data part. */
export type ChatMessage = UIMessage<ChatMetadata, ChatData, Record<never, never>>;
