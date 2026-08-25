import {
  getRoomRoundState,
} from './roomRoundCoordinator';

import {
  getRoundAudit,
  getRoundAuditTotals,
  type AuditEntry,
} from './roundAuditLedger';

import type {
  RoundSettlementResult,
} from './roundEngine';

export type RoundSnapshot = {
  roomId: string;
  roundId: string;

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

  lastNumber:
    number | null;

  drawCount:
    number;

  playerCount:
    number;

  prizePool:
    number;

  residualGold:
    number;

  residualBB:
    number;

  finished:
    boolean;

  totalGoldPaid:
    number;

  totalBBPaid:
    number;

  settlementCount:
    number;

  walletCreditCount:
    number;

  auditTotals:
    ReturnType<
      typeof getRoundAuditTotals
    >;

  audit:
    AuditEntry[];
};

/**
 * Creates a consolidated read-only snapshot of a round.
 *
 * It does not mutate room, round, wallet, settlement or audit state.
 */
export function buildRoundSnapshot(
  roomId: string,
  roundId: string,
  settlement:
    | RoundSettlementResult
    | null,
  totalGoldPaid = 0,
  totalBBPaid = 0,
): RoundSnapshot {
  const roomRound =
    getRoomRoundState(
      roomId,
    );

  const audit =
    getRoundAudit(
      roundId,
    );

  const auditTotals =
    getRoundAuditTotals(
      roundId,
    );

  const room =
    roomRound.room;

  const roundState =
    roomRound.roundStatus;

  return {
    roomId,

    roundId,

    roomStatus:
      room?.status ??
      'missing',

    roundStatus:
      roundState,

    lastNumber:
      settlement?.triggerNumber ??
      null,

    drawCount:
      auditTotals.balls,

    playerCount:
      room?.players.length ??
      0,

    prizePool:
      settlement?.prizePool ??
      0,

    residualGold:
      settlement?.residualGold ??
      0,

    residualBB:
      settlement?.residualBB ??
      0,

    finished:
      settlement?.roundClosed ??
      auditTotals.closed,

    totalGoldPaid:
      Math.max(
        0,
        Math.floor(
          totalGoldPaid,
        ),
      ),

    totalBBPaid:
      Math.max(
        0,
        Math.floor(
          totalBBPaid,
        ),
      ),

    settlementCount:
      auditTotals.settlements,

    walletCreditCount:
      auditTotals.walletCredits,

    auditTotals,
    audit,
  };
}
