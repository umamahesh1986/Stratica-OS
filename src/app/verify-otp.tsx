import { router } from 'expo-router';
import { useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { AuthScaffold } from '@/components/AuthScaffold';
import { FeedbackMessage } from '@/components/FeedbackMessage';
import { FormField } from '@/components/FormField';
import { useAuth } from '@/context/AuthContext';

export default function VerifyOtpRoute() {
  const { pendingChallengeId, verifyOtp, cancelOtp } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!pendingChallengeId) {
      router.replace('/login');
      return;
    }
    if (!code.trim()) {
      setError('Enter the verification code.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await verifyOtp(code.trim());
      router.replace('/dashboard');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to verify this code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold title="Verify it’s you" description="Enter the one-time code sent through your configured verification channel.">
      {error && <FeedbackMessage message={error} />}
      <FormField
        autoComplete="one-time-code"
        keyboardType="number-pad"
        label="Verification code"
        maxLength={8}
        onChangeText={setCode}
        placeholder="Enter code"
        textContentType="oneTimeCode"
        value={code}
      />
      <AppButton label="Verify and continue" loading={loading} onPress={() => void submit()} />
      <AppButton
        label="Cancel"
        variant="secondary"
        onPress={() => {
          cancelOtp();
          router.replace('/login');
        }}
      />
    </AuthScaffold>
  );
}
