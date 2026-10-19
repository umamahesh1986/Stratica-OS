import { Image, StyleSheet, View } from 'react-native';

type BrandProps = {
  compact?: boolean;
};

export function Brand({ compact = false }: BrandProps) {
  return (
    <View style={[styles.wrap, compact ? styles.wrapCompact : styles.wrapFull]}>
      <Image
        accessibilityLabel="Stratica OS. Powered by Stratica. Designed for Scale."
        resizeMode="contain"
        source={require('../../assets/stratica-logo.jpg')}
        style={[styles.image, compact ? styles.imageCompact : styles.imageFull]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    maxWidth: '100%',
    padding: 8,
    borderRadius: 12,
  },
  wrapFull: {
    alignSelf: 'stretch',
    width: '100%',
  },
  wrapCompact: {
    width: 185,
    padding: 4,
  },
  image: {
    maxWidth: '100%',
    width: '100%',
  },
  imageFull: {
    height: 58,
  },
  imageCompact: {
    height: 34,
  },
});
