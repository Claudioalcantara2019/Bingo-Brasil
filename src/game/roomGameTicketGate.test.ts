import {
  clearRoomTestStore,
} from './roomEngine';

import {
  createRoomRound,
  joinRoomPlayer,
  startRoomRound,
} from './roomRoundCoordinator';

import {
  processRoomGameEventFromTickets,
} from './roomGameTicketGate';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

clearRoomTestStore();

createRoomRound(
  'TICKET-GATE-ROOM',
  4,
);

joinRoomPlayer(
  'TICKET-GATE-ROOM',
  'A',
  [
    'A1',
    'A2',
  ],
);

joinRoomPlayer(
  'TICKET-GATE-ROOM',
  'B',
  [
    'B1',
    'B2',
    'B3',
  ],
);

startRoomRound(
  'TICKET-GATE-ROOM',
  'TICKET-GATE-ROUND',
);

const result =
  processRoomGameEventFromTickets({
    roomId:
      'TICKET-GATE-ROOM',
    roundId:
      'TICKET-GATE-ROUND',
    triggerNumber:
      57,
    ticketValue:
      25,
    accumulatedBB:
      0,
    candidates: {
      terno: [],
      quadra: [],
      diagonal: [],
      linha: [],
      dupla: [],
      bingo: [],
    },
  });

assert(
  result.ticketCount ===
    5,
  'Gateway deveria detectar 5 cartelas',
);

assert(
  result.grossGold ===
    125,
  'Gateway deveria calcular 125 fichas brutas',
);

assert(
  result.prizePool ===
    81,
  'Gateway deveria calcular 65% de 125',
);

assert(
  result.roomResult.ok &&
    result.roomResult.flow !==
      null,
  'Evento por cartelas deveria chegar ao roomGameEngine',
);

assert(
  result.roomResult.flow?.round.prizePool ===
    81,
  'RoundEngine deveria usar o pool calculado pelas cartelas',
);

assert(
  result.roomResult.flow?.round.residualGold ===
    81,
  'Sem vencedor, o pool inteiro deveria permanecer residual',
);

console.log(
  'roomGameTicketGate integration tests: OK',
);
