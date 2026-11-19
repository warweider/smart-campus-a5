import type { Verdict, ReasonCode } from '@/availability';
import { toHHMM, REASON_CODES, DAY_MINUTES } from '@/availability';

export { REASON_CODES };
export type { ReasonCode };

export type ExplainInput = {
  roomLabel: string;
  // null when the entered times are not a valid interval (M1): never invent a slot.
  start: number | null;
  end: number | null;
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
  let start: number | null = null;
  let end: number | null = null;
  if (r.start !== null || r.end !== null) {
    if (!Number.isInteger(r.start) || !Number.isInteger(r.end)) return null;
    start = r.start as number;
    end = r.end as number;
    if (start < 0 || start >= end || end > DAY_MINUTES) return null;
  }
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
  if (input.start === null || input.end === null) return `${input.roomLabel} (requested times)`;
  return `${input.roomLabel} ${toHHMM(input.start)}–${toHHMM(input.end)}`;
}

// M1: builds the explanation input from what the user actually entered.
// Times are passed on only if they form a valid interval 0 <= start < end <= 1440;
// otherwise start/end are null instead of clamped or inverted values.
export function buildExplainInput(
  roomLabel: string,
  startRaw: string,
  endRaw: string,
  verdict: Verdict,
): ExplainInput {
  const s = startRaw.trim();
  const e = endRaw.trim();
  const start = Number(s);
  const end = Number(e);
  const valid = /^\d+$/.test(s) && /^\d+$/.test(e) && start < end && end <= DAY_MINUTES;
  return {
    roomLabel,
    start: valid ? start : null,
    end: valid ? end : null,
    isAvailable: verdict.kind === 'available',
    reasonCode: deriveReasonCode(verdict),
  };
}

export const MAX_EXPLANATION_LENGTH = 300;
