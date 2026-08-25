import {
  getRoomRoundState,
} from './roomRoundCoordinator';

import {
  checkEconomyInvariants,
  type EconomyInvariantResult,
} from './economyInvariant';

import {
  getRoundAudit,
  getRoundAuditTotals,
  type AuditEntry,
} from './roundAuditLedger';

import type {
  RoundSettlementResult,
} from './roundEngine';

export type RoundIntegrityResult = {
  ok: boolean;

  room:
    | 'waiting'
    | 'running'
    | 'closed'
    | 'missing';

  round:
    | 'none'
    | 'open'
    | 'running'
    | 'closed';

  economy:
    EconomyInvariantResult;

  audit:
    ReturnType<
      typeof getRoundAuditTotals
    >;

  errors:
    string[];

  warnings:
    string[];

  auditEntries:
    AuditEntry[];
};

/**
 * Cross-checks room state, round result, economy and audit.
 *
 * This module is read-only.
 */
export function checkRoundIntegrity(
  roomId: string,
  roundId: string,
  settlement:
    | RoundSettlementResult
    | null,
): RoundIntegrityResult {
  const state =
    getRoomRoundState(
      roomId,
    );

  const economy =
    settlement
      ? checkEconomyInvariants(
          settlement,
        )
      : {
          ok: true,
          prizePool: 0,
          paidGold: 0,
          residualGold: 0,
          expectedGoldTotal: 0,
          paidBB: 0,
          residualBB: 0,
          expectedBBTotal: 0,
          errors: [],
        };

  const audit =
    getRoundAuditTotals(
      roundId,
    );

  const auditEntries =
    getRoundAudit(
      roundId,
    );

  const roomStatus =
    state.room?.status ??
    'missing';

  const roundStatus =
    state.roundStatus;

  const errors: string[] =
    [
      ...economy.errors,
    ];

  const warnings: string[] =
    [];

  if (
    roomStatus === 'missing'
  ) {
    errors.push(
      'Sala inexistente',
    );
  }

  if (
    state.room &&
    state.room.roundId !==
      null &&
    state.room.roundId !==
      roundId
  ) {
    errors.push(
      'Sala vinculada a outra rodada',
    );
  }

  if (
    settlement &&
    settlement.roundClosed &&
    (
      roomStatus !==
        'closed' ||
      roundStatus !==
        'closed'
    )
  ) {
    errors.push(
      'Liquidação indica rodada fechada, mas estado persistido não está fechado',
    );
  }

  if (
    settlement &&
    !settlement.roundClosed &&
    roundStatus ===
      'closed'
  ) {
    warnings.push(
      'Estado persistido está fechado, mas o resultado econômico não marca fechamento',
    );
  }

  if (
    settlement &&
    settlement.settlements.length >
      0 &&
    audit.settlements === 0
  ) {
    warnings.push(
      'Existem liquidações sem eventos de auditoria',
    );
  }

  if (
    settlement &&
    settlement.roundClosed &&
    !audit.closed
  ) {
    warnings.push(
      'Rodada fechada sem evento de auditoria de fechamento',
    );
  }

  return {
    ok:
      errors.length === 0,
    room:
      roomStatus,
    round:
      roundStatus,
    economy,
    audit,
    errors,
    warnings,
    auditEntries,
  };
}
