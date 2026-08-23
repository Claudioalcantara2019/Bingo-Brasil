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
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  image: {
    width: 220,
    height: 330,
  },
});