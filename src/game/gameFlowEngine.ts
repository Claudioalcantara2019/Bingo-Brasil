import {
  processRoundEvent,
  type RoundInput,
  type RoundSettlementResult,
} from './roundEngine';

import {
  processRoundPayouts,
  type PayoutProcessorResult,
} from './payoutProcessor';

export type GameFlowResult = {
  round:
    RoundSettlementResult;

  payout:
    PayoutProcessorResult;

  finished:
    boolean;
};

/**
 * Runs one complete server-side-style event through the local domain layers.
 *
 * This is intentionally a domain orchestrator:
 * - it does not generate the random ball;
 * - it does not detect card patterns itself;
 * - it receives already-confirmed candidates;
 * - it does not touch the UI.
 */
export function processGameEvent(
  input: RoundInput,
): GameFlowResult {
  const round =
    processRoundEvent(
      input,
    );

  const payout =
    processRoundPayouts(
      round,
    );

  return {
    round,
    payout,
    finished:
      round.roundClosed,
  };
}
