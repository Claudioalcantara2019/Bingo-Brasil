import {
  allocateCategoryPools,
  resolvePrizeCategory,
  type PrizeCategory,
  type WinnerCandidate,
} from './prizeEngine';

import {
  settleRound,
  type SettlementResult,
} from './settlementEngine';

export type RoundPatternCandidates = {
  terno: WinnerCandidate[];
  quadra: WinnerCandidate[];
  diagonal: WinnerCandidate[];
  linha: WinnerCandidate[];
  dupla: WinnerCandidate[];
  bingo: WinnerCandidate[];
};

export type RoundInput = {
  roundId: string;
  triggerNumber: number;

  /**
   * Virtual gold used to enter the round.
   * Prize pool is calculated by the prizeEngine.
   */
  virtualGoldUsed: number;

  /**
   * BB available in this round's accumulator/fund.
   * This is passed to the Bingo settlement.
   */
  accumulatedBB: number;

  candidates: RoundPatternCandidates;
};

export type RoundCategoryResult = {
  category: PrizeCategory;
  reservedPool: number;
  winners: WinnerCandidate[];
  paidPool: number;
  residual: number;
};

export type RoundSettlementResult = {
  roundId: string;
  triggerNumber: number;

  prizePool: number;
  categoryPools: Record<
    'terno' |
    'quadra' |
    'linha' |
    'dupla' |
    'bingo',
    number
  >;

  categories: RoundCategoryResult[];

  settlements: SettlementResult[];

  residualGold: number;
  residualBB: number;

  roundClosed: boolean;
};

const SETTLEABLE_CATEGORIES: Array<
  keyof RoundPatternCandidates
> = [
  'terno',
  'quadra',
  'diagonal',
  'linha',
  'dupla',
  'bingo',
];

function totalResidualGold(
  categories: RoundCategoryResult[],
): number {
  return categories.reduce(
    (sum, category) =>
      sum + category.residual,
    0,
  );
}

/**
 * Orquestra uma única bola/evento da rodada.
 *
 * Responsabilidades:
 * 1. calcular o pool;
 * 2. reservar fundos para as categorias;
 * 3. resolver vencedores por categoria;
 * 4. liquidar automaticamente os vencedores confirmados;
 * 5. preservar resíduos.
 *
 * Ainda é uma camada de domínio/local.
 * Banco, autenticação e transação real ficam para o servidor.
 */
export function processRoundEvent(
  input: RoundInput,
): RoundSettlementResult {
  const virtualPool = Math.max(
    0,
    Math.floor(
      input.virtualGoldUsed *
        0.65,
    ),
  );

  const categoryPools =
    allocateCategoryPools(
      virtualPool,
    );

  const categories: RoundCategoryResult[] =
    SETTLEABLE_CATEGORIES.map(
      (category) => {
        const reservedPool =
          categoryPools[
            category
          ];

        const candidates =
          input.candidates[
            category
          ];

        const resolution =
          resolvePrizeCategory(
            category,
            reservedPool,
            candidates,
          );

        return {
          category,
          reservedPool,
          winners:
            resolution.winners.map(
              (winner) => ({
                userId:
                  winner.userId,
                cardId:
                  winner.cardId,
              }),
            ),
          paidPool:
            resolution.paidPool,
          residual:
            resolution.residual,
        };
      },
    );

  const settlements: SettlementResult[] = [];

  for (
    const category of categories
  ) {
    if (
      category.winners.length ===
      0
    ) {
      continue;
    }

    const settlementKey =
      [
        input.roundId,
        category.category,
        input.triggerNumber,
      ].join(':');

    /*
     * Bingo receives the room BB accumulator.
     * Other categories currently receive 0 BB.
     */
    const bbForCategory =
      category.category === 'bingo'
        ? Math.max(
            0,
            Math.floor(
              input.accumulatedBB,
            ),
          )
        : 0;

    const settlement =
      settleRound({
        roundId:
          input.roundId,
        category:
          category.category,
        triggerNumber:
          input.triggerNumber,
        winners:
          category.winners,
        prizeGold:
          category.paidPool,
        prizeBB:
          bbForCategory,
        settlementKey,
      });

    settlements.push(
      settlement,
    );
  }

  /*
   * Invariante de domínio:
   * sempre que uma categoria tem vencedores, ela deve gerar
   * exatamente uma entrada de liquidação para este evento.
   */
  for (
    const category of categories
  ) {
    if (
      category.winners.length === 0
    ) {
      continue;
    }

    const matchingSettlement =
      settlements.find(
        (settlement) =>
          settlement.category ===
          category.category,
      );

    if (!matchingSettlement) {
      throw new Error(
        `Settlement ausente para ${category.category}`,
      );
    }
  }

  const residualGold =
    totalResidualGold(
      categories,
    );

  const paidBB =
    settlements.reduce(
      (sum, settlement) =>
        sum +
        settlement.payouts.reduce(
          (
            payoutSum,
            payout,
          ) =>
            payoutSum +
            payout.bb,
          0,
        ),
      0,
    );

  const residualBB =
    Math.max(
      0,
      Math.floor(
        input.accumulatedBB,
      ) - paidBB,
    );

  const bingoWasClosed =
    settlements.some(
      (settlement) =>
        settlement.category ===
          'bingo' &&
        (
          (
            settlement.status ===
              'paid' &&
            settlement.payouts.length >
              0
          ) ||
          settlement.status ===
            'already-paid'
        ),
    );

  return {
    roundId:
      input.roundId,
    triggerNumber:
      input.triggerNumber,
    prizePool:
      virtualPool,
    categoryPools: {
      terno:
        categoryPools.terno,
      quadra:
        categoryPools.quadra,
      diagonal:
        categoryPools.diagonal,
      linha:
        categoryPools.linha,
      dupla:
        categoryPools.dupla,
      bingo:
        categoryPools.bingo,
    },
    categories,
    settlements,
    residualGold,
    residualBB,
    roundClosed:
      bingoWasClosed,
  };
}
