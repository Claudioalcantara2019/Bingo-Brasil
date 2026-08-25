import {
  checkRoundIntegrity,
  type RoundIntegrityResult,
} from './roundIntegrityCheck';

import type {
  RoundSnapshot,
} from './roundSnapshot';

export type RoundCloseReceipt = {
  receiptId: string;
  roomId: string;
  roundId: string;

  triggerNumber: number | null;

  playerCount: number;

  totalGoldPaid: number;
  totalBBPaid: number;

  residualGold: number;
  residualBB: number;

  auditEntries: number;
  settlementCount: number;
  walletCreditCount: number;

  integrityOk: boolean;

  closedAt: number;

  closingReason:
    | 'bingo'
    | 'manual'
    | 'server'
    | 'already-closed';
};

/**
 * Creates a read-only receipt from a closed round snapshot.
 *
 * It does not close the round itself.
 */
export function buildRoundCloseReceipt(
  snapshot: RoundSnapshot,
  integrity: RoundIntegrityResult,
  reason:
    | 'bingo'
    | 'manual'
    | 'server'
    | 'already-closed',
): RoundCloseReceipt {
  return {
    receiptId:
      `RECEIPT-${snapshot.roundId}-${Date.now()}`,

    roomId:
      snapshot.roomId,

    roundId:
      snapshot.roundId,

    triggerNumber:
      snapshot.lastNumber,

    playerCount:
      snapshot.playerCount,

    totalGoldPaid:
      snapshot.totalGoldPaid,

    totalBBPaid:
      snapshot.totalBBPaid,

    residualGold:
      snapshot.residualGold,

    residualBB:
      snapshot.residualBB,

    auditEntries:
      snapshot.audit.length,

    settlementCount:
      snapshot.settlementCount,

    walletCreditCount:
      snapshot.walletCreditCount,

    integrityOk:
      integrity.ok,

    closedAt:
      Date.now(),

    closingReason:
      reason,
  };
}
