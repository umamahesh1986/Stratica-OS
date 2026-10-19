import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppText as Text } from '@/components/AppText';
import { FeedbackMessage } from '@/components/FeedbackMessage';
import { FormField } from '@/components/FormField';
import { PageHeader } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { Surface } from '@/components/Surface';
import { submitOperation } from '@/services/operations';
import type { SectionDefinition } from '@/config/roleSections';
import type { OperationalRecord } from '@/types/operations';
import { colors, spacing } from '@/theme/tokens';

type SectionFormProps = {
  accessToken: string;
  section: SectionDefinition;
  record?: OperationalRecord;
  actionId?: string;
};

type FormFieldDefinition = {
  key: string;
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'number-pad';
  multiline?: boolean;
  options?: readonly { label: string; value: string }[];
};

function formFieldsFor(section: SectionDefinition): FormFieldDefinition[] {
  switch (section.id) {
    case 'products':
      return [
        { key: 'name', label: 'Product name', placeholder: 'Enter product name' },
        { key: 'category', label: 'Category', placeholder: 'Enter product category' },
        { key: 'description', label: 'Description', placeholder: 'Describe this product', multiline: true },
      ];
    case 'new-order':
      return [
        { key: 'merchant', label: 'Merchant', placeholder: 'Select or enter merchant name' },
        { key: 'product', label: 'Product', placeholder: 'Select or enter product' },
        { key: 'quantity', label: 'Quantity', placeholder: 'Enter quantity', keyboardType: 'number-pad' },
        { key: 'notes', label: 'Notes', placeholder: 'Optional order notes', multiline: true },
      ];
    case 'inventory':
      return [
        { key: 'item', label: 'Inventory item', placeholder: 'Select item' },
        {
          key: 'movementType',
          label: 'Movement type',
          placeholder: 'Choose a movement type',
          options: [
            { label: 'Inbound', value: 'INBOUND' },
            { label: 'Outbound', value: 'OUTBOUND' },
            { label: 'Adjustment', value: 'ADJUSTMENT' },
          ],
        },
        { key: 'quantity', label: 'Movement quantity', placeholder: 'Enter quantity', keyboardType: 'number-pad' },
        { key: 'reason', label: 'Reason', placeholder: 'Reason for the audited movement', multiline: true },
      ];
    case 'tasks':
      return [
        { key: 'representative', label: 'Representative', placeholder: 'Select assigned representative' },
        { key: 'task', label: 'Task', placeholder: 'Describe the task' },
        { key: 'dueDate', label: 'Due date', placeholder: 'YYYY-MM-DD' },
      ];
    default:
      return [
        { key: 'name', label: 'Name', placeholder: 'Enter a name' },
        { key: 'description', label: 'Description', placeholder: 'Add details', multiline: true },
      ];
  }
}

export function SectionForm({ accessToken, section, record, actionId }: SectionFormProps) {
  const action = actionId
    ? section.actions?.find((candidate) => candidate.id === actionId)
    : section.createAction;
  const fields = formFieldsFor(section);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (record) {
      initial.name = record.name;
      initial.description = record.description;
    }
    return initial;
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!action || !actionId && !section.createAction) return;
    const required = fields.filter((field) => field.key !== 'notes' && field.key !== 'description');
    if (required.some((field) => !values[field.key]?.trim())) {
      setError('Complete the required fields before continuing.');
      return;
    }
    if (section.id === 'inventory' && (
      !Number.isFinite(Number(values.quantity)) ||
      Number(values.quantity) <= 0 ||
      !values.reason?.trim()
    )) {
      setError('Enter a positive movement quantity and a reason.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const payload: Record<string, unknown> = { ...values };
      if (payload.quantity !== undefined) payload.quantity = Number(payload.quantity);
      await submitOperation(
        accessToken,
        section.resource,
        record?.id ?? null,
        action.id,
        payload,
      );
      Alert.alert('Request submitted', 'The service accepted this request.', [
        { text: 'Continue', onPress: () => router.replace({ pathname: '/dashboard/[section]', params: { section: section.id } }) },
      ]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The request could not be submitted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <PageHeader
        back
        title={action?.label ?? (record ? 'Edit details' : 'Create request')}
        subtitle={section.title}
      />
      {section.id === 'inventory' && (
        <FeedbackMessage
          variant="info"
          message="This records an auditable stock movement only. It does not overwrite the on-hand stock total."
        />
      )}
      {error && <FeedbackMessage message={error} />}
      <Surface style={styles.form}>
        {fields.map((field) => (
          <View key={field.key} style={styles.field}>
            {field.options ? (
              <>
                <Text style={styles.label}>{field.label}</Text>
                <View style={styles.options}>
                  {field.options.map((option) => (
                    <AppButton
                      key={option.value}
                      label={option.label}
                      onPress={() => setValues((previous) => ({ ...previous, [field.key]: option.value }))}
                      style={styles.option}
                      variant={values[field.key] === option.value ? 'primary' : 'secondary'}
                    />
                  ))}
                </View>
              </>
            ) : (
              <FormField
                keyboardType={field.keyboardType}
                label={field.label}
                multiline={field.multiline}
                onChangeText={(value) => setValues((previous) => ({ ...previous, [field.key]: value }))}
                placeholder={field.placeholder}
                value={values[field.key] ?? ''}
              />
            )}
          </View>
        ))}
        {section.id === 'inventory' && (
          <Text style={styles.hint}>A positive movement quantity and a reason are required by the service.</Text>
        )}
      </Surface>
      <AppButton label="Submit" loading={loading} onPress={() => void submit()} />
      <Text style={styles.disclaimer}>Submission is sent only to the authenticated service; access is validated by the backend.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
  field: {
    width: '100%',
  },
  label: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    flexGrow: 1,
  },
  hint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  disclaimer: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});
