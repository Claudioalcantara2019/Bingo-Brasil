import { useState } from 'react';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const CARD_NUMBERS = [
  7, 18, 34, 49, 63,
  2, 21, 38, 52, 70,
  11, 26, 0, 57, 68,
  5, 24, 41, 55, 73,
  14, 29, 45, 60, 75,
];

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

export default function BingoGameScreen() {
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

  const markedCount = markedNumbers.size;

  const handleNumberPress = (number: number) => {
    if (number === 0) {
      return;
    }

    setMarkedNumbers((current) => {
      const next = new Set(current);

      if (next.has(number)) {
        next.delete(number);
      } else {
        next.add(number);
      }

      return next;
    });
  };

  const handleNextNumber = () => {
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
      CARD_NUMBERS.includes(nextNumber)
    ) {
      setMarkedNumbers((current) => {
        const next = new Set(current);
        next.add(nextNumber);
        return next;
      });
    }
  };

  const toggleAutoMark = () => {
    setAutoMark((current) => !current);
  };

  const isFinished = drawnNumbers.length >= 75;

  const currentLetter = drawnNumber
    ? getBingoLetter(drawnNumber)
    : '—';

  let drawMessage = 'Toque em PRÓXIMO NÚMERO para começar';

  if (isFinished) {
    drawMessage = 'Todos os números foram sorteados!';
  } else if (drawnNumber !== null) {
    const isNumberMarked = markedNumbers.has(drawnNumber);

    if (isNumberMarked) {
      drawMessage = 'Número marcado!';
    } else if (CARD_NUMBERS.includes(drawnNumber)) {
      drawMessage = autoMark
        ? 'Número encontrado na sua cartela!'
        : 'Toque no número para marcar';
    } else {
      drawMessage = 'Boa! Vamos para o próximo.';
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
            <Text style={styles.topTitle}>VILA TROPICAL</Text>
            <Text style={styles.topSubtitle}>PARTIDA</Text>
          </View>

          <View style={styles.chipBadge}>
            <Text style={styles.chipIcon}>●</Text>
            <Text style={styles.chipValue}>1.000</Text>
          </View>
        </View>

        {/* STATUS DA PARTIDA */}
        <View style={styles.statusRow}>
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>PARTIDA</Text>
            <Text style={styles.statusValue}>#001</Text>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>SORTEADOS</Text>
            <Text style={styles.statusValue}>
              {drawnNumbers.length}
            </Text>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>NÍVEL</Text>
            <Text style={styles.statusValue}>1</Text>
          </View>
        </View>

        {/* NÚMERO SORTEADO */}
        <View style={styles.drawSection}>
          <Text style={styles.drawLabel}>ÚLTIMO NÚMERO</Text>

          <View style={styles.ballRow}>
            <View style={styles.bingoBall}>
              <View style={styles.ballInner}>
                <Text style={styles.ballLetter}>
                  {currentLetter}
                </Text>

                <Text style={styles.ballNumber}>
                  {drawnNumber ?? '—'}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.drawMessage}>
            {drawMessage}
          </Text>
        </View>

        {/* CARTELA */}
        <View style={styles.cardSection}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>
                SUA CARTELA
              </Text>

              <Text style={styles.cardSubtitle}>
                Toque em um número para marcar
              </Text>
            </View>

            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>
                {markedCount} / 24
              </Text>
            </View>
          </View>

          <View style={styles.cardBoard}>
            {/* CABEÇALHO */}
            <View style={styles.columnHeaderRow}>
              {['B', 'I', 'N', 'G', 'O'].map((letter) => (
                <View
                  key={letter}
                  style={styles.columnHeader}
                >
                  <Text style={styles.columnHeaderText}>
                    {letter}
                  </Text>
                </View>
              ))}
            </View>

            {/* CARTELA */}
            <View style={styles.numberGrid}>
              {CARD_NUMBERS.map((number, index) => {
                const isFree = number === 0;
                const isMarked = markedNumbers.has(number);

                return (
                  <View
                    key={`${number}-${index}`}
                    style={styles.numberCell}
                  >
                    <Pressable
                      disabled={isFree}
                      onPress={() =>
                        handleNumberPress(number)
                      }
                      style={({ pressed }) => [
                        styles.numberInner,
                        isFree && styles.freeInner,
                        isMarked && styles.markedInner,
                        pressed &&
                          !isFree &&
                          styles.numberPressed,
                      ]}
                    >
                      {isFree ? (
                        <>
                          <Text style={styles.freeIcon}>
                            ★
                          </Text>

                          <Text style={styles.freeText}>
                            LIVRE
                          </Text>
                        </>
                      ) : (
                        <Text
                          style={[
                            styles.numberText,
                            isMarked && styles.markedText,
                          ]}
                        >
                          {number}
                        </Text>
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* CONTROLES */}
        <View style={styles.controls}>
          <Pressable
            style={({ pressed }) => [
              styles.autoButton,
              pressed && styles.pressed,
            ]}
            onPress={toggleAutoMark}
          >
            <View
              style={[
                styles.autoIcon,
                autoMark && styles.autoIconActive,
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
                {autoMark
                  ? 'Ativada para números sorteados'
                  : 'Desativada — toque para marcar'}
              </Text>
            </View>

            <View
              style={[
                styles.toggle,
                !autoMark && styles.toggleOff,
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  !autoMark && styles.toggleKnobOff,
                ]}
              />
            </View>
          </Pressable>
        </View>

        {/* ANFITRIÕES */}
        <View style={styles.hostSection}>
          <View style={styles.hostBubble}>
            <Text style={styles.hostBubbleText}>B</Text>
          </View>

          <View style={styles.hostMessage}>
            <Text style={styles.hostName}>
              Bianca + Bob
            </Text>

            <Text style={styles.hostMessageText}>
              {drawnNumber === null
                ? 'Vamos começar? Clique em próximo número!'
                : isFinished
                  ? 'Todos os números saíram. Agora é hora de conferir a cartela!'
                  : markedNumbers.has(drawnNumber)
                    ? 'Boa! Esse número já está marcado!'
                    : CARD_NUMBERS.includes(drawnNumber)
                      ? 'Esse número está na sua cartela!'
                      : 'Esse não veio para sua cartela. Vamos continuar!'}
            </Text>
          </View>

          <View style={styles.hostBubble}>
            <Text style={styles.hostBubbleText}>B</Text>
          </View>
        </View>

        {/* BOTÃO */}
        <Pressable
          disabled={isFinished}
          onPress={handleNextNumber}
          style={({ pressed }) => [
            styles.nextButton,
            isFinished && styles.nextButtonDisabled,
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
            <Text style={styles.nextButtonArrow}>›</Text>
          )}
        </Pressable>

        <Text style={styles.footerHint}>
          {drawnNumbers.length} de 75 números sorteados
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
  },

  drawMessage: {
    color: '#F6CA5F',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 9,
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