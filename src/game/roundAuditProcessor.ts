import type {
  GameFlowResult,
} from './gameFlowEngine';

import {
  recordBallDrawn,
  recordPatternDetected,
  recordRoundClosed,
  recordRoundCreated,
  recordRoundStarted,
  recordSettlementPaid,
  recordWalletCredited,
} from './roundAuditLedger';

/**
 * Converts one already-processed game event into audit entries.
 *
 * This module does not change prizes or wallets.
 * It only records what already happened.
 */
export function auditGameFlowEvent(
  roundId: string,
  triggerNumber: number,
  flow: GameFlowResult,
) {
  recordRoundCreated(
    roundId,
  );

  recordRoundStarted(
    roundId,
  );

  recordBallDrawn(
    roundId,
    triggerNumber,
  );

  for (
    const category of
    flow.round.categories
  ) {
    for (
      const winner of
      category.winners
    ) {
      recordPatternDetected(
        roundId,
        triggerNumber,
        winner.userId,
        category.category,
      );
    }
  }

  for (
    const settlement of
    flow.round.settlements
  ) {
    if (
      settlement.status ===
        'paid' ||
      settlement.status ===
        'already-paid'
    ) {
      recordSettlementPaid(
        roundId,
        triggerNumber,
        settlement.category,
        settlement.totalGold,
        settlement.totalBB,
      );
    }

    for (
      const payout of
      settlement.payouts
    ) {
      recordWalletCredited(
        roundId,
        triggerNumber,
        payout.userId,
        payout.category,
        payout.gold,
        payout.bb,
      );
    }
  }

  if (
    flow.finished
  ) {
    recordRoundClosed(
      roundId,
      triggerNumber,
    );
  }

  return flow;
}
