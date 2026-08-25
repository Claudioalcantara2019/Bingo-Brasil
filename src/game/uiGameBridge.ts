import type {
  RoomGameEventResult,
} from './roomGameEngine';

export type UiPrizeRow = {
  key:
    | 'terno'
    | 'quadra'
    | 'diagonal'
    | 'linha'
    | 'dupla'
    | 'bingo';

  label: string;
  winners: number;
  paid: number;
  remaining: number;
  status:
    | 'waiting'
    | 'detected'
    | 'paid';
};

export type UiRoundSummary = {
  roomStatus:
    | 'waiting'
    | 'running'
    | 'closed'
    | 'missing';

  roundStatus:
    | 'none'
    | 'open'
    | 'running'
    | 'closed';

  blocked:
    boolean;

  blockedReason:
    | 'none'
    | 'room-not-running'
    | 'round-mismatch'
    | 'round-closed';

  finished:
    boolean;

  totalGoldPaid: number;
  totalBBPaid: number;

  prizes: UiPrizeRow[];
};

function getCategoryStatus(
  paid: number,
  winners: number,
): UiPrizeRow['status'] {
  if (paid > 0) {
    return 'paid';
  }

  if (winners > 0) {
    return 'detected';
  }

  return 'waiting';
}

/**
 * Converts the domain result into a small presentation model.
 *
 * The UI should consume this model instead of reaching into
 * settlement/prize internals directly.
 */
export function buildUiRoundSummary(
  result: RoomGameEventResult,
): UiRoundSummary {
  if (!result.flow) {
    return {
      roomStatus:
        result.roomStatus,
      roundStatus:
        result.roundStatus,
      blocked:
        !result.ok,
      blockedReason:
        result.ok
          ? 'none'
          : result.reason ===
            'round-closed'
            ? 'round-closed'
            : result.reason ===
              'round-mismatch'
              ? 'round-mismatch'
              : 'room-not-running',
      finished: false,
      totalGoldPaid: 0,
      totalBBPaid: 0,
      prizes: [
        {
          key: 'terno',
          label: '🥉 Terno',
          winners: 0,
          paid: 0,
          remaining: 0,
          status: 'waiting',
        },
        {
          key: 'quadra',
          label: '🥈 Quadra',
          winners: 0,
          paid: 0,
          remaining: 0,
          status: 'waiting',
        },
        {
          key: 'diagonal',
          label: '↘️ Diagonal',
          winners: 0,
          paid: 0,
          remaining: 0,
          status: 'waiting',
        },
        {
          key: 'linha',
          label: '🟡 Linha',
          winners: 0,
          paid: 0,
          remaining: 0,
          status: 'waiting',
        },
        {
          key: 'dupla',
          label: '🏆 Linha dupla',
          winners: 0,
          paid: 0,
          remaining: 0,
          status: 'waiting',
        },
        {
          key: 'bingo',
          label: '🎱 Bingo',
          winners: 0,
          paid: 0,
          remaining: 0,
          status: 'waiting',
        },
      ],
    };
  }

  const categories =
    result.flow.round.categories;

  const settlements =
    result.flow.round.settlements;

  const getPrize = (
    key: UiPrizeRow['key'],
  ): UiPrizeRow => {
    const category =
      categories.find(
        (item) =>
          item.category ===
          key,
      );

    const settlement =
      settlements.find(
        (item) =>
          item.category ===
          key,
      );

    const winners =
      category?.winners.length ??
      0;

    const paid =
      settlement?.payouts.reduce(
        (sum, payout) =>
          sum + payout.gold,
        0,
      ) ??
      0;

    const reserved =
      category?.reservedPool ??
      0;

    return {
      key,
      label:
        key === 'terno'
          ? '🥉 Terno'
          : key === 'quadra'
            ? '🥈 Quadra'
            : key === 'diagonal'
              ? '↘️ Diagonal'
              : key === 'linha'
                ? '🟡 Linha'
                : key === 'dupla'
                  ? '🏆 Linha dupla'
                  : '🎱 Bingo',
      winners,
      paid,
      remaining:
        Math.max(
          0,
          reserved - paid,
        ),
      status:
        getCategoryStatus(
          paid,
          winners,
        ),
    };
  };

  return {
    roomStatus:
      result.roomStatus,
    roundStatus:
      result.roundStatus,
    blocked: false,
    blockedReason: 'none',
    finished:
      result.flow.finished,
    totalGoldPaid:
      result.flow.payout
        .totalGoldCredited,
    totalBBPaid:
      result.flow.payout
        .totalBBCredited,
    prizes: [
      getPrize('terno'),
      getPrize('quadra'),
      getPrize('diagonal'),
      getPrize('linha'),
      getPrize('dupla'),
      getPrize('bingo'),
    ],
  };
}
