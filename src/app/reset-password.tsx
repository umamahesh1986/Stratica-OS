import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AuthScaffold } from '@/components/AuthScaffold';
import { FeedbackMessage } from '@/components/FeedbackMessage';
import { FormField } from '@/components/FormField';
import { resetPassword } from '@/services/auth';

export default function ResetPasswordRoute() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!token.trim() || password.length < 10 || password !== confirmation) {
      setError('Enter a valid reset token, a password of at least 10 characters, and matching confirmation.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await resetPassword(token.trim(), password);
      Alert.alert('Password reset', 'Your password reset request was processed.', [
        { text: 'Continue', onPress: () => router.replace('/login') },
      ]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to reset the password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold title="Choose a new password" description="Use the reset token provided by your organization.">
      {error && <FeedbackMessage message={error} />}
      <FormField label="Reset token" onChangeText={setToken} placeholder="Paste reset token" value={token} />
      <FormField label="New password" onChangeText={setPassword} placeholder="At least 10 characters" secure value={password} />
      <FormField label="Confirm password" onChangeText={setConfirmation} placeholder="Re-enter password" secure value={confirmation} />
      <AppButton label="Reset password" loading={loading} onPress={() => void submit()} />
    </AuthScaffold>
  );
}
