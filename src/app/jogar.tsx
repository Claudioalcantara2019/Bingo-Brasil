import { useState } from 'react';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

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

function hasHorizontalBingo(
  cardNumbers: number[],
  markedNumbers: Set<number>,
) {
  for (let row = 0; row < 5; row += 1) {
    const start = row * 5;

    const rowNumbers = cardNumbers.slice(
      start,
      start + 5,
    );

    const complete = rowNumbers.every((number) => {
      if (number === 0) {
        return true;
      }

      return markedNumbers.has(number);
    });

    if (complete) {
      return true;
    }
  }

  return false;
}

export default function BingoGameScreen() {
  const [cardNumbers, setCardNumbers] =
    useState<number[]>(
      () => createBingoCard(),
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

  const [xp, setXp] =
    useState(0);

  const [level, setLevel] =
    useState(1);

  const [rewardGiven, setRewardGiven] =
    useState(false);

  const [bingosCompleted, setBingosCompleted] =
    useState(0);

  const [missionRewardGiven, setMissionRewardGiven] =
    useState(false);

  const [villageBingos, setVillageBingos] =
    useState(0);

  const [showFullHistory, setShowFullHistory] =
    useState(false);

  const markedCount =
    markedNumbers.size;

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
    bestRowProgress === 4;

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

        if (
          hasHorizontalBingo(
            cardNumbers,
            next,
          )
        ) {
          awardVictory(next);
        }

        return next;
      },
    );
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

    if (
      autoMark &&
      cardNumbers.includes(
        nextNumber,
      )
    ) {
      setMarkedNumbers(
        (current) => {
          const next =
            new Set(current);

          next.add(
            nextNumber,
          );

          if (
            hasHorizontalBingo(
              cardNumbers,
              next,
            )
          ) {
            awardVictory(
              next,
            );
          }

          return next;
        },
      );
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
    setCardNumbers(
      createBingoCard(),
    );

    setDrawnNumber(null);

    setDrawnNumbers([]);

    setMarkedNumbers(
      new Set(),
    );

    setAutoMark(true);

    setHasWon(false);

    setRewardGiven(false);

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
      'Você completou uma linha!';
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
              Você completou uma linha!
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
                  ? 'Linha vencedora destacada'
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
                          <Text
                            style={[
                              styles.numberText,
                              isMarked &&
                                styles.markedText,
                              isWinningRow &&
                                styles.winningText,
                              isAlmostWinningRow &&
                                styles.almostWinningText,
                            ]}
                          >
                            {number}
                          </Text>
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

  numberText: {
    color: '#0B2540',
    fontSize: 18,
    fontWeight: '900',
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