import {
  clearRoundWinnerRegistryTestStore,
  filterEligibleRoundWinners,
  getRoundCategoryWinnerCount,
  getRoundCategoryWinners,
  registerRoundWinners,
} from './roundWinnerRegistry';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

clearRoundWinnerRegistryTestStore();

const firstTernos =
  registerRoundWinners(
    'ROUND-1',
    'terno',
    [
      {
        userId:
          'A',
        cardId:
          'A1',
      },
      {
        userId:
          'B',
        cardId:
          'B1',
      },
    ],
    10,
  );

assert(
  firstTernos.length ===
    2,
  'Dois vencedores de Terno deveriam ser registrados',
);

assert(
  getRoundCategoryWinnerCount(
    'ROUND-1',
    'terno',
  ) === 2,
  'Contagem de Terno incorreta',
);

const repeatedAndNew =
  filterEligibleRoundWinners(
    'ROUND-1',
    'terno',
    [
      {
        userId:
          'A',
        cardId:
          'A1',
      },
      {
        userId:
          'C',
        cardId:
          'C1',
      },
      {
        userId:
          'D',
        cardId:
          'D1',
      },
    ],
  );

assert(
  repeatedAndNew.length ===
    2 &&
    repeatedAndNew[0].userId ===
      'C' &&
    repeatedAndNew[1].userId ===
      'D',
  'Cartela já vencedora não deveria receber novo Terno',
);

registerRoundWinners(
  'ROUND-1',
  'terno',
  repeatedAndNew,
  11,
);

const sixth =
  filterEligibleRoundWinners(
    'ROUND-1',
    'terno',
    [
      {
        userId:
          'E',
        cardId:
          'E1',
      },
      {
        userId:
          'F',
        cardId:
          'F1',
      },
      {
        userId:
          'G',
        cardId:
          'G1',
      },
    ],
  );

assert(
  sixth.length ===
    1 &&
    sixth[0].userId ===
      'E',
  'Terno deveria parar na 5ª vaga',
);

registerRoundWinners(
  'ROUND-1',
  'terno',
  sixth,
  12,
);

assert(
  getRoundCategoryWinnerCount(
    'ROUND-1',
    'terno',
  ) === 5,
  'Terno deveria ter exatamente 5 vencedores',
);

const noMoreTernos =
  filterEligibleRoundWinners(
    'ROUND-1',
    'terno',
    [
      {
        userId:
          'Z',
        cardId:
          'Z1',
      },
    ],
  );

assert(
  noMoreTernos.length ===
    0,
  'Não deveria haver 6º vencedor de Terno',
);

const doubleFirst =
  registerRoundWinners(
    'ROUND-1',
    'dupla',
    [
      {
        userId:
          'A',
        cardId:
          'A1',
      },
      {
        userId:
          'B',
        cardId:
          'B1',
      },
      {
        userId:
          'C',
        cardId:
          'C1',
      },
      {
        userId:
          'D',
        cardId:
          'D1',
      },
    ],
    20,
  );

assert(
  doubleFirst.length ===
    3,
  'Linha Dupla deveria preencher apenas 3 vagas',
);

const noMoreDouble =
  filterEligibleRoundWinners(
    'ROUND-1',
    'dupla',
    [
      {
        userId:
          'E',
        cardId:
          'E1',
      },
    ],
  );

assert(
  noMoreDouble.length ===
    0,
  'Linha Dupla não deveria aceitar 4º vencedor',
);

const bingoFirst =
  registerRoundWinners(
    'ROUND-2',
    'bingo',
    [
      {
        userId:
          'A',
        cardId:
          'A1',
      },
      {
        userId:
          'B',
        cardId:
          'B1',
      },
      {
        userId:
          'C',
        cardId:
          'C1',
      },
      {
        userId:
          'D',
        cardId:
          'D1',
      },
    ],
    75,
  );

assert(
  bingoFirst.length ===
    4,
  'Bingo deveria aceitar todos os vencedores válidos',
);

const audit =
  getRoundCategoryWinners(
    'ROUND-1',
    'terno',
  );

assert(
  audit.length === 5 &&
    audit[0].place === 1 &&
    audit[4].place === 5,
  'Posições dos vencedores de Terno incorretas',
);

console.log(
  'roundWinnerRegistry tests: OK',
);
