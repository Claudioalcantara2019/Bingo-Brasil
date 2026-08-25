import {
  checkEconomyInvariants,
} from './economyInvariant';

import type {
  RoundSettlementResult,
} from './roundEngine';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

const valid:
  RoundSettlementResult = {
  roundId:
    'ECONOMY-1',
  triggerNumber:
    57,
  prizePool:
    650,
  categoryPools: {
    terno: 65,
    quadra: 65,
    diagonal: 65,
    linha: 98,
    dupla: 130,
    bingo: 227,
  },
  categories: [],
  settlements: [
    {
      roundId:
        'ECONOMY-1',
      settlementKey:
        'ECONOMY-1:bingo:57',
      category:
        'bingo',
      status:
        'paid',
      totalGold:
        227,
      totalBB:
        12,
      payouts: [
        {
          userId:
            'A',
          cardId:
            'A1',
          gold:
            114,
          bb:
            6,
          category:
            'bingo',
          triggerNumber:
            57,
        },
        {
          userId:
            'B',
          cardId:
            'B1',
          gold:
            113,
          bb:
            6,
          category:
            'bingo',
          triggerNumber:
            57,
        },
      ],
      goldResidual:
        0,
      bbResidual:
        0,
    },
  ],
  residualGold:
    423,
  residualBB:
    0,
  roundClosed:
    true,
};

const result =
  checkEconomyInvariants(
    valid,
  );

assert(
  result.ok,
  'Rodada válida deveria passar',
);

assert(
  result.paidGold === 227 &&
    result.residualGold === 423 &&
    result.expectedGoldTotal === 650,
  'Fechamento de fichas incorreto',
);

assert(
  result.paidBB === 12 &&
    result.residualBB === 0,
  'Fechamento de BB incorreto',
);

const invalid:
  RoundSettlementResult = {
  ...valid,
  residualGold:
    400,
};

const invalidResult =
  checkEconomyInvariants(
    invalid,
  );

assert(
  !invalidResult.ok,
  'Economia inconsistente deveria falhar',
);

assert(
  invalidResult.errors.length > 0,
  'Deveria existir erro de invariância',
);

console.log(
  'economyInvariant tests: OK',
);
