import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';

type BobHostProps = {
  source: any;
};

export default function BobHost({ source }: BobHostProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  return (
    <View style={styles.container}>
      <Image
        source={source}
        style={[
          styles.image,
          isMobile && styles.mobileImage,
        ]}
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
    overflow: 'visible',
  },

  image: {
    width: 225,
    height: 338,
    transform: [{ translateY: 0 }],
  },

  mobileImage: {
    width: 132,
    height: 198,
    transform: [{ translateY: 22 }],
  },
});