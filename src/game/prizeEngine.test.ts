import {
  allocateCategoryPools,
  calculatePrizePool,
  resolvePrizeCategory,
} from './prizeEngine';

const assert = (
  condition: boolean,
  message: string,
) => {
  if (!condition) {
    throw new Error(message);
  }
};

const pool =
  calculatePrizePool(
    1000,
  );

assert(
  pool === 650,
  'Pool 65% inválido',
);

const categoryPools =
  allocateCategoryPools(
    pool,
  );

const categoryTotal =
  Object.values(
    categoryPools,
  ).reduce(
    (sum, value) =>
      sum + value,
    0,
  );

assert(
  categoryTotal === pool,
  'Pools de categorias não fecham o total',
);

const terno =
  resolvePrizeCategory(
    'terno',
    100,
    [
      { userId: 'A', cardId: '1' },
      { userId: 'B', cardId: '2' },
      { userId: 'A', cardId: '3' },
      { userId: 'C', cardId: '4' },
      { userId: 'D', cardId: '5' },
      { userId: 'E', cardId: '6' },
      { userId: 'F', cardId: '7' },
    ],
  );

assert(
  terno.winners.length === 5,
  'Terno não limitou a 5 usuários',
);

assert(
  new Set(
    terno.winners.map(
      (winner) =>
        winner.userId,
    ),
  ).size === 5,
  'Terno repetiu usuário',
);

const bingo =
  resolvePrizeCategory(
    'bingo',
    1000,
    [
      { userId: 'A', cardId: '1' },
      { userId: 'B', cardId: '2' },
      { userId: 'C', cardId: '3' },
    ],
  );

assert(
  bingo.winners.length === 3,
  'Bingo deveria ter 3 vencedores',
);

assert(
  bingo.paidPool === 1000,
  'Bingo não distribuiu o pool completo',
);

assert(
  bingo.winners.every(
    (winner) =>
      winner.prize > 0,
  ),
  'Bingo possui prêmio zero',
);


const oneTerno =
  resolvePrizeCategory(
    'terno',
    100,
    [
      {
        userId: 'A',
        cardId: '1',
      },
    ],
  );

assert(
  oneTerno.winners.length === 1,
  'Terno de 1 vencedor inválido',
);

assert(
  oneTerno.winners[0].prize === 30,
  'Terno de 1 vencedor deveria pagar a primeira posição (30%)',
);

assert(
  oneTerno.residual === 70,
  'Terno de 1 vencedor deveria deixar 70 de residual',
);

const twoTerno =
  resolvePrizeCategory(
    'terno',
    100,
    [
      {
        userId: 'A',
        cardId: '1',
      },
      {
        userId: 'B',
        cardId: '2',
      },
    ],
  );

assert(
  twoTerno.winners.length === 2,
  'Terno de 2 vencedores inválido',
);

assert(
  twoTerno.winners[0].prize === 30 &&
    twoTerno.winners[1].prize === 23,
  'Terno de 2 vencedores não respeitou as posições',
);

assert(
  twoTerno.residual === 47,
  'Terno de 2 vencedores deveria deixar 47 de residual',
);

const fullTerno =
  resolvePrizeCategory(
    'terno',
    100,
    [
      { userId: 'A', cardId: '1' },
      { userId: 'B', cardId: '2' },
      { userId: 'C', cardId: '3' },
      { userId: 'D', cardId: '4' },
      { userId: 'E', cardId: '5' },
    ],
  );

assert(
  fullTerno.paidPool === 100,
  'Terno completo deveria distribuir 100%',
);

assert(
  fullTerno.residual === 0,
  'Terno completo não deveria deixar residual',
);

console.log(
  'prizeEngine tests: OK',
);
