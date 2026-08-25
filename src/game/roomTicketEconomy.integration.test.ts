import {
  clearRoomTestStore,
  createRoom,
  joinRoom,
  startRoom,
} from './roomEngine';

import {
  calculateRoomTicketEconomy,
} from './roomTicketEconomy';

import {
  processRoundEvent,
} from './roundEngine';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

clearRoomTestStore();

createRoom(
  'ROOM-TICKET-INTEGRATION',
  4,
);

joinRoom(
  'ROOM-TICKET-INTEGRATION',
  'A',
  [
    'A1',
    'A2',
  ],
);

joinRoom(
  'ROOM-TICKET-INTEGRATION',
  'B',
  [
    'B1',
    'B2',
  ],
);

startRoom(
  'ROOM-TICKET-INTEGRATION',
  'ROUND-TICKET-INTEGRATION',
);

const economy =
  calculateRoomTicketEconomy(
    'ROOM-TICKET-INTEGRATION',
    25,
);

const round =
  processRoundEvent({
    roundId:
      'ROUND-TICKET-INTEGRATION',
    triggerNumber:
      57,
    virtualGoldUsed:
      economy.economy.grossGold,
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
  economy.ticketCount ===
    4,
  'Integração deveria contar 4 cartelas',
);

assert(
  round.prizePool ===
    economy.economy.prizePool,
  'RoundEngine não recebeu o valor bruto correto das cartelas',
);

assert(
  Object.values(
    round.categoryPools,
  ).reduce(
    (sum, value) =>
      sum + value,
    0,
  ) ===
    economy.economy.prizePool,
  'Pool da rodada não fechou com a economia da sala',
);

console.log(
  'roomTicketEconomy integration tests: OK',
);
