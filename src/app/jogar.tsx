import { useEffect, useMemo, useState } from 'react';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {
  BingoCard,
  createBingoCard as createGeneratedBingoCard,
} from '../game/cardGenerator';

import {
  allocateCategoryPools,
  calculatePrizePool,
  resolvePrizeCategory,
} from '../game/prizeEngine';

import {
  evaluateCardPatterns,
} from '../game/patternEngine';

import {
  createUiTicketGameActions,
  type UiTicketGameActions,
} from '../game/uiTicketGameActions';

const INITIAL_CHIPS = 1000;
const WIN_REWARD = 100;
const WIN_XP = 50;
const XP_PER_LEVEL = 100;

const MISSION_TARGET = 3;
const MISSION_REWARD = 150;

const VILLAGE_BINGOS_PER_LEVEL = 5;
const HISTORY_LIMIT = 5;

function shuffleNumbers(numbers: number[]) {
  const shuffled = [...numbers];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1),
    );

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function createColumnNumbers(min: number, max: number) {
  const numbers = Array.from(
    { length: max - min + 1 },
    (_, index) => min + index,
  );

  return shuffleNumbers(numbers).slice(0, 5);
}

function createBingoCard() {
  const bColumn = createColumnNumbers(1, 15);
  const iColumn = createColumnNumbers(16, 30);
  const nColumn = createColumnNumbers(31, 45);
  const gColumn = createColumnNumbers(46, 60);
  const oColumn = createColumnNumbers(61, 75);

  return [
    bColumn[0],
    iColumn[0],
    nColumn[0],
    gColumn[0],
    oColumn[0],

    bColumn[1],
    iColumn[1],
    nColumn[1],
    gColumn[1],
    oColumn[1],

    bColumn[2],
    iColumn[2],
    0,
    gColumn[2],
    oColumn[2],

    bColumn[3],
    iColumn[3],
    nColumn[3],
    gColumn[3],
    oColumn[3],

    bColumn[4],
    iColumn[4],
    nColumn[4],
    gColumn[4],
    oColumn[4],
  ];
}

function getNextNumber(usedNumbers: number[]) {
  const availableNumbers = Array.from(
    { length: 75 },
    (_, index) => index + 1,
  ).filter(
    (number) => !usedNumbers.includes(number),
  );

  if (availableNumbers.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(
    Math.random() * availableNumbers.length,
  );

  return availableNumbers[randomIndex];
}

function getBingoLetter(number: number) {
  if (number <= 15) {
    return 'B';
  }

  if (number <= 30) {
    return 'I';
  }

  if (number <= 45) {
    return 'N';
  }

  if (number <= 60) {
    return 'G';
  }

  return 'O';
}

function createGeneratedCard(): BingoCard {
  return createGeneratedBingoCard(
    'common',
  );
}

export default function BingoGameScreen() {
  /*
   * Integração interna em shadow mode.
   * A mecânica local continua comandando a tela nesta etapa.
   */
  const [uiRoundVersion, setUiRoundVersion] =
    useState(0);

  const uiTicketActions:
    UiTicketGameActions =
    useMemo(
      () =>
        createUiTicketGameActions(
          `LOCAL-UI-ROOM-${uiRoundVersion}`,
          1,
        ),
      [
        uiRoundVersion,
      ],
    );

  const uiTicketRoundId =
    `LOCAL-UI-ROUND-${uiRoundVersion}`;

  useEffect(() => {
    uiTicketActions.createRoom(1);

    uiTicketActions.joinPlayer(
      'LOCAL-PLAYER',
      ['LOCAL-CARD'],
    );

    uiTicketActions.startRound(
      uiTicketRoundId,
    );
  }, [
    uiTicketActions,
    uiTicketRoundId,
  ]);

  const [generatedCard, setGeneratedCard] =
    useState<BingoCard>(
      () =>
        createGeneratedCard(),
    );

  const [cardNumbers, setCardNumbers] =
    useState<number[]>(
      () =>
        generatedCard.cells.map(
          (cell) => cell.number,
        ),
    );

  const [drawnNumber, setDrawnNumber] =
    useState<number | null>(null);

  const [drawnNumbers, setDrawnNumbers] =
    useState<number[]>([]);

  const [markedNumbers, setMarkedNumbers] =
    useState<Set<number>>(
      new Set(),
    );

  const [autoMark, setAutoMark] =
    useState(true);

  const [hasWon, setHasWon] =
    useState(false);

  const [chips, setChips] =
    useState(INITIAL_CHIPS);

  const [bbDolinha, setBbDolinha] =
    useState(0);

  const [roomAccumulatorGold, setRoomAccumulatorGold] =
    useState(100);

  const [roomAccumulatorBB, setRoomAccumulatorBB] =
    useState(1);

  const [patternAwards, setPatternAwards] =
    useState({
      terno: false,
      quadra: false,
      linha: false,
      linhaDupla: false,
      bingo: false,
    });

  const [patternPaid, setPatternPaid] =
    useState({
      terno: false,
      quadra: false,
      linha: false,
      linhaDupla: false,
      bingo: false,
    });

  const [settlementQueue, setSettlementQueue] =
    useState<
      {
        id: string;
        category:
          | 'terno'
          | 'quadra'
          | 'linha'
          | 'dupla'
          | 'bingo';
        status:
          | 'eligible'
          | 'paid';
        number: number | null;
      }[]
    >([]);

  const [latestAchievementMessage, setLatestAchievementMessage] =
    useState('');

  const [latestAchievementType, setLatestAchievementType] =
    useState<
      'normal' | 'special' | 'bingo'
    >('normal');

  const [specialEventMessage, setSpecialEventMessage] =
    useState('');


  const [xp, setXp] =
    useState(0);

  const [level, setLevel] =
    useState(1);

  const [rewardGiven, setRewardGiven] =
    useState(false);

  const [bingosCompleted, setBingosCompleted] =
    useState(0);

  const [firstBingoUnlocked, setFirstBingoUnlocked] =
    useState(false);

  const [comboChallengeCompleted, setComboChallengeCompleted] =
    useState(false);

  const [comboChallengeRewardGiven, setComboChallengeRewardGiven] =
    useState(false);

  const [missionRewardGiven, setMissionRewardGiven] =
    useState(false);

  const [villageBingos, setVillageBingos] =
    useState(0);

  const [showFullHistory, setShowFullHistory] =
    useState(false);

  const [hitCombo, setHitCombo] =
    useState(0);

  const [bestHitCombo, setBestHitCombo] =
    useState(0);

  const markedCount =
    markedNumbers.size;

  const fullCardProgress =
    Math.min(
      markedCount,
      24,
    );

  const fullCardPercentage =
    (fullCardProgress / 24) *
    100;

  const patternState =
    evaluateCardPatterns(
      cardNumbers,
      markedNumbers,
    );

  const virtualEntryValue =
    25;

  const virtualPrizePoolPreview =
    calculatePrizePool(
      virtualEntryValue,
    );

  const categoryPrizePools =
    allocateCategoryPools(
      virtualPrizePoolPreview,
    );

  const currentRoundResidualPreview =
    Math.max(
      0,
      virtualPrizePoolPreview -
        Object.values(
          categoryPrizePools,
        ).reduce(
          (sum, value) =>
            sum + value,
          0,
        ),
    );

  const simulatedAccumulatorGold =
    roomAccumulatorGold +
    Math.floor(
      currentRoundResidualPreview * 0.99,
    );

  const simulatedAccumulatorBB =
    roomAccumulatorBB +
    currentRoundResidualPreview *
      0.01;

  const resolveLocalPreview = (
    category:
      | 'terno'
      | 'quadra'
      | 'linha'
      | 'dupla'
      | 'bingo',
    pool: number,
    completed: boolean,
  ) => {
    if (!completed) {
      return {
        winners: 0,
        paid: 0,
        remaining: Math.max(
          0,
          Math.floor(pool),
        ),
      };
    }

    const resolution =
      resolvePrizeCategory(
        category,
        pool,
        [
          {
            userId:
              'LOCAL-PLAYER',
            cardId:
              'LOCAL-CARD',
          },
        ],
      );

    return {
      winners:
        resolution.winners.length,
      paid:
        resolution.winners[0]?.prize ??
        0,
      remaining:
        Math.max(
          0,
          resolution.residual,
        ),
    };
  };

  const dynamicPrizePreview = {
    terno:
      resolveLocalPreview(
        'terno',
        categoryPrizePools.terno,
        patternAwards.terno,
      ),

    quadra:
      resolveLocalPreview(
        'quadra',
        categoryPrizePools.quadra,
        patternAwards.quadra,
      ),

    linha:
      resolveLocalPreview(
        'linha',
        categoryPrizePools.linha,
        patternAwards.linha,
      ),

    dupla:
      resolveLocalPreview(
        'dupla',
        categoryPrizePools.dupla,
        patternAwards.linhaDupla,
      ),

    bingo:
      resolveLocalPreview(
        'bingo',
        categoryPrizePools.bingo,
        patternAwards.bingo,
      ),
  };

  const dynamicRoundAccounting = {
    reserved:
      Object.values(
        categoryPrizePools,
      ).reduce(
        (sum, value) =>
          sum + value,
        0,
      ),

    paidPreview:
      dynamicPrizePreview.terno.paid +
      dynamicPrizePreview.quadra.paid +
      dynamicPrizePreview.linha.paid +
      dynamicPrizePreview.dupla.paid +
      dynamicPrizePreview.bingo.paid,

    remaining:
      dynamicPrizePreview.terno.remaining +
      dynamicPrizePreview.quadra.remaining +
      dynamicPrizePreview.linha.remaining +
      dynamicPrizePreview.dupla.remaining +
      dynamicPrizePreview.bingo.remaining,
  };

  const projectedAccumulatorGoldAfterRound =
    roomAccumulatorGold +
    Math.floor(
      dynamicRoundAccounting.remaining *
        0.99,
    );

  const projectedAccumulatorBBAfterRound =
    roomAccumulatorBB +
    dynamicRoundAccounting.remaining *
      0.01;

  const intermediatePrizePreview = {
    terno: {
      completed:
        patternAwards.terno,
      value:
        categoryPrizePools.terno,
    },
    quadra: {
      completed:
        patternAwards.quadra,
      value:
        categoryPrizePools.quadra,
    },
    linha: {
      completed:
        patternAwards.linha,
      value:
        categoryPrizePools.linha,
    },
  };

  const pendingSettlements =
    settlementQueue.filter(
      (event) =>
        event.status ===
        'eligible',
    );

  const paidSettlements =
    settlementQueue.filter(
      (event) =>
        event.status ===
        'paid',
    );

  const settlementCount =
    settlementQueue.length;

  const levelProgress =
    xp % XP_PER_LEVEL;

  const progressPercentage =
    (levelProgress /
      XP_PER_LEVEL) *
    100;

  const missionProgress =
    Math.min(
      bingosCompleted,
      MISSION_TARGET,
    );

  const missionPercentage =
    (missionProgress /
      MISSION_TARGET) *
    100;

  const missionCompleted =
    bingosCompleted >=
    MISSION_TARGET;

  const villageLevel =
    Math.floor(
      villageBingos /
        VILLAGE_BINGOS_PER_LEVEL,
    ) + 1;

  const villageProgress =
    villageBingos %
    VILLAGE_BINGOS_PER_LEVEL;

  const villagePercentage =
    (villageProgress /
      VILLAGE_BINGOS_PER_LEVEL) *
    100;

  const villageBingosNeeded =
    VILLAGE_BINGOS_PER_LEVEL -
    villageProgress;

  const recentNumbers =
    drawnNumbers
      .slice(-HISTORY_LIMIT)
      .reverse();

  /*
   * Fonte da nova tabela da rodada.
   * Continua em shadow mode: usamos o núcleo para apresentar
   * as vagas reais da rodada, sem substituir a mecânica local.
   */
  const uiPrizeRows =
    uiTicketActions.read().prizes;

  const uiPrizeRow = (
    key:
      | 'terno'
      | 'quadra'
      | 'diagonal'
      | 'linha'
      | 'dupla'
      | 'bingo',
  ) =>
    uiPrizeRows.find(
      (row) =>
        row.key === key,
    );

  /*
   * PROGRESSO DA LINHA
   */
  let bestRowProgress = 0;

  let bestRowIndex = -1;

  for (let row = 0; row < 5; row += 1) {
    const rowNumbers =
      cardNumbers.slice(
        row * 5,
        row * 5 + 5,
      );

    const progress =
      rowNumbers.filter(
        (number) =>
          number === 0 ||
          markedNumbers.has(number),
      ).length;

    if (
      progress >
      bestRowProgress
    ) {
      bestRowProgress =
        progress;

      bestRowIndex =
        row;
    }
  }

  const almostBingo =
    !hasWon &&
    patternState.linha.progress === 4;

  const latestCardNumber =
    drawnNumber !== null &&
    cardNumbers.includes(
      drawnNumber,
    );
const hitCardNumber =
  drawnNumber !== null &&
  cardNumbers.includes(
    drawnNumber,
  );
  /*
   * FALAS DA BIANCA + BOB
   */
  let hostMessage =
    'Vamos começar? Clique em próximo número!';

  if (hasWon) {
    hostMessage =
      missionCompleted
        ? 'BINGO! E ainda concluímos o Desafio da Vila!'
        : 'BINGO! Eu sabia que você conseguiria!';
  } else if (
    drawnNumber === null
  ) {
    hostMessage =
      'Vamos começar? Clique em próximo número!';
  } else if (
  almostBingo
) {
  hostMessage =
    'Está quase! Falta só mais um número para fechar uma linha!';
} else if (
  hitCardNumber
) {
  hostMessage =
    'ACERTOU! Esse número veio para sua cartela!';
} else if (
  drawnNumbers.length === 1
) {
  hostMessage =
    'Boa sorte! A partida acabou de começar!';
  } else if (
    drawnNumbers.length >= 25
  ) {
    hostMessage =
      'O jogo está esquentando! Continua de olho na cartela!';
  } else if (
    drawnNumbers.length >= 10
  ) {
    hostMessage =
      'Estamos começando a esquentar! Vamos nessa!';
  } else {
    hostMessage =
      'Boa! Vamos continuar!';
  }

  const awardVictory = (
    nextMarkedNumbers: Set<number>,
  ) => {
    setMarkedNumbers(
      nextMarkedNumbers,
    );

    setHasWon(true);

    if (!rewardGiven) {
      setChips(
        (current) =>
          current + WIN_REWARD,
      );

      setXp(
        (currentXp) => {
          const updatedXp =
            currentXp + WIN_XP;

          const nextLevel =
            Math.floor(
              updatedXp /
                XP_PER_LEVEL,
            ) + 1;

          setLevel(
            nextLevel,
          );

          return updatedXp;
        },
      );

      setBingosCompleted(
        (current) =>
          current + 1,
      );

      setFirstBingoUnlocked(true);

      setVillageBingos(
        (current) =>
          current + 1,
      );

      if (
        bingosCompleted + 1 >=
          MISSION_TARGET &&
        !missionRewardGiven
      ) {
        setChips(
          (current) =>
            current +
            MISSION_REWARD,
        );

        setMissionRewardGiven(
          true,
        );
      }

      setRewardGiven(
        true,
      );
    }
  };

  const handleNumberPress = (
    number: number,
  ) => {
    if (
      number === 0 ||
      hasWon
    ) {
      return;
    }

    setMarkedNumbers(
      (current) => {
        const next =
          new Set(current);

        if (
          next.has(number)
        ) {
          next.delete(number);
        } else {
          next.add(number);
        }

        const patterns =
          evaluateCardPatterns(
            cardNumbers,
            next,
          );

        if (
          patterns.bingo.completed
        ) {
          awardVictory(next);
        }

        return next;
      },
    );
  };

  const getBombAffectedIndexes = (
    cellIndex: number,
  ) => {
    const row =
      Math.floor(cellIndex / 5);

    const column =
      cellIndex % 5;

    const affectedIndexes =
      [cellIndex];

    const candidates = [
      row > 0
        ? cellIndex - 5
        : null,
      row < 4
        ? cellIndex + 5
        : null,
      column > 0
        ? cellIndex - 1
        : null,
      column < 4
        ? cellIndex + 1
        : null,
    ];

    for (const candidate of candidates) {
      if (
        candidate !== null &&
        cardNumbers[candidate] !== 0
      ) {
        affectedIndexes.push(
          candidate,
        );
      }
    }

    return affectedIndexes;
  };

  const handleNextNumber = () => {
    if (hasWon) {
      return;
    }

    const nextNumber =
      getNextNumber(
        drawnNumbers,
      );

    if (
      nextNumber === null
    ) {
      return;
    }

    setDrawnNumber(
      nextNumber,
    );

    setDrawnNumbers(
      (current) => [
        ...current,
        nextNumber,
      ],
    );

    const drawnCardIndex =
      generatedCard.cells.findIndex(
        (cell) =>
          cell.number === nextNumber,
      );

    const isSystemBomb =
      generatedCard.bombPositions.includes(
        drawnCardIndex,
      );

    const isDolinha =
      generatedCard.dolinhaPositions.includes(
        drawnCardIndex,
      );

    setSpecialEventMessage('');

    if (isDolinha) {
      setBbDolinha(
        (current) =>
          current + 2,
      );

      setSpecialEventMessage(
        '💵 +2 BB Dólinhas!',
      );
    }

    let specialMarkedIndexes: number[] =
      [];

    if (isSystemBomb) {
      specialMarkedIndexes =
        getBombAffectedIndexes(
          drawnCardIndex,
        );

      setSpecialEventMessage(
        isDolinha
          ? '💣 BOOM! +2 BB Dólinhas!'
          : '💣 BOOM! A bombinha marcou os números vizinhos!',
      );
    }

    const affectedNumbers =
      specialMarkedIndexes
        .map(
          (index) =>
            cardNumbers[index],
        )
        .filter(
          (number) =>
            number !== 0,
        );

    const numberIsOnCard =
      cardNumbers.includes(nextNumber);

    const nextCombo =
      numberIsOnCard
        ? hitCombo + 1
        : 0;

    setHitCombo(nextCombo);

    setBestHitCombo(
      (currentBest) =>
        Math.max(
          currentBest,
          nextCombo,
        ),
    );

    if (
      nextCombo >= 3 &&
      !comboChallengeCompleted
    ) {
      setComboChallengeCompleted(true);

      if (!comboChallengeRewardGiven) {
        setXp((currentXp) => {
          const updatedXp =
            currentXp + 25;

          const nextLevel =
            Math.floor(
              updatedXp /
                XP_PER_LEVEL,
            ) + 1;

          setLevel(
            nextLevel,
          );

          return updatedXp;
        });

        setComboChallengeRewardGiven(true);
      }
    }

    const shouldAutoMarkDrawnNumber =
      autoMark &&
      cardNumbers.includes(
        nextNumber,
      );

    /*
     * ÚNICA FONTE DE VERDADE DO NOVO ESTADO DA CARTELA:
     * calculamos exatamente a próxima coleção de marcados uma vez.
     *
     * A mesma coleção é usada por:
     * 1. marcação visual/local;
     * 2. detecção de padrões;
     * 3. integração shadow com o novo núcleo.
     *
     * Isso evita que a cartela visual e a camada interna possam
     * trabalhar com estados diferentes.
     */
    const nextMarkedNumbers =
      new Set(
        markedNumbers,
      );

    if (
      shouldAutoMarkDrawnNumber
    ) {
      nextMarkedNumbers.add(
        nextNumber,
      );
    }

    for (
      const affectedNumber
      of affectedNumbers
    ) {
      nextMarkedNumbers.add(
        affectedNumber,
      );
    }

    const patterns =
      evaluateCardPatterns(
        cardNumbers,
        nextMarkedNumbers,
      );

    const uiShadowDiagonalCompleted =
      patterns.diagonais.some(
        (diagonal) =>
          diagonal.completed,
      );

    /*
     * Shadow mode:
     * o novo núcleo recebe exatamente os mesmos padrões que
     * acabamos de calcular para a cartela.
     */
    uiTicketActions.processBallFromTickets(
      uiTicketRoundId,
      nextNumber,
      virtualEntryValue,
      roomAccumulatorBB,
      {
        terno:
          patterns.terno.completed
            ? [
                {
                  userId:
                    'LOCAL-PLAYER',
                  cardId:
                    'LOCAL-CARD',
                },
              ]
            : [],

        quadra:
          patterns.quadra.completed
            ? [
                {
                  userId:
                    'LOCAL-PLAYER',
                  cardId:
                    'LOCAL-CARD',
                },
              ]
            : [],

        diagonal:
          uiShadowDiagonalCompleted
            ? [
                {
                  userId:
                    'LOCAL-PLAYER',
                  cardId:
                    'LOCAL-CARD',
                },
              ]
            : [],

        linha:
          patterns.linha.completed
            ? [
                {
                  userId:
                    'LOCAL-PLAYER',
                  cardId:
                    'LOCAL-CARD',
                },
              ]
            : [],

        dupla:
          patterns.linhaDupla.completed
            ? [
                {
                  userId:
                    'LOCAL-PLAYER',
                  cardId:
                    'LOCAL-CARD',
                },
              ]
            : [],

        bingo:
          patterns.bingo.completed
            ? [
                {
                  userId:
                    'LOCAL-PLAYER',
                  cardId:
                    'LOCAL-CARD',
                },
              ]
            : [],
      },
    );

    if (
      shouldAutoMarkDrawnNumber ||
      affectedNumbers.length > 0
    ) {
      setMarkedNumbers(
        nextMarkedNumbers,
      );

      setPatternAwards(
        (current) => ({
          terno:
            current.terno ||
            patterns.terno.completed,
          quadra:
            current.quadra ||
            patterns.quadra.completed,
          linha:
            current.linha ||
            patterns.linha.completed,
          linhaDupla:
            current.linhaDupla ||
            patterns.linhaDupla.completed,
          bingo:
            current.bingo ||
            patterns.bingo.completed,
        }),
      );

      const settlementCandidates = [
        {
          category:
            'terno' as const,
          completed:
            patterns.terno.completed,
        },
        {
          category:
            'quadra' as const,
          completed:
            patterns.quadra.completed,
        },
        {
          category:
            'linha' as const,
          completed:
            patterns.linha.completed,
        },
        {
          category:
            'dupla' as const,
          completed:
            patterns.linhaDupla.completed,
        },
        {
          category:
            'bingo' as const,
          completed:
            patterns.bingo.completed,
        },
      ];

      for (
        const candidate of
        settlementCandidates
      ) {
        if (
          !candidate.completed ||
          patternAwards[
            candidate.category ===
            'dupla'
              ? 'linhaDupla'
              : candidate.category
          ]
        ) {
          continue;
        }

        setSettlementQueue(
          (current) => {
            const alreadyExists =
              current.some(
                (event) =>
                  event.category ===
                    candidate.category &&
                  event.number ===
                    nextNumber,
              );

            if (
              alreadyExists
            ) {
              return current;
            }

            return [
              ...current,
              {
                id:
                  `${candidate.category}-${nextNumber}-${Date.now()}`,
                category:
                  candidate.category,
                status:
                  'eligible',
                number:
                  nextNumber,
              },
            ];
          },
        );
      }

      setPatternPaid(
        (current) => ({
          terno:
            current.terno ||
            (
              patterns.terno.completed &&
              patternAwards.terno
            ),
          quadra:
            current.quadra ||
            (
              patterns.quadra.completed &&
              patternAwards.quadra
            ),
          linha:
            current.linha ||
            (
              patterns.linha.completed &&
              patternAwards.linha
            ),
          linhaDupla:
            current.linhaDupla ||
            (
              patterns.linhaDupla.completed &&
              patternAwards.linhaDupla
            ),
          bingo:
            current.bingo ||
            (
              patterns.bingo.completed &&
              patternAwards.bingo
            ),
        }),
      );

      if (
        patterns.bingo.completed &&
        !patternAwards.bingo
      ) {
        setLatestAchievementMessage(
          '🏆 BINGO! CARTELA CHEIA!',
        );

        setLatestAchievementType(
          'bingo',
        );
      } else if (
        patterns.linhaDupla.completed &&
        !patternAwards.linhaDupla
      ) {
        setLatestAchievementMessage(
          '🔥 LINHA DUPLA!',
        );

        setLatestAchievementType(
          'special',
        );
      } else if (
        patterns.linha.completed &&
        !patternAwards.linha
      ) {
        setLatestAchievementMessage(
          '🏅 LINHA CONQUISTADA!',
        );

        setLatestAchievementType(
          'special',
        );
      } else if (
        patterns.quadra.completed &&
        !patternAwards.quadra
      ) {
        setLatestAchievementMessage(
          '🥈 QUADRA CONQUISTADA!',
        );

        setLatestAchievementType(
          'normal',
        );
      } else if (
        patterns.terno.completed &&
        !patternAwards.terno
      ) {
        setLatestAchievementMessage(
          '🥉 TERNO CONQUISTADO!',
        );

        setLatestAchievementType(
          'normal',
        );
      }

      if (
        patterns.bingo.completed
      ) {
        awardVictory(
          nextMarkedNumbers,
        );
      }
    }
  };

  const toggleAutoMark = () => {
    if (hasWon) {
      return;
    }

    setAutoMark(
      (current) => !current,
    );
  };

  const handlePlayAgain = () => {
    setUiRoundVersion(
      (current) =>
        current + 1,
    );

    const nextCard =
      createGeneratedCard();

    setGeneratedCard(
      nextCard,
    );

    setCardNumbers(
      nextCard.cells.map(
        (cell) => cell.number,
      ),
    );

    setDrawnNumber(null);

    setDrawnNumbers([]);

    setMarkedNumbers(
      new Set(),
    );

    setAutoMark(true);

    setHasWon(false);

    setRewardGiven(false);

    setBbDolinha(0);

    setPatternAwards({
      terno: false,
      quadra: false,
      linha: false,
      linhaDupla: false,
      bingo: false,
    });

    setPatternPaid({
      terno: false,
      quadra: false,
      linha: false,
      linhaDupla: false,
      bingo: false,
    });

    setSettlementQueue([]);

    setLatestAchievementMessage('');

    setLatestAchievementType(
      'normal',
    );

    setSpecialEventMessage('');

    setHitCombo(0);

    setBestHitCombo(0);

    setComboChallengeCompleted(false);

    setComboChallengeRewardGiven(false);

    setShowFullHistory(
      false,
    );
  };

  const isFinished =
    drawnNumbers.length >=
    75;

  const currentLetter =
    drawnNumber
      ? getBingoLetter(
          drawnNumber,
        )
      : '—';

  let drawMessage =
    'Toque em PRÓXIMO NÚMERO para começar';

  if (hasWon) {
    drawMessage =
      'Você completou a cartela inteira!';
  } else if (
    isFinished
  ) {
    drawMessage =
      'Todos os números foram sorteados!';
  } else if (
    drawnNumber !== null
  ) {
    const isNumberMarked =
      markedNumbers.has(
        drawnNumber,
      );

    if (isNumberMarked) {
      drawMessage =
        'Número marcado!';
    } else if (
      cardNumbers.includes(
        drawnNumber,
      )
    ) {
      drawMessage =
        autoMark
          ? 'Número encontrado na sua cartela!'
          : 'Toque no número para marcar';
    } else {
      drawMessage =
        'Boa! Vamos para o próximo.';
    }
  }

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* TOPO */}
        <View
          style={styles.topBar}
        >
          <Pressable
            style={
              styles.backButton
            }
          >
            <Text
              style={
                styles.backButtonText
              }
            >
              ‹
            </Text>
          </Pressable>

          <View
            style={
              styles.topCenter
            }
          >
            <Text
              style={
                styles.topTitle
              }
            >
              VILA TROPICAL
            </Text>

            <Text
              style={
                styles.topSubtitle
              }
            >
              PARTIDA
            </Text>
          </View>

          <View
            style={
              styles.currencyGroup
            }
          >
            <View
              style={
                styles.chipBadge
              }
            >
            <Text
              style={
                styles.chipIcon
              }
            >
              ●
            </Text>

            <Text
              style={
                styles.chipValue
              }
            >
              {chips.toLocaleString(
                'pt-BR',
              )}
            </Text>
          </View>

          <View
            style={
              styles.dolinhaBadge
            }
          >
            <Text
              style={
                styles.dolinhaBadgeIcon
              }
            >
              💵
            </Text>

            <Text
              style={
                styles.dolinhaBadgeValue
              }
            >
              {bbDolinha}
            </Text>
          </View>
          </View>
        </View>

        {/* PROGRESSO DO JOGADOR */}
        <View
          style={
            styles.progressCard
          }
        >
          <View
            style={
              styles.progressTop
            }
          >
            <View>
              <Text
                style={
                  styles.progressLabel
                }
              >
                SEU PROGRESSO
              </Text>

              <Text
                style={
                  styles.levelTitle
                }
              >
                NÍVEL {level}
              </Text>
            </View>

            <View
              style={
                styles.xpBadge
              }
            >
              <Text
                style={
                  styles.xpBadgeText
                }
              >
                {levelProgress} / 100 XP
              </Text>
            </View>
          </View>

          <View
            style={
              styles.xpTrack
            }
          >
            <View
              style={[
                styles.xpFill,
                {
                  width: `${progressPercentage}%`,
                },
              ]}
            />
          </View>

          <View
            style={
              styles.xpBottom
            }
          >
            <Text
              style={
                styles.xpCurrent
              }
            >
              XP ATUAL: {xp}
            </Text>

            <Text
              style={
                styles.progressHint
              }
            >
              Mais{' '}
              {XP_PER_LEVEL -
                levelProgress}{' '}
              XP para o próximo nível
            </Text>
          </View>
        </View>

        {/* MISSÃO */}
        <View
          style={[
            styles.missionCard,
            missionCompleted &&
              styles.missionCardCompleted,
          ]}
        >
          <View
            style={[
              styles.missionIcon,
              missionCompleted &&
                styles.missionIconCompleted,
            ]}
          >
            <Text
              style={
                styles.missionIconText
              }
            >
              {missionCompleted
                ? '✓'
                : '★'}
            </Text>
          </View>

          <View
            style={
              styles.missionContent
            }
          >
            <Text
              style={
                styles.missionLabel
              }
            >
              DESAFIO DA VILA
            </Text>

            <Text
              style={
                styles.missionTitle
              }
            >
              Faça 3 Bingos
            </Text>

            <View
              style={
                styles.missionTrack
              }
            >
              <View
                style={[
                  styles.missionFill,
                  {
                    width: `${missionPercentage}%`,
                  },
                ]}
              />
            </View>

            <Text
              style={
                styles.missionProgressText
              }
            >
              {missionProgress} /{' '}
              {MISSION_TARGET}{' '}
              Bingos
            </Text>
          </View>

          <View
            style={
              styles.missionReward
            }
          >
            <Text
              style={
                styles.missionRewardLabel
              }
            >
              RECOMPENSA
            </Text>

            <Text
              style={
                styles.missionRewardValue
              }
            >
              {missionCompleted
                ? 'CONCLUÍDO'
                : `+${MISSION_REWARD}`}
            </Text>

            {!missionCompleted && (
              <Text
                style={
                  styles.missionRewardSub
                }
              >
                fichas
              </Text>
            )}
          </View>
        </View>

        {/* EVOLUÇÃO DA VILA */}
        <View
          style={
            styles.villageCard
          }
        >
          <View
            style={
              styles.villageIcon
            }
          >
            <Text
              style={
                styles.villageIconText
              }
            >
              🌴
            </Text>
          </View>

          <View
            style={
              styles.villageContent
            }
          >
            <View
              style={
                styles.villageHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.villageLabel
                  }
                >
                  VILA TROPICAL
                </Text>

                <Text
                  style={
                    styles.villageTitle
                  }
                >
                  NÍVEL {villageLevel}
                </Text>
              </View>

              <View
                style={
                  styles.villageBingoBadge
                }
              >
                <Text
                  style={
                    styles.villageBingoBadgeText
                  }
                >
                  {villageBingos}{' '}
                  BINGOS
                </Text>
              </View>
            </View>

            <View
              style={
                styles.villageTrack
              }
            >
              <View
                style={[
                  styles.villageFill,
                  {
                    width: `${villagePercentage}%`,
                  },
                ]}
              />
            </View>

            <View
              style={
                styles.villageBottom
              }
            >
              <Text
                style={
                  styles.villageProgressText
                }
              >
                {villageProgress} /{' '}
                {VILLAGE_BINGOS_PER_LEVEL}
              </Text>

              <Text
                style={
                  styles.villageHint
                }
              >
                {villageBingosNeeded}{' '}
                {villageBingosNeeded === 1
                  ? 'Bingo'
                  : 'Bingos'}{' '}
                para avançar
              </Text>
            </View>
          </View>
        </View>

        {/* STATUS */}
        <View
          style={
            styles.statusRow
          }
        >
          <View
            style={
              styles.statusCard
            }
          >
            <Text
              style={
                styles.statusLabel
              }
            >
              PARTIDA
            </Text>

            <Text
              style={
                styles.statusValue
              }
            >
              #001
            </Text>
          </View>

          <View
            style={
              styles.statusCard
            }
          >
            <Text
              style={
                styles.statusLabel
              }
            >
              SORTEADOS
            </Text>

            <Text
              style={
                styles.statusValue
              }
            >
              {drawnNumbers.length}
            </Text>
          </View>

          <View
            style={
              styles.statusCard
            }
          >
            <Text
              style={
                styles.statusLabel
              }
            >
              NÍVEL
            </Text>

            <Text
              style={
                styles.statusValue
              }
            >
              {level}
            </Text>
          </View>
        </View>

        {/* NÚMERO */}
        <View
          style={[
            styles.drawSection,
            hasWon &&
              styles.drawSectionWon,
          ]}
        >
          <Text
            style={
              styles.drawLabel
            }
          >
            {hasWon
              ? 'RESULTADO DA PARTIDA'
              : 'ÚLTIMO NÚMERO'}
          </Text>

          <View
            style={
              styles.ballRow
            }
          >
            <View
              style={[
                styles.bingoBall,
                hasWon &&
                  styles.bingoBallWon,
              ]}
            >
              <View
                style={[
                  styles.ballInner,
                  hasWon &&
                    styles.ballInnerWon,
                ]}
              >
                <Text
                  style={
                    styles.ballLetter
                  }
                >
                  {hasWon
                    ? '★'
                    : currentLetter}
                </Text>

                <Text
                  style={[
                    styles.ballNumber,
                    hasWon &&
                      styles.ballNumberWon,
                  ]}
                >
                  {hasWon
                    ? 'BINGO!'
                    : drawnNumber ?? '—'}
                </Text>
              </View>
            </View>
          </View>

          <Text
            style={[
              styles.drawMessage,
              hasWon &&
                styles.drawMessageWon,
            ]}
          >
            {drawMessage}
          </Text>

          <View
            style={
              styles.prizePreviewCard
            }
          >
            <Text
              style={
                styles.prizePreviewTitle
              }
            >
              PREMIAÇÃO DA RODADA
            </Text>

            <Text
              style={
                styles.prizePreviewLiveNote
              }
            >
              Dados da rodada atual • sincronizados com o núcleo.
            </Text>

            <View
              style={
                styles.roundAccountingCard
              }
            >
              <View
                style={
                  styles.roundAccountingItem
                }
              >
                <Text
                  style={
                    styles.roundAccountingLabel
                  }
                >
                  FUNDO RESERVADO • PRÉVIA
                </Text>

                <Text
                  style={
                    styles.roundAccountingValue
                  }
                >
                  {dynamicRoundAccounting.reserved}
                </Text>
              </View>

              <View
                style={
                  styles.roundAccountingItem
                }
              >
                <Text
                  style={
                    styles.roundAccountingLabel
                  }
                >
                  DISTRIBUÍDO • PRÉVIA
                </Text>

                <Text
                  style={
                    styles.roundAccountingValue
                  }
                >
                  {dynamicRoundAccounting.paidPreview}
                </Text>
              </View>

              <View
                style={
                  styles.roundAccountingItem
                }
              >
                <Text
                  style={
                    styles.roundAccountingLabel
                  }
                >
                  RESÍDUO • PRÉVIA
                </Text>

                <Text
                  style={
                    styles.roundAccountingValueHighlight
                  }
                >
                  {dynamicRoundAccounting.remaining}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.prizePreviewHeaderRow
              }
            >
              <Text
                style={
                  styles.prizePreviewHeaderLabel
                }
              >
                CATEGORIA
              </Text>

              <Text
                style={
                  styles.prizePreviewHeaderLabel
                }
              >
                STATUS
              </Text>

              <Text
                style={
                  styles.prizePreviewHeaderLabel
                }
              >
                RESTANTE
              </Text>
            </View>

            <View
              style={
                styles.prizePreviewRow
              }
            >
              <Text
                style={
                  styles.prizePreviewLabel
                }
              >
                🥉 Terno
              </Text>

              <Text
                style={
                  styles.prizePreviewStatus
                }
              >
                {uiPrizeRow('terno')?.slotsText ?? '0/5'}
                {uiPrizeRow('terno')?.highlighted ? ' ✅' : ''}
              </Text>

              <Text
                style={
                  styles.prizePreviewValue
                }
              >
                {uiPrizeRow('terno')?.remainingText ?? '0'}
              </Text>
            </View>

            <View
              style={
                styles.prizePreviewSubRow
              }
            >
              <Text
                style={
                  styles.prizePreviewSubText
                }
              >
                {uiPrizeRow('terno')?.paidText &&
                uiPrizeRow('terno')?.paidText !== '0'
                  ? `pago: ${uiPrizeRow('terno')?.paidText}`
                  : `fundo: ${categoryPrizePools.terno}`}
              </Text>
            </View>

            <View
              style={
                styles.prizePreviewRow
              }
            >
              <Text
                style={
                  styles.prizePreviewLabel
                }
              >
                🥈 Quadra
              </Text>

              <Text
                style={
                  styles.prizePreviewStatus
                }
              >
                {uiPrizeRow('quadra')?.slotsText ?? '0/3'}
                {uiPrizeRow('quadra')?.highlighted ? ' ✅' : ''}
              </Text>

              <Text
                style={
                  styles.prizePreviewValue
                }
              >
                {uiPrizeRow('quadra')?.remainingText ?? '0'}
              </Text>
            </View>

            <View
              style={
                styles.prizePreviewSubRow
              }
            >
              <Text
                style={
                  styles.prizePreviewSubText
                }
              >
                {uiPrizeRow('quadra')?.paidText &&
                uiPrizeRow('quadra')?.paidText !== '0'
                  ? `pago: ${uiPrizeRow('quadra')?.paidText}`
                  : `fundo: ${categoryPrizePools.quadra}`}
              </Text>
            </View>

            <View
              style={
                styles.prizePreviewRow
              }
            >
              <Text
                style={
                  styles.prizePreviewLabel
                }
              >
                🟡 Linha
              </Text>

              <Text
                style={
                  styles.prizePreviewStatus
                }
              >
                {uiPrizeRow('linha')?.slotsText ?? '0/3'}
                {uiPrizeRow('linha')?.highlighted ? ' ✅' : ''}
              </Text>

              <Text
                style={
                  styles.prizePreviewValue
                }
              >
                {uiPrizeRow('linha')?.remainingText ?? '0'}
              </Text>
            </View>

            <View
              style={
                styles.prizePreviewSubRow
              }
            >
              <Text
                style={
                  styles.prizePreviewSubText
                }
              >
                {patternState.diagonais.some(
                  (item) =>
                    item.completed,
                )
                  ? 'linha diagonal'
                  : 'linha horizontal ou válida'}
                {' • '}
                {uiPrizeRow('linha')?.paidText &&
                uiPrizeRow('linha')?.paidText !== '0'
                  ? `pago: ${uiPrizeRow('linha')?.paidText}`
                  : `fundo: ${categoryPrizePools.linha}`}
              </Text>
            </View>

            <View
              style={
                styles.prizePreviewRow
              }
            >
              <Text
                style={
                  styles.prizePreviewLabel
                }
              >
                🏆 Linha dupla
              </Text>

              <Text
                style={
                  styles.prizePreviewStatus
                }
              >
                {uiPrizeRow('dupla')?.slotsText ?? '0/3'}
                {uiPrizeRow('dupla')?.highlighted ? ' ✅' : ''}
              </Text>

              <Text
                style={
                  styles.prizePreviewValue
                }
              >
                {uiPrizeRow('dupla')?.remainingText ?? '0'}
              </Text>
            </View>

            <View
              style={
                styles.prizePreviewSubRow
              }
            >
              <Text
                style={
                  styles.prizePreviewSubText
                }
              >
                {uiPrizeRow('dupla')?.paidText &&
                uiPrizeRow('dupla')?.paidText !== '0'
                  ? `pago: ${uiPrizeRow('dupla')?.paidText}`
                  : `fundo: ${categoryPrizePools.dupla}`}
              </Text>
            </View>

            <View
              style={
                styles.prizePreviewRowBingo
              }
            >
              <Text
                style={
                  styles.prizePreviewLabelBingo
                }
              >
                🎱 Bingo
              </Text>

              <Text
                style={
                  styles.prizePreviewStatusBingo
                }
              >
                {uiPrizeRow('bingo')?.slotsText ?? '0'}
              </Text>

              <Text
                style={
                  styles.prizePreviewValueBingo
                }
              >
                {uiPrizeRow('bingo')?.remainingText ?? '0'}
              </Text>
            </View>

            <View
              style={
                styles.prizePreviewSubRow
              }
            >
              <Text
                style={
                  styles.prizePreviewSubText
                }
              >
                {uiPrizeRow('bingo')?.paidText &&
                uiPrizeRow('bingo')?.paidText !== '0'
                  ? `pago: ${uiPrizeRow('bingo')?.paidText}`
                  : `fundo: ${categoryPrizePools.bingo}`}
              </Text>
            </View>

            <View
              style={
                styles.projectedAccumulatorCard
              }
            >
              <Text
                style={
                  styles.projectedAccumulatorTitle
                }
              >
                🔥 PROJEÇÃO DO ACUMULADO DA SALA
              </Text>

              <Text
                style={
                  styles.projectedAccumulatorValue
                }
              >
                🟡 {projectedAccumulatorGoldAfterRound}
                {'  '}
                💵 {Math.floor(
                  projectedAccumulatorBBAfterRound,
                )}
              </Text>

              <Text
                style={
                  styles.projectedAccumulatorNote
                }
              >
                Simulação: o que não encontrar vencedor permanece no fundo da sala.
              </Text>
            </View>

            <Text
              style={
                styles.prizePreviewNote
              }
            >
              Prévia dinâmica • não é pagamento real.
            </Text>

            <View
              style={
                styles.prizeLedgerLegend
              }
            >
              <Text
                style={
                  styles.prizeLedgerLegendTitle
                }
              >
                CONQUISTA ≠ PAGAMENTO
              </Text>

              <Text
                style={
                  styles.prizeLedgerLegendText
                }
              >
                ✅ = conquista detectada
                {'  '}
                💰 = pagamento da sala
              </Text>
            </View>

            <Text
              style={
                styles.prizePreviewLiveNote
              }
            >
              VAGAS REAIS DA RODADA:
              {' '}
              T {uiPrizeRow('terno')?.slotsText ?? '0/5'}
              {' • '}
              Q {uiPrizeRow('quadra')?.slotsText ?? '0/3'}
              {' • '}
              L {uiPrizeRow('linha')?.slotsText ?? '0/3'}
              {' • '}
              D {uiPrizeRow('dupla')?.slotsText ?? '0/3'}
            </Text>
            <Text
              style={
                styles.prizePreviewLiveNote
              }
            >
              DIAGONAL:
              {' '}
              {uiPrizeRow('diagonal')?.slotsText ?? '0/3'}
              {' • '}
              BINGO:
              {' '}
              {uiPrizeRow('bingo')?.slotsText ?? '0'}
            </Text>

            <View
              style={
                styles.settlementQueueCard
              }
            >
              <Text
                style={
                  styles.settlementQueueTitle
                }
              >
                FILA DE LIQUIDAÇÃO DA RODADA
              </Text>

              <Text
                style={
                  styles.settlementQueueValue
                }
              >
                {pendingSettlements.length}
                {' '}
                aguardando confirmação
              </Text>

              <Text
                style={
                  styles.settlementQueueSubtext
                }
              >
                {settlementCount}
                {' '}
                eventos registrados
                {' • '}
                {paidSettlements.length}
                {' '}
                pagos
              </Text>
            </View>

            {settlementQueue.length > 0 && (
              <View
                style={
                  styles.settlementEventList
                }
              >
                {settlementQueue
                  .slice(-5)
                  .reverse()
                  .map(
                    (event) => (
                      <Text
                        key={
                          event.id
                        }
                        style={
                          styles.settlementEventText
                        }
                      >
                        {event.category ===
                        'terno'
                          ? '🥉 Terno'
                          : event.category ===
                            'quadra'
                            ? '🥈 Quadra'
                            : event.category ===
                              'linha'
                              ? '🟡 Linha'
                              : event.category ===
                                'dupla'
                                ? '🏆 Dupla'
                                : '🎱 Bingo'}
                        {' • '}
                        bola {event.number}
                        {' • '}
                        {event.status ===
                        'eligible'
                          ? 'aguardando'
                          : 'pago'}
                      </Text>
                    ),
                  )}
              </View>
            )}

            <Text
              style={
                styles.prizePreviewLiveNote
              }
            >
              Pagamentos locais: T {patternPaid.terno ? '💰' : '—'}
              {' • '}
              Q {patternPaid.quadra ? '💰' : '—'}
              {' • '}
              L {patternPaid.linha ? '💰' : '—'}
              {' • '}
              D {patternPaid.linhaDupla ? '💰' : '—'}
              {' • '}
              B {patternPaid.bingo ? '💰' : '—'}
            </Text>

            <Text
              style={
                styles.prizePreviewNote
              }
            >
              Na sala multiusuário, os vencedores reais serão registrados pelo servidor.
            </Text>
          </View>

          {patternState.linha.completed &&
            !patternState.bingo.completed && (
              <View
                style={
                  styles.completedLineNotice
                }
              >
                <Text
                  style={
                    styles.completedLineNoticeText
                  }
                >
                  🏅 LINHA COMPLETA DESTACADA NA CARTELA
                </Text>
              </View>
            )}

          {latestAchievementMessage !== '' && (
            <View
              style={[
                styles.achievementHighlight,
                latestAchievementType ===
                  'special' &&
                  styles.achievementHighlightSpecial,
                latestAchievementType ===
                  'bingo' &&
                  styles.achievementHighlightBingo,
              ]}
            >
              <Text
                style={
                  latestAchievementType ===
                  'bingo'
                    ? styles.achievementHighlightBingoTitle
                    : styles.achievementHighlightText
                }
              >
                {latestAchievementMessage}
              </Text>

              <Text
                style={
                  styles.achievementHighlightSubtext
                }
              >
                {latestAchievementType ===
                'bingo'
                  ? '24 / 24 números marcados • BINGO VÁLIDO'
                  : latestAchievementType ===
                    'special'
                    ? 'Conquista especial registrada nesta cartela'
                    : 'Conquista registrada nesta cartela'}
              </Text>
            </View>
          )}

          <View
            style={
              styles.achievementLedger
            }
          >
            <Text
              style={
                styles.achievementLedgerTitle
              }
            >
              CONQUISTAS DA CARTELA
            </Text>

            <Text
              style={
                styles.achievementLedgerText
              }
            >
              Terno {patternAwards.terno ? '✅' : '—'}
              {'  '}Quadra {patternAwards.quadra ? '✅' : '—'}
              {'  '}Linha {patternAwards.linha ? '✅' : '—'}
              {'  '}Dupla {patternAwards.linhaDupla ? '✅' : '—'}
              {'  '}Bingo {patternAwards.bingo ? '🏆' : '—'}
            </Text>
          </View>

          {patternState.linha.completed &&
            !patternState.bingo.completed && (
              <Text
                style={
                  styles.lineTypeHint
                }
              >
                {patternState.diagonais.some(
                  (item) =>
                    item.completed,
                )
                  ? '↘/↗ LINHA DIAGONAL • PRÊMIO MENOR'
                  : '→ LINHA HORIZONTAL • PRÊMIO MAIOR'}
              </Text>
            )}

          <View
            style={
              styles.fullCardProgressCard
            }
          >
            <View
              style={
                styles.fullCardProgressHeader
              }
            >
              <Text
                style={
                  styles.fullCardProgressTitle
                }
              >
                PROGRESSO PARA BINGO
              </Text>

              <Text
                style={
                  styles.fullCardProgressValue
                }
              >
                {fullCardProgress} / 24
              </Text>
            </View>

            <View
              style={
                styles.fullCardProgressTrack
              }
            >
              <View
                style={[
                  styles.fullCardProgressFill,
                  {
                    width: `${fullCardPercentage}%`,
                  },
                ]}
              />
            </View>
          </View>

          <View
            style={
              styles.patternStatusStrip
            }
          >
            <Text
              style={
                styles.patternStatusTitle
              }
            >
              STATUS DA CARTELA
            </Text>

            <Text
              style={
                styles.patternStatusText
              }
            >
              Terno {patternState.terno.completed ? '✅' : '—'}
              {'  '}Quadra {patternState.quadra.completed ? '✅' : '—'}
              {'  '}Linha {patternState.linha.completed ? '✅' : '—'}
              {'  '}Dupla {patternState.linhaDupla.completed ? '✅' : '—'}
              {'  '}Bingo {patternState.bingo.completed ? '🏆' : '—'}
            </Text>
          </View>

          {specialEventMessage !== '' && (
            <View
              style={
                styles.specialEventCard
              }
            >
              <Text
                style={
                  styles.specialEventText
                }
              >
                {specialEventMessage}
              </Text>
            </View>
          )}
        </View>

        {/* HISTÓRICO */}
        {recentNumbers.length > 0 && (
          <View
            style={
              styles.historyCard
            }
          >
            <View
              style={
                styles.historyHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.historyTitle
                  }
                >
                  ÚLTIMOS SORTEADOS
                </Text>

                <Text
                  style={
                    styles.historySubtitle
                  }
                >
                  Os 5 números mais recentes
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setShowFullHistory(
                    (current) =>
                      !current,
                  )
                }
                style={
                  styles.historyButton
                }
              >
                <Text
                  style={
                    styles.historyButtonText
                  }
                >
                  {showFullHistory
                    ? 'FECHAR'
                    : 'VER TODOS'}
                </Text>
              </Pressable>
            </View>

            <View
              style={
                styles.historyNumbers
              }
            >
              {recentNumbers.map(
                (
                  number,
                  index,
                ) => (
                  <View
                    key={`${number}-${index}`}
                    style={[
                      styles.historyBall,
                      index === 0 &&
                        styles.historyBallLatest,
                    ]}
                  >
                    <Text
                      style={
                        styles.historyLetter
                      }
                    >
                      {getBingoLetter(
                        number,
                      )}
                    </Text>

                    <Text
                      style={
                        styles.historyNumber
                      }
                    >
                      {number}
                    </Text>
                  </View>
                ),
              )}
            </View>

            {showFullHistory && (
              <View
                style={
                  styles.fullHistoryPanel
                }
              >
                <View
                  style={
                    styles.fullHistoryHeader
                  }
                >
                  <Text
                    style={
                      styles.fullHistoryTitle
                    }
                  >
                    TODOS OS SORTEADOS
                  </Text>

                  <Text
                    style={
                      styles.fullHistoryCount
                    }
                  >
                    {drawnNumbers.length} / 75
                  </Text>
                </View>

                <View
                  style={
                    styles.fullHistoryGrid
                  }
                >
                  {drawnNumbers.map(
                    (
                      number,
                      index,
                    ) => (
                      <View
                        key={`${number}-${index}`}
                        style={[
                          styles.fullHistoryItem,
                          index ===
                            drawnNumbers.length -
                              1 &&
                            styles.fullHistoryLatest,
                        ]}
                      >
                        <Text
                          style={
                            styles.fullHistoryOrder
                          }
                        >
                          #{index + 1}
                        </Text>

                        <Text
                          style={
                            styles.fullHistoryLetter
                          }
                        >
                          {getBingoLetter(
                            number,
                          )}
                        </Text>

                        <Text
                          style={
                            styles.fullHistoryNumber
                          }
                        >
                          {number}
                        </Text>
                      </View>
                    ),
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {/* DESAFIO DO COMBO */}
        <View
          style={[
            styles.comboChallengeCard,
            hitCombo >= 1 &&
              !comboChallengeCompleted &&
              styles.comboChallengeCardActive,
            comboChallengeCompleted &&
              styles.comboChallengeCardCompleted,
          ]}
        >
          <View
            style={
              styles.comboChallengeIcon
            }
          >
            <Text
              style={
                styles.comboChallengeIconText
              }
            >
              {comboChallengeCompleted ? '✓' : '🔥'}
            </Text>
          </View>

          <View
            style={
              styles.comboChallengeContent
            }
          >
            <Text
              style={
                styles.comboChallengeLabel
              }
            >
              DESAFIO DA PARTIDA
            </Text>

            <Text
              style={
                styles.comboChallengeTitle
              }
            >
              {comboChallengeCompleted
                ? 'COMBO x3 — DESAFIO CONCLUÍDO!'
                : hitCombo === 0
                  ? 'Consiga um COMBO x3'
                  : hitCombo === 1
                    ? 'COMBO x1 — mais 2 acertos'
                    : 'COMBO x2 — mais 1 acerto!'}
            </Text>

            <View
              style={
                styles.comboChallengeTrack
              }
            >
              <View
                style={[
                  styles.comboChallengeFill,
                  {
                    width: `${
                      (Math.min(
                        hitCombo,
                        3,
                      ) / 3) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>

          <View
            style={
              styles.comboChallengeReward
            }
          >
            <Text
              style={
                styles.comboChallengeRewardValue
              }
            >
              {comboChallengeCompleted
                ? '+25 XP'
                : 'META'}
            </Text>

            <Text
              style={
                styles.comboChallengeRewardLabel
              }
            >
              {comboChallengeCompleted
                ? 'RECEBIDO'
                : `${Math.min(hitCombo, 3)}/3`}
            </Text>
          </View>
        </View>

        {/* QUASE BINGO */}
        {almostBingo && (
          <View
            style={
              styles.almostBingoCard
            }
          >
            <View
              style={
                styles.almostBingoIcon
              }
            >
              <Text
                style={
                  styles.almostBingoIconText
                }
              >
                !
              </Text>
            </View>

            <View
              style={
                styles.almostBingoContent
              }
            >
              <Text
                style={
                  styles.almostBingoTitle
                }
              >
                QUASE BINGO!
              </Text>

              <Text
                style={
                  styles.almostBingoSubtitle
                }
              >
                Falta apenas 1 número
                nesta linha.
              </Text>
            </View>

            <Text
              style={
                styles.almostBingoProgress
              }
            >
              {bestRowProgress}/5
            </Text>
          </View>
        )}

        {/* CELEBRAÇÃO */}
        {hasWon && (
          <View
            style={
              styles.victoryCard
            }
          >
            <View
              style={
                styles.confettiRow
              }
            >
              <Text
                style={
                  styles.confetti
                }
              >
                ✦
              </Text>

              <Text
                style={
                  styles.confetti
                }
              >
                ★
              </Text>

              <Text
                style={
                  styles.confetti
                }
              >
                ✦
              </Text>

              <Text
                style={
                  styles.confetti
                }
              >
                ★
              </Text>

              <Text
                style={
                  styles.confetti
                }
              >
                ✦
              </Text>
            </View>

            <Text
              style={
                styles.victoryTitle
              }
            >
              BINGO!
            </Text>

            <Text
              style={
                styles.victorySubtitle
              }
            >
              Você completou a cartela inteira!
            </Text>

            <View
              style={
                styles.rewardCard
              }
            >
              <View
                style={
                  styles.rewardIcon
                }
              >
                <Text
                  style={
                    styles.rewardIconText
                  }
                >
                  +
                </Text>
              </View>

              <View
                style={
                  styles.rewardContent
                }
              >
                <Text
                  style={
                    styles.rewardLabel
                  }
                >
                  RECOMPENSA
                </Text>

                <Text
                  style={
                    styles.rewardValue
                  }
                >
                  +{WIN_REWARD} fichas
                </Text>
              </View>
            </View>

            <View
              style={
                styles.xpReward
              }
            >
              <Text
                style={
                  styles.xpRewardText
                }
              >
                +{WIN_XP} XP
              </Text>

              <Text
                style={
                  styles.xpRewardHint
                }
              >
                Progresso salvo
              </Text>
            </View>

            {missionCompleted && (
              <View
                style={
                  styles.missionCompleteReward
                }
              >
                <Text
                  style={
                    styles.missionCompleteTitle
                  }
                >
                  DESAFIO CONCLUÍDO!
                </Text>

                <Text
                  style={
                    styles.missionCompleteText
                  }
                >
                  +{MISSION_REWARD}{' '}
                  fichas
                </Text>
              </View>
            )}

            <Text
              style={
                styles.victoryMessage
              }
            >
              Bianca e Bob estão
              comemorando com você!
            </Text>

            {firstBingoUnlocked && bingosCompleted === 1 && (
              <View
                style={
                  styles.firstBingoCard
                }
              >
                <Text
                  style={
                    styles.firstBingoIcon
                  }
                >
                  🏆
                </Text>

                <View
                  style={
                    styles.firstBingoContent
                  }
                >
                  <Text
                    style={
                      styles.firstBingoTitle
                    }
                  >
                    PRIMEIRO BINGO!
                  </Text>

                  <Text
                    style={
                      styles.firstBingoText
                    }
                  >
                    Você acaba de completar sua primeira vitória.
                  </Text>
                </View>
              </View>
            )}

            {firstBingoUnlocked && bingosCompleted > 1 && (
              <View
                style={
                  styles.firstBingoCompact
                }
              >
                <Text
                  style={
                    styles.firstBingoCompactText
                  }
                >
                  🏆 PRIMEIRO BINGO CONQUISTADO
                </Text>
              </View>
            )}

            <View
              style={
                styles.matchSummaryCard
              }
            >
              <Text
                style={
                  styles.matchSummaryTitle
                }
              >
                RESUMO DA PARTIDA
              </Text>

              <View
                style={
                  styles.matchSummaryGrid
                }
              >
              <Text
                style={
                  styles.matchSummaryNote
                }
              >
                Valores de premiação são uma prévia do motor; pagamento real
                entra quando houver rodada multiusuário.
              </Text>

                <View
                  style={
                    styles.matchSummaryItem
                  }
                >
                  <Text
                    style={
                      styles.matchSummaryIcon
                    }
                  >
                    🎱
                  </Text>

                  <Text
                    style={
                      styles.matchSummaryLabel
                    }
                  >
                    SORTEADOS
                  </Text>

                  <Text
                    style={
                      styles.matchSummaryValue
                    }
                  >
                    {drawnNumbers.length}
                  </Text>
                </View>

                <View
                  style={
                    styles.matchSummaryItem
                  }
                >
                  <Text
                    style={
                      styles.matchSummaryIcon
                    }
                  >
                    🧮
                  </Text>

                  <Text
                    style={
                      styles.matchSummaryLabel
                    }
                  >
                    POOL VIRTUAL
                  </Text>

                  <Text
                    style={
                      styles.matchSummaryValue
                    }
                  >
                    {virtualPrizePoolPreview}
                  </Text>
                </View>

                <View
                  style={
                    styles.matchSummaryItemWide
                  }
                >
                  <Text
                    style={
                      styles.matchSummaryIcon
                    }
                  >
                    🔥
                  </Text>

                  <Text
                    style={
                      styles.matchSummaryLabel
                    }
                  >
                    ACUMULADO DA SALA
                  </Text>

                  <Text
                    style={
                      styles.matchSummaryValueSmall
                    }
                  >
                    🟡 {simulatedAccumulatorGold}
                    {'  '}
                    💵 {Math.floor(simulatedAccumulatorBB)}
                  </Text>

                  <Text
                    style={
                      styles.accumulatorCurrencyHint
                    }
                  >
                    Fichas douradas + BB Dólinhas
                  </Text>

                  <Text
                    style={
                      styles.matchSummaryNote
                    }
                  >
                    Prévia matemática • não é pagamento
                  </Text>
                </View>

                <View
                  style={
                    styles.matchSummaryItem
                  }
                >
                  <Text
                    style={
                      styles.matchSummaryIcon
                    }
                  >
                    🏅
                  </Text>

                  <Text
                    style={
                      styles.matchSummaryLabel
                    }
                  >
                    PRÊMIOS
                  </Text>

                  <Text
                    style={
                      styles.matchSummaryValue
                    }
                  >
                    {patternAwards.terno
                      ? 'T✅'
                      : 'T—'}
                    {' '}
                    {patternAwards.quadra
                      ? 'Q✅'
                      : 'Q—'}
                    {' '}
                    {patternAwards.linha
                      ? 'L✅'
                      : 'L—'}
                  </Text>
                </View>

                <View
                  style={
                    styles.matchSummaryItem
                  }
                >
                  <Text
                    style={
                      styles.matchSummaryIcon
                    }
                  >
                    🔥
                  </Text>

                  <Text
                    style={
                      styles.matchSummaryLabel
                    }
                  >
                    MELHOR COMBO
                  </Text>

                  <Text
                    style={
                      styles.matchSummaryValue
                    }
                  >
                    x{bestHitCombo}
                  </Text>
                </View>

                <View
                  style={
                    styles.matchSummaryItem
                  }
                >
                  <Text
                    style={
                      styles.matchSummaryIcon
                    }
                  >
                    🎯
                  </Text>

                  <Text
                    style={
                      styles.matchSummaryLabel
                    }
                  >
                    CARTELA
                  </Text>

                  <Text
                    style={
                      styles.matchSummaryValue
                    }
                  >
                    24 / 24
                  </Text>
                </View>

                <View
                  style={
                    styles.matchSummaryItem
                  }
                >
                  <Text
                    style={
                      styles.matchSummaryIcon
                    }
                  >
                    🏅
                  </Text>

                  <Text
                    style={
                      styles.matchSummaryLabel
                    }
                  >
                    LINHAS
                  </Text>

                  <Text
                    style={
                      styles.matchSummaryValue
                    }
                  >
                    {
                      patternState
                        .linha
                        .lineIndexes
                        .length
                    }
                  </Text>
                </View>

                <View
                  style={
                    styles.matchSummaryItem
                  }
                >
                  <Text
                    style={
                      styles.matchSummaryIcon
                    }
                  >
                    🌴
                  </Text>

                  <Text
                    style={
                      styles.matchSummaryLabel
                    }
                  >
                    VILA
                  </Text>

                  <Text
                    style={
                      styles.matchSummaryValue
                    }
                  >
                    NÍVEL {villageLevel}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* CARTELA */}
        <View
          style={
            styles.cardSection
          }
        >
          <View
            style={
              styles.cardHeader
            }
          >
            <View>
              <Text
                style={
                  styles.cardTitle
                }
              >
                SUA CARTELA
              </Text>

              <Text
                style={
                  styles.cardSubtitle
                }
              >
                {hasWon
                  ? 'Cartela completa — BINGO!'
                  : 'Toque em um número para marcar'}
              </Text>
            </View>

            <View
              style={[
                styles.progressBadge,
                hasWon &&
                  styles.progressBadgeWon,
              ]}
            >
              <Text
                style={
                  styles.progressText
                }
              >
                {markedCount} / 24
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.cardBoard,
              hasWon &&
                styles.cardBoardWon,
            ]}
          >
            <View
              style={
                styles.columnHeaderRow
              }
            >
              {[
                'B',
                'I',
                'N',
                'G',
                'O',
              ].map(
                (letter) => (
                  <View
                    key={letter}
                    style={
                      styles.columnHeader
                    }
                  >
                    <Text
                      style={
                        styles.columnHeaderText
                      }
                    >
                      {letter}
                    </Text>
                  </View>
                ),
              )}
            </View>

            <View
              style={
                styles.numberGrid
              }
            >
              {cardNumbers.map(
                (
                  number,
                  index,
                ) => {
                  const isFree =
                    number === 0;

                  const isMarked =
                    isFree ||
                    markedNumbers.has(
                      number,
                    );

                  const row =
                    Math.floor(
                      index / 5,
                    );

                  const rowNumbers =
                    cardNumbers.slice(
                      row * 5,
                      row * 5 + 5,
                    );

                  const isWinningRow =
                    hasWon &&
                    rowNumbers.every(
                      (rowNumber) => {
                        if (
                          rowNumber ===
                          0
                        ) {
                          return true;
                        }

                        return markedNumbers.has(
                          rowNumber,
                        );
                      },
                    );

                  const isAlmostWinningRow =
                    almostBingo &&
                    row === bestRowIndex;

                  const isCompletedPatternCell =
                    patternState.linha.winningIndexes.includes(
                      index,
                    ) ||
                    patternState.linhaDupla.winningIndexes.includes(
                      index,
                    );

                  const isBingoCell =
                    patternState.bingo.completed;

                  return (
                    <View
                      key={`${number}-${index}`}
                      style={
                        styles.numberCell
                      }
                    >
                      <Pressable
                        disabled={
                          isFree ||
                          hasWon
                        }
                        onPress={() =>
                          handleNumberPress(
                            number,
                          )
                        }
                        style={({
                          pressed,
                        }) => [
                          styles.numberInner,
                          isFree &&
                            styles.freeInner,
                          isCompletedPatternCell &&
                            styles.completedPatternCell,
                          isBingoCell &&
                            styles.bingoCell,
                          isMarked &&
                            !isFree &&
                            styles.markedInner,
                          isWinningRow &&
                            styles.winningInner,
                          isAlmostWinningRow &&
                            styles.almostWinningInner,
                          pressed &&
                            !isFree &&
                            !hasWon &&
                            styles.numberPressed,
                        ]}
                      >
                        {isFree ? (
                          <>
                            <Text
                              style={
                                styles.freeIcon
                              }
                            >
                              ★
                            </Text>

                            <Text
                              style={
                                styles.freeText
                              }
                            >
                              LIVRE
                            </Text>
                          </>
                        ) : (
                          <>
                            <Text
                              style={[
                                styles.numberText,
                                isMarked &&
                                  styles.markedText,
                                isWinningRow &&
                                  styles.winningText,
                                isAlmostWinningRow &&
                                  styles.almostWinningText,
                                isCompletedPatternCell &&
                                  styles.completedPatternText,
                                isBingoCell &&
                                  styles.bingoCellNumberText,
                              ]}
                            >
                              {number}
                            </Text>

                            <View
                              style={
                                styles.specialSymbolRow
                              }
                            >
                              {generatedCard.cells[
                                index
                              ].symbols.includes(
                                'bomb',
                              ) && (
                                <Text
                                  style={
                                    styles.specialSymbol
                                  }
                                >
                                  💣
                                </Text>
                              )}

                              {generatedCard.cells[
                                index
                              ].symbols.includes(
                                'dolinha',
                              ) && (
                                <Text
                                  style={
                                    styles.specialSymbol
                                  }
                                >
                                  💵
                                </Text>
                              )}
                            </View>
                          </>
                        )}
                      </Pressable>
                    </View>
                  );
                },
              )}
            </View>
          </View>
        </View>

        {/* MARCAÇÃO AUTOMÁTICA */}
        <View
          style={
            styles.controls
          }
        >
          <Pressable
            disabled={hasWon}
            style={({ pressed }) => [
              styles.autoButton,
              hasWon &&
                styles.disabledControl,
              pressed &&
                !hasWon &&
                styles.pressed,
            ]}
            onPress={
              toggleAutoMark
            }
          >
            <View
              style={[
                styles.autoIcon,
                autoMark &&
                  styles.autoIconActive,
              ]}
            >
              <Text
                style={
                  styles.autoIconText
                }
              >
                {autoMark
                  ? '✓'
                  : '−'}
              </Text>
            </View>

            <View
              style={
                styles.autoContent
              }
            >
              <Text
                style={
                  styles.autoTitle
                }
              >
                MARCAÇÃO AUTOMÁTICA
              </Text>

              <Text
                style={
                  styles.autoSubtitle
                }
              >
                {hasWon
                  ? 'Partida encerrada'
                  : autoMark
                    ? 'Ativada para números sorteados'
                    : 'Desativada — toque para marcar'}
              </Text>
            </View>

            <View
              style={[
                styles.toggle,
                !autoMark &&
                  styles.toggleOff,
                hasWon &&
                  styles.toggleOff,
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  !autoMark &&
                    styles.toggleKnobOff,
                  hasWon &&
                    styles.toggleKnobOff,
                ]}
              />
            </View>
          </Pressable>
        </View>

        {/* ANFITRIÕES */}
        <View
          style={[
            styles.hostSection,
            almostBingo &&
              styles.hostSectionAlmost,
            hasWon &&
              styles.hostSectionWon,
          ]}
        >
          <View
            style={[
              styles.hostBubble,
              almostBingo &&
                styles.hostBubbleAlmost,
              hasWon &&
                styles.hostBubbleWon,
            ]}
          >
            <Text
              style={
                styles.hostBubbleText
              }
            >
              B
            </Text>
          </View>

          <View
            style={
              styles.hostMessage
            }
          >
            <Text
  style={[
    styles.hostName,
    almostBingo &&
      styles.hostNameAlmost,
    hitCardNumber &&
      !almostBingo &&
      !hasWon &&
      styles.hostNameHit,
    hasWon &&
      styles.hostNameWon,
  ]}
>
  Bianca + Bob
</Text>

            {almostBingo && (
              <View
                style={
                  styles.hostAlmostBadge
                }
              >
                <Text
                  style={
                    styles.hostAlmostBadgeText
                  }
                >
                  QUASE BINGO!
                </Text>
              </View>
            )}

            {hitCombo >= 2 &&
              !almostBingo &&
              !hasWon && (
                <View
                  style={
                    styles.hostComboBadge
                  }
                >
                  <Text
                    style={
                      styles.hostComboBadgeText
                    }
                  >
                    🔥 COMBO x{hitCombo}
                  </Text>
                </View>
              )}

            <Text
              style={[
                styles.hostMessageText,
                almostBingo &&
                  styles.hostMessageAlmost,
              ]}
            >
              {hostMessage}
            </Text>
          </View>

          <View
            style={[
              styles.hostBubble,
              almostBingo &&
                styles.hostBubbleAlmost,
              hasWon &&
                styles.hostBubbleWon,
            ]}
          >
            <Text
              style={
                styles.hostBubbleText
              }
            >
              B
            </Text>
          </View>
        </View>

        {/* AÇÃO */}
        {hasWon ? (
          <Pressable
            onPress={
              handlePlayAgain
            }
            style={({ pressed }) => [
              styles.playAgainButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Text
              style={
                styles.playAgainText
              }
            >
              JOGAR NOVAMENTE
            </Text>

            <Text
              style={
                styles.nextButtonArrow
              }
            >
              ›
            </Text>
          </Pressable>
        ) : (
          <Pressable
            disabled={
              isFinished
            }
            onPress={
              handleNextNumber
            }
            style={({ pressed }) => [
              styles.nextButton,
              isFinished &&
                styles.nextButtonDisabled,
              pressed &&
                !isFinished &&
                styles.pressed,
            ]}
          >
            <Text
              style={
                styles.nextButtonText
              }
            >
              {isFinished
                ? 'SORTEIO ENCERRADO'
                : 'PRÓXIMO NÚMERO'}
            </Text>

            {!isFinished && (
              <Text
                style={
                  styles.nextButtonArrow
                }
              >
                ›
              </Text>
            )}
          </Pressable>
        )}

        <Text
          style={
            styles.footerHint
          }
        >
          {hasWon
            ? 'Sua jornada continua no Bingo Brasil!'
            : `${drawnNumbers.length} de 75 números sorteados`}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07152D',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 34,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#102A4D',
    borderWidth: 1,
    borderColor: '#315176',
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
    marginTop: -3,
  },

  topCenter: {
    alignItems: 'center',
  },

  topTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },

  topSubtitle: {
    color: '#78C8C8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 3,
  },

  currencyGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  chipBadge: {
    minWidth: 80,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#102A4D',
    borderWidth: 1,
    borderColor: '#315176',
  },

  chipIcon: {
    color: '#F6CA5F',
    fontSize: 13,
    marginRight: 6,
  },

  chipValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  dolinhaBadge: {
    minWidth: 58,
    height: 40,
    paddingHorizontal: 9,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#102A4D',
    borderWidth: 1,
    borderColor: '#315176',
  },

  dolinhaBadgeIcon: {
    fontSize: 13,
    marginRight: 4,
  },

  dolinhaBadgeValue: {
    color: '#A9FFE0',
    fontSize: 12,
    fontWeight: '900',
  },

  progressCard: {
    borderRadius: 22,
    backgroundColor: '#0A5C75',
    borderWidth: 2,
    borderColor: '#56D6D1',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },

  progressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  progressLabel: {
    color: '#B9F0EC',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  levelTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 3,
  },

  xpBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#082F3B',
    borderWidth: 1,
    borderColor: '#56D6D1',
  },

  xpBadgeText: {
    color: '#F6CA5F',
    fontSize: 10,
    fontWeight: '900',
  },

  xpTrack: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#083E50',
    marginTop: 12,
    overflow: 'hidden',
  },

  xpFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#F6CA5F',
  },

  xpBottom: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  xpCurrent: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  progressHint: {
    color: '#B9F0EC',
    fontSize: 8,
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 10,
  },

  missionCard: {
    minHeight: 92,
    borderRadius: 20,
    backgroundColor: '#0D2342',
    borderWidth: 1,
    borderColor: '#315176',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  missionCardCompleted: {
    backgroundColor: '#0B6E58',
    borderColor: '#1BCB83',
  },

  missionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6D58B8',
    marginRight: 11,
  },

  missionIconCompleted: {
    backgroundColor: '#1BCB83',
  },

  missionIconText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
  },

  missionContent: {
    flex: 1,
    minWidth: 0,
  },

  missionLabel: {
    color: '#7EB2D3',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  missionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 3,
  },

  missionTrack: {
    width: '100%',
    height: 7,
    borderRadius: 4,
    backgroundColor: '#183A58',
    marginTop: 8,
    overflow: 'hidden',
  },

  missionFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#F6CA5F',
  },

  missionProgressText: {
    color: '#7EB2D3',
    fontSize: 8,
    marginTop: 4,
  },

  missionReward: {
    width: 74,
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: '#123456',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    paddingHorizontal: 5,
  },

  missionRewardLabel: {
    color: '#7197B0',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
  },

  missionRewardValue: {
    color: '#F6CA5F',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
    textAlign: 'center',
  },

  missionRewardSub: {
    color: '#8CADBE',
    fontSize: 7,
    marginTop: 1,
  },

  villageCard: {
    minHeight: 100,
    borderRadius: 22,
    backgroundColor: '#0A5C75',
    borderWidth: 2,
    borderColor: '#56D6D1',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  villageIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#123E4B',
    borderWidth: 1,
    borderColor: '#77E1D9',
    marginRight: 12,
  },

  villageIconText: {
    fontSize: 24,
  },

  villageContent: {
    flex: 1,
  },

  villageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  villageLabel: {
    color: '#B9F0EC',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  villageTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
  },

  villageBingoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#082F3B',
    borderWidth: 1,
    borderColor: '#56D6D1',
  },

  villageBingoBadgeText: {
    color: '#F6CA5F',
    fontSize: 8,
    fontWeight: '900',
  },

  villageTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#083E50',
    marginTop: 9,
    overflow: 'hidden',
  },

  villageFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#F6CA5F',
  },

  villageBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },

  villageProgressText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },

  villageHint: {
    color: '#B9F0EC',
    fontSize: 8,
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  statusCard: {
    width: '31.5%',
    minHeight: 68,
    borderRadius: 18,
    backgroundColor: '#0D2342',
    borderWidth: 1,
    borderColor: '#21476F',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusLabel: {
    color: '#6F92B0',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  statusValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 5,
  },

  drawSection: {
    alignItems: 'center',
    marginBottom: 18,
  },

  drawSectionWon: {
    marginBottom: 16,
  },

  drawLabel: {
    color: '#7EB2D3',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  ballRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  bingoBall: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1C84B',
    borderWidth: 5,
    borderColor: '#FFFFFF',
  },

  bingoBallWon: {
    backgroundColor: '#1BCB83',
    borderColor: '#A9FFE0',
  },

  ballInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E8FA2',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  ballInnerWon: {
    backgroundColor: '#0A7159',
  },

  ballLetter: {
    color: '#A8EFEA',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },

  ballNumber: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 1,
    textAlign: 'center',
  },

  ballNumberWon: {
    fontSize: 20,
    letterSpacing: 0.5,
  },

  drawMessage: {
    color: '#F6CA5F',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 9,
    textAlign: 'center',
  },

  drawMessageWon: {
    color: '#1BCB83',
    fontSize: 14,
  },

  achievementHighlightSpecial: {
    backgroundColor: '#4A3A10',
    borderColor: '#F6CA5F',
  },

  achievementHighlightBingo: {
    minHeight: 92,
    backgroundColor: '#0B6E58',
    borderColor: '#F6CA5F',
    borderWidth: 3,
  },

  achievementHighlightBingoTitle: {
    color: '#F6CA5F',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.6,
  },

  prizePreviewCard: {
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#0D2342',
    borderWidth: 1,
    borderColor: '#315176',
  },

  prizePreviewLiveNote: {
    color: '#A9FFE0',
    fontSize: 7,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 7,
  },

  prizePreviewTitle: {
    color: '#F6CA5F',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 6,
  },

  roundAccountingCard: {
    marginBottom: 7,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 13,
    backgroundColor: '#102A4D',
    borderWidth: 1,
    borderColor: '#315176',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },

  roundAccountingItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },

  roundAccountingLabel: {
    color: '#7EB2D3',
    fontSize: 6,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.4,
  },

  roundAccountingValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },

  roundAccountingValueHighlight: {
    color: '#F6CA5F',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },

  settlementQueueCard: {
    marginTop: 7,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 13,
    backgroundColor: '#102A4D',
    borderWidth: 1,
    borderColor: '#315176',
    alignItems: 'center',
  },

  settlementQueueTitle: {
    color: '#F6CA5F',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.6,
    textAlign: 'center',
  },

  settlementQueueValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 3,
  },

  settlementQueueSubtext: {
    color: '#7EB2D3',
    fontSize: 7,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },

  settlementEventList: {
    marginBottom: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#0D2342',
  },

  settlementEventText: {
    color: '#A9FFE0',
    fontSize: 7,
    fontWeight: '700',
    marginVertical: 1,
    textAlign: 'center',
  },

  prizeLedgerLegend: {
    marginBottom: 7,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#132B4A',
    borderWidth: 1,
    borderColor: '#315176',
    alignItems: 'center',
  },

  prizeLedgerLegendTitle: {
    color: '#F6CA5F',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  prizeLedgerLegendText: {
    color: '#A9FFE0',
    fontSize: 7,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },

  prizePreviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 5,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#315176',
  },

  prizePreviewHeaderLabel: {
    color: '#7EB2D3',
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  prizePreviewStatus: {
    minWidth: 52,
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
  },

  prizePreviewSubRow: {
    paddingLeft: 4,
    paddingBottom: 4,
  },

  prizePreviewSubText: {
    color: '#7EB2D3',
    fontSize: 7,
    fontWeight: '700',
  },

  prizePreviewRowBingo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginTop: 3,
    borderTopWidth: 1,
    borderTopColor: '#F6CA5F',
  },

  prizePreviewLabelBingo: {
    color: '#F6CA5F',
    fontSize: 10,
    fontWeight: '900',
  },

  prizePreviewStatusBingo: {
    minWidth: 70,
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    textAlign: 'center',
  },

  prizePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },

  prizePreviewLabel: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },

  prizePreviewValue: {
    color: '#A9FFE0',
    fontSize: 10,
    fontWeight: '900',
  },

  prizePreviewValueBingo: {
    color: '#F6CA5F',
    fontSize: 11,
    fontWeight: '900',
  },

  accumulatorCurrencyHint: {
    color: '#7EB2D3',
    fontSize: 7,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },

  projectedAccumulatorCard: {
    marginTop: 7,
    marginBottom: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#0B6E58',
    borderWidth: 1,
    borderColor: '#1BCB83',
    alignItems: 'center',
  },

  projectedAccumulatorTitle: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  projectedAccumulatorValue: {
    color: '#F6CA5F',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 3,
    textAlign: 'center',
  },

  projectedAccumulatorNote: {
    color: '#D4FFF1',
    fontSize: 7,
    lineHeight: 10,
    fontWeight: '700',
    marginTop: 3,
    textAlign: 'center',
  },

  prizePreviewNote: {
    color: '#7EB2D3',
    fontSize: 7,
    lineHeight: 10,
    textAlign: 'center',
    marginTop: 6,
  },

  lineTypeHint: {
    alignSelf: 'center',
    marginTop: 6,
    marginBottom: 2,
    color: '#F6CA5F',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  completedLineNotice: {
    marginTop: 7,
    marginBottom: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 11,
    backgroundColor: '#4A3A10',
    borderWidth: 1,
    borderColor: '#F6CA5F',
    alignItems: 'center',
  },

  completedLineNoticeText: {
    color: '#F6CA5F',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.4,
    textAlign: 'center',
  },

  achievementHighlight: {
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#0B6E58',
    borderWidth: 2,
    borderColor: '#1BCB83',
    alignItems: 'center',
  },

  achievementHighlightText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.4,
  },

  achievementHighlightSubtext: {
    color: '#D4FFF1',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 3,
    textAlign: 'center',
  },

  achievementLedger: {
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#102A4D',
    borderWidth: 1,
    borderColor: '#F6CA5F',
  },

  achievementLedgerTitle: {
    color: '#F6CA5F',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
  },

  achievementLedgerText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 3,
  },

  patternStatusStrip: {
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#0D2342',
    borderWidth: 1,
    borderColor: '#315176',
  },

  patternStatusTitle: {
    color: '#7EB2D3',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
  },

  patternStatusText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 3,
  },

  specialEventCard: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#103C3B',
    borderWidth: 1,
    borderColor: '#1BCB83',
  },

  specialEventText: {
    color: '#A9FFE0',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },

  historyCard: {
    borderRadius: 20,
    backgroundColor: '#0D2342',
    borderWidth: 1,
    borderColor: '#315176',
    padding: 13,
    marginBottom: 18,
  },

  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  historyTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  historySubtitle: {
    color: '#6F92B0',
    fontSize: 8,
    marginTop: 3,
  },

  historyButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#123456',
    borderWidth: 1,
    borderColor: '#315176',
  },

  historyButtonText: {
    color: '#A8EFEA',
    fontSize: 8,
    fontWeight: '900',
  },

  historyNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  historyBall: {
    flex: 1,
    minHeight: 56,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#102A4D',
    borderWidth: 1,
    borderColor: '#315176',
    marginHorizontal: 2,
  },

  historyBallLatest: {
    backgroundColor: '#0A5C75',
    borderColor: '#56D6D1',
  },

  historyLetter: {
    color: '#79B8C7',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  historyNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },

  fullHistoryPanel: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#21476F',
  },

  fullHistoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  fullHistoryTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  fullHistoryCount: {
    color: '#F6CA5F',
    fontSize: 10,
    fontWeight: '900',
  },

  fullHistoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  fullHistoryItem: {
    width: '19%',
    minHeight: 54,
    borderRadius: 12,
    backgroundColor: '#102A4D',
    borderWidth: 1,
    borderColor: '#315176',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '1.25%',
    marginBottom: 7,
  },

  fullHistoryLatest: {
    backgroundColor: '#0A5C75',
    borderColor: '#56D6D1',
  },

  fullHistoryOrder: {
    color: '#52758E',
    fontSize: 6,
    fontWeight: '800',
  },

  fullHistoryLetter: {
    color: '#79B8C7',
    fontSize: 7,
    fontWeight: '900',
    marginTop: 1,
  },

  fullHistoryNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 1,
  },

  comboChallengeCardActive: {
    backgroundColor: '#103C3B',
    borderColor: '#1BCB83',
    borderWidth: 2,
  },

  comboChallengeCardCompleted: {
    backgroundColor: '#0B6E58',
    borderColor: '#1BCB83',
    borderWidth: 2,
  },

  comboChallengeCard: {
    minHeight: 84,
    borderRadius: 20,
    backgroundColor: '#0D2342',
    borderWidth: 1,
    borderColor: '#315176',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  comboChallengeIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#123456',
    marginRight: 10,
  },

  comboChallengeIconText: {
    fontSize: 19,
    color: '#F6CA5F',
  },

  comboChallengeContent: {
    flex: 1,
    minWidth: 0,
  },

  comboChallengeLabel: {
    color: '#7EB2D3',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  comboChallengeTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 3,
  },

  comboChallengeTrack: {
    width: '100%',
    height: 7,
    borderRadius: 4,
    backgroundColor: '#183A58',
    marginTop: 7,
    overflow: 'hidden',
  },

  comboChallengeFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#1BCB83',
  },

  comboChallengeReward: {
    width: 66,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: '#123456',
    borderWidth: 1,
    borderColor: '#315176',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 9,
    paddingHorizontal: 4,
  },

  comboChallengeRewardValue: {
    color: '#F6CA5F',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },

  comboChallengeRewardLabel: {
    color: '#7EB2D3',
    fontSize: 7,
    fontWeight: '900',
    marginTop: 3,
    textAlign: 'center',
  },

  almostBingoCard: {
    minHeight: 74,
    borderRadius: 20,
    backgroundColor: '#4A3A10',
    borderWidth: 2,
    borderColor: '#F6CA5F',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  almostBingoIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6CA5F',
    marginRight: 11,
  },

  almostBingoIconText: {
    color: '#4A3200',
    fontSize: 24,
    fontWeight: '900',
  },

  almostBingoContent: {
    flex: 1,
  },

  almostBingoTitle: {
    color: '#F6CA5F',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.9,
  },

  almostBingoSubtitle: {
    color: '#FFF0B5',
    fontSize: 10,
    marginTop: 3,
  },

  almostBingoProgress: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 10,
  },

  victoryCard: {
    borderRadius: 24,
    backgroundColor: '#0B6E58',
    borderWidth: 2,
    borderColor: '#1BCB83',
    paddingHorizontal: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 18,
  },

  confettiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  confetti: {
    color: '#F6CA5F',
    fontSize: 20,
    fontWeight: '900',
    marginHorizontal: 8,
  },

  victoryTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 6,
  },

  victorySubtitle: {
    color: '#D4FFF1',
    fontSize: 13,
    marginTop: 3,
  },

  rewardCard: {
    width: '100%',
    minHeight: 70,
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: '#082F3B',
    borderWidth: 1,
    borderColor: '#2CA58D',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  rewardIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6CA5F',
    marginRight: 12,
  },

  rewardIconText: {
    color: '#09203C',
    fontSize: 23,
    fontWeight: '900',
  },

  rewardContent: {
    flex: 1,
  },

  rewardLabel: {
    color: '#85BFB6',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  rewardValue: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    marginTop: 3,
  },

  xpReward: {
    width: '100%',
    marginTop: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#123456',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  xpRewardText: {
    color: '#F6CA5F',
    fontSize: 13,
    fontWeight: '900',
  },

  xpRewardHint: {
    color: '#82AAA9',
    fontSize: 9,
    fontWeight: '700',
  },

  missionCompleteReward: {
    width: '100%',
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: '#123456',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },

  missionCompleteTitle: {
    color: '#F6CA5F',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  missionCompleteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 3,
  },

  victoryMessage: {
    color: '#D4FFF1',
    fontSize: 11,
    marginTop: 12,
    textAlign: 'center',
  },

  firstBingoCard: {
    width: '100%',
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: '#4A3A10',
    borderWidth: 2,
    borderColor: '#F6CA5F',
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  firstBingoIcon: {
    fontSize: 27,
    marginRight: 10,
  },

  firstBingoContent: {
    flex: 1,
  },

  firstBingoTitle: {
    color: '#F6CA5F',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  firstBingoText: {
    color: '#FFF0B5',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  firstBingoCompact: {
    width: '100%',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#123456',
    borderWidth: 1,
    borderColor: '#315176',
    alignItems: 'center',
  },

  firstBingoCompactText: {
    color: '#F6CA5F',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
    textAlign: 'center',
  },

  matchSummaryCard: {
    width: '100%',
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: '#082F3B',
    borderWidth: 1,
    borderColor: '#2CA58D',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },

  matchSummaryTitle: {
    color: '#B9F0EC',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 10,
  },

  matchSummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  fullCardProgressCard: {
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 15,
    backgroundColor: '#0D2342',
    borderWidth: 1,
    borderColor: '#315176',
  },

  fullCardProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  fullCardProgressTitle: {
    color: '#7EB2D3',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  fullCardProgressValue: {
    color: '#F6CA5F',
    fontSize: 11,
    fontWeight: '900',
  },

  fullCardProgressTrack: {
    height: 8,
    borderRadius: 6,
    backgroundColor: '#102A4D',
    overflow: 'hidden',
    marginTop: 6,
  },

  fullCardProgressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: '#1BCB83',
  },

  matchSummaryItemWide: {
    width: '100%',
    minHeight: 78,
    borderRadius: 14,
    backgroundColor: '#102A4D',
    borderWidth: 1,
    borderColor: '#315176',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
    paddingHorizontal: 8,
  },

  matchSummaryValueSmall: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
    textAlign: 'center',
  },

  matchSummaryItem: {
    width: '48.5%',
    minHeight: 78,
    borderRadius: 14,
    backgroundColor: '#123456',
    borderWidth: 1,
    borderColor: '#21476F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
    paddingHorizontal: 5,
  },

  matchSummaryIcon: {
    fontSize: 15,
  },

  matchSummaryLabel: {
    color: '#7EB2D3',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginTop: 3,
    textAlign: 'center',
  },

  matchSummaryNote: {
    color: '#7EB2D3',
    fontSize: 7,
    lineHeight: 11,
    textAlign: 'center',
    marginTop: 3,
  },

  matchSummaryValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
    textAlign: 'center',
  },

  cardSection: {
    marginBottom: 18,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },

  cardSubtitle: {
    color: '#6F92B0',
    fontSize: 10,
    marginTop: 3,
  },

  progressBadge: {
    minWidth: 62,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#123456',
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressBadgeWon: {
    backgroundColor: '#0F7A61',
  },

  progressText: {
    color: '#A8EFEA',
    fontSize: 10,
    fontWeight: '900',
  },

  cardBoard: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    borderRadius: 22,
    backgroundColor: '#F5F0DE',
    padding: 9,
    borderWidth: 2,
    borderColor: '#F6CA5F',
  },

  cardBoardWon: {
    borderColor: '#1BCB83',
    borderWidth: 3,
  },

  columnHeaderRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },

  columnHeader: {
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },

  columnHeaderText: {
    color: '#0A5C75',
    fontSize: 14,
    fontWeight: '900',
  },

  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  numberCell: {
    width: '20%',
    aspectRatio: 1.18,
    padding: 3,
  },

  numberInner: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E0C9',
  },

  numberPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  completedPatternCell: {
    backgroundColor: '#E9D27A',
    borderColor: '#B28C1E',
    borderWidth: 2,
  },

  bingoCell: {
    backgroundColor: '#B8F0DE',
    borderColor: '#1BCB83',
    borderWidth: 2,
  },

  completedPatternText: {
    color: '#3D2B05',
  },

  bingoCellNumberText: {
    color: '#064C3D',
  },

  numberText: {
    color: '#0B2540',
    fontSize: 18,
    fontWeight: '900',
  },

  specialSymbolRow: {
    minHeight: 15,
    marginTop: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  specialSymbol: {
    fontSize: 11,
    lineHeight: 14,
    marginHorizontal: 1,
  },

  markedInner: {
    backgroundColor: '#1BCB83',
    borderColor: '#A9FFE0',
  },

  markedText: {
    color: '#062A25',
  },

  freeInner: {
    backgroundColor: '#F6CA5F',
    borderColor: '#D7A92E',
  },

  freeIcon: {
    color: '#09203C',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 1,
  },

  freeText: {
    color: '#09203C',
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  winningInner: {
    backgroundColor: '#20D892',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },

  winningText: {
    color: '#04251E',
  },

  almostWinningInner: {
    backgroundColor: '#FFF1B7',
    borderColor: '#F6CA5F',
    borderWidth: 2,
  },

  almostWinningText: {
    color: '#624500',
  },

  controls: {
    marginBottom: 16,
  },

  autoButton: {
    minHeight: 72,
    borderRadius: 20,
    backgroundColor: '#0D2342',
    borderWidth: 1,
    borderColor: '#21476F',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  disabledControl: {
    opacity: 0.7,
  },

  autoIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38516A',
    marginRight: 12,
  },

  autoIconActive: {
    backgroundColor: '#1D8E72',
  },

  autoIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },

  autoContent: {
    flex: 1,
  },

  autoTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  autoSubtitle: {
    color: '#6F92B0',
    fontSize: 9,
    marginTop: 4,
  },

  toggle: {
    width: 42,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1BCB83',
    padding: 3,
    justifyContent: 'center',
  },

  toggleOff: {
    backgroundColor: '#38516A',
  },

  toggleKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-end',
  },

  toggleKnobOff: {
    alignSelf: 'flex-start',
  },

  hostComboBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9,
    backgroundColor: '#1BCB83',
    borderWidth: 1,
    borderColor: '#A9FFE0',
  },

  hostComboBadgeText: {
    color: '#062A25',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  hostSection: {
    minHeight: 76,
    borderRadius: 20,
    backgroundColor: '#0A5C75',
    borderWidth: 1,
    borderColor: '#2F92A2',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  hostSectionAlmost: {
    backgroundColor: '#5A4410',
    borderColor: '#F6CA5F',
    borderWidth: 2,
  },

  hostSectionWon: {
    backgroundColor: '#0B7059',
    borderColor: '#1BCB83',
  },

  hostBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6CA5F',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  hostBubbleAlmost: {
    backgroundColor: '#FFE48A',
    borderColor: '#FFFFFF',
  },

  hostBubbleWon: {
    backgroundColor: '#1BCB83',
  },

  hostBubbleText: {
    color: '#09203C',
    fontSize: 18,
    fontWeight: '900',
  },

  hostMessage: {
    flex: 1,
    paddingHorizontal: 12,
  },

  hostName: {
    color: '#F6CA5F',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  hostNameAlmost: {
    color: '#FFE08A',
  },
hostNameHit: {
  color: '#7CFFD7',
},
  hostNameWon: {
    color: '#A9FFE0',
  },

  hostAlmostBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#F6CA5F',
  },

  hostAlmostBadgeText: {
    color: '#523A00',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  hostMessageText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },

  hostMessageAlmost: {
    color: '#FFF4C9',
  },

  nextButton: {
    minHeight: 64,
    borderRadius: 20,
    backgroundColor: '#1BCB83',
    borderWidth: 2,
    borderColor: '#A9FFE0',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  playAgainButton: {
    minHeight: 64,
    borderRadius: 20,
    backgroundColor: '#F6CA5F',
    borderWidth: 2,
    borderColor: '#FFF2B9',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  playAgainText: {
    color: '#09203C',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  nextButtonDisabled: {
    backgroundColor: '#38516A',
    borderColor: '#526A80',
  },

  nextButtonText: {
    color: '#062A25',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  nextButtonArrow: {
    color: '#062A25',
    fontSize: 28,
    fontWeight: '800',
    marginLeft: 8,
    marginTop: -2,
  },

  footerHint: {
    color: '#45627C',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 14,
  },

  pressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },
});