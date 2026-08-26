import {
  clearRoomTestStore,
  createRoom,
  joinRoom,
} from './roomEngine';

import {
  startRoomRound,
} from './roomRoundCoordinator';

import {
  clearSettlementTestStore,
} from './settlementEngine';

import {
  clearWalletLedgerTestStore,
} from './walletLedger';

import {
  clearRoundWinnerRegistryTestStore,
  getRoundCategoryWinnerCount,
} from './roundWinnerRegistry';

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
clearSettlementTestStore();
clearWalletLedgerTestStore();
clearRoundWinnerRegistryTestStore();

createRoom(
  'ROOM-ZERO-PRIZE',
  2,
);

joinRoom(
  'ROOM-ZERO-PRIZE',
  'A',
  ['A1'],
);

startRoomRound(
  'ROOM-ZERO-PRIZE',
  'ROUND-ZERO-PRIZE',
);

const result =
  processRoomGameEvent({
    roomId:
      'ROOM-ZERO-PRIZE',
    roundId:
      'ROUND-ZERO-PRIZE',
    triggerNumber:
      58,
    virtualGoldUsed:
      25,
    accumulatedBB:
      0,
    candidates: {
      terno: [
        {
          userId:
            'A',
          cardId:
            'A1',
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
  result.ok,
  'Evento de Terno deveria ser processado',
);

assert(
  result.flow !== null &&
    result.flow.round.categories.some(
      (category) =>
        category.category ===
          'terno' &&
        category.winners.length ===
          1,
    ),
  'Terno deveria ser confirmado na rodada',
);

assert(
  getRoundCategoryWinnerCount(
    'ROUND-ZERO-PRIZE',
    'terno',
  ) === 1,
  'Terno confirmado deveria ocupar 1/5 mesmo com pagamento zero',
);

const second =
  processRoomGameEvent({
    roomId:
      'ROOM-ZERO-PRIZE',
    roundId:
      'ROUND-ZERO-PRIZE',
    triggerNumber:
      59,
    virtualGoldUsed:
      25,
    accumulatedBB:
      0,
    candidates: {
      terno: [
        {
          userId:
            'A',
          cardId:
            'A1',
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
  second.ok &&
    getRoundCategoryWinnerCount(
      'ROUND-ZERO-PRIZE',
      'terno',
    ) === 1,
  'A mesma cartela não pode ocupar Terno novamente',
);

console.log(
  'roomGameEngine winner-slot regression tests: OK',
);
