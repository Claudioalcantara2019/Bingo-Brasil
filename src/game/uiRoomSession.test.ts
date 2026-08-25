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
  createUiRoomSession,
} from './uiRoomSession';

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

const session =
  createUiRoomSession(
    'SESSION-ROOM',
    3,
  );

assert(
  session.state.roomId ===
    'SESSION-ROOM',
  'Sessão não recebeu roomId',
);

session.joinPlayer(
  'A',
  ['A1'],
);

session.joinPlayer(
  'B',
  ['B1'],
);

session.joinPlayer(
  'C',
  ['C1'],
);

assert(
  session.state.playerCount ===
    3,
  'Sessão não atualizou jogadores',
);

const started =
  session.startRound(
    'SESSION-ROUND',
  );

assert(
  started.ok &&
    session.state.ready,
  'Sessão não ficou pronta para a rodada',
);

const processed =
  session.processBall(
    'SESSION-ROUND',
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
  processed.ok &&
    session.state.view.finished,
  'Sessão não refletiu o Bingo concluído',
);

assert(
  session.state.view.totalBBPaid ===
    12,
  'Sessão não refletiu as BB',
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
  'Carteiras não receberam BB',
);

const blocked =
  session.processBall(
    'SESSION-ROUND',
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
  !blocked.ok &&
    session.state.view.blocked,
  'Sessão não manteve bloqueio após fechamento',
);

const closed =
  session.closeRoom();

assert(
  closed.ok &&
    session.state.view.roomStatus ===
      'closed',
  'Sessão não fechou a sala',
);

console.log(
  'uiRoomSession integration tests: OK',
);
