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
  createUiTicketRoomSession,
} from './uiTicketRoomSession';

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
  createUiTicketRoomSession(
    'UI-TICKET-SESSION',
    3,
  );

session.joinPlayer(
  'A',
  ['A1', 'A2'],
);

session.joinPlayer(
  'B',
  ['B1', 'B2', 'B3'],
);

const started =
  session.startRound(
    'UI-TICKET-SESSION-ROUND',
  );

assert(
  started.ok &&
    session.state.roundId ===
      'UI-TICKET-SESSION-ROUND',
  'Sessão não iniciou a rodada',
);

const result =
  session.processBallFromTickets(
    'UI-TICKET-SESSION-ROUND',
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
  'Fluxo real por cartelas deveria funcionar',
);

assert(
  result.ticketCount ===
      5 &&
    result.grossGold ===
      125 &&
    result.prizePool ===
      81,
  'Economia por cartelas não chegou à sessão UI',
);

assert(
  session.state.roomId ===
      'UI-TICKET-SESSION' &&
    session.state.roundId ===
      'UI-TICKET-SESSION-ROUND',
  'Sessão perdeu a identidade da rodada',
);

assert(
  session.state.header.players ===
    '2 jogadores',
  'Sessão perdeu quantidade de jogadores',
);

console.log(
  'uiTicketRoomSession integration tests: OK',
);
