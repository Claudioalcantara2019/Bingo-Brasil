import {
  clearRoomTestStore,
  createRoom,
  joinRoom,
  startRoom,
} from './roomEngine';

import {
  buildRoomRoundEconomyGate,
} from './roomRoundEconomyGate';

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
  'GATE-INTEGRATION-ROOM',
  3,
);

joinRoom(
  'GATE-INTEGRATION-ROOM',
  'A',
  [
    'A1',
    'A2',
  ],
);

joinRoom(
  'GATE-INTEGRATION-ROOM',
  'B',
  [
    'B1',
  ],
);

startRoom(
  'GATE-INTEGRATION-ROOM',
  'GATE-INTEGRATION-ROUND',
);

const gate =
  buildRoomRoundEconomyGate(
    'GATE-INTEGRATION-ROOM',
    'GATE-INTEGRATION-ROUND',
    25,
    12,
    {
      terno: [],
      quadra: [],
      diagonal: [],
      linha: [],
      dupla: [],
      bingo: [],
    },
  );

const result =
  processRoundEvent({
    ...gate.roundInput,
    triggerNumber:
      57,
  });

assert(
  gate.economy.ticketCount ===
    3,
  'Integração deveria contar 3 cartelas',
);

assert(
  gate.economy.economy.grossGold ===
    75,
  'Integração deveria calcular 75 de arrecadação',
);

assert(
  result.prizePool ===
    gate.economy.economy.prizePool,
  'RoundEngine não recebeu o pool calculado pelas cartelas',
);

assert(
  result.residualGold ===
    result.prizePool,
  'Sem vencedores, o pool inteiro deveria permanecer residual',
);

console.log(
  'roomRoundEconomyGate integration tests: OK',
);
