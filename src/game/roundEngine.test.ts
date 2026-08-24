import {
  processRoundEvent,
} from './roundEngine';

import {
  clearSettlementTestStore,
  settleRound,
} from './settlementEngine';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

clearSettlementTestStore();

const result =
  processRoundEvent({
    roundId:
      'ROUND-TEST-1',
    triggerNumber: 57,
    virtualGoldUsed: 1000,
    accumulatedBB: 12,

    candidates: {
      terno: [
        {
          userId: 'A',
          cardId: 'A1',
        },
      ],

      quadra: [],

      diagonal: [
        {
          userId: 'F',
          cardId: 'F1',
        },
      ],

      linha: [
        {
          userId: 'B',
          cardId: 'B1',
        },
      ],

      dupla: [],

      bingo: [
        {
          userId: 'C',
          cardId: 'C1',
        },
        {
          userId: 'D',
          cardId: 'D1',
        },
        {
          userId: 'E',
          cardId: 'E1',
        },
      ],
    },
  });

assert(
  result.prizePool === 650,
  'Pool da rodada deveria ser 65% de 1000',
);

assert(
  result.categoryPools.terno === 65,
  'Pool de Terno incorreto',
);

assert(
  result.categoryPools.diagonal ===
    65,
  'Pool de Diagonal incorreto',
);

assert(
  result.categoryPools.bingo === 227,
  'Pool de Bingo incorreto',
);

const bingoCategory =
  result.categories.find(
    (category) =>
      category.category ===
      'bingo',
  );

assert(
  !!bingoCategory,
  'Categoria Bingo não foi criada',
);

assert(
  bingoCategory?.winners.length ===
    3,
  'Categoria Bingo deveria ter 3 vencedores',
);

assert(
  bingoCategory?.paidPool ===
    227,
  'Pool pago do Bingo deveria ser 227',
);

const ternoSettlement =
  result.settlements.find(
    (settlement) =>
      settlement.category ===
      'terno',
  );

assert(
  !!ternoSettlement,
  'Liquidação de Terno não encontrada',
);

assert(
  ternoSettlement?.category ===
    'terno',
  'Settlement de Terno sem categoria',
);

const diagonalSettlement =
  result.settlements.find(
    (settlement) =>
      settlement.category ===
      'diagonal',
  );

assert(
  !!diagonalSettlement,
  'Liquidação de Diagonal não encontrada',
);

const bingoSettlement =
  result.settlements.find(
    (settlement) =>
      settlement.category ===
      'bingo',
  );

assert(
  !!bingoSettlement,
  'Liquidação de Bingo não encontrada',
);

assert(
  bingoSettlement?.category ===
    'bingo',
  'Settlement deveria carregar sua categoria',
);

assert(
  result.settlements.length === 4,
  'Deveriam existir exatamente 4 liquidações nesta rodada de teste',
);

assert(
  bingoSettlement?.status ===
    'paid',
  'Liquidação de Bingo não foi marcada como paga',
);

assert(
  bingoSettlement?.payouts.length === 3,
  'Bingo deveria ter 3 pagamentos',
);

assert(
  bingoSettlement?.payouts.every(
    (payout) =>
      payout.gold === 75 &&
      payout.bb === 4,
  ),
  'Divisão de Bingo da rodada incorreta',
);

assert(
  result.residualGold > 0,
  'Deveria existir residual de categorias',
);

assert(
  result.residualBB === 0,
  'BB deveria ter sido totalmente distribuído neste caso',
);

assert(
  result.roundClosed,
  'Rodada deveria ser fechada após Bingo confirmado',
);

const noWinnerRound =
  processRoundEvent({
    roundId:
      'ROUND-TEST-2',
    triggerNumber: 33,
    virtualGoldUsed: 1000,
    accumulatedBB: 7,

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
  noWinnerRound.settlements.length === 0,
  'Sem vencedores não deveria haver liquidação',
);

assert(
  noWinnerRound.residualGold ===
    noWinnerRound.prizePool,
  'Sem vencedores, todo o pool deve permanecer como residual',
);

assert(
  !noWinnerRound.roundClosed,
  'Rodada sem Bingo não deveria ser encerrada',
);

const repeatClosedRound =
  processRoundEvent({
    roundId:
      'ROUND-TEST-1',
    triggerNumber:
      57,
    virtualGoldUsed:
      1000,
    accumulatedBB:
      12,

    candidates: {
      terno: [],
      quadra: [],
      diagonal: [],
      linha: [],
      dupla: [],
      bingo: [
        {
          userId: 'C',
          cardId: 'C1',
        },
        {
          userId: 'D',
          cardId: 'D1',
        },
        {
          userId: 'E',
          cardId: 'E1',
        },
      ],
    },
  });

assert(
  repeatClosedRound.roundClosed,
  'Rodada já liquidada deveria continuar fechada',
);


clearSettlementTestStore();

const directSettlement =
  settleRound({
    roundId:
      'DIRECT-TEST',
    category:
      'bingo',
    triggerNumber:
      57,
    winners: [
      {
        userId: 'X',
        cardId: 'X1',
      },
    ],
    prizeGold: 100,
    prizeBB: 2,
    settlementKey:
      'DIRECT-TEST-BINGO-57',
  });

assert(
  directSettlement.status ===
    'paid',
  'SettlementEngine direto não pagou',
);

assert(
  directSettlement.payouts.length ===
    1,
  'SettlementEngine direto não criou payout',
);


console.log(
  'roundEngine tests: OK',
);
