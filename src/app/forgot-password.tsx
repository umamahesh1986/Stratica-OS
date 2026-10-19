import { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AppText as Text } from '@/components/AppText';
import { AppButton } from '@/components/AppButton';
import { AuthScaffold } from '@/components/AuthScaffold';
import { FeedbackMessage } from '@/components/FeedbackMessage';
import { FormField } from '@/components/FormField';
import { requestPasswordReset } from '@/services/auth';
import { colors, spacing } from '@/theme/tokens';

export default function ForgotPasswordRoute() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim()) {
      setError('Enter the email address associated with your account.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to request a password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold title="Reset your password" description="Enter your work email and we’ll send password reset instructions if the account is eligible.">
      {submitted ? (
        <FeedbackMessage variant="success" message="If the account can be recovered, instructions will be sent using your organization’s configured workflow." />
      ) : (
        <>
          {error && <FeedbackMessage message={error} />}
          <FormField
            autoComplete="email"
            keyboardType="email-address"
            label="Work email"
            onChangeText={setEmail}
            placeholder="name@company.com"
            value={email}
          />
          <AppButton label="Send instructions" loading={loading} onPress={() => void submit()} />
        </>
      )}
      <Text style={styles.note}>For account security, we don’t disclose whether an email address is registered.</Text>
      <Text onPress={() => router.push('/reset-password')} style={styles.devLink}>Have a reset token? Continue to reset</Text>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  note: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  devLink: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
