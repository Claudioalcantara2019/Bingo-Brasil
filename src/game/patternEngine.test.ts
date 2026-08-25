import {
  detectBingo,
  detectLineDouble,
  detectLines,
  evaluateCardPatterns,
} from './patternEngine';

function assert(
  condition: boolean,
  message: string,
) {
  if (!condition) {
    throw new Error(message);
  }
}

const card = [
  1, 16, 31, 46, 61,
  2, 17, 32, 47, 62,
  3, 18, 0, 48, 63,
  4, 19, 34, 49, 64,
  5, 20, 35, 50, 65,
];

const terno =
  new Set([
    1,
    16,
    31,
  ]);

assert(
  evaluateCardPatterns(
    card,
    terno,
  ).terno.completed,
  'Terno não detectado',
);

const quadra =
  new Set([
    1,
    16,
    31,
    46,
  ]);

assert(
  evaluateCardPatterns(
    card,
    quadra,
  ).quadra.completed,
  'Quadra não detectada',
);

const horizontal =
  new Set([
    1,
    16,
    31,
    46,
    61,
  ]);

assert(
  detectLines(
    card,
    horizontal,
  ).horizontals[0]
    .completed,
  'Linha horizontal não detectada',
);

const diagonal =
  new Set([
    1,
    17,
    0,
    49,
    65,
  ]);

assert(
  detectLines(
    card,
    diagonal,
  ).diagonals.some(
    (result) =>
      result.completed,
  ),
  'Linha diagonal não detectada',
);

/*
 * REGRA OFICIAL:
 * Linha Dupla = 2 linhas HORIZONTAIS completas.
 * Diagonais não contam para formar Linha Dupla.
 */

const doubleHorizontal =
  new Set([
    1, 16, 31, 46, 61,
    5, 20, 35, 50, 65,
  ]);

const doubleHorizontalResult =
  detectLineDouble(
    card,
    doubleHorizontal,
  );

assert(
  doubleHorizontalResult.completed,
  'Duas horizontais deveriam formar Linha Dupla',
);

assert(
  doubleHorizontalResult.lineIndexes.length ===
    2,
  'Linha Dupla deveria registrar exatamente 2 horizontais',
);

const oneHorizontalOneDiagonal =
  new Set([
    1, 16, 31, 46, 61,
    1, 17, 0, 49, 65,
  ]);

const mixedResult =
  detectLineDouble(
    card,
    oneHorizontalOneDiagonal,
  );

assert(
  !mixedResult.completed,
  'Horizontal + diagonal NÃO deve formar Linha Dupla',
);

assert(
  mixedResult.progress === 1,
  'Horizontal + diagonal deveria contar somente a horizontal',
);

const doubleDiagonal =
  new Set([
    1, 17, 0, 49, 65,
    5, 18, 0, 47, 61,
  ]);

const doubleDiagonalResult =
  detectLineDouble(
    card,
    doubleDiagonal,
  );

assert(
  !doubleDiagonalResult.completed,
  'Duas diagonais NÃO devem formar Linha Dupla',
);

assert(
  doubleDiagonalResult.progress === 0,
  'Duas diagonais não devem aumentar o progresso da Linha Dupla',
);

/*
 * A diagonal continua sendo uma conquista própria.
 */
const evaluatedMixed =
  evaluateCardPatterns(
    card,
    diagonal,
  );

assert(
  evaluatedMixed.diagonais.some(
    (result) =>
      result.completed,
  ),
  'A diagonal deixou de existir como conquista própria',
);

const bingo =
  new Set(
    card.filter(
      (number) =>
        number !== 0,
    ),
  );

assert(
  detectBingo(
    card,
    bingo,
  ).completed,
  'Bingo cheio não detectado',
);

const all =
  evaluateCardPatterns(
    card,
    bingo,
  );

assert(
  all.bingo.completed,
  'Avaliação completa não reconheceu Bingo',
);

console.log(
  'patternEngine tests: OK',
);
