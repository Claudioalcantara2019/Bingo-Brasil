import {
    Image,
    StyleSheet,
    useWindowDimensions,
    View,
} from 'react-native';

type BiancaHostProps = {
  source: any;
};

export default function BiancaHost({ source }: BiancaHostProps) {
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
    width: 315,
    height: 345,
    transform: [{ translateY: 0 }],
  },

  mobileImage: {
    width: 145,
    height: 159,
    transform: [{ translateY: 20 }],
  },
});