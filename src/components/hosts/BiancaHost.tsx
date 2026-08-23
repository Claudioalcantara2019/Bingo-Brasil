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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  image: {
    width: 315,
    height: 345,
    transform: [{ translateY: 0 }],
  },
});