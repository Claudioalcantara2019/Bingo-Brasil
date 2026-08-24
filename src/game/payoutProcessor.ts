import {
  type RoundSettlementResult,
} from './roundEngine';

import {
  creditWallet,
  type WalletLedgerResult,
} from './walletLedger';

export type PayoutProcessorResult = {
  status:
    | 'processed'
    | 'already-processed'
    | 'rejected';

  roundId: string;

  credits: WalletLedgerResult[];

  totalGoldCredited: number;
  totalBBCredited: number;
};

/**
 * Converts the settled payouts of a round into wallet credits.
 *
 * The same settlementKey is preserved at player level so the
 * walletLedger provides the final idempotency guard.
 */
export function processRoundPayouts(
  round: RoundSettlementResult,
): PayoutProcessorResult {
  if (
    !round.roundId ||
    round.settlements.length === 0
  ) {
    return {
      status: 'rejected',
      roundId:
        round.roundId,
      credits: [],
      totalGoldCredited: 0,
      totalBBCredited: 0,
    };
  }

  const credits: WalletLedgerResult[] =
    [];

  for (
    const settlement of
    round.settlements
  ) {
    if (
      settlement.status !==
      'paid'
    ) {
      continue;
    }

    for (
      const payout of
      settlement.payouts
    ) {
      const settlementKey =
        settlement.settlementKey;

      const credit =
        creditWallet({
          userId:
            payout.userId,
          settlementKey,
          gold:
            payout.gold,
          bb:
            payout.bb,
        });

      credits.push(
        credit,
      );
    }
  }

  const totalGoldCredited =
    credits.reduce(
      (sum, credit) =>
        sum +
        (credit.status ===
        'credited'
          ? credit.entry?.gold ??
            0
          : 0),
      0,
    );

  const totalBBCredited =
    credits.reduce(
      (sum, credit) =>
        sum +
        (credit.status ===
        'credited'
          ? credit.entry?.bb ??
            0
          : 0),
      0,
    );

  const processedCount =
    credits.filter(
      (credit) =>
        credit.status ===
        'credited',
    ).length;

  const alreadyProcessedCount =
    credits.filter(
      (credit) =>
        credit.status ===
        'already-credited',
    ).length;

  const paidSettlementCount =
    round.settlements.filter(
      (settlement) =>
        settlement.status ===
          'paid' ||
        settlement.status ===
          'already-paid',
    ).length;

  const alreadyPaidSettlementCount =
    round.settlements.filter(
      (settlement) =>
        settlement.status ===
        'already-paid',
    ).length;

  let status:
    | 'processed'
    | 'already-processed'
    | 'rejected';

  if (
    processedCount > 0
  ) {
    status =
      'processed';
  } else if (
    alreadyProcessedCount >
      0 ||
    (
      paidSettlementCount > 0 &&
      alreadyPaidSettlementCount ===
        paidSettlementCount
    )
  ) {
    /*
     * No new wallet credit was required because
     * every paid settlement was already finalized.
     */
    status =
      'already-processed';
  } else {
    status =
      'rejected';
  }

  return {
    status,
    roundId:
      round.roundId,
    credits,
    totalGoldCredited,
    totalBBCredited,
  };
}
