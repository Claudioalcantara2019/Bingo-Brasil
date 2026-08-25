import type {
  RoundSettlementResult,
} from './roundEngine';

export type EconomyInvariantResult = {
  ok: boolean;
  prizePool: number;
  paidGold: number;
  residualGold: number;
  expectedGoldTotal: number;
  paidBB: number;
  residualBB: number;
  expectedBBTotal: number;
  errors: string[];
};

export function checkEconomyInvariants(
  round: RoundSettlementResult,
): EconomyInvariantResult {
  const paidGold =
    round.settlements.reduce(
      (sum, settlement) =>
        sum +
        settlement.payouts.reduce(
          (payoutSum, payout) =>
            payoutSum + payout.gold,
          0,
        ),
      0,
    );

  const paidBB =
    round.settlements.reduce(
      (sum, settlement) =>
        sum +
        settlement.payouts.reduce(
          (payoutSum, payout) =>
            payoutSum + payout.bb,
          0,
        ),
      0,
    );

  const residualGold =
    Math.max(
      0,
      Math.floor(round.residualGold),
    );

  const residualBB =
    Math.max(
      0,
      Math.floor(round.residualBB),
    );

  const expectedGoldTotal =
    paidGold + residualGold;

  const expectedBBTotal =
    paidBB + residualBB;

  const errors: string[] = [];

  if (
    expectedGoldTotal !==
    round.prizePool
  ) {
    errors.push(
      `Gold não fecha: pool=${round.prizePool}, paid=${paidGold}, residual=${residualGold}`,
    );
  }

  if (
    paidGold < 0 ||
    paidBB < 0
  ) {
    errors.push(
      'Pagamento negativo detectado',
    );
  }

  return {
    ok:
      errors.length === 0,
    prizePool:
      round.prizePool,
    paidGold,
    residualGold,
    expectedGoldTotal,
    paidBB,
    residualBB,
    expectedBBTotal,
    errors,
  };
}
