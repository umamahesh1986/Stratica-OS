import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Brand } from '@/components/Brand';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing } from '@/theme/tokens';

export default function IndexRoute() {
  const { isRestoring, session } = useAuth();
  if (!isRestoring) return <Redirect href={session ? '/dashboard' : '/login'} />;

  return (
    <Screen contentStyle={styles.content}>
      <Brand />
      <View style={styles.loader}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: spacing.xxxl,
  },
  loader: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
