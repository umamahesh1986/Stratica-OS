import { Link, router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText as Text } from '@/components/AppText';
import { AppButton } from '@/components/AppButton';
import { Brand } from '@/components/Brand';
import { FeedbackMessage } from '@/components/FeedbackMessage';
import { FormField } from '@/components/FormField';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/context/AuthContext';
import { colors, radius, spacing, typography } from '@/theme/tokens';

export default function LoginRoute() {
  const { signIn, restoreError, retryRestore, isRestoring } = useAuth();
  const { notice } = useLocalSearchParams<{ notice?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('Enter your work email and password.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await signIn({ email: email.trim(), password });
      router.replace(result === 'otp-required' ? '/verify-otp' : '/dashboard');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <Brand />
      <View style={styles.form}>
        <View style={styles.heading}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue to your workspace.</Text>
        </View>
        {typeof notice === 'string' && <FeedbackMessage variant="info" message={notice} />}
        {restoreError && (
          <View style={styles.restore}>
            <FeedbackMessage message={`Saved session could not be verified: ${restoreError}`} />
            <AppButton label="Retry session restore" variant="secondary" loading={isRestoring} onPress={() => void retryRestore()} />
          </View>
        )}
        {error && <FeedbackMessage message={error} />}
        <FormField
          autoComplete="email"
          keyboardType="email-address"
          label="Work email"
          onChangeText={setEmail}
          placeholder="name@company.com"
          returnKeyType="next"
          textContentType="emailAddress"
          value={email}
        />
        <FormField
          autoComplete="current-password"
          label="Password"
          onChangeText={setPassword}
          onSubmitEditing={() => void submit()}
          placeholder="Enter your password"
          returnKeyType="go"
          secure
          textContentType="password"
          value={password}
        />
        <Link href="/forgot-password" style={styles.forgot}>
          Forgot password?
        </Link>
        <AppButton label="Sign in" loading={isSubmitting} onPress={() => void submit()} />
        <View style={styles.registration}>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>New to Stratica?</Text>
            <View style={styles.dividerLine} />
          </View>
          <RegistrationButton
            label="Register as Distributor"
            onPress={() => router.push('/register/distributor')}
          />
          <RegistrationButton label="Register as Field Representative" onPress={() => router.push('/register/field-representative')} />
          <RegistrationButton label="Register as Product Company" onPress={() => router.push('/register/product-company')} />
        </View>
      </View>
      <Text style={styles.footer}>Powered by Stratica &copy; 2026. Designed for Scale.</Text>
    </Screen>
  );
}

function RegistrationButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.registrationButton, pressed && styles.registrationButtonPressed]}
    >
      <Text style={styles.registrationLabel}>{label}</Text>
      <Feather name="arrow-up-right" size={17} color={colors.charcoal} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  form: {
    gap: spacing.lg,
    maxWidth: 500,
    width: '100%',
  },
  heading: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.ink,
    fontSize: typography.heading,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.body,
  },
  forgot: {
    alignSelf: 'flex-end',
    color: colors.charcoal,
    fontFamily: 'Figtree_700Bold',
    fontSize: 13,
    fontWeight: '700',
  },
  restore: {
    gap: spacing.sm,
  },
  registration: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  dividerLine: {
    backgroundColor: colors.border,
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  registrationButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  registrationButtonPressed: {
    opacity: 0.75,
  },
  registrationLabel: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    color: colors.muted,
    fontSize: 11,
    paddingBottom: spacing.xxl,
    textAlign: 'center',
  },
});
