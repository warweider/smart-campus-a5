// Smart Campus room availability: pure logic extracted from src/App.tsx (evaluate / isStrictOverlap).
export interface Booking {
  start: number; // minutes after midnight
  end: number;
}

// Stable machine-readable reason for every verdict (Task 03: replaces parsing of message text).
export const REASON_CODES = [
  'AVAILABLE',
  'OVERLAP',
  'BLOCKED',
  'INVALID_TIME',
  'PAST_TIME',
  'TOO_LONG',
] as const;

export type ReasonCode = (typeof REASON_CODES)[number];

export type Verdict =
  | { kind: 'available'; code: 'AVAILABLE' }
  | { kind: 'unavailable'; code: 'OVERLAP' | 'BLOCKED'; reason: string }
  | { kind: 'error'; code: 'INVALID_TIME' | 'PAST_TIME' | 'TOO_LONG'; reason: string };

export const DAY_MINUTES = 1440;
export const MAX_DURATION = 120;

export function toHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function isStrictOverlap(a: Booking, b: Booking): boolean {
  // Intervals that only touch at an endpoint do NOT overlap (AC4).
  return a.start < b.end && b.start < a.end;
}

export function evaluate(
  startRaw: string,
  endRaw: string,
  now: number,
  blocked: boolean,
  bookings: Booking[],
): Verdict {
  const startTrim = startRaw.trim();
  const endTrim = endRaw.trim();
  if (startTrim === '' || endTrim === '') {
    return { kind: 'error', code: 'INVALID_TIME', reason: 'Please enter both a start and an end time.' };
  }
  // AC3: a blocked room is always Unavailable (Bolt Version 2).
  if (blocked) {
    return { kind: 'unavailable', code: 'BLOCKED', reason: 'This room is currently blocked for bookings.' };
  }
  if (!/^-?\d+$/.test(startTrim) || !/^-?\d+$/.test(endTrim)) {
    return { kind: 'error', code: 'INVALID_TIME', reason: 'Start and end must be whole numbers (minutes after midnight).' };
  }
  const start = Number(startTrim);
  const end = Number(endTrim);
  if (start < 0 || end < 0 || start > DAY_MINUTES || end > DAY_MINUTES) {
    return { kind: 'error', code: 'INVALID_TIME', reason: `Times must be between 0 and ${DAY_MINUTES} (00:00 and 24:00).` };
  }
  if (start >= end) {
    return { kind: 'error', code: 'INVALID_TIME', reason: 'Start must be earlier than end.' };
  }
  if (!(start > now)) {
    return { kind: 'error', code: 'PAST_TIME', reason: `Start must be after the current time (${toHHMM(now)} / ${now}).` };
  }
  const duration = end - start;
  if (duration > MAX_DURATION) {
    return { kind: 'error', code: 'TOO_LONG', reason: `Booking duration is ${duration} minutes. Maximum allowed is ${MAX_DURATION} minutes.` };
  }
  const requested = { start, end };
  // Sort by start so the scan visits bookings in time order.
  const conflict = [...bookings].sort((a, b) => a.start - b.start).find((b) => isStrictOverlap(requested, b));
  if (conflict) {
    return { kind: 'unavailable', code: 'OVERLAP', reason: `Overlaps an existing booking (${toHHMM(conflict.start)}–${toHHMM(conflict.end)}).` };
  }
  return { kind: 'available', code: 'AVAILABLE' };
}