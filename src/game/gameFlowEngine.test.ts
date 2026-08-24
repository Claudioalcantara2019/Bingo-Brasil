import {
  clearSettlementTestStore,
} from './settlementEngine';

import {
  clearWalletLedgerTestStore,
  getWalletBalance,
} from './walletLedger';

import {
  processGameEvent,
} from './gameFlowEngine';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

clearSettlementTestStore();
clearWalletLedgerTestStore();

const first =
  processGameEvent({
    roundId:
      'FLOW-ROUND-1',
    triggerNumber:
      57,
    virtualGoldUsed:
      1000,
    accumulatedBB:
      12,

    candidates: {
      terno: [],
      quadra: [],
      diagonal: [],
      linha: [],
      dupla: [],

      bingo: [
        {
          userId: 'A',
          cardId: 'A1',
        },
        {
          userId: 'B',
          cardId: 'B1',
        },
        {
          userId: 'C',
          cardId: 'C1',
        },
      ],
    },
  });

assert(
  first.finished,
  'O fluxo deveria encerrar a rodada com Bingo',
);

assert(
  first.payout.status ===
    'processed',
  'Payout do fluxo deveria ser processado',
);

assert(
  first.payout.totalBBCredited ===
    12,
  'O fluxo deveria creditar as 12 BB',
);

assert(
  getWalletBalance(
    'A',
  ).bb === 4 &&
    getWalletBalance(
      'B',
    ).bb === 4 &&
    getWalletBalance(
      'C',
    ).bb === 4,
  'As BB não foram creditadas corretamente',
);

assert(
  getWalletBalance(
    'A',
  ).gold ===
    getWalletBalance(
      'B',
    ).gold &&
    getWalletBalance(
      'B',
    ).gold ===
      getWalletBalance(
        'C',
      ).gold,
  'As fichas dos vencedores não foram divididas igualmente',
);

/*
 * Reprocessamento da mesma rodada:
 * o walletLedger deve bloquear o segundo crédito.
 */
const duplicate =
  processGameEvent({
    roundId:
      'FLOW-ROUND-1',
    triggerNumber:
      57,
    virtualGoldUsed:
      1000,
    accumulatedBB:
      12,

    candidates: {
      terno: [],
      quadra: [],
      diagonal: [],
      linha: [],
      dupla: [],

      bingo: [
        {
          userId: 'A',
          cardId: 'A1',
        },
        {
          userId: 'B',
          cardId: 'B1',
        },
        {
          userId: 'C',
          cardId: 'C1',
        },
      ],
    },
  });

assert(
  duplicate.finished,
  'A rodada repetida deveria continuar identificada como encerrada',
);

assert(
  duplicate.payout.status ===
    'already-processed',
  'Reprocessamento deveria ser idempotente',
);

assert(
  getWalletBalance(
    'A',
  ).bb === 4 &&
    getWalletBalance(
      'B',
    ).bb === 4 &&
    getWalletBalance(
      'C',
    ).bb === 4,
  'O reprocessamento alterou as BB',
);

console.log(
  'gameFlowEngine integration tests: OK',
);
