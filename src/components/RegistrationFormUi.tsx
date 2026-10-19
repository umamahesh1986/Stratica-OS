import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText as Text } from '@/components/AppText';
import { FeedbackMessage } from '@/components/FeedbackMessage';
import { radius, spacing } from '@/theme/tokens';

const palette = {
  canvas: '#F3F7EF',
  surface: '#FFFFFF',
  ink: '#18251B',
  muted: '#738074',
  border: '#DFE8DC',
  primary: '#18301E',
  primarySoft: '#E7F0E3',
} as const;

export function RegistrationFormFrame({
  title,
  description,
  stepLabel,
  stepLabels,
  message,
  onBack,
  onSaveDraft,
  onContinue,
  children,
}: {
  title: string;
  description: string;
  stepLabel: string;
  stepLabels: string[];
  message: { variant: 'info' | 'error'; text: string } | null;
  onBack: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
  children: ReactNode;
}) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
          <Feather name="arrow-left" size={18} color={palette.primary} />
          <Text style={styles.backText}>Back to sign in</Text>
        </Pressable>
        <View style={styles.heading}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{description}</Text>
        </View>
        <View style={styles.progressCard}>
          <View style={styles.progressHeading}>
            <Text style={styles.progressTitle}>{stepLabel}</Text>
            <Text style={styles.progressPercent}>{Math.round(100 / stepLabels.length)}% done</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressValue, { width: `${100 / stepLabels.length}%` }]} />
          </View>
          <View style={styles.stepLabels}>
            {stepLabels.map((step, index) => (
              <View key={step} style={styles.stepItem}>
                <View style={[styles.stepNumber, index === 0 && styles.stepNumberActive]}>
                  {index === 0
                    ? <Feather name="check" size={12} color="#FFFFFF" />
                    : <Text style={styles.stepNumberText}>{index + 1}</Text>}
                </View>
                <Text numberOfLines={1} style={[styles.stepLabel, index === 0 && styles.stepLabelActive]}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </View>
        {message && <FeedbackMessage variant={message.variant} message={message.text} />}
        {children}
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={onSaveDraft} style={styles.saveButton}>
            <Text style={styles.saveLabel}>Save draft</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onContinue} style={styles.proceedButton}>
            <Text style={styles.proceedLabel}>Continue</Text>
            <Feather name="arrow-right" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
        <Text style={styles.disclaimer}>This preview does not save, verify, upload, or submit your information.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export function RegistrationSection({
  number,
  icon,
  title,
  children,
}: {
  number: string;
  icon: ComponentProps<typeof Feather>['name'];
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <View style={styles.sectionIcon}>
          <Feather name={icon} size={15} color={palette.primary} />
        </View>
        <Text style={styles.sectionTitle}>{number}. {title}</Text>
      </View>
      <View style={styles.sectionFields}>{children}</View>
    </View>
  );
}

export function RegistrationField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  secure = false,
  autoCapitalize = 'sentences',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad' | 'number-pad' | 'decimal-pad' | 'email-address';
  multiline?: boolean;
  secure?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label.replace(' *', '')}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.muted}
        secureTextEntry={secure}
        style={[styles.input, multiline && styles.multiline]}
        value={value}
      />
    </View>
  );
}

export function RegistrationChoiceGrid({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.choiceGrid}>
      {options.map((option) => {
        const active = selected === option;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            key={option}
            onPress={() => onSelect(option)}
            style={({ pressed }) => [styles.choice, active && styles.choiceActive, pressed && styles.pressed]}
          >
            <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{option}</Text>
            <Feather
              name={active ? 'check-circle' : 'circle'}
              size={14}
              color={active ? palette.primary : palette.muted}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export function RegistrationMultiSelect({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: active }}
            key={option}
            onPress={() => onToggle(option)}
            style={({ pressed }) => [styles.chip, active && styles.chipSelected, pressed && styles.pressed]}
          >
            <Feather
              name={active ? 'check-square' : 'square'}
              size={13}
              color={active ? palette.primary : palette.muted}
            />
            <Text style={[styles.chipText, active && styles.chipTextSelected]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function RegistrationToggle({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={styles.toggleTitle}>{label}</Text>
        <Text style={styles.fieldHint}>{description}</Text>
      </View>
      <Switch
        accessibilityLabel={label}
        onValueChange={onValueChange}
        trackColor={{ false: '#D9E0D6', true: '#A8C69E' }}
        value={value}
      />
    </View>
  );
}

export function RegistrationConsent({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      style={styles.consentRow}
    >
      <View style={[styles.checkbox, checked && styles.checkboxSelected]}>
        {checked && <Feather name="check" size={13} color="#FFFFFF" />}
      </View>
      <Text style={styles.consentText}>{children}</Text>
    </Pressable>
  );
}

export function RegistrationFilePicker({
  title,
  description,
  types,
}: {
  title: string;
  description: string;
  types: string[];
}) {
  const [assets, setAssets] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  const pickDocuments = async () => {
    setPickerError(null);
    setIsPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: true,
        type: types,
      });
      if (!result.canceled) {
        setAssets((current) => {
          const existingUris = new Set(current.map((asset) => asset.uri));
          return [...current, ...result.assets.filter((asset) => !existingUris.has(asset.uri))];
        });
      }
    } catch (error) {
      setPickerError(error instanceof Error ? error.message : 'The file picker could not be opened. Please try again.');
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <View style={styles.uploadContainer}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: isPicking, disabled: isPicking }}
        disabled={isPicking}
        onPress={() => void pickDocuments()}
        style={({ pressed }) => [styles.uploadArea, pressed && styles.pressed, isPicking && styles.uploadDisabled]}
      >
        <View style={styles.uploadIcon}>
          <Feather name={isPicking ? 'clock' : 'upload-cloud'} size={20} color={palette.primary} />
        </View>
        <Text style={styles.uploadTitle}>{isPicking ? 'Opening files…' : assets.length ? 'Add more files' : title}</Text>
        <Text style={styles.uploadDescription}>{description}</Text>
        <Text style={styles.fieldHint}>Select files from this device. They are not uploaded or submitted.</Text>
      </Pressable>
      {pickerError && <Text accessibilityRole="alert" style={styles.uploadError}>{pickerError}</Text>}
      {assets.map((asset) => (
        <View key={asset.uri} style={styles.selectedFile}>
          <Feather name="file-text" size={16} color={palette.primary} />
          <View style={styles.selectedFileCopy}>
            <Text numberOfLines={1} style={styles.selectedFileName}>{asset.name}</Text>
            <Text style={styles.fieldHint}>
              {asset.size === undefined ? 'Selected locally' : `${(asset.size / (1024 * 1024)).toFixed(2)} MB · Selected locally`}
            </Text>
          </View>
          <Pressable
            accessibilityLabel={`Remove ${asset.name}`}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setAssets((current) => current.filter((item) => item.uri !== asset.uri))}
            style={styles.removeFile}
          >
            <Feather name="x" size={16} color={palette.muted} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

export function RegistrationHint({ children }: { children: ReactNode }) {
  return <Text style={styles.fieldHint}>{children}</Text>;
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.canvas,
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    gap: spacing.md,
    maxWidth: 680,
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
    width: '100%',
  },
  back: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 40,
    paddingHorizontal: spacing.xs,
  },
  backText: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  heading: {
    gap: spacing.xs,
  },
  title: {
    color: palette.primary,
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  progressCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  progressHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTitle: {
    color: palette.primary,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
  },
  progressPercent: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  progressTrack: {
    backgroundColor: '#E6EBE3',
    borderRadius: radius.pill,
    height: 5,
    overflow: 'hidden',
  },
  progressValue: {
    backgroundColor: palette.primary,
    borderRadius: radius.pill,
    height: '100%',
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  stepNumber: {
    alignItems: 'center',
    backgroundColor: '#EDF0EA',
    borderRadius: radius.pill,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  stepNumberActive: {
    backgroundColor: palette.primary,
  },
  stepNumberText: {
    color: palette.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  stepLabel: {
    color: palette.muted,
    fontSize: 9,
    maxWidth: '100%',
  },
  stepLabelActive: {
    color: palette.primary,
    fontWeight: '700',
  },
  section: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sectionIcon: {
    alignItems: 'center',
    backgroundColor: palette.primarySoft,
    borderRadius: 8,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  sectionTitle: {
    color: palette.ink,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionFields: {
    gap: spacing.md,
  },
  inputGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    color: palette.ink,
    fontSize: 11,
    fontWeight: '700',
  },
  input: {
    backgroundColor: palette.canvas,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    color: palette.ink,
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    minHeight: 42,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  multiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  fieldHint: {
    color: palette.muted,
    fontSize: 10,
    lineHeight: 15,
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  choice: {
    alignItems: 'center',
    backgroundColor: palette.canvas,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: '47%',
    flexDirection: 'row',
    flexGrow: 1,
    gap: spacing.xs,
    justifyContent: 'space-between',
    minHeight: 40,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  choiceActive: {
    backgroundColor: palette.primarySoft,
    borderColor: '#A8C69E',
  },
  choiceText: {
    color: palette.ink,
    flex: 1,
    fontSize: 10,
    fontWeight: '600',
  },
  choiceTextActive: {
    color: palette.primary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: palette.canvas,
    borderColor: palette.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 32,
    paddingHorizontal: spacing.sm,
  },
  chipSelected: {
    backgroundColor: palette.primarySoft,
    borderColor: '#B6CFAD',
  },
  chipText: {
    color: palette.muted,
    fontSize: 10,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: palette.primary,
  },
  toggleRow: {
    alignItems: 'center',
    borderTopColor: palette.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  toggleCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  toggleTitle: {
    color: palette.ink,
    fontSize: 11,
    fontWeight: '700',
  },
  uploadArea: {
    alignItems: 'center',
    backgroundColor: palette.canvas,
    borderColor: palette.border,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  uploadContainer: {
    gap: spacing.sm,
  },
  uploadDisabled: {
    opacity: 0.65,
  },
  uploadError: {
    color: '#A52E26',
    fontSize: 11,
  },
  selectedFile: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  selectedFileCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  selectedFileName: {
    color: palette.ink,
    fontSize: 11,
    fontWeight: '600',
  },
  removeFile: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  uploadIcon: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: radius.pill,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  uploadTitle: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  uploadDescription: {
    color: palette.muted,
    fontSize: 10,
    textAlign: 'center',
  },
  consentRow: {
    alignItems: 'flex-start',
    backgroundColor: '#EBF2E8',
    borderColor: palette.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: '#B5C2B2',
    borderRadius: 4,
    borderWidth: 1,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkboxSelected: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  consentText: {
    color: palette.ink,
    flex: 1,
    fontSize: 10,
    lineHeight: 15,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  saveLabel: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  proceedButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderColor: palette.primary,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 48,
  },
  proceedLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  disclaimer: {
    color: palette.muted,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
