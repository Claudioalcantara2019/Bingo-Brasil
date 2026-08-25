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
    'UI-BLOCK-ROOM',
    3,
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

const started =
  session.startRound(
    'UI-BLOCK-ROUND',
  );

assert(
  started.ok &&
    session.state.ready,
  'Sessão UI não ficou pronta',
);

const bingo =
  session.processBall(
    'UI-BLOCK-ROUND',
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
      'closed' &&
    bingo.state.view.roundStatus ===
      'closed',
  'Sessão UI não refletiu fechamento completo',
);

assert(
  bingo.state.view.totalBBPaid ===
    12,
  'Sessão UI não refletiu 12 BB',
);

const blocked =
  session.processBall(
    'UI-BLOCK-ROUND',
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
    blocked.state.view.blocked,
  'Sessão UI deveria bloquear nova bola',
);

console.log(
  'ui internal block integration tests: OK',
);
