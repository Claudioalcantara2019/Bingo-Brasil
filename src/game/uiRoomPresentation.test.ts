import { clearRoomTestStore } from './roomEngine';
import { clearRoundStateTestStore } from './roundStateEngine';
import { clearSettlementTestStore } from './settlementEngine';
import { clearWalletLedgerTestStore } from './walletLedger';
import { createUiRoomSession } from './uiRoomSession';
import { buildUiRoomPresentation } from './uiRoomPresentation';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

clearRoomTestStore();
clearRoundStateTestStore();
clearSettlementTestStore();
clearWalletLedgerTestStore();

const session = createUiRoomSession('PRESENTATION-ROOM', 3);
session.joinPlayer('A', ['A1']);
session.joinPlayer('B', ['B1']);
session.joinPlayer('C', ['C1']);
session.startRound('PRESENTATION-ROUND');

const initial = buildUiRoomPresentation(session);

assert(
  initial.roomId === 'PRESENTATION-ROOM',
  'RoomId da apresentação incorreto',
);
assert(
  initial.header.players === '3 jogadores',
  'Jogadores da apresentação incorretos',
);
assert(
  initial.round.blocked === false,
  'Rodada não deveria estar bloqueada',
);

const processed = session.processBall(
  'PRESENTATION-ROUND',
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
      { userId: 'A', cardId: 'A1' },
      { userId: 'B', cardId: 'B1' },
      { userId: 'C', cardId: 'C1' },
    ],
  },
);

assert(
  processed.ok,
  'Processamento do Bingo deveria funcionar',
);

const finalView = buildUiRoomPresentation(session);

assert(
  finalView.header.roomStatus === 'Sala encerrada' &&
    finalView.header.roundStatus === 'Rodada encerrada',
  'Apresentação não refletiu o fechamento',
);
assert(
  finalView.round.banner === '🎱 BINGO — rodada encerrada',
  'Banner da apresentação incorreto',
);
assert(
  finalView.round.blocked === false,
  'A apresentação do resultado não deveria marcar erro',
);
assert(
  finalView.economy.bbPaid === '12' &&
    finalView.economy.goldPaid === '225',
  'Economia da apresentação incorreta',
);

const bingo = finalView.prizes.find((row) => row.key === 'bingo');

assert(
  bingo?.statusText === 'Pago' &&
    bingo?.highlighted === true,
  'Bingo não apareceu como pago',
);

console.log('uiRoomPresentation integration tests: OK');
