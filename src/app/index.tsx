import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import BiancaHost from '@/components/hosts/BiancaHost';
import BobHost from '@/components/hosts/BobHost';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const sceneHeight = isMobile ? 205 : 360;
  const foregroundHeight = isMobile ? 135 : 378;
  const hostScale = isMobile ? 0.68 : 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* FUNDO / ATMOSFERA */}
        <View style={styles.backgroundGlowTop} />
        <View style={styles.backgroundGlowBottom} />

        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View style={styles.brandGroup}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>BB</Text>
            </View>

            <View>
              <Text style={styles.brandTitle}>BINGO BRASIL</Text>
              <Text style={styles.brandSubtitle}>
                A sorte sorri pra você!
              </Text>
            </View>
          </View>

          <View style={styles.profileButton}>
            <Text style={styles.profileIcon}>☺</Text>
          </View>
        </View>

        {/* SALDO */}
        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>SUAS FICHAS</Text>
            <Text style={styles.balanceValue}>1.000</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>

        {/* HERO */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>VILA TROPICAL</Text>
          </View>

          <Text style={styles.heroTitle}>BINGO BRASIL</Text>

          <Text style={styles.heroDescription}>
            Entre na nossa vila, jogue seu bingo e deixe Bianca e Bob
            torcerem com você.
          </Text>

          {/* CENA / ANFITRIÕES */}
          <View
            style={[
              styles.hostsPlaceholder,
              {
                height: sceneHeight,
                minHeight: sceneHeight,
              },
            ]}
          >
            {/* 1. FUNDO */}
            <Image
              source={require('@/assets/images/FUNDO-VILA-TROPICAL-HERO.png')}
              style={styles.hostBackground}
              resizeMode={isMobile ? 'contain' : 'cover'}
            />

            {/* 2. BIANCA */}
            <View
              style={[
                styles.hostSide,
                {
                  transform: [{ scale: hostScale }],
                },
              ]}
            >
              <BiancaHost
                source={require('@/assets/images/BIANCA-OFICIAL.png')}
              />
            </View>

            {/* CENTRO */}
            <View style={styles.hostCenter}>
              <View style={styles.hostCenterBadge}>
                <Text style={styles.hostCenterBadgeText}>BB</Text>
              </View>

              <Text style={styles.hostTitle}>Nossos anfitriões</Text>

              <Text style={styles.hostSubtitle}>
                Bianca + Bob
              </Text>
            </View>

            {/* 2. BOB */}
            <View
              style={[
                styles.hostSide,
                {
                  transform: [{ scale: hostScale }],
                },
              ]}
            >
              <BobHost
                source={require('@/assets/images/BOB-OFICIAL.png')}
              />
            </View>

            {/* 3. PRIMEIRO PLANO */}
            <Image
              source={require('@/assets/images/PRIMEIRO-PLANO-VILA-TROPICAL.png')}
              style={[
                styles.hostForeground,
                {
                  height: foregroundHeight,
                },
              ]}
              resizeMode="cover"
            />
          </View>

          {/* BOTÃO PRINCIPAL */}
          <Pressable
            style={({ pressed }) => [
              styles.playButton,
              pressed && styles.playButtonPressed,
            ]}
          >
            <Text style={styles.playButtonText}>JOGAR BINGO</Text>
            <Text style={styles.playButtonArrow}>›</Text>
          </Pressable>
        </View>

        {/* MENU PRINCIPAL */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>EXPLORAR</Text>
          <Text style={styles.sectionHint}>Escolha uma opção</Text>
        </View>

        <View style={styles.menuGrid}>
          <Pressable
            style={({ pressed }) => [
              styles.menuCard,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.menuIcon, styles.menuIconGreen]}>
              <Text style={styles.menuIconText}>★</Text>
            </View>

            <Text style={styles.menuTitle}>Bônus Diário</Text>

            <Text style={styles.menuDescription}>
              Pegue suas fichas grátis
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuCard,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.menuIcon, styles.menuIconBlue]}>
              <Text style={styles.menuIconText}>♛</Text>
            </View>

            <Text style={styles.menuTitle}>Ranking</Text>

            <Text style={styles.menuDescription}>
              Veja sua posição
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuCard,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.menuIcon, styles.menuIconPurple]}>
              <Text style={styles.menuIconText}>●</Text>
            </View>

            <Text style={styles.menuTitle}>Coleções</Text>

            <Text style={styles.menuDescription}>
              Descubra o universo BB
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuCard,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.menuIcon, styles.menuIconGold]}>
              <Text style={styles.menuIconText}>⚙</Text>
            </View>

            <Text style={styles.menuTitle}>Configurações</Text>

            <Text style={styles.menuDescription}>
              Personalize o jogo
            </Text>
          </Pressable>
        </View>

        {/* DESTAQUE */}
        <View style={styles.dailyCard}>
          <View style={styles.dailyLeft}>
            <Text style={styles.dailyTag}>HOJE</Text>

            <Text style={styles.dailyTitle}>
              Desafio da Vila
            </Text>

            <Text style={styles.dailyDescription}>
              Jogue uma partida e avance na sua jornada.
            </Text>
          </View>

          <View style={styles.dailyNumber}>
            <Text style={styles.dailyNumberText}>1</Text>
          </View>
        </View>

        {/* RODAPÉ */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            BINGO BRASIL • VERSÃO INICIAL
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

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },

  backgroundGlowTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#16D9D0',
    opacity: 0.12,
  },

  backgroundGlowBottom: {
    position: 'absolute',
    bottom: 180,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#7B61FF',
    opacity: 0.1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E8FA2',
    borderWidth: 2,
    borderColor: '#F6CA5F',
    marginRight: 12,
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -1,
  },

  brandTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  brandSubtitle: {
    color: '#9FDCD9',
    fontSize: 11,
    marginTop: 2,
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#102A4D',
    borderWidth: 1,
    borderColor: '#315176',
  },

  profileIcon: {
    color: '#FFFFFF',
    fontSize: 22,
  },

  balanceCard: {
    minHeight: 84,
    borderRadius: 22,
    backgroundColor: '#0D2342',
    borderWidth: 1,
    borderColor: '#21476F',
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  balanceLabel: {
    color: '#7EB2D3',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
  },

  balanceValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 2,
  },

  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0C84B',
  },

  addButtonText: {
    color: '#09203C',
    fontSize: 26,
    lineHeight: 27,
    fontWeight: '900',
  },

  heroCard: {
    borderRadius: 30,
    backgroundColor: '#0A5C75',
    borderWidth: 1,
    borderColor: '#56D6D1',
    padding: 22,
    overflow: 'hidden',
    marginBottom: 24,
  },

  heroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3C95B',
    marginBottom: 14,
  },

  heroBadgeText: {
    color: '#09203C',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  heroDescription: {
    color: '#D5FFFF',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 360,
  },

  hostsPlaceholder: {
    marginTop: 22,
    marginBottom: 22,
    borderRadius: 24,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 6,
    overflow: 'hidden',
    position: 'relative',
  },

  hostBackground: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },

  hostSide: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 2,
  },

  hostCenter: {
    width: 115,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 48,
    zIndex: 5,
  },

  hostCenterBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F6CA5F',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  hostCenterBadgeText: {
    color: '#09203C',
    fontSize: 14,
    fontWeight: '900',
  },

  hostTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },

  hostSubtitle: {
    color: '#B9F0EC',
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
    lineHeight: 14,
  },

  hostForeground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    zIndex: 20,
  },

  playButton: {
    minHeight: 64,
    borderRadius: 20,
    backgroundColor: '#1BCB83',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#A9FFE0',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },

  playButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },

  playButtonText: {
    color: '#062A25',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },

  playButtonArrow: {
    color: '#062A25',
    fontSize: 28,
    fontWeight: '800',
    marginLeft: 8,
    marginTop: -2,
  },

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },

  sectionHint: {
    color: '#6F92B0',
    fontSize: 11,
    marginTop: 4,
  },

  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  menuCard: {
    width: '48.2%',
    minHeight: 150,
    borderRadius: 22,
    backgroundColor: '#0D2342',
    borderWidth: 1,
    borderColor: '#21476F',
    padding: 16,
    marginBottom: 12,
  },

  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  menuIconGreen: {
    backgroundColor: '#1D8E72',
  },

  menuIconBlue: {
    backgroundColor: '#226FBC',
  },

  menuIconPurple: {
    backgroundColor: '#6D58B8',
  },

  menuIconGold: {
    backgroundColor: '#A78025',
  },

  menuIconText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
  },

  menuTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  menuDescription: {
    color: '#7898B2',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },

  dailyCard: {
    marginTop: 8,
    minHeight: 112,
    borderRadius: 24,
    backgroundColor: '#132D4F',
    borderWidth: 1,
    borderColor: '#3B5F83',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dailyLeft: {
    flex: 1,
    paddingRight: 16,
  },

  dailyTag: {
    color: '#F6CA5F',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  dailyTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 5,
  },

  dailyDescription: {
    color: '#87A7C0',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },

  dailyNumber: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1BCB83',
    borderWidth: 2,
    borderColor: '#A9FFE0',
  },

  dailyNumberText: {
    color: '#062A25',
    fontSize: 24,
    fontWeight: '900',
  },

  footer: {
    alignItems: 'center',
    marginTop: 26,
  },

  footerText: {
    color: '#45627C',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },

  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});