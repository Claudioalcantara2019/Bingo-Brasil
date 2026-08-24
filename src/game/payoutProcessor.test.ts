import {
  processRoundEvent,
} from './roundEngine';

import {
  clearSettlementTestStore,
} from './settlementEngine';

import {
  clearWalletLedgerTestStore,
  getWalletBalance,
} from './walletLedger';

import {
  processRoundPayouts,
} from './payoutProcessor';

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

const round =
  processRoundEvent({
    roundId:
      'INTEGRATION-ROUND-1',
    triggerNumber:
      57,
    virtualGoldUsed:
      1000,
    accumulatedBB:
      12,

    candidates: {
      terno: [
        {
          userId: 'A',
          cardId: 'A1',
        },
      ],

      quadra: [],

      diagonal: [],

      linha: [],

      dupla: [],

      bingo: [
        {
          userId: 'B',
          cardId: 'B1',
        },
        {
          userId: 'C',
          cardId: 'C1',
        },
        {
          userId: 'D',
          cardId: 'D1',
        },
      ],
    },
  });

assert(
  round.roundClosed,
  'A rodada de integração deveria fechar com Bingo',
);

const payout =
  processRoundPayouts(
    round,
  );

assert(
  payout.status ===
    'processed',
  'Payout deveria ser processado',
);

assert(
  payout.totalGoldCredited >
    0,
  'Nenhuma ficha foi creditada',
);

assert(
  payout.totalBBCredited ===
    12,
  'As 12 BB do Bingo deveriam ter sido creditadas',
);

assert(
  getWalletBalance(
    'B',
  ).bb === 4 &&
    getWalletBalance(
      'C',
    ).bb === 4 &&
    getWalletBalance(
      'D',
    ).bb === 4,
  'BB dos três vencedores não foram divididas corretamente',
);

assert(
  getWalletBalance(
    'B',
  ).gold ===
    getWalletBalance(
      'C',
    ).gold &&
    getWalletBalance(
      'C',
    ).gold ===
      getWalletBalance(
        'D',
      ).gold,
  'Fichas dos vencedores não ficaram iguais',
);

/*
 * Rodar a mesma liquidação de novo deve ser seguro.
 */
const duplicate =
  processRoundPayouts(
    round,
  );

assert(
  duplicate.status ===
    'already-processed',
  'Reprocessamento deveria ser idempotente',
);

assert(
  duplicate.credits.every(
    (credit) =>
      credit.status ===
        'already-credited',
  ),
  'Reprocessamento deveria apontar créditos já realizados',
);

assert(
  getWalletBalance(
    'B',
  ).bb === 4 &&
    getWalletBalance(
      'C',
    ).bb === 4 &&
    getWalletBalance(
      'D',
    ).bb === 4,
  'Reprocessamento alterou as BB',
);

assert(
  getWalletBalance(
    'B',
  ).gold ===
    getWalletBalance(
      'C',
    ).gold,
  'Reprocessamento alterou as fichas',
);

console.log(
  'payoutProcessor integration tests: OK',
);
