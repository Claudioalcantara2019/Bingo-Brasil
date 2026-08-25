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

import {
  buildUiRoomViewModel,
} from './uiRoomViewModel';

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
    'VM-INTEGRATION',
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

session.startRound(
  'VM-INTEGRATION-ROUND',
);

session.processBall(
  'VM-INTEGRATION-ROUND',
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
      {
        userId:
          'C',
        cardId:
          'C1',
      },
    ],
  },
);

const view =
  buildUiRoomViewModel(
    session.state,
  );

assert(
  view.roomStatusText ===
      'Sala encerrada' &&
    view.roundStatusText ===
      'Rodada encerrada',
  'ViewModel não refletiu fechamento',
);

assert(
  view.totalBBPaidText ===
    '12',
  'ViewModel não refletiu BB',
);

assert(
  view.playerCountText ===
    '3 jogadores',
  'ViewModel não refletiu jogadores',
);

assert(
  view.prizes.some(
    (prize) =>
      prize.key ===
        'bingo' &&
      prize.highlighted,
  ),
  'Bingo não ficou destacado no ViewModel',
);

console.log(
  'uiRoomViewModel integration tests: OK',
);
