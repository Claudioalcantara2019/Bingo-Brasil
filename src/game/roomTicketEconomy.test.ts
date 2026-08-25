import {
  clearRoomTestStore,
  createRoom,
  joinRoom,
  startRoom,
} from './roomEngine';

import {
  calculateRoomTicketEconomy,
  getRoomTicketCount,
} from './roomTicketEconomy';

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
  'ROOM-ECONOMY',
  3,
);

joinRoom(
  'ROOM-ECONOMY',
  'A',
  [
    'A1',
    'A2',
  ],
);

joinRoom(
  'ROOM-ECONOMY',
  'B',
  [
    'B1',
  ],
);

assert(
  getRoomTicketCount(
    'ROOM-ECONOMY',
  ) === 3,
  'A sala deveria ter 3 cartelas',
);

const before =
  calculateRoomTicketEconomy(
    'ROOM-ECONOMY',
    25,
);

assert(
  before.ticketCount ===
      3 &&
    before.playerCount ===
      2 &&
    before.economy.grossGold ===
      75,
  'Economia da sala não refletiu as cartelas',
);

assert(
  before.economy.prizePool ===
      48 &&
    before.economy.retainedGold ===
      27,
  'Pool da sala incorreto',
);

startRoom(
  'ROOM-ECONOMY',
  'ROUND-ECONOMY',
);

const running =
  calculateRoomTicketEconomy(
    'ROOM-ECONOMY',
    25,
);

assert(
  running.roundId ===
    'ROUND-ECONOMY',
  'RoundId da sala não foi preservado',
);

assert(
  Object.values(
    running.economy.categoryPools,
  ).reduce(
    (sum, value) =>
      sum + value,
    0,
  ) ===
    running.economy.prizePool,
  'Pools da sala não fecham',
);

console.log(
  'roomTicketEconomy tests: OK',
);
