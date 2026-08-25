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
} from './walletLedger';

import {
  createUiRoomActions,
} from './uiRoomActions';

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

const actions =
  createUiRoomActions(
    'ACTIONS-ROOM',
    3,
  );

const created =
  actions.createRoom(
    3,
  );

assert(
  created.ok &&
    created.state.roomId ===
      'ACTIONS-ROOM',
  'Criação da sala falhou',
);

const a =
  actions.joinPlayer(
    'A',
    ['A1'],
  );

const b =
  actions.joinPlayer(
    'B',
    ['B1'],
  );

const c =
  actions.joinPlayer(
    'C',
    ['C1'],
  );

assert(
  a.ok &&
    b.ok &&
    c.ok &&
    actions.read().header.players ===
      '3 jogadores',
  'Entrada dos jogadores falhou',
);

const started =
  actions.startRound(
    'ACTIONS-ROUND',
  );

assert(
  started.ok &&
    started.state.round.id ===
      'ACTIONS-ROUND',
  'Início da rodada falhou',
);

const bingo =
  actions.processBall(
    'ACTIONS-ROUND',
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
    bingo.state.round.banner ===
      '🎱 BINGO — rodada encerrada',
  'Processamento do Bingo falhou',
);

assert(
  bingo.state.economy.bbPaid ===
    '12',
  'BB não chegaram à camada de ações',
);

const second =
  actions.processBall(
    'ACTIONS-ROUND',
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
    second.state.header.connection ===
      'Bloqueado',
  'Nova bola deveria ser bloqueada',
);

const closed =
  actions.closeRoom();

assert(
  closed.ok &&
    closed.state.header.roomStatus ===
      'Sala encerrada',
  'Fechamento da sala falhou',
);

console.log(
  'uiRoomActions integration tests: OK',
);
