import {
  clearRoomTestStore,
  createRoom,
  joinRoom,
  startRoom,
} from './roomEngine';

import {
  buildRoomRoundEconomyGate,
} from './roomRoundEconomyGate';

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
  'GATE-ROOM',
  4,
);

joinRoom(
  'GATE-ROOM',
  'A',
  [
    'A1',
    'A2',
  ],
);

joinRoom(
  'GATE-ROOM',
  'B',
  [
    'B1',
  ],
);

startRoom(
  'GATE-ROOM',
  'GATE-ROUND',
);

const gate =
  buildRoomRoundEconomyGate(
    'GATE-ROOM',
    'GATE-ROUND',
    25,
    7,
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
  gate.economy.ticketCount ===
    3,
  'Gate deveria contar 3 cartelas',
);

assert(
  gate.economy.economy.grossGold ===
    75,
  'Gate deveria calcular 75 fichas brutas',
);

assert(
  gate.roundInput.virtualGoldUsed ===
    75,
  'RoundInput deveria receber a arrecadação das cartelas',
);

assert(
  gate.roundInput.roundId ===
    'GATE-ROUND',
  'RoundInput não preservou roundId',
);

assert(
  gate.roundInput.accumulatedBB ===
    7,
  'Gate alterou BB acumulado',
);

console.log(
  'roomRoundEconomyGate tests: OK',
);
