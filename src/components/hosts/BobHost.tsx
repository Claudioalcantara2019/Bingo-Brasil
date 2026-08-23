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
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: 180,
    height: 240,
  },
});