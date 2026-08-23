import { Image, StyleSheet, View } from 'react-native';

export default function BobHost() {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/REFERENCIA-MESTRE-BIANCA-BOB.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: 180,
    height: 180,
  },
});