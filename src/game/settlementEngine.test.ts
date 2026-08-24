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
  settleRound({
    roundId: 'ROUND-1',
    category: 'bingo',
    triggerNumber: 57,
    winners: [
      {
        userId: 'A',
        cardId: 'A1',
      },
      {
        userId: 'B',
        cardId: 'B1',
      },
      {
        userId: 'C',
        cardId: 'C1',
      },
    ],
    prizeGold: 1500,
    prizeBB: 12,
    settlementKey:
      'ROUND-1-BINGO-57',
  });

assert(
  result.status === 'paid',
  'Liquidação não foi paga',
);

assert(
  result.payouts.length === 3,
  'Bingo deveria pagar 3 vencedores',
);

assert(
  result.payouts.every(
    (payout) =>
      payout.gold === 500 &&
      payout.bb === 4,
  ),
  'Divisão de Bingo incorreta',
);

assert(
  result.goldResidual === 0 &&
    result.bbResidual === 0,
  'Não deveria existir residual neste caso',
);

const duplicateWinner =
  settleRound({
    roundId: 'ROUND-2',
    category: 'bingo',
    triggerNumber: 63,
    winners: [
      {
        userId: 'A',
        cardId: 'A1',
      },
      {
        userId: 'A',
        cardId: 'A2',
      },
      {
        userId: 'B',
        cardId: 'B1',
      },
    ],
    prizeGold: 1001,
    prizeBB: 5,
    settlementKey:
      'ROUND-2-BINGO-63',
  });

assert(
  duplicateWinner.payouts.length === 2,
  'Usuário duplicado deveria ocupar apenas uma vaga',
);

assert(
  duplicateWinner.payouts[0].gold === 500 &&
    duplicateWinner.payouts[1].gold === 500 &&
    duplicateWinner.goldResidual === 1,
  'Residual de fichas incorreto',
);

assert(
  duplicateWinner.payouts[0].bb === 2 &&
    duplicateWinner.payouts[1].bb === 2 &&
    duplicateWinner.bbResidual === 1,
  'Residual de BB incorreto',
);

const secondAttempt =
  settleRound({
    roundId: 'ROUND-2',
    category: 'bingo',
    triggerNumber: 63,
    winners: [
      {
        userId: 'A',
        cardId: 'A1',
      },
      {
        userId: 'B',
        cardId: 'B1',
      },
    ],
    prizeGold: 1001,
    prizeBB: 5,
    settlementKey:
      'ROUND-2-BINGO-63',
  });

assert(
  secondAttempt.status ===
    'already-paid',
  'Liquidação idempotente falhou',
);

assert(
  secondAttempt.payouts.length === 0,
  'Uma liquidação repetida não pode pagar novamente',
);

console.log(
  'settlementEngine tests: OK',
);
