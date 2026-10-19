import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useRolePalette } from '@/hooks/useRolePalette';
import { radius, spacing } from '@/theme/tokens';

type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function SearchField({ value, onChangeText, placeholder = 'Search' }: SearchFieldProps) {
  const palette = useRolePalette();

  return (
    <View style={[styles.wrap, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <Feather name="search" size={18} color={palette.primary} />
      <TextInput
        accessibilityLabel={placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.subtle}
        returnKeyType="search"
        style={[styles.input, { color: palette.ink }]}
        value={value}
      />
      {!!value && (
        <Pressable accessibilityLabel="Clear search" onPress={() => onChangeText('')}>
          <Feather name="x" size={17} color={palette.muted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  input: {
    flex: 1,
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    paddingVertical: spacing.md,
  },
});
