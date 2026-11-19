import { MAX_DURATION } from '@/availability';
import {
  validateExplainInput,
  validateExplanation,
  describeSlot,
  type ExplainInput,
  type ExplainOutput,
} from './contract';

export type MockMode = 'ok' | 'error' | 'timeout';

export function getMockMode(
  search: string = typeof window !== 'undefined' ? window.location.search : '',
): MockMode {
  const value = new URLSearchParams(search).get('mock');
  return value === 'error' || value === 'timeout' ? value : 'ok';
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Built only from the structured input — never from free text.
function composeExplanation(input: ExplainInput): string {
  const slot = describeSlot(input);
  switch (input.reasonCode) {
    case 'AVAILABLE':
      return `${slot} is available. The request starts after the current time, stays within the day, is at most ${MAX_DURATION} minutes long, and does not overlap any existing booking.`;
    case 'OVERLAP':
      return `${slot} is unavailable because the requested slot overlaps an existing booking. Touching endpoints would be allowed, but this request crosses one.`;
    case 'BLOCKED':
      return `${slot} is unavailable because the room is currently blocked; every request is declined while the block is active.`;
    case 'PAST_TIME':
      return `${slot} was rejected because the start time is not after the current time.`;
    case 'TOO_LONG':
      return `${slot} was rejected because it is longer than the maximum allowed duration of ${MAX_DURATION} minutes.`;
    case 'INVALID_TIME':
      return `${slot} could not be checked because the times are invalid. Enter whole minutes from 0 to 1440, with the start before the end.`;
  }
}

export async function mockExplainAdapter(raw: unknown): Promise<ExplainOutput> {
  const input = validateExplainInput(raw);
  if (!input) throw new Error('mock adapter: invalid input');

  const mode = getMockMode();
  if (mode === 'error') {
    await delay(300);
    throw new Error('mock adapter: simulated failure');
  }
  await delay(mode === 'timeout' ? 5000 : 600);

  const explanation = validateExplanation(composeExplanation(input));
  if (!explanation) throw new Error('mock adapter: invalid output');
  return { explanation };
}
