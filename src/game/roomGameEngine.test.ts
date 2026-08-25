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
  first.flow !== undefined &&
    first.flow !== null &&
    first.flow.round.settlements.some(
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

/*
 * Teste isolado da regra de vencedores múltiplos por categoria.
 * Esta sala NÃO possui Bingo no primeiro evento, portanto permanece aberta.
 */
createRoom(
  'ROOM-TERNOS',
  5,
);

joinRoom(
  'ROOM-TERNOS',
  'A',
  ['A1'],
);

joinRoom(
  'ROOM-TERNOS',
  'B',
  ['B1'],
);

joinRoom(
  'ROOM-TERNOS',
  'C',
  ['C1'],
);

joinRoom(
  'ROOM-TERNOS',
  'D',
  ['D1'],
);

joinRoom(
  'ROOM-TERNOS',
  'E',
  ['E1'],
);

const ternoStarted =
  startRoomRound(
    'ROOM-TERNOS',
    'ROUND-TERNOS',
  );

assert(
  ternoStarted.ok,
  'Sala de Ternos não iniciou',
);

const firstTernoEvent =
  processRoomGameEvent({
    roomId:
      'ROOM-TERNOS',
    roundId:
      'ROUND-TERNOS',
    triggerNumber:
      10,
    virtualGoldUsed:
      1000,
    accumulatedBB:
      12,
    candidates: {
      terno: [
        {
          userId:
            'A',
          cardId:
            'A1',
        },
        {
          userId:
            'B',
          cardId:
            'B1',
        },
      ],
      quadra: [],
      diagonal: [],
      linha: [],
      dupla: [],
      bingo: [],
    },
  });

assert(
  firstTernoEvent.ok &&
    firstTernoEvent.flow !== null &&
    firstTernoEvent.flow.round.settlements.some(
      (settlement) =>
        settlement.category ===
          'terno',
    ),
  'Primeiro evento deveria registrar Terno',
);

/*
 * As mesmas duas cartelas não podem ocupar novamente Terno.
 */
const repeatedTernoEvent =
  processRoomGameEvent({
    roomId:
      'ROOM-TERNOS',
    roundId:
      'ROUND-TERNOS',
    triggerNumber:
      11,
    virtualGoldUsed:
      1000,
    accumulatedBB:
      12,
    candidates: {
      terno: [
        {
          userId:
            'A',
          cardId:
            'A1',
        },
        {
          userId:
            'B',
          cardId:
            'B1',
        },
      ],
      quadra: [],
      diagonal: [],
      linha: [],
      dupla: [],
      bingo: [],
    },
  });

assert(
  repeatedTernoEvent.ok &&
    repeatedTernoEvent.flow !== null &&
    repeatedTernoEvent.flow.round.settlements.every(
      (settlement) =>
        settlement.category !==
        'terno',
    ),
  'Cartelas já premiadas não deveriam receber novo Terno',
);

/*
 * Uma nova cartela ocupa a próxima vaga.
 */
const newTernoEvent =
  processRoomGameEvent({
    roomId:
      'ROOM-TERNOS',
    roundId:
      'ROUND-TERNOS',
    triggerNumber:
      12,
    virtualGoldUsed:
      1000,
    accumulatedBB:
      12,
    candidates: {
      terno: [
        {
          userId:
            'C',
          cardId:
            'C1',
        },
      ],
      quadra: [],
      diagonal: [],
      linha: [],
      dupla: [],
      bingo: [],
    },
  });

assert(
  newTernoEvent.ok &&
    newTernoEvent.flow !== null &&
    newTernoEvent.flow.round.settlements.some(
      (settlement) =>
        settlement.category ===
          'terno',
    ),
  'Nova cartela deveria ocupar a próxima vaga de Terno',
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
