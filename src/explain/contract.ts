import type { Verdict } from '@/availability';
import { toHHMM } from '@/availability';

export const REASON_CODES = [
  'AVAILABLE',
  'OVERLAP',
  'BLOCKED',
  'INVALID_TIME',
  'PAST_TIME',
  'TOO_LONG',
] as const;

export type ReasonCode = (typeof REASON_CODES)[number];

export type ExplainInput = {
  roomLabel: string;
  start: number;
  end: number;
  isAvailable: boolean;
  reasonCode: ReasonCode;
};

export type ExplainOutput = { explanation: string };

// Derives a stable reason code from the authoritative checker result
// without changing it. Matches on the tested AC6 wording prefixes.
export function deriveReasonCode(verdict: Verdict): ReasonCode {
  if (verdict.kind === 'available') return 'AVAILABLE';
  if (verdict.kind === 'unavailable') {
    return verdict.reason.startsWith('This room is currently blocked')
      ? 'BLOCKED'
      : 'OVERLAP';
  }
  if (verdict.reason.startsWith('Start must be after the current time')) return 'PAST_TIME';
  if (verdict.reason.startsWith('Booking duration is')) return 'TOO_LONG';
  return 'INVALID_TIME';
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
