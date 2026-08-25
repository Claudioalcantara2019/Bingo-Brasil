import {
  allocateCategoryPools,
  calculatePrizePool,
  type PrizeCategory,
} from './prizeEngine';

export type RoundTicketEconomy = {
  ticketCount: number;
  ticketValue: number;
  grossGold: number;

  prizeReturnRate: number;
  prizePool: number;

  retainedGold: number;

  categoryPools: Record<
    PrizeCategory,
    number
  >;
};

function safeInteger(
  value: number,
): number {
  return Math.max(
    0,
    Math.floor(value),
  );
}

/**
 * Central economic source for a round whose
 * revenue comes from purchased cards.
 */
export function calculateRoundTicketEconomy(
  ticketCount: number,
  ticketValue: number,
  prizeReturnRate = 0.65,
): RoundTicketEconomy {
  const safeTicketCount =
    safeInteger(
      ticketCount,
    );

  const safeTicketValue =
    safeInteger(
      ticketValue,
    );

  const grossGold =
    safeTicketCount *
    safeTicketValue;

  const safeRate =
    Math.min(
      1,
      Math.max(
        0,
        prizeReturnRate,
      ),
    );

  const prizePool =
    calculatePrizePool(
      grossGold,
      safeRate,
    );

  const categoryPools =
    allocateCategoryPools(
      prizePool,
    );

  const allocatedCategoryTotal =
    Object.values(
      categoryPools,
    ).reduce(
      (sum, value) =>
        sum + value,
      0,
    );

  return {
    ticketCount:
      safeTicketCount,

    ticketValue:
      safeTicketValue,

    grossGold,

    prizeReturnRate:
      safeRate,

    prizePool,

    retainedGold:
      grossGold -
      prizePool,

    categoryPools,
  };
}

export function calculateGrossGoldFromCards(
  ticketCount: number,
  ticketValue: number,
): number {
  return (
    safeInteger(
      ticketCount,
    ) *
    safeInteger(
      ticketValue,
    )
  );
}
