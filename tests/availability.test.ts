import { describe, it, expect, beforeEach } from 'vitest';
import { evaluate, isStrictOverlap, type Booking } from '../src/availability';

// Fixed clock and fresh fixtures for every test (no shared state between tests).
const NOW = 540; // 09:00
let bookings: Booking[];
let snapshot: Booking[];

beforeEach(() => {
  bookings = [
    { start: 700, end: 760 },
    { start: 600, end: 660 },
  ]; // deliberately NOT sorted by start
  snapshot = structuredClone(bookings);
});

describe('AC1 time validation', () => {
  it('T01 rejects start >= end', () => {
    expect(evaluate('700', '650', NOW, false, bookings).kind).toBe('error');
  });
  it('T02 rejects a start that is not after now', () => {
    expect(evaluate('540', '570', NOW, false, bookings).kind).toBe('error');
  });
  it('T03 rejects non-integer input', () => {
    expect(evaluate('600.5', '620', NOW, false, bookings).kind).toBe('error');
  });
});

describe('AC2 maximum duration', () => {
  it('T04 allows exactly 120 minutes', () => {
    expect(evaluate('800', '920', NOW, false, bookings).kind).toBe('available');
  });
  it('T05 rejects 121 minutes', () => {
    expect(evaluate('800', '921', NOW, false, bookings).kind).toBe('error');
  });
});

describe('AC3 blocked room', () => {
  it('T06 rejects every request for a blocked room', () => {
    expect(evaluate('800', '830', NOW, true, bookings).kind).toBe('unavailable');
  });
});

describe('AC4 overlap', () => {
  it('T07 rejects a real overlap', () => {
    expect(evaluate('630', '690', NOW, false, bookings).kind).toBe('unavailable');
  });
  it('T08 allows a booking that touches the end of an existing one (660-700)', () => {
    expect(evaluate('660', '700', NOW, false, bookings).kind).toBe('available');
  });
  it('T09 allows a booking that touches the start of an existing one (560-600)', () => {
    expect(evaluate('560', '600', NOW, false, bookings).kind).toBe('available');
  });
  it('T10 isStrictOverlap is false for touching endpoints', () => {
    expect(isStrictOverlap({ start: 660, end: 700 }, { start: 600, end: 660 })).toBe(false);
  });
});

describe('AC5 result and non-mutation', () => {
  it('T11 returns Available for a free slot', () => {
    expect(evaluate('800', '830', NOW, false, bookings)).toEqual({ kind: 'available', code: 'AVAILABLE' });
  });
  it('T12 does not change the bookings array (order and values)', () => {
    evaluate('630', '690', NOW, false, bookings);
    evaluate('800', '830', NOW, false, bookings);
    expect(bookings).toEqual(snapshot);
  });
});
