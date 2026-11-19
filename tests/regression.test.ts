// Practice #10 regression tests for the two mitigated risks (R1 and R2).
import { describe, it, expect } from 'vitest';
import { evaluate, type Booking } from '../src/availability';
import appSource from '../src/App.tsx?raw';

const NOW = 540; // 09:00, same fixed scenario time as the UI
const UI_BOOKINGS: Booking[] = [{ start: 600, end: 660 }]; // same fixture as App.tsx

describe('R1 the UI uses the tested rules (single source of truth)', () => {
  it('RG01 App.tsx imports evaluate from @/availability', () => {
    expect(appSource).toMatch(/import\s*\{[^}]*\bevaluate\b[^}]*\}\s*from\s*'@\/availability'/);
  });
  it('RG02 App.tsx has no local copy of the booking rules', () => {
    expect(appSource).not.toMatch(/function\s+evaluate\s*\(/);
    expect(appSource).not.toMatch(/function\s+isStrictOverlap\s*\(/);
    expect(appSource).not.toMatch(/const\s+MAX_DURATION\s*=/);
  });
  it('RG03 the UI messages are produced by the tested module (AC6 wording kept)', () => {
    expect(evaluate('', '', NOW, false, UI_BOOKINGS)).toEqual({ kind: 'error', reason: 'Please enter both a start and an end time.' });
    expect(evaluate('500', '560', NOW, false, UI_BOOKINGS)).toEqual({ kind: 'error', reason: 'Start must be after the current time (09:00 / 540).' });
    expect(evaluate('630', '690', NOW, false, UI_BOOKINGS)).toEqual({ kind: 'unavailable', reason: 'Overlaps an existing booking (10:00–11:00).' });
    expect(evaluate('660', '720', NOW, false, UI_BOOKINGS)).toEqual({ kind: 'available' });
  });
});