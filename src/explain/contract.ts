import type { Verdict, ReasonCode } from '@/availability';
import { toHHMM, REASON_CODES } from '@/availability';

export { REASON_CODES };
export type { ReasonCode };

export type ExplainInput = {
  roomLabel: string;
  start: number;
  end: number;
  isAvailable: boolean;
  reasonCode: ReasonCode;
};

export type ExplainOutput = { explanation: string };

// The reason code now comes from the checker itself (Task 03). Before, it was
// guessed from the message text, so a wording change silently mislabelled verdicts.
export function deriveReasonCode(verdict: Verdict): ReasonCode {
  return verdict.code;
}

// Validates untrusted input; returns null when the shape is wrong.
export function validateExplainInput(raw: unknown): ExplainInput | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.roomLabel !== 'string') return null;
  const roomLabel = r.roomLabel.trim();
  if (roomLabel === '' || roomLabel.length > 100) return null;
  if (!Number.isInteger(r.start) || !Number.isInteger(r.end)) return null;
  const start = r.start as number;
  const end = r.end as number;
  if (start < 0 || end < 0 || start > 1440 || end > 1440) return null;
  if (typeof r.isAvailable !== 'boolean') return null;
  if (typeof r.reasonCode !== 'string') return null;
  if (!REASON_CODES.includes(r.reasonCode as ReasonCode)) return null;
  return {
    roomLabel,
    start,
    end,
    isAvailable: r.isAvailable,
    reasonCode: r.reasonCode as ReasonCode,
  };
}

function hasControlChars(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

// Validates untrusted adapter output: plain text, 1..300 chars,
// no HTML brackets and no control characters.
export function validateExplanation(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const text = raw.trim();
  if (text === '' || text.length > 300) return null;
  if (/[<>]/.test(text) || hasControlChars(text)) return null;
  return text;
}

export function describeSlot(input: ExplainInput): string {
  return `${input.roomLabel} ${toHHMM(input.start)}–${toHHMM(input.end)}`;
}

export const MAX_EXPLANATION_LENGTH = 300;
