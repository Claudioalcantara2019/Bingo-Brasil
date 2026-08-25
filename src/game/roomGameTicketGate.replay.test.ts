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
  'TICKET-GATE-REPLAY',
  2,
);

joinRoomPlayer(
  'TICKET-GATE-REPLAY',
  'A',
  ['A1'],
);

joinRoomPlayer(
  'TICKET-GATE-REPLAY',
  'B',
  ['B1'],
);

startRoomRound(
  'TICKET-GATE-REPLAY',
  'TICKET-GATE-REPLAY-ROUND',
);

const first =
  processRoomGameEventFromTickets({
    roomId:
      'TICKET-GATE-REPLAY',
    roundId:
      'TICKET-GATE-REPLAY-ROUND',
    triggerNumber:
      1,
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
  first.grossGold ===
    50,
  'Primeira leitura deveria usar 2 cartelas',
);

const second =
  processRoomGameEventFromTickets({
    roomId:
      'TICKET-GATE-REPLAY',
    roundId:
      'TICKET-GATE-REPLAY-ROUND',
    triggerNumber:
      2,
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
  second.grossGold ===
    50,
  'Reprocessamento deveria manter a mesma economia da sala',
);

console.log(
  'roomGameTicketGate replay tests: OK',
);
