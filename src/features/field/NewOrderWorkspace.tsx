import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppText as Text } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { FeedbackMessage } from '@/components/FeedbackMessage';
import { FormField } from '@/components/FormField';
import { PageHeader } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { Surface } from '@/components/Surface';
import { useAuth } from '@/context/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useRolePalette } from '@/hooks/useRolePalette';
import { getOrderOptions, submitOperation } from '@/services/operations';
import type { OperationalRecord } from '@/types/operations';
import { colors, radius, spacing } from '@/theme/tokens';

export function NewOrderWorkspace() {
  const { session } = useAuth();
  const token = session?.accessToken ?? '';
  const loadOptions = useCallback(() => getOrderOptions(token), [token]);
  const { data: options, error, loading, refresh } = useAsyncData(loadOptions);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const merchant = options?.merchants.find((record) => record.id === merchantId);
  const product = options?.products.find((record) => record.id === productId);

  const submit = async () => {
    if (!session || !merchant || !product || !Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
      setSubmitError('Select a shop and product, and enter a whole-number quantity greater than zero.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitOperation(token, 'merchant-orders', null, 'create', {
        merchantId: merchant.id,
        productId: product.id,
        quantity: Number(quantity),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      Alert.alert('Order submitted', 'The service accepted this order.', [
        { text: 'Continue', onPress: () => router.replace('/dashboard/my-orders') },
      ]);
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : 'The order could not be submitted.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <PageHeader back title="New merchant order" subtitle="Select assigned records, then review before submission." />
      {error && (
        <Surface>
          <FeedbackMessage message={error} />
          <AppButton label="Retry options" variant="secondary" icon="refresh-cw" onPress={() => void refresh()} />
        </Surface>
      )}
      {submitError && <FeedbackMessage message={submitError} />}
      {loading && !options ? (
        <Surface><EmptyState title="Loading order options" description="Retrieving shops and products allowed for your account." /></Surface>
      ) : !options || !options.merchants.length || !options.products.length ? (
        <Surface><EmptyState title="Order options unavailable" description="Your account needs authorized shops and products before an order can be created." /></Surface>
      ) : reviewing ? (
        <Surface style={styles.review}>
          <Text style={styles.heading}>Review your order</Text>
          <ReviewRow label="Shop" value={merchant?.name ?? 'Select a shop'} />
          <ReviewRow label="Product" value={product?.name ?? 'Select a product'} />
          <ReviewRow label="Quantity" value={quantity} />
          {notes.trim() && <ReviewRow label="Notes" value={notes.trim()} />}
          <Text style={styles.disclaimer}>Nothing is submitted until you confirm below.</Text>
          <AppButton label="Edit order" variant="secondary" onPress={() => setReviewing(false)} />
          <AppButton label="Confirm and submit" loading={submitting} onPress={() => void submit()} />
        </Surface>
      ) : (
        <>
          <OptionList
            label="Assigned shop"
            records={options?.merchants ?? []}
            selectedId={merchantId}
            onSelect={setMerchantId}
          />
          <OptionList
            label="Available product"
            records={options?.products ?? []}
            selectedId={productId}
            onSelect={setProductId}
          />
          <Surface style={styles.form}>
            <FormField
              keyboardType="number-pad"
              label="Quantity"
              onChangeText={setQuantity}
              placeholder="Number of units"
              value={quantity}
            />
            <FormField
              label="Order notes (optional)"
              multiline
              onChangeText={setNotes}
              placeholder="Add a short note"
              value={notes}
            />
          </Surface>
          <AppButton
            disabled={!merchant || !product || !quantity}
            label="Review order"
            onPress={() => {
              if (!merchant || !product || !Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
                setSubmitError('Select a shop and product, and enter a whole-number quantity greater than zero.');
                return;
              }
              setSubmitError(null);
              setReviewing(true);
            }}
          />
        </>
      )}
      <Text style={styles.disclaimer}>Orders are sent using your authenticated account; backend permissions and organization scope are authoritative.</Text>
    </Screen>
  );
}

function OptionList({
  label,
  records,
  selectedId,
  onSelect,
}: {
  label: string;
  records: OperationalRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const palette = useRolePalette();

  return (
    <View style={styles.options}>
      <Text style={styles.heading}>{label}</Text>
      {records.map((record) => (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: selectedId === record.id }}
          key={record.id}
          onPress={() => onSelect(record.id)}
        >
          <Surface
            style={[
              styles.option,
              selectedId === record.id && styles.selected,
              { borderColor: selectedId === record.id ? palette.primary : palette.border },
              selectedId === record.id && { backgroundColor: palette.primaryPale },
            ]}
          >
            <Text style={styles.optionTitle}>{record.name}</Text>
            <Text style={styles.optionSubtitle}>{record.subtitle}</Text>
          </Surface>
        </Pressable>
      ))}
    </View>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.optionSubtitle}>{label}</Text>
      <Text style={styles.optionTitle}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: spacing.sm,
  },
  heading: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  option: {
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.md,
  },
  selected: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  optionTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  optionSubtitle: {
    color: colors.muted,
    fontSize: 11,
  },
  form: {
    gap: spacing.lg,
  },
  review: {
    gap: spacing.lg,
  },
  reviewRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  disclaimer: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
});
