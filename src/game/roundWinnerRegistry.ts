import {
  getPrizeCategoryConfig,
  type PrizeCategory,
  type WinnerCandidate,
} from './prizeEngine';

export type RoundWinnerRegistryEntry = {
  roundId: string;
  category: PrizeCategory;
  userId: string;
  cardId: string;
  place: number;
  triggerNumber: number;
};

const registry =
  new Map<
    string,
    RoundWinnerRegistryEntry[]
  >();

function keyFor(
  roundId: string,
  category: PrizeCategory,
): string {
  return `${roundId}:${category}`;
}

function cloneEntry(
  entry: RoundWinnerRegistryEntry,
): RoundWinnerRegistryEntry {
  return {
    ...entry,
  };
}

export function clearRoundWinnerRegistryTestStore() {
  registry.clear();
}

export function getRoundCategoryWinners(
  roundId: string,
  category: PrizeCategory,
): RoundWinnerRegistryEntry[] {
  return (
    registry.get(
      keyFor(
        roundId,
        category,
      ),
    ) ?? []
  ).map(cloneEntry);
}

export function getRoundCategoryWinnerCount(
  roundId: string,
  category: PrizeCategory,
): number {
  return getRoundCategoryWinners(
    roundId,
    category,
  ).length;
}

/**
 * Filters candidates that have not yet won this category in the round
 * and applies the remaining winner-slot limit.
 *
 * A card can win a category only once in one round.
 * Different cards/players can occupy the available slots.
 */
export function filterEligibleRoundWinners(
  roundId: string,
  category: PrizeCategory,
  candidates: WinnerCandidate[],
): WinnerCandidate[] {
  const existing =
    getRoundCategoryWinners(
      roundId,
      category,
    );

  const existingCards =
    new Set(
      existing.map(
        (winner) =>
          winner.cardId,
      ),
    );

  const existingUsers =
    new Set(
      existing.map(
        (winner) =>
          winner.userId,
      ),
    );

  const uniqueCandidates: WinnerCandidate[] =
    [];

  const seenUsers =
    new Set<string>();

  const seenCards =
    new Set<string>();

  for (
    const candidate of candidates
  ) {
    if (
      existingCards.has(
        candidate.cardId,
      ) ||
      existingUsers.has(
        candidate.userId,
      ) ||
      seenCards.has(
        candidate.cardId,
      ) ||
      seenUsers.has(
        candidate.userId,
      )
    ) {
      continue;
    }

    seenCards.add(
      candidate.cardId,
    );
    seenUsers.add(
      candidate.userId,
    );

    uniqueCandidates.push({
      userId:
        candidate.userId,
      cardId:
        candidate.cardId,
    });
  }

  const maxWinners =
    getPrizeCategoryConfig(
      category,
    ).maxWinners;

  if (
    maxWinners === null
  ) {
    return uniqueCandidates;
  }

  const remainingSlots =
    Math.max(
      0,
      maxWinners -
        existing.length,
    );

  return uniqueCandidates.slice(
    0,
    remainingSlots,
  );
}

export function registerRoundWinners(
  roundId: string,
  category: PrizeCategory,
  winners: WinnerCandidate[],
  triggerNumber: number,
): RoundWinnerRegistryEntry[] {
  const eligible =
    filterEligibleRoundWinners(
      roundId,
      category,
      winners,
    );

  if (
    eligible.length ===
    0
  ) {
    return [];
  }

  const currentKey =
    keyFor(
      roundId,
      category,
    );

  const current =
    registry.get(
      currentKey,
    ) ?? [];

  const newEntries =
    eligible.map(
      (winner, index) => ({
        roundId,
        category,
        userId:
          winner.userId,
        cardId:
          winner.cardId,
        place:
          current.length +
          index +
          1,
        triggerNumber,
      }),
    );

  registry.set(
    currentKey,
    [
      ...current,
      ...newEntries,
    ],
  );

  return newEntries.map(
    cloneEntry,
  );
}
