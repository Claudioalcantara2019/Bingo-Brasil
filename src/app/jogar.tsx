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

function shuffleNumbers(numbers: number[]) {
  const shuffled = [...numbers];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

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
  ).filter((number) => !usedNumbers.includes(number));

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
  const [cardNumbers, setCardNumbers] = useState<number[]>(
    () => createBingoCard(),
  );

  const [drawnNumber, setDrawnNumber] = useState<number | null>(
    null,
  );

  const [drawnNumbers, setDrawnNumbers] = useState<number[]>(
    [],
  );

  const [markedNumbers, setMarkedNumbers] = useState<Set<number>>(
    new Set(),
  );

  const [autoMark, setAutoMark] = useState(true);

  const [hasWon, setHasWon] = useState(false);

  const [chips, setChips] = useState(INITIAL_CHIPS);

  const [rewardGiven, setRewardGiven] = useState(false);

  const markedCount = markedNumbers.size;

  const completeVictory = (
    nextMarkedNumbers?: Set<number>,
  ) => {
    setHasWon(true);

    if (nextMarkedNumbers) {
      setMarkedNumbers(nextMarkedNumbers);
    }

    if (!rewardGiven) {
      setChips((current) => current + WIN_REWARD);
      setRewardGiven(true);
    }
  };

  const handleNumberPress = (number: number) => {
    if (number === 0 || hasWon) {
      return;
    }

    setMarkedNumbers((current) => {
      const next = new Set(current);

      if (next.has(number)) {
        next.delete(number);
      } else {
        next.add(number);
      }

      if (hasHorizontalBingo(cardNumbers, next)) {
        setHasWon(true);

        if (!rewardGiven) {
          setChips((currentChips) => (
            currentChips + WIN_REWARD
          ));
          setRewardGiven(true);
        }
      }

      return next;
    });
  };

  const handleNextNumber = () => {
    if (hasWon) {
      return;
    }

    const nextNumber = getNextNumber(drawnNumbers);

    if (nextNumber === null) {
      return;
    }

    setDrawnNumber(nextNumber);

    setDrawnNumbers((current) => [
      ...current,
      nextNumber,
    ]);

    if (
      autoMark &&
      cardNumbers.includes(nextNumber)
    ) {
      setMarkedNumbers((current) => {
        const next = new Set(current);

        next.add(nextNumber);

        if (
          hasHorizontalBingo(
            cardNumbers,
            next,
          )
        ) {
          setHasWon(true);

          if (!rewardGiven) {
            setChips((currentChips) => (
              currentChips + WIN_REWARD
            ));
            setRewardGiven(true);
          }
        }

        return next;
      });
    }
  };

  const toggleAutoMark = () => {
    if (hasWon) {
      return;
    }

    setAutoMark((current) => !current);
  };

  const handlePlayAgain = () => {
    setCardNumbers(createBingoCard());
    setDrawnNumber(null);
    setDrawnNumbers([]);
    setMarkedNumbers(new Set());
    setAutoMark(true);
    setHasWon(false);
    setRewardGiven(false);
  };

  const isFinished = drawnNumbers.length >= 75;

  const currentLetter = drawnNumber
    ? getBingoLetter(drawnNumber)
    : '—';

  let drawMessage =
    'Toque em PRÓXIMO NÚMERO para começar';

  if (hasWon) {
    drawMessage = 'Você completou uma linha!';
  } else if (isFinished) {
    drawMessage =
      'Todos os números foram sorteados!';
  } else if (drawnNumber !== null) {
    const isNumberMarked =
      markedNumbers.has(drawnNumber);

    if (isNumberMarked) {
      drawMessage = 'Número marcado!';
    } else if (
      cardNumbers.includes(drawnNumber)
    ) {
      drawMessage = autoMark
        ? 'Número encontrado na sua cartela!'
        : 'Toque no número para marcar';
    } else {
      drawMessage =
        'Boa! Vamos para o próximo.';
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TOPO */}
        <View style={styles.topBar}>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>

          <View style={styles.topCenter}>
            <Text style={styles.topTitle}>
              VILA TROPICAL
            </Text>

            <Text style={styles.topSubtitle}>
              PARTIDA
            </Text>
          </View>

          <View style={styles.chipBadge}>
            <Text style={styles.chipIcon}>●</Text>

            <Text style={styles.chipValue}>
              {chips.toLocaleString('pt-BR')}
            </Text>
          </View>
        </View>

        {/* STATUS */}
        <View style={styles.statusRow}>
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>
              PARTIDA
            </Text>

            <Text style={styles.statusValue}>
              #001
            </Text>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>
              SORTEADOS
            </Text>

            <Text style={styles.statusValue}>
              {drawnNumbers.length}
            </Text>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>
              NÍVEL
            </Text>

            <Text style={styles.statusValue}>
              1
            </Text>
          </View>
        </View>

        {/* NÚMERO / RESULTADO */}
        <View
          style={[
            styles.drawSection,
            hasWon && styles.drawSectionWon,
          ]}
        >
          <Text style={styles.drawLabel}>
            {hasWon
              ? 'RESULTADO DA PARTIDA'
              : 'ÚLTIMO NÚMERO'}
          </Text>

          <View style={styles.ballRow}>
            <View
              style={[
                styles.bingoBall,
                hasWon && styles.bingoBallWon,
              ]}
            >
              <View
                style={[
                  styles.ballInner,
                  hasWon && styles.ballInnerWon,
                ]}
              >
                <Text style={styles.ballLetter}>
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

        {/* CELEBRAÇÃO */}
        {hasWon && (
          <View style={styles.victoryCard}>
            <View style={styles.confettiRow}>
              <Text style={styles.confetti}>
                ✦
              </Text>

              <Text style={styles.confetti}>
                ★
              </Text>

              <Text style={styles.confetti}>
                ✦
              </Text>

              <Text style={styles.confetti}>
                ★
              </Text>

              <Text style={styles.confetti}>
                ✦
              </Text>
            </View>

            <Text style={styles.victoryTitle}>
              BINGO!
            </Text>

            <Text style={styles.victorySubtitle}>
              Você completou uma linha!
            </Text>

            <View style={styles.rewardCard}>
              <View style={styles.rewardIcon}>
                <Text style={styles.rewardIconText}>
                  +
                </Text>
              </View>

              <View style={styles.rewardContent}>
                <Text style={styles.rewardLabel}>
                  RECOMPENSA
                </Text>

                <Text style={styles.rewardValue}>
                  +{WIN_REWARD} fichas
                </Text>
              </View>
            </View>

            <Text style={styles.victoryMessage}>
              Bianca e Bob estão comemorando com você!
            </Text>
          </View>
        )}

        {/* CARTELA */}
        <View style={styles.cardSection}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>
                SUA CARTELA
              </Text>

              <Text style={styles.cardSubtitle}>
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
              <Text style={styles.progressText}>
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
            {/* CABEÇALHO */}
            <View style={styles.columnHeaderRow}>
              {['B', 'I', 'N', 'G', 'O'].map(
                (letter) => (
                  <View
                    key={letter}
                    style={styles.columnHeader}
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

            {/* CARTELA */}
            <View style={styles.numberGrid}>
              {cardNumbers.map(
                (number, index) => {
                  const isFree =
                    number === 0;

                  const isMarked =
                    isFree ||
                    markedNumbers.has(number);

                  const row =
                    Math.floor(index / 5);

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
                          rowNumber === 0
                        ) {
                          return true;
                        }

                        return markedNumbers.has(
                          rowNumber,
                        );
                      },
                    );

                  return (
                    <View
                      key={`${number}-${index}`}
                      style={styles.numberCell}
                    >
                      <Pressable
                        disabled={
                          isFree || hasWon
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
        <View style={styles.controls}>
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
            onPress={toggleAutoMark}
          >
            <View
              style={[
                styles.autoIcon,
                autoMark &&
                  styles.autoIconActive,
              ]}
            >
              <Text style={styles.autoIconText}>
                {autoMark ? '✓' : '−'}
              </Text>
            </View>

            <View style={styles.autoContent}>
              <Text style={styles.autoTitle}>
                MARCAÇÃO AUTOMÁTICA
              </Text>

              <Text style={styles.autoSubtitle}>
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
            hasWon &&
              styles.hostSectionWon,
          ]}
        >
          <View
            style={[
              styles.hostBubble,
              hasWon &&
                styles.hostBubbleWon,
            ]}
          >
            <Text
              style={styles.hostBubbleText}
            >
              B
            </Text>
          </View>

          <View style={styles.hostMessage}>
            <Text
              style={[
                styles.hostName,
                hasWon &&
                  styles.hostNameWon,
              ]}
            >
              Bianca + Bob
            </Text>

            <Text
              style={styles.hostMessageText}
            >
              {hasWon
                ? 'BINGO! Eu sabia que você conseguiria!'
                : drawnNumber === null
                  ? 'Vamos começar? Clique em próximo número!'
                  : isFinished
                    ? 'Todos os números saíram. Agora é hora de conferir a cartela!'
                    : markedNumbers.has(
                          drawnNumber,
                        )
                      ? 'Boa! Esse número já está marcado!'
                      : cardNumbers.includes(
                            drawnNumber,
                          )
                        ? 'Esse número está na sua cartela!'
                        : 'Esse não veio para sua cartela. Vamos continuar!'}
            </Text>
          </View>

          <View
            style={[
              styles.hostBubble,
              hasWon &&
                styles.hostBubbleWon,
            ]}
          >
            <Text
              style={styles.hostBubbleText}
            >
              B
            </Text>
          </View>
        </View>

        {/* AÇÃO */}
        {hasWon ? (
          <Pressable
            onPress={handlePlayAgain}
            style={({ pressed }) => [
              styles.playAgainButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Text style={styles.playAgainText}>
              JOGAR NOVAMENTE
            </Text>

            <Text style={styles.nextButtonArrow}>
              ›
            </Text>
          </Pressable>
        ) : (
          <Pressable
            disabled={isFinished}
            onPress={handleNextNumber}
            style={({ pressed }) => [
              styles.nextButton,
              isFinished &&
                styles.nextButtonDisabled,
              pressed &&
                !isFinished &&
                styles.pressed,
            ]}
          >
            <Text style={styles.nextButtonText}>
              {isFinished
                ? 'SORTEIO ENCERRADO'
                : 'PRÓXIMO NÚMERO'}
            </Text>

            {!isFinished && (
              <Text
                style={styles.nextButtonArrow}
              >
                ›
              </Text>
            )}
          </Pressable>
        )}

        <Text style={styles.footerHint}>
          {hasWon
            ? 'Sua primeira vitória no Bingo Brasil!'
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
    transform: [{ scale: 0.96 }],
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

  hostNameWon: {
    color: '#A9FFE0',
  },

  hostMessageText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
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
    transform: [{ scale: 0.98 }],
  },
});