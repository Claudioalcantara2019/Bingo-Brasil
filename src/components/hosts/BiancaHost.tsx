import { Image, StyleSheet, View } from 'react-native';

type BiancaHostProps = {
  source: any;
};

export default function BiancaHost({ source }: BiancaHostProps) {
  return (
    <View style={styles.container}>
      <Image
        source={source}
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
    height: 240,
  },
});