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
  createUiTicketGameActions,
} from './uiTicketGameActions';

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
  createUiTicketGameActions(
    'UI-TICKET-ROOM',
    3,
  );

assert(
  actions.createRoom(
    3,
  ).ok,
  'Criação da sala falhou',
);

assert(
  actions.joinPlayer(
    'A',
    ['A1', 'A2'],
  ).ok,
  'Entrada A falhou',
);

assert(
  actions.joinPlayer(
    'B',
    ['B1', 'B2', 'B3'],
  ).ok,
  'Entrada B falhou',
);

assert(
  actions.startRound(
    'UI-TICKET-ROUND',
  ).ok,
  'Início da rodada falhou',
);

const result =
  actions.processBallFromTickets(
    'UI-TICKET-ROUND',
    57,
    25,
    0,
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
  result.ok,
  'Evento por cartelas deveria ser processado',
);

assert(
  result.ticketCount ===
      5 &&
    result.grossGold ===
      125 &&
    result.prizePool ===
      81,
  'Economia por cartelas chegou errada à camada UI',
);

assert(
  result.state.roomId ===
    'UI-TICKET-ROOM' &&
    result.state.roundId ===
      'UI-TICKET-ROUND',
  'Apresentação perdeu identificação da sala/rodada',
);

console.log(
  'uiTicketGameActions integration tests: OK',
);
