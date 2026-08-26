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
  getWalletBalance,
} from './walletLedger';

import {
  clearRoundWinnerRegistryTestStore,
  getRoundCategoryWinnerCount,
  getRoundCategoryWinners,
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
  'ROOM-MULTI-CARDS',
  6,
);

joinRoom(
  'ROOM-MULTI-CARDS',
  'A',
  ['A1'],
);

joinRoom(
  'ROOM-MULTI-CARDS',
  'B',
  ['B1'],
);

joinRoom(
  'ROOM-MULTI-CARDS',
  'C',
  ['C1'],
);

joinRoom(
  'ROOM-MULTI-CARDS',
  'D',
  ['D1'],
);

joinRoom(
  'ROOM-MULTI-CARDS',
  'E',
  ['E1'],
);

joinRoom(
  'ROOM-MULTI-CARDS',
  'F',
  ['F1'],
);

startRoomRound(
  'ROOM-MULTI-CARDS',
  'ROUND-MULTI-CARDS',
);

const first =
  processRoomGameEvent({
    roomId:
      'ROOM-MULTI-CARDS',
    roundId:
      'ROUND-MULTI-CARDS',
    triggerNumber:
      47,
    virtualGoldUsed:
      1000,
    accumulatedBB:
      0,
    candidates: {
      terno: [
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
        {
          userId: 'D',
          cardId: 'D1',
        },
        {
          userId: 'E',
          cardId: 'E1',
        },
        {
          userId: 'F',
          cardId: 'F1',
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
  first.ok,
  'Primeiro evento multi-cartelas deveria ser processado',
);

assert(
  getRoundCategoryWinnerCount(
    'ROUND-MULTI-CARDS',
    'terno',
  ) === 5,
  'Terno deveria ocupar exatamente 5 vagas',
);

const winners =
  getRoundCategoryWinners(
    'ROUND-MULTI-CARDS',
    'terno',
  );

assert(
  winners.length === 5 &&
    winners.map(
      (winner) =>
        winner.userId,
    ).join(',') ===
      'A,B,C,D,E',
  'Os cinco primeiros vencedores deveriam ocupar as vagas em ordem',
);

assert(
  first.flow !== null &&
    first.flow.round.categories.some(
      (category) =>
        category.category ===
          'terno' &&
        category.winners.length ===
          5,
    ),
  'RoundEngine deveria confirmar cinco vencedores de Terno',
);

const second =
  processRoomGameEvent({
    roomId:
      'ROOM-MULTI-CARDS',
    roundId:
      'ROUND-MULTI-CARDS',
    triggerNumber:
      48,
    virtualGoldUsed:
      1000,
    accumulatedBB:
      0,
    candidates: {
      terno: [
        {
          userId: 'A',
          cardId: 'A1',
        },
        {
          userId: 'F',
          cardId: 'F1',
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
      'ROUND-MULTI-CARDS',
      'terno',
    ) === 5,
  'Depois de preencher 5 vagas, Terno não poderia receber nova vaga',
);

const third =
  processRoomGameEvent({
    roomId:
      'ROOM-MULTI-CARDS',
    roundId:
      'ROUND-MULTI-CARDS',
    triggerNumber:
      49,
    virtualGoldUsed:
      1000,
    accumulatedBB:
      0,
    candidates: {
      terno: [
        {
          userId: 'F',
          cardId: 'F1',
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
  third.ok &&
    getRoundCategoryWinnerCount(
      'ROUND-MULTI-CARDS',
      'terno',
    ) === 5,
  'Terno cheio não poderia ser expandido para um sexto vencedor',
);

const fBalance =
  getWalletBalance(
    'F',
  );

assert(
  fBalance.gold === 0 &&
    fBalance.bb === 0,
  'Jogador barrado após o limite não deveria receber prêmio',
);

console.log(
  'multiple-card winner-slot tests: OK',
);
