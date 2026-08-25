import {
  processRoundEvent,
} from './roundEngine';

import {
  calculateRoundTicketEconomy,
} from './roundTicketEconomy';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

const economy =
  calculateRoundTicketEconomy(
    20,
    25,
  );

const result =
  processRoundEvent({
    roundId:
      'TICKET-ECONOMY-ROUND',
    triggerNumber:
      57,

    /*
     * Compatibilidade temporária:
     * o roundEngine atual ainda recebe o valor bruto da entrada.
     * O bloco de economia é a fonte que calcula esse valor.
     */
    virtualGoldUsed:
      economy.grossGold,

    accumulatedBB:
      12,

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
  result.prizePool ===
    economy.prizePool,
  'RoundEngine não está usando a arrecadação calculada pelas cartelas',
);

assert(
  Object.values(
    result.categoryPools,
  ).reduce(
    (sum, value) =>
      sum + value,
    0,
  ) ===
    economy.prizePool,
  'RoundEngine e economia das cartelas não fecharam juntos',
);

console.log(
  'roundTicketEconomy integration tests: OK',
);
