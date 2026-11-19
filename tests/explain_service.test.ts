// M2 (risk R08): the explanation feature had no tests. These lock its safety contract.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { evaluate } from '../src/availability';
import { validateExplainInput, validateExplanation, type ExplainInput } from '../src/explain/contract';
import { getExplanation } from '../src/explain/explainService';

const OK: ExplainInput = { roomLabel: 'Room B-204', start: 800, end: 830, isAvailable: true, reasonCode: 'AVAILABLE' };

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('M2 input validation (untrusted adapter input)', () => {
  it('EX01 accepts a well-formed input', () => {
    expect(validateExplainInput(OK)).toEqual(OK);
  });
  it.each([
    ['null', null],
    ['unknown reason code', { ...OK, reasonCode: 'HACKED' }],
    ['empty room label', { ...OK, roomLabel: '   ' }],
    ['room label over 100 chars', { ...OK, roomLabel: 'x'.repeat(101) }],
    ['fractional minute', { ...OK, start: 800.5 }],
    ['start after end', { ...OK, start: 900, end: 800 }],
    ['end beyond 1440', { ...OK, end: 1441 }],
    ['only one time null', { ...OK, end: null }],
    ['isAvailable not boolean', { ...OK, isAvailable: 'yes' }],
  ])('EX02 rejects %s', (_name, raw) => {
    expect(validateExplainInput(raw)).toBeNull();
  });
});

describe('M2 output validation (untrusted adapter output)', () => {
  it.each([
    ['non-string', 42],
    ['empty', '   '],
    ['HTML markup', '<img src=x onerror=alert(1)>'],
    ['control character', 'line1\u0007line2'],
    ['longer than 300 chars', 'a'.repeat(301)],
  ])('EX03 rejects %s', (_name, raw) => {
    expect(validateExplanation(raw)).toBeNull();
  });
  it('EX04 trims and accepts plain text', () => {
    expect(validateExplanation('  Room is free.  ')).toBe('Room is free.');
  });
});

describe('M2 fallback behaviour', () => {
  it('EX05 normal mode uses the adapter answer', async () => {
    const r = await getExplanation(OK);
    expect(r.usedFallback).toBe(false);
    expect(r.output.explanation).toContain('Room B-204 13:20–13:50 is available');
  });
  it('EX06 adapter error (?mock=error) -> deterministic fallback', async () => {
    vi.stubGlobal('window', { location: { search: '?mock=error' } });
    const r = await getExplanation(OK);
    expect(r.usedFallback).toBe(true);
    expect(r.output.explanation).toBe('Fallback: Room B-204 13:20–13:50 is available under all booking rules.');
  });
  it('EX07 adapter slower than 3 s (?mock=timeout) -> fallback after the timeout', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('window', { location: { search: '?mock=timeout' } });
    const p = getExplanation(OK);
    await vi.advanceTimersByTimeAsync(3000);
    const r = await p;
    expect(r.usedFallback).toBe(true);
  });
  it('EX08 the explanation never changes the verdict (AC5)', async () => {
    const verdict = Object.freeze(evaluate('630', '690', 540, false, [{ start: 600, end: 660 }]));
    const before = structuredClone(verdict);
    await getExplanation({ ...OK, start: 630, end: 690, isAvailable: false, reasonCode: verdict.code });
    expect(verdict).toEqual(before);
  });
});
