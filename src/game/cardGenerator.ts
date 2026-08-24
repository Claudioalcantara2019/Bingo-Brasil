export type CardType = 'common' | 'green';

export type SpecialSymbol = 'bomb' | 'dolinha';

export type BingoCell = {
  number: number;
  isFree: boolean;
  symbols: SpecialSymbol[];
};

export type BingoCard = {
  id: string;
  type: CardType;
  cells: BingoCell[];
  bombPositions: number[];
  dolinhaPositions: number[];
};

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1),
    );

    [result[index], result[randomIndex]] = [
      result[randomIndex],
      result[index],
    ];
  }

  return result;
}

function createColumnNumbers(
  min: number,
  max: number,
): number[] {
  return shuffle(
    Array.from(
      { length: max - min + 1 },
      (_, index) => min + index,
    ),
  ).slice(0, 5);
}

function createBaseNumbers(): number[] {
  const b = createColumnNumbers(1, 15);
  const i = createColumnNumbers(16, 30);
  const n = createColumnNumbers(31, 45);
  const g = createColumnNumbers(46, 60);
  const o = createColumnNumbers(61, 75);

  return [
    b[0], i[0], n[0], g[0], o[0],
    b[1], i[1], n[1], g[1], o[1],
    b[2], i[2], 0,    g[2], o[2],
    b[3], i[3], n[3], g[3], o[3],
    b[4], i[4], n[4], g[4], o[4],
  ];
}

function getRandomNonFreePositions(
  count: number,
): number[] {
  return shuffle(
    Array.from(
      { length: 25 },
      (_, index) => index,
    ).filter((index) => index !== 12),
  ).slice(0, count);
}

function createCardId(): string {
  return `BB-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

export function createBingoCard(
  type: CardType = 'common',
): BingoCard {
  const numbers = createBaseNumbers();

  // Every cartela starts with exactly 2 system bombs.
  const bombPositions =
    getRandomNonFreePositions(2);

  // Common = 1 Dólinha; Green = exactly 3.
  const dolinhaCount =
    type === 'green' ? 3 : 1;

  const usedSpecialPositions = new Set(
    bombPositions,
  );

  const dolinhaCandidates =
    shuffle(
      Array.from(
        { length: 25 },
        (_, index) => index,
      ).filter(
        (index) =>
          index !== 12 &&
          !usedSpecialPositions.has(index),
      ),
    );

  const dolinhaPositions =
    dolinhaCandidates.slice(
      0,
      dolinhaCount,
    );

  const bombSet = new Set(
    bombPositions,
  );

  const dolinhaSet = new Set(
    dolinhaPositions,
  );

  const cells: BingoCell[] =
    numbers.map(
      (number, index) => {
        if (number === 0) {
          return {
            number: 0,
            isFree: true,
            symbols: [],
          };
        }

        const symbols: SpecialSymbol[] =
          [];

        if (bombSet.has(index)) {
          symbols.push('bomb');
        }

        if (dolinhaSet.has(index)) {
          symbols.push('dolinha');
        }

        return {
          number,
          isFree: false,
          symbols,
        };
      },
    );

  return {
    id: createCardId(),
    type,
    cells,
    bombPositions,
    dolinhaPositions,
  };
}

export function isBombCell(
  card: BingoCard,
  cellIndex: number,
): boolean {
  return card.bombPositions.includes(
    cellIndex,
  );
}

export function isDolinhaCell(
  card: BingoCard,
  cellIndex: number,
): boolean {
  return card.dolinhaPositions.includes(
    cellIndex,
  );
}

export function getCellByNumber(
  card: BingoCard,
  number: number,
): BingoCell | null {
  const cell = card.cells.find(
    (item) => item.number === number,
  );

  return cell ?? null;
}
