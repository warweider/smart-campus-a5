// Task 03: the reason code comes from the checker, not from the message wording.
import { describe, it, expect } from 'vitest';
import { evaluate, type Booking } from '../src/availability';
import { deriveReasonCode } from '../src/explain/contract';

const NOW = 540;
const B: Booking[] = [{ start: 600, end: 660 }];

describe('Task 03 explicit reason codes', () => {
  it.each([
    ['800', '830', false, 'AVAILABLE'],
    ['630', '690', false, 'OVERLAP'],
    ['800', '830', true, 'BLOCKED'],
    ['', '700', false, 'INVALID_TIME'],
    ['abc', '700', false, 'INVALID_TIME'],
    ['1500', '1600', false, 'INVALID_TIME'],
    ['700', '650', false, 'INVALID_TIME'],
    ['500', '560', false, 'PAST_TIME'],
    ['800', '921', false, 'TOO_LONG'],
  ] as const)('RC %s-%s blocked=%s -> %s', (s, e, blocked, code) => {
    const v = evaluate(s, e, NOW, blocked, B);
    expect(v.code).toBe(code);
    expect(deriveReasonCode(v)).toBe(code);
  });

  it('RC10 the code does not depend on the message text', () => {
    expect(deriveReasonCode({ kind: 'unavailable', code: 'BLOCKED', reason: 'Reworded message' })).toBe('BLOCKED');
  });
});
