import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText as Text } from '@/components/AppText';
import { colors, radius, spacing } from '@/theme/tokens';

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string;
  secure?: boolean;
};

export function FormField({ label, error, secure = false, ...inputProps }: FormFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const hideInput = secure && !isPasswordVisible;

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, error && styles.inputError]}>
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={colors.subtle}
          secureTextEntry={hideInput}
          style={styles.input}
          {...inputProps}
        />
        {secure && (
          <Pressable
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => setIsPasswordVisible((visible) => !visible)}
          >
            <Feather name={isPasswordVisible ? 'eye-off' : 'eye'} size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.sm,
  },
  label: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '700',
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  inputError: {
    borderColor: colors.danger,
  },
  input: {
    color: colors.ink,
    flex: 1,
    fontFamily: 'Figtree_400Regular',
    fontSize: 15,
    paddingVertical: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
  },
});
