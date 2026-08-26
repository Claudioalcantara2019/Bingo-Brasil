import { useState } from 'react';
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
  createBingoCard,
} from '../game/cardGenerator';

function CardPreview({
  card,
  label,
}: {
  card: BingoCard;
  label: string;
}) {
  return (
    <View style={styles.previewCard}>
      <View style={styles.previewHeader}>
        <View>
          <Text style={styles.previewLabel}>
            {label}
          </Text>

          <Text style={styles.previewType}>
            {card.type === 'green'
              ? '🟢 CARTELA VERDE'
              : '🎟️ CARTELA COMUM'}
          </Text>
        </View>

        <Text style={styles.previewId}>
          {card.id.slice(-6)}
        </Text>
      </View>

      <View style={styles.columnHeaders}>
        {['B', 'I', 'N', 'G', 'O'].map(
          (letter) => (
            <View
              key={letter}
              style={styles.columnHeader}
            >
              <Text style={styles.columnHeaderText}>
                {letter}
              </Text>
            </View>
          ),
        )}
      </View>

      <View style={styles.grid}>
        {card.cells.map((cell, index) => (
          <View
            key={`${card.id}-${index}`}
            style={styles.cell}
          >
            <View
              style={[
                styles.cellInner,
                cell.isFree &&
                  styles.freeCell,
              ]}
            >
              {cell.isFree ? (
                <>
                  <Text style={styles.freeStar}>
                    ★
                  </Text>
                  <Text style={styles.freeText}>
                    LIVRE
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.number}>
                    {cell.number}
                  </Text>

                  <View
                    style={
                      styles.symbolRow
                    }
                  >
                    {cell.symbols.includes(
                      'bomb',
                    ) && (
                      <Text style={styles.symbol}>
                        💣
                      </Text>
                    )}

                    {cell.symbols.includes(
                      'dolinha',
                    ) && (
                      <Text style={styles.symbol}>
                        💵
                      </Text>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.rulesRow}>
        <Text style={styles.ruleText}>
          💣 {card.bombPositions.length} Bombinhas
        </Text>

        <Text style={styles.ruleText}>
          💵 {card.dolinhaPositions.length} Dólinhas
        </Text>
      </View>
    </View>
  );
}

export default function TesteCartelaScreen() {
  const [commonCards, setCommonCards] = useState<
    BingoCard[]
  >(() => [
    createBingoCard('common'),
    createBingoCard('common'),
  ]);

  const [greenCards, setGreenCards] = useState<
    BingoCard[]
  >(() => [
    createBingoCard('green'),
    createBingoCard('green'),
  ]);

  const regenerate = () => {
    setCommonCards([
      createBingoCard('common'),
      createBingoCard('common'),
    ]);

    setGreenCards([
      createBingoCard('green'),
      createBingoCard('green'),
    ]);
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          TESTE DE CARTELAS
        </Text>

        <Text style={styles.subtitle}>
          Validação do gerador do Bingo Brasil
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            REGRAS TESTADAS
          </Text>

          <Text style={styles.infoLine}>
            💣 2 Bombinhas em toda cartela
          </Text>

          <Text style={styles.infoLine}>
            💵 1 Dólinha na cartela comum
          </Text>

          <Text style={styles.infoLine}>
            💵 3 Dólinhas na cartela verde
          </Text>

          <Text style={styles.infoLine}>
            ⭕ Centro LIVRE nunca recebe símbolo
          </Text>

          <Text style={styles.infoLine}>
            🎲 Posições aleatórias a cada geração
          </Text>
        </View>

        <Pressable
          onPress={regenerate}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>
            GERAR NOVAS CARTELAS
          </Text>
        </Pressable>

        <Text style={styles.sectionTitle}>
          CARTELAS COMUNS
        </Text>

        {commonCards.map(
          (card, index) => (
            <CardPreview
              key={card.id}
              card={card}
              label={`COMUM ${index + 1}`}
            />
          ),
        )}

        <Text style={styles.sectionTitle}>
          CARTELAS VERDES
        </Text>

        {greenCards.map(
          (card, index) => (
            <CardPreview
              key={card.id}
              card={card}
              label={`VERDE ${index + 1}`}
            />
          ),
        )}

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>
            ✅ CHECKPOINT DE TESTE
          </Text>

          <Text style={styles.footerText}>
            Esta tela é independente da partida
            oficial. Não altera o jogar.tsx.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07152D',
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 36,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.8,
  },

  subtitle: {
    color: '#7EB2D3',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 16,
  },

  infoCard: {
    borderRadius: 20,
    backgroundColor: '#0D2342',
    borderWidth: 1,
    borderColor: '#315176',
    padding: 14,
    marginBottom: 14,
  },

  infoTitle: {
    color: '#F6CA5F',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },

  infoLine: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 18,
  },

  button: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: '#1BCB83',
    borderWidth: 2,
    borderColor: '#A9FFE0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  buttonPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  buttonText: {
    color: '#062A25',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  previewCard: {
    borderRadius: 22,
    backgroundColor: '#F5F0DE',
    borderWidth: 2,
    borderColor: '#F6CA5F',
    padding: 9,
    marginBottom: 16,
  },

  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 8,
  },

  previewLabel: {
    color: '#0A5C75',
    fontSize: 10,
    fontWeight: '900',
  },

  previewType: {
    color: '#0B2540',
    fontSize: 8,
    fontWeight: '900',
    marginTop: 2,
  },

  previewId: {
    color: '#7C6F4A',
    fontSize: 8,
    fontWeight: '700',
  },

  columnHeaders: {
    flexDirection: 'row',
    marginBottom: 4,
  },

  columnHeader: {
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },

  columnHeaderText: {
    color: '#0A5C75',
    fontSize: 13,
    fontWeight: '900',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  cell: {
    width: '20%',
    aspectRatio: 1.1,
    padding: 2,
  },

  cellInner: {
    flex: 1,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E0C9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  freeCell: {
    backgroundColor: '#F6CA5F',
    borderColor: '#D7A92E',
  },

  number: {
    color: '#0B2540',
    fontSize: 17,
    fontWeight: '900',
  },

  symbolRow: {
    minHeight: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },

  symbol: {
    fontSize: 12,
    marginHorizontal: 1,
  },

  freeStar: {
    color: '#09203C',
    fontSize: 17,
    fontWeight: '900',
  },

  freeText: {
    color: '#09203C',
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginTop: 1,
  },

  rulesRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0D6B9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  ruleText: {
    color: '#0A5C75',
    fontSize: 8,
    fontWeight: '900',
  },

  footerCard: {
    borderRadius: 18,
    backgroundColor: '#0B6E58',
    borderWidth: 1,
    borderColor: '#1BCB83',
    padding: 13,
    marginTop: 4,
  },

  footerTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  footerText: {
    color: '#D4FFF1',
    fontSize: 9,
    lineHeight: 15,
    marginTop: 4,
  },
});
