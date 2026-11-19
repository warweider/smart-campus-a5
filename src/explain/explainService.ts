import {
  validateExplanation,
  describeSlot,
  MAX_EXPLANATION_LENGTH,
  type ExplainInput,
  type ExplainOutput,
} from './contract';
import { mockExplainAdapter } from './mockAdapter';

const TIMEOUT_MS = 3000;

export type ExplainResult = {
  output: ExplainOutput;
  usedFallback: boolean;
};

// Deterministic fallback, built only from the structured input.
function fallbackExplanation(input: ExplainInput): string {
  const slot = describeSlot(input);
  switch (input.reasonCode) {
    case 'AVAILABLE':
      return `Fallback: ${slot} is available under all booking rules.`;
    case 'OVERLAP':
      return `Fallback: ${slot} is unavailable because it overlaps an existing booking.`;
    case 'BLOCKED':
      return `Fallback: ${slot} is unavailable because the room is blocked.`;
    case 'PAST_TIME':
      return `Fallback: the start time for ${slot} is not after the current time.`;
    case 'TOO_LONG':
      return `Fallback: the requested booking at ${slot} exceeds the maximum duration.`;
    case 'INVALID_TIME':
      return `Fallback: the times for ${slot} are invalid and were not checked.`;
  }
}

export async function getExplanation(input: ExplainInput): Promise<ExplainResult> {
  try {
    const result = await Promise.race([
      mockExplainAdapter(input),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('explanation timed out')), TIMEOUT_MS),
      ),
    ]);
    const explanation = validateExplanation(result.explanation);
    if (!explanation || explanation.length > MAX_EXPLANATION_LENGTH) {
      throw new Error('explanation service returned invalid output');
    }
    return { output: { explanation }, usedFallback: false };
  } catch {
    return { output: { explanation: fallbackExplanation(input) }, usedFallback: true };
  }
}
