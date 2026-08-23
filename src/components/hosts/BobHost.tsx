import { Image, StyleSheet, View } from 'react-native';

type BobHostProps = {
  source: any;
};

export default function BobHost({ source }: BobHostProps) {
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
    height: 330,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },

  image: {
    width: 225,
    height: 338,
    transform: [{ translateY: 0 }],
  },
});