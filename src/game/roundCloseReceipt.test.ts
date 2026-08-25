import {
  clearRoomTestStore,
} from './roomEngine';

import {
  clearRoundStateTestStore,
} from './roundStateEngine';

import {
  clearRoundAuditTestStore,
} from './roundAuditLedger';

import {
  createRoomRound,
  joinRoomPlayer,
  startRoomRound,
  closeRoomRound,
} from './roomRoundCoordinator';

import {
  buildRoundSnapshot,
} from './roundSnapshot';

import {
  checkRoundIntegrity,
} from './roundIntegrityCheck';

import {
  buildRoundCloseReceipt,
} from './roundCloseReceipt';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

clearRoomTestStore();
clearRoundStateTestStore();
clearRoundAuditTestStore();

createRoomRound(
  'RECEIPT-ROOM',
  3,
);

joinRoomPlayer(
  'RECEIPT-ROOM',
  'A',
  ['A1'],
);

joinRoomPlayer(
  'RECEIPT-ROOM',
  'B',
  ['B1'],
);

startRoomRound(
  'RECEIPT-ROOM',
  'RECEIPT-ROUND',
);

closeRoomRound(
  'RECEIPT-ROOM',
);

const snapshot =
  buildRoundSnapshot(
    'RECEIPT-ROOM',
    'RECEIPT-ROUND',
    {
      roundId:
        'RECEIPT-ROUND',
      triggerNumber:
        57,
      prizePool:
        650,
      categoryPools: {
        terno: 65,
        quadra: 65,
        diagonal: 65,
        linha: 98,
        dupla: 130,
        bingo: 227,
      },
      categories: [],
      settlements: [],
      residualGold:
        650,
      residualBB:
        0,
      roundClosed:
        true,
    },
    0,
    0,
  );

const integrity =
  checkRoundIntegrity(
    'RECEIPT-ROOM',
    'RECEIPT-ROUND',
    {
      ...{
        roundId:
          'RECEIPT-ROUND',
        triggerNumber:
          57,
        prizePool:
          650,
        categoryPools: {
          terno: 65,
          quadra: 65,
          diagonal: 65,
          linha: 98,
          dupla: 130,
          bingo: 227,
        },
        categories: [],
        settlements: [],
        residualGold:
          650,
        residualBB:
          0,
        roundClosed:
          true,
      },
    },
  );

assert(
  integrity.ok,
  'Integridade do recibo deveria estar aprovada',
);

const receipt =
  buildRoundCloseReceipt(
    snapshot,
    integrity,
    'bingo',
  );

assert(
  receipt.roomId ===
      'RECEIPT-ROOM' &&
    receipt.roundId ===
      'RECEIPT-ROUND',
  'Identificação do recibo incorreta',
);

assert(
  receipt.triggerNumber ===
      57 &&
    receipt.playerCount ===
      2,
  'Dados básicos do recibo incorretos',
);

assert(
  receipt.totalGoldPaid ===
      0 &&
    receipt.residualGold ===
      650,
  'Economia do recibo incorreta',
);

assert(
  receipt.integrityOk,
  'Recibo deveria registrar integridade aprovada',
);

assert(
  receipt.closingReason ===
    'bingo',
  'Motivo de fechamento incorreto',
);

assert(
  receipt.receiptId.includes(
    'RECEIPT-ROUND',
  ),
  'ID do recibo não referencia a rodada',
);

console.log(
  'roundCloseReceipt tests: OK',
);
