export type PrizeCategory =
  | 'terno'
  | 'quadra'
  | 'diagonal'
  | 'linha'
  | 'dupla'
  | 'bingo';

export type WinnerCandidate = {
  userId: string;
  cardId: string;
};

export type PrizeCategoryConfig = {
  category: PrizeCategory;
  maxWinners: number | null;
  poolWeight: number;
  placementWeights: number[];
};

export type PrizeWinner = {
  userId: string;
  cardId: string;
  place: number;
  prize: number;
};

export type PrizeResolution = {
  category: PrizeCategory;
  reservedPool: number;
  paidPool: number;
  residual: number;
  winners: PrizeWinner[];
};

const CATEGORY_CONFIG: Record<
  PrizeCategory,
  PrizeCategoryConfig
> = {
  terno: {
    category: 'terno',
    maxWinners: 5,
    poolWeight: 0.10,
    placementWeights: [
      0.30,
      0.23,
      0.20,
      0.15,
      0.12,
    ],
  },

  quadra: {
    category: 'quadra',
    maxWinners: 3,
    poolWeight: 0.10,
    placementWeights: [
      0.42,
      0.33,
      0.25,
    ],
  },

  diagonal: {
    category: 'diagonal',
    maxWinners: 3,
    poolWeight: 0.10,
    placementWeights: [
      0.42,
      0.33,
      0.25,
    ],
  },

  linha: {
    category: 'linha',
    maxWinners: 3,
    poolWeight: 0.15,
    placementWeights: [
      0.45,
      0.33,
      0.22,
    ],
  },

  dupla: {
    category: 'dupla',
    maxWinners: 3,
    poolWeight: 0.20,
    placementWeights: [
      0.50,
      0.30,
      0.20,
    ],
  },

  bingo: {
    category: 'bingo',
    maxWinners: null,
    poolWeight: 0.35,
    placementWeights: [
      1,
    ],
  },
};

export function getPrizeCategoryConfig(
  category: PrizeCategory,
): PrizeCategoryConfig {
  return CATEGORY_CONFIG[category];
}

/**
 * Allocates an integer pool among weights that are intended to consume 100%
 * of the supplied pool. Used for the round-level category allocation.
 */
function allocateIntegerPool(
  total: number,
  weights: number[],
): number[] {
  const integerTotal =
    Math.max(
      0,
      Math.floor(total),
    );

  const raw = weights.map(
    (weight) =>
      integerTotal * weight,
  );

  const base = raw.map(
    (value) =>
      Math.floor(value),
  );

  let remainder =
    integerTotal -
    base.reduce(
      (sum, value) =>
        sum + value,
      0,
    );

  const order =
    raw
      .map(
        (value, index) => ({
          index,
          fractional:
            value -
            base[index],
        }),
      )
      .sort(
        (a, b) =>
          b.fractional -
          a.fractional,
      );

  for (
    let index = 0;
    index < order.length &&
    remainder > 0;
    index += 1
  ) {
    base[
      order[index].index
    ] += 1;

    remainder -= 1;
  }

  return base;
}

/**
 * Allocates only the occupied placement percentages.
 * It intentionally does NOT redistribute the unused percentage,
 * because that unused percentage is the residual/acumulado.
 */
function allocatePlacementPool(
  total: number,
  weights: number[],
): number[] {
  const integerTotal =
    Math.max(
      0,
      Math.floor(total),
    );

  return weights.map(
    (weight) =>
      Math.floor(
        integerTotal * weight,
      ),
  );
}

export function uniqueUsers(
  candidates: WinnerCandidate[],
): WinnerCandidate[] {
  const seen =
    new Set<string>();

  const result: WinnerCandidate[] =
    [];

  for (
    const candidate of candidates
  ) {
    if (
      seen.has(
        candidate.userId,
      )
    ) {
      continue;
    }

    seen.add(
      candidate.userId,
    );

    result.push(
      candidate,
    );
  }

  return result;
}

export function resolvePrizeCategory(
  category: PrizeCategory,
  reservedPool: number,
  candidates: WinnerCandidate[],
): PrizeResolution {
  const config =
    getPrizeCategoryConfig(
      category,
    );

  const unique =
    uniqueUsers(
      candidates,
    );

  const integerPool =
    Math.max(
      0,
      Math.floor(
        reservedPool,
      ),
    );

  if (
    unique.length === 0
  ) {
    return {
      category,
      reservedPool:
        integerPool,
      paidPool: 0,
      residual:
        integerPool,
      winners: [],
    };
  }

  let winners: WinnerCandidate[];

  if (
    config.maxWinners === null
  ) {
    winners = unique;
  } else {
    winners =
      unique.slice(
        0,
        config.maxWinners,
      );
  }

  if (
    winners.length === 0
  ) {
    return {
      category,
      reservedPool:
        integerPool,
      paidPool: 0,
      residual:
        integerPool,
      winners: [],
    };
  }

  if (
    category === 'bingo'
  ) {
    const baseShare =
      Math.floor(
        integerPool /
          winners.length,
      );

    const remainder =
      integerPool -
      baseShare *
        winners.length;

    const bingoWinners =
      winners.map(
        (winner, index) => ({
          userId:
            winner.userId,
          cardId:
            winner.cardId,
          place:
            index + 1,
          prize:
            baseShare +
            (
              index <
              remainder
                ? 1
                : 0
            ),
        }),
      );

    return {
      category,
      reservedPool:
        integerPool,
      paidPool:
        integerPool,
      residual: 0,
      winners:
        bingoWinners,
    };
  }

  /*
   * Limited categories deliberately pay only the occupied positions.
   * Example: Terno with 1 winner:
   * 100 × 30% = 30 paid, 70 residual.
   */
  const occupiedWeights =
    config.placementWeights.slice(
      0,
      winners.length,
    );

  const prizes =
    allocatePlacementPool(
      integerPool,
      occupiedWeights,
    );

  const paidPool =
    prizes.reduce(
      (sum, value) =>
        sum + value,
      0,
    );

  const winnerResults =
    winners.map(
      (winner, index) => ({
        userId:
          winner.userId,
        cardId:
          winner.cardId,
        place:
          index + 1,
        prize:
          prizes[index] ?? 0,
      }),
    );

  return {
    category,
    reservedPool:
      integerPool,
    paidPool,
    residual:
      integerPool -
      paidPool,
    winners:
      winnerResults,
  };
}

export function calculatePrizePool(
  virtualGoldUsed: number,
  returnRate = 0.65,
): number {
  return Math.max(
    0,
    Math.floor(
      virtualGoldUsed *
        returnRate,
    ),
  );
}

export function allocateCategoryPools(
  prizePool: number,
): Record<
  PrizeCategory,
  number
> {
  const categories =
    Object.values(
      CATEGORY_CONFIG,
    );

  const weights =
    categories.map(
      (config) =>
        config.poolWeight,
    );

  const allocated =
    allocateIntegerPool(
      prizePool,
      weights,
    );

  return {
    terno:
      allocated[0] ?? 0,
    quadra:
      allocated[1] ?? 0,
    diagonal:
      allocated[2] ?? 0,
    linha:
      allocated[3] ?? 0,
    dupla:
      allocated[4] ?? 0,
    bingo:
      allocated[5] ?? 0,
  };
}
