import {
  clearRoomTestStore,
} from './roomEngine';

import {
  clearRoundStateTestStore,
} from './roundStateEngine';

import {
  clearSettlementTestStore,
} from './settlementEngine';

import {
  clearWalletLedgerTestStore,
  getWalletBalance,
} from './walletLedger';

import {
  createUiRoom,
  joinUiPlayer,
  processUiBall,
  startUiRoom,
} from './uiRoomController';

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
clearSettlementTestStore();
clearWalletLedgerTestStore();

const created =
  createUiRoom(
    'UI-ROOM-1',
    3,
  );

assert(
  created.ok &&
    created.state.playerCount ===
      0,
  'Sala UI não foi criada',
);

joinUiPlayer(
  'UI-ROOM-1',
  'A',
  ['A1'],
);

joinUiPlayer(
  'UI-ROOM-1',
  'B',
  ['B1'],
);

joinUiPlayer(
  'UI-ROOM-1',
  'C',
  ['C1'],
);

const started =
  startUiRoom(
    'UI-ROOM-1',
    'UI-ROUND-1',
  );

assert(
  started.ok &&
    started.state.ready &&
    started.state.playerCount ===
      3,
  'Sala UI não ficou pronta',
);

const bingo =
  processUiBall(
    'UI-ROOM-1',
    'UI-ROUND-1',
    57,
    1000,
    12,
    {
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
  );

assert(
  bingo.ok &&
    bingo.state.view.finished &&
    bingo.state.view.roomStatus ===
      'closed',
  'Estado UI não registrou fechamento do Bingo',
);

assert(
  bingo.state.view.totalBBPaid ===
    12,
  'UI não recebeu total correto de BB',
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
  'Carteiras não receberam BB corretamente',
);

assert(
  bingo.state.cardsByPlayer.A[0] ===
      'A1' &&
    bingo.state.cardsByPlayer.B[0] ===
      'B1',
  'Mapeamento de cartelas da UI incorreto',
);

const second =
  processUiBall(
    'UI-ROOM-1',
    'UI-ROUND-1',
    63,
    1000,
    12,
    {
      terno: [],
      quadra: [],
      diagonal: [],
      linha: [],
      dupla: [],
      bingo: [],
    },
  );

assert(
  !second.ok &&
    second.state.view.blocked,
  'UI deveria bloquear bola após fechamento',
);

console.log(
  'uiRoomController integration tests: OK',
);
