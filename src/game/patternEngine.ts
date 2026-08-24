export type PatternKind =
  | 'terno'
  | 'quadra'
  | 'linha-diagonal'
  | 'linha-horizontal'
  | 'linha-dupla'
  | 'bingo';

export type PatternResult = {
  kind: PatternKind;
  completed: boolean;
  progress: number;
  lineIndexes: number[];
  winningIndexes: number[];
};

function buildValidLines(): number[][] {
  const lines: number[][] = [];

  for (let row = 0; row < 5; row += 1) {
    lines.push(
      Array.from(
        { length: 5 },
        (_, column) =>
          row * 5 + column,
      ),
    );
  }

  lines.push([0, 6, 12, 18, 24]);
  lines.push([4, 8, 12, 16, 20]);

  return lines;
}

function isMarked(
  cardNumbers: number[],
  markedNumbers: Set<number>,
  index: number,
): boolean {
  const number = cardNumbers[index];

  return (
    number === 0 ||
    markedNumbers.has(number)
  );
}

function lineProgress(
  cardNumbers: number[],
  markedNumbers: Set<number>,
  line: number[],
): number {
  return line.filter(
    (index) =>
      isMarked(
        cardNumbers,
        markedNumbers,
        index,
      ),
  ).length;
}

export function getValidLineProgress(
  cardNumbers: number[],
  markedNumbers: Set<number>,
): number[] {
  return buildValidLines().map(
    (line) =>
      lineProgress(
        cardNumbers,
        markedNumbers,
        line,
      ),
  );
}

export function getCompletedLineIndexes(
  cardNumbers: number[],
  markedNumbers: Set<number>,
): number[] {
  return buildValidLines()
    .map(
      (line, index) =>
        lineProgress(
          cardNumbers,
          markedNumbers,
          line,
        ) === 5
          ? index
          : -1,
    )
    .filter(
      (index) => index >= 0,
    );
}

function detectThreshold(
  kind: 'terno' | 'quadra',
  cardNumbers: number[],
  markedNumbers: Set<number>,
): PatternResult {
  const threshold =
    kind === 'terno'
      ? 3
      : 4;

  const lines =
    buildValidLines();

  const completedLines =
    lines
      .map(
        (line, index) =>
          lineProgress(
            cardNumbers,
            markedNumbers,
            line,
          ) >= threshold
            ? index
            : -1,
      )
      .filter(
        (index) => index >= 0,
      );

  const progress = Math.max(
    0,
    ...getValidLineProgress(
      cardNumbers,
      markedNumbers,
    ),
  );

  return {
    kind,
    completed:
      completedLines.length > 0,
    progress,
    lineIndexes:
      completedLines,
    winningIndexes:
      completedLines.flatMap(
        (lineIndex) =>
          lines[lineIndex] ?? [],
      ),
  };
}

export function detectTerno(
  cardNumbers: number[],
  markedNumbers: Set<number>,
): PatternResult {
  return detectThreshold(
    'terno',
    cardNumbers,
    markedNumbers,
  );
}

export function detectQuadra(
  cardNumbers: number[],
  markedNumbers: Set<number>,
): PatternResult {
  return detectThreshold(
    'quadra',
    cardNumbers,
    markedNumbers,
  );
}

function detectSpecificLine(
  kind: PatternKind,
  lineIndex: number,
  cardNumbers: number[],
  markedNumbers: Set<number>,
): PatternResult {
  const line =
    buildValidLines()[lineIndex];

  if (!line) {
    return {
      kind,
      completed: false,
      progress: 0,
      lineIndexes: [],
      winningIndexes: [],
    };
  }

  const progress =
    lineProgress(
      cardNumbers,
      markedNumbers,
      line,
    );

  return {
    kind,
    completed:
      progress === 5,
    progress,
    lineIndexes:
      progress === 5
        ? [lineIndex]
        : [],
    winningIndexes:
      progress === 5
        ? [...line]
        : [],
  };
}

export function detectLines(
  cardNumbers: number[],
  markedNumbers: Set<number>,
) {
  const diagonalIndexes = [5, 6];
  const horizontalIndexes = [0, 1, 2, 3, 4];

  const diagonals =
    diagonalIndexes.map(
      (index) =>
        detectSpecificLine(
          'linha-diagonal',
          index,
          cardNumbers,
          markedNumbers,
        ),
    );

  const horizontals =
    horizontalIndexes.map(
      (index) =>
        detectSpecificLine(
          'linha-horizontal',
          index,
          cardNumbers,
          markedNumbers,
        ),
    );

  return {
    diagonals,
    horizontals,
    completedLineIndexes:
      getCompletedLineIndexes(
        cardNumbers,
        markedNumbers,
      ),
  };
}

export function detectLineDouble(
  cardNumbers: number[],
  markedNumbers: Set<number>,
): PatternResult {
  const completed =
    getCompletedLineIndexes(
      cardNumbers,
      markedNumbers,
    );

  return {
    kind: 'linha-dupla',
    completed:
      completed.length >= 2,
    progress:
      Math.min(
        completed.length,
        2,
      ),
    lineIndexes:
      completed.slice(0, 2),
    winningIndexes:
      completed.length >= 2
        ? completed
            .slice(0, 2)
            .flatMap(
              (lineIndex) =>
                buildValidLines()[
                  lineIndex
                ] ?? [],
            )
        : [],
  };
}

export function detectBingo(
  cardNumbers: number[],
  markedNumbers: Set<number>,
): PatternResult {
  const completed =
    cardNumbers.every(
      (number) =>
        number === 0 ||
        markedNumbers.has(number),
    );

  const progress =
    cardNumbers.filter(
      (number) =>
        number === 0 ||
        markedNumbers.has(number),
    ).length;

  return {
    kind: 'bingo',
    completed,
    progress,
    lineIndexes:
      completed
        ? getCompletedLineIndexes(
            cardNumbers,
            markedNumbers,
          )
        : [],
    winningIndexes:
      cardNumbers
        .map(
          (_, index) =>
            index,
        )
        .filter(
          (index) =>
            isMarked(
              cardNumbers,
              markedNumbers,
              index,
            ),
        ),
  };
}

export function evaluateCardPatterns(
  cardNumbers: number[],
  markedNumbers: Set<number>,
) {
  const terno =
    detectTerno(
      cardNumbers,
      markedNumbers,
    );

  const quadra =
    detectQuadra(
      cardNumbers,
      markedNumbers,
    );

  const lineInfo =
    detectLines(
      cardNumbers,
      markedNumbers,
    );

  const linha =
    lineInfo.completedLineIndexes.length > 0;

  const linhaDupla =
    detectLineDouble(
      cardNumbers,
      markedNumbers,
    );

  const bingo =
    detectBingo(
      cardNumbers,
      markedNumbers,
    );

  return {
    terno,
    quadra,
    diagonais:
      lineInfo.diagonals,
    horizontais:
      lineInfo.horizontals,
    linha: {
      kind:
        'linha' as const,
      completed: linha,
      progress:
        linha
          ? 5
          : Math.max(
              0,
              ...getValidLineProgress(
                cardNumbers,
                markedNumbers,
              ),
            ),
      lineIndexes:
        lineInfo.completedLineIndexes,
      winningIndexes:
        lineInfo.completedLineIndexes.flatMap(
          (lineIndex) =>
            buildValidLines()[
              lineIndex
            ] ?? [],
        ),
    },
    linhaDupla,
    bingo,
  };
}
