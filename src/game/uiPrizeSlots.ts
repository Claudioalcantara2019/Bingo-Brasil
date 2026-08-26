import {
  getPrizeCategoryConfig,
  type PrizeCategory,
} from './prizeEngine';

export type UiPrizeSlotState = {
  key: PrizeCategory;
  label: string;
  filled: number;
  limit: number | null;
  text: string;
  remainingSlots: number | null;
};

const LABELS: Record<
  PrizeCategory,
  string
> = {
  terno: 'Terno',
  quadra: 'Quadra',
  diagonal: 'Diagonal',
  linha: 'Linha',
  dupla: 'Linha Dupla',
  bingo: 'Bingo',
};

export function buildUiPrizeSlotState(
  category: PrizeCategory,
  winnerCount: number,
): UiPrizeSlotState {
  const config =
    getPrizeCategoryConfig(
      category,
    );

  const filled =
    Math.max(
      0,
      Math.floor(
        winnerCount,
      ),
    );

  const limit =
    config.maxWinners;

  const remainingSlots =
    limit === null
      ? null
      : Math.max(
          0,
          limit - filled,
        );

  const text =
    limit === null
      ? `${filled}`
      : `${Math.min(
          filled,
          limit,
        )}/${limit}`;

  return {
    key:
      category,
    label:
      LABELS[category],
    filled:
      Math.min(
        filled,
        limit ?? filled,
      ),
    limit,
    text,
    remainingSlots,
  };
}

export function buildUiPrizeSlotStates(
  counts: Partial<
    Record<PrizeCategory, number>
  >,
): UiPrizeSlotState[] {
  const categories:
    PrizeCategory[] = [
      'terno',
      'quadra',
      'diagonal',
      'linha',
      'dupla',
      'bingo',
    ];

  return categories.map(
    (category) =>
      buildUiPrizeSlotState(
        category,
        counts[category] ??
          0,
      ),
  );
}
