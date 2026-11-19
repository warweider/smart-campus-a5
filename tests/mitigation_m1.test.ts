// M1 (risk R01 + R02): the explanation must describe only what the user entered.
import { describe, it, expect } from 'vitest';
import { evaluate, type Booking } from '../src/availability';
import { buildExplainInput, describeSlot } from '../src/explain/contract';
import { getExplanation } from '../src/explain/explainService';

const NOW = 540;
const B: Booking[] = [{ start: 600, end: 660 }];
const ROOM = 'Room B-204';

function explainFor(s: string, e: string, blocked = false) {
  const verdict = evaluate(s, e, NOW, blocked, B);
  return { verdict, input: buildExplainInput(ROOM, s, e, verdict) };
}

describe('M1 no invented or inverted slot in the explanation', () => {
  it.each([
    ['abc', '700', false],
    ['abc', 'def', false],
    ['1500', '1600', false],
    ['900', '700', false],
    ['-5', '30', false],
    ['abc', 'xyz', true],
    ['800', '700', true],
  ] as const)('M1-%#: %s-%s blocked=%s -> no times in the explanation', async (s, e, blocked) => {
    const { input } = explainFor(s, e, blocked);
    expect(input.start).toBeNull();
    expect(input.end).toBeNull();
    const r = await getExplanation(input);
    expect(r.output.explanation).not.toMatch(/\d\d:\d\d/);
    expect(r.output.explanation).toContain('(requested times)');
  });

  it('M1-valid: a valid interval keeps the real times', async () => {
    const { input } = explainFor('630', '690');
    expect(input).toMatchObject({ start: 630, end: 690, reasonCode: 'OVERLAP', isAvailable: false });
    expect(describeSlot(input)).toBe('Room B-204 10:30–11:30');
  });

  it('M1-blocked-valid: blocked room with valid times keeps the times', () => {
    const { input } = explainFor('800', '830', true);
    expect(input).toMatchObject({ start: 800, end: 830, reasonCode: 'BLOCKED' });
  });
});

describe('M1 INVALID_TIME explanation passes its own output validator (risk R09)', () => {
  it('M1-10 the adapter answer is used, not the fallback', async () => {
    const r = await getExplanation({ roomLabel: ROOM, start: 900, end: 960, isAvailable: false, reasonCode: 'INVALID_TIME' });
    expect(r.usedFallback).toBe(false);
  });
});
