export type SettlementWinner = {
  userId: string;
  cardId: string;
};

export type SettlementInput = {
  roundId: string;
  category:
    | 'terno'
    | 'quadra'
    | 'linha'
    | 'dupla'
    | 'bingo';
  triggerNumber: number;
  winners: SettlementWinner[];

  prizeGold: number;
  prizeBB: number;

  /**
   * External idempotency key.
   * In the real server, the same key must never be settled twice.
   */
  settlementKey: string;
};

export type PlayerSettlement = {
  userId: string;
  cardId: string;

  gold: number;
  bb: number;

  category:
    | 'terno'
    | 'quadra'
    | 'linha'
    | 'dupla'
    | 'bingo';

  triggerNumber: number;
};

export type SettlementResult = {
  roundId: string;
  settlementKey: string;

  category:
    | 'terno'
    | 'quadra'
    | 'linha'
    | 'dupla'
    | 'bingo';

  status: 'paid' | 'already-paid' | 'rejected';

  totalGold: number;
  totalBB: number;

  payouts: PlayerSettlement[];

  /**
   * Deterministic residuals caused only by integer division.
   * They must never be lost.
   */
  goldResidual: number;
  bbResidual: number;
};

function uniqueWinners(
  winners: SettlementWinner[],
): SettlementWinner[] {
  const seen = new Set<string>();
  const result: SettlementWinner[] = [];

  for (const winner of winners) {
    if (seen.has(winner.userId)) {
      continue;
    }

    seen.add(winner.userId);
    result.push(winner);
  }

  return result;
}

/**
 * Divides an integer pool evenly among all unique winners.
 *
 * Any indivisible remainder is returned as residual so the server
 * can carry it into the round accumulator instead of destroying it.
 */
function splitEvenly(
  total: number,
  count: number,
): {
  share: number;
  residual: number;
} {
  const safeTotal = Math.max(
    0,
    Math.floor(total),
  );

  if (count <= 0) {
    return {
      share: 0,
      residual: safeTotal,
    };
  }

  const share = Math.floor(
    safeTotal / count,
  );

  const residual =
    safeTotal -
    share * count;

  return {
    share,
    residual,
  };
}

/**
 * In-memory idempotency guard for local testing.
 *
 * The real server will persist this key in its transaction table.
 */
const settledKeys = new Set<string>();

export function clearSettlementTestStore() {
  settledKeys.clear();
}

export function settleRound(
  input: SettlementInput,
): SettlementResult {
  const safeGold = Math.max(
    0,
    Math.floor(input.prizeGold),
  );

  const safeBB = Math.max(
    0,
    Math.floor(input.prizeBB),
  );

  const winners =
    uniqueWinners(
      input.winners,
    );

  if (
    !input.roundId ||
    !input.settlementKey ||
    input.triggerNumber < 1 ||
    input.triggerNumber > 75 ||
    winners.length === 0
  ) {
    return {
      roundId: input.roundId,
      settlementKey:
        input.settlementKey,
      category:
        input.category,
      status: 'rejected',
      totalGold: safeGold,
      totalBB: safeBB,
      payouts: [],
      goldResidual: safeGold,
      bbResidual: safeBB,
    };
  }

  if (
    settledKeys.has(
      input.settlementKey,
    )
  ) {
    return {
      roundId: input.roundId,
      settlementKey:
        input.settlementKey,
      category:
        input.category,
      status: 'already-paid',
      totalGold: safeGold,
      totalBB: safeBB,
      payouts: [],
      goldResidual: 0,
      bbResidual: 0,
    };
  }

  const goldSplit =
    splitEvenly(
      safeGold,
      winners.length,
    );

  const bbSplit =
    splitEvenly(
      safeBB,
      winners.length,
    );

  const payouts =
    winners.map(
      (winner, index) => ({
        userId:
          winner.userId,
        cardId:
          winner.cardId,
        gold:
          goldSplit.share,
        bb:
          bbSplit.share,
        category:
          input.category,
        triggerNumber:
          input.triggerNumber,
      }),
    );

  settledKeys.add(
    input.settlementKey,
  );

  return {
    roundId:
      input.roundId,
    settlementKey:
      input.settlementKey,
    category:
      input.category,
    status: 'paid',
    totalGold:
      safeGold,
    totalBB:
      safeBB,
    payouts,
    goldResidual:
      goldSplit.residual,
    bbResidual:
      bbSplit.residual,
  };
}
