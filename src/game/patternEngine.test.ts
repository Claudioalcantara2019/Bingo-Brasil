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
  new Set([1, 16, 31]);

assert(
  evaluateCardPatterns(
    card,
    terno,
  ).terno.completed,
  'Terno não detectado',
);

const quadra =
  new Set([1, 16, 31, 46]);

assert(
  evaluateCardPatterns(
    card,
    quadra,
  ).quadra.completed,
  'Quadra não detectada',
);

const horizontal =
  new Set([1, 16, 31, 46, 61]);

assert(
  detectLines(
    card,
    horizontal,
  ).horizontals[0].completed,
  'Linha horizontal não detectada',
);

const diagonal =
  new Set([1, 17, 0, 49, 65]);

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

const doubleLine =
  new Set([
    1, 16, 31, 46, 61,
    5, 20, 35, 50, 65,
  ]);

assert(
  detectLineDouble(
    card,
    doubleLine,
  ).completed,
  'Linha dupla não detectada',
);

const bingo =
  new Set(
    card.filter(
      (number) => number !== 0,
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
