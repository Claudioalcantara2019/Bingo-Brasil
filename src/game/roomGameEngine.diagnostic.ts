import {
    clearRoomTestStore,
    createRoom,
    joinRoom,
} from './roomEngine';

import {
    clearRoundStateTestStore,
} from './roundStateEngine';

import {
    getRoomRoundState,
    startRoomRound,
} from './roomRoundCoordinator';

import {
    clearSettlementTestStore,
} from './settlementEngine';

import {
    clearWalletLedgerTestStore,
} from './walletLedger';

import {
    processRoomGameEvent,
} from './roomGameEngine';

clearRoomTestStore();
clearRoundStateTestStore();
clearSettlementTestStore();
clearWalletLedgerTestStore();

console.log('\n=== 1. CRIANDO SALA ===');

console.log(
  createRoom(
    'DIAG-ROOM',
    3,
  ),
);

console.log('\n=== 2. ENTRANDO JOGADORES ===');

console.log(
  joinRoom(
    'DIAG-ROOM',
    'A',
    ['A1'],
  ),
);

console.log(
  joinRoom(
    'DIAG-ROOM',
    'B',
    ['B1'],
  ),
);

console.log(
  joinRoom(
    'DIAG-ROOM',
    'C',
    ['C1'],
  ),
);

console.log('\n=== 3. INICIANDO SALA + RODADA ===');

console.log(
  startRoomRound(
    'DIAG-ROOM',
    'DIAG-ROUND',
  ),
);

console.log('\n=== 4. ESTADO ANTES DO BINGO ===');

console.log(
  getRoomRoundState(
    'DIAG-ROOM',
  ),
);

console.log('\n=== 5. PROCESSANDO BINGO ===');

const bingo =
  processRoomGameEvent({
    roomId:
      'DIAG-ROOM',
    roundId:
      'DIAG-ROUND',
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

console.log(
  bingo,
);

console.log('\n=== 6. ESTADO DEPOIS DO BINGO ===');

console.log(
  getRoomRoundState(
    'DIAG-ROOM',
  ),
);

console.log('\n=== 7. TENTANDO NOVA BOLA ===');

const second =
  processRoomGameEvent({
    roomId:
      'DIAG-ROOM',
    roundId:
      'DIAG-ROUND',
    triggerNumber:
      63,
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
      bingo: [],
    },
  });

console.log(
  second,
);