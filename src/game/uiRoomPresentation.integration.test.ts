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

const session = createUiRoomSession('PRESENTATION-BLOCK-ROOM', 2);
session.joinPlayer('A', ['A1']);
session.joinPlayer('B', ['B1']);
session.startRound('PRESENTATION-BLOCK-ROUND');

session.processBall(
  'PRESENTATION-BLOCK-ROUND',
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
    ],
  },
);

const presentation = buildUiRoomPresentation(session);

assert(
  presentation.round.id === 'PRESENTATION-BLOCK-ROUND' &&
    presentation.header.players === '2 jogadores',
  'Contrato principal da apresentação incorreto',
);
assert(
  presentation.prizes.length === 6,
  'Apresentação deveria conter 6 categorias',
);
assert(
  presentation.economy.bbPaid === '12',
  'Apresentação deveria mostrar 12 BB',
);

console.log('uiRoomPresentation contract tests: OK');
