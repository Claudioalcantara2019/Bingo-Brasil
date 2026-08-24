import {
  clearRoomTestStore,
  createRoom,
  joinRoom,
} from './roomEngine';

import {
  clearRoundStateTestStore,
} from './roundStateEngine';

import {
  startRoomRound,
  closeRoomRound,
} from './roomRoundCoordinator';

import {
  clearSettlementTestStore,
} from './settlementEngine';

import {
  clearWalletLedgerTestStore,
  getWalletBalance,
} from './walletLedger';

import {
  processRoomGameEvent,
} from './roomGameEngine';

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

createRoom(
  'ROOM-GAME-1',
  3,
);

joinRoom(
  'ROOM-GAME-1',
  'A',
  ['A1'],
);

joinRoom(
  'ROOM-GAME-1',
  'B',
  ['B1'],
);

joinRoom(
  'ROOM-GAME-1',
  'C',
  ['C1'],
);

const started =
  startRoomRound(
    'ROOM-GAME-1',
    'ROUND-GAME-1',
  );

assert(
  started.ok,
  'Sala/rodada não iniciou',
);

const first =
  processRoomGameEvent({
    roomId:
      'ROOM-GAME-1',
    roundId:
      'ROUND-GAME-1',
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
  first.ok &&
    first.reason ===
      'processed-and-closed',
  'Evento com Bingo deveria encerrar o fluxo',
);

assert(
  first.flow?.finished === true,
  'Fluxo não marcou a rodada como encerrada',
);

assert(
  first.flow?.round.settlements.some(
    (settlement) =>
      settlement.category ===
        'bingo' &&
      (
        settlement.status ===
          'paid' ||
        settlement.status ===
          'already-paid'
      ),
  ),
  'Primeiro evento deveria conter settlement de Bingo',
);

assert(
  first.roomStatus ===
      'closed' &&
    first.roundStatus ===
      'closed',
  'Sala e rodada não foram sincronizadas como closed',
);

assert(
  getWalletBalance('A').bb ===
      4 &&
    getWalletBalance('B').bb ===
      4 &&
    getWalletBalance('C').bb ===
      4,
  'BB do Bingo não chegaram às três carteiras',
);

assert(
  getWalletBalance('A').gold ===
    getWalletBalance('B').gold &&
    getWalletBalance('B').gold ===
      getWalletBalance('C').gold,
  'Fichas do Bingo não foram divididas igualmente',
);

/*
 * A gateway roomGame não reabre/repaga a rodada fechada.
 */
const second =
  processRoomGameEvent({
    roomId:
      'ROOM-GAME-1',
    roundId:
      'ROUND-GAME-1',
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

assert(
  !second.ok &&
    second.reason ===
      'room-not-running' &&
    second.roomStatus ===
      'closed' &&
    second.roundStatus ===
      'closed',
  'Sala/rodada fechadas deveriam bloquear nova bola',
);

const wrongRoom =
  processRoomGameEvent({
    roomId:
      'ROOM-DOES-NOT-EXIST',
    roundId:
      'ROUND-GAME-1',
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

assert(
  !wrongRoom.ok &&
    wrongRoom.reason ===
      'room-not-running',
  'Sala inexistente deveria bloquear o evento',
);

console.log(
  'roomGameEngine integration tests: OK',
);
