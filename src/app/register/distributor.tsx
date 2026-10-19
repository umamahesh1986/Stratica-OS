import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText as Text } from '@/components/AppText';
import { FeedbackMessage } from '@/components/FeedbackMessage';
import { RegistrationFilePicker } from '@/components/RegistrationFormUi';
import { radius, spacing } from '@/theme/tokens';

const registrationColors = {
  canvas: '#F3F7EF',
  surface: '#FFFFFF',
  ink: '#18251B',
  muted: '#738074',
  border: '#DFE8DC',
  primary: '#18301E',
  primarySoft: '#E7F0E3',
} as const;

const constitutions = ['Proprietorship', 'Partnership', 'LLP', 'Private Limited'];
const corridors = ['Hyderabad Outer', 'Warangal Axis', 'Vijayawada–Guntur', 'Vizag Coastal'];
const storageOptions = ['Ambient dry', 'Heavy pallet racks', 'Cold room (2–8°C)', 'CCTV / 24×7 security', 'DG power backup'];
const capitalOptions = ['< ₹25L', '₹25L–₹50L', '₹50L–₹1Cr', '> ₹1Cr'];

type DistributorApplication = {
  firmName: string;
  constitution: string;
  signatory: string;
  mobile: string;
  email: string;
  gstin: string;
  pan: string;
  fssai: string;
  wholesalePermit: boolean;
  corridor: string;
  carpetArea: string;
  depotAddress: string;
  storage: string[];
  fleetUnits: string;
  dailyOutflow: string;
  fieldExecutives: string;
  workingCapital: string;
  accountNumber: string;
  ifsc: string;
  bankBranch: string;
  consent: boolean;
};

const emptyApplication: DistributorApplication = {
  firmName: '',
  constitution: '',
  signatory: '',
  mobile: '',
  email: '',
  gstin: '',
  pan: '',
  fssai: '',
  wholesalePermit: false,
  corridor: '',
  carpetArea: '',
  depotAddress: '',
  storage: [],
  fleetUnits: '',
  dailyOutflow: '',
  fieldExecutives: '',
  workingCapital: '',
  accountNumber: '',
  ifsc: '',
  bankBranch: '',
  consent: false,
};

export default function DistributorRegistrationRoute() {
  const [application, setApplication] = useState(emptyApplication);
  const [message, setMessage] = useState<{ variant: 'info' | 'error'; text: string } | null>(null);

  const update = <Key extends keyof DistributorApplication>(
    key: Key,
    value: DistributorApplication[Key],
  ) => {
    setApplication((current) => ({ ...current, [key]: value }));
    setMessage(null);
  };

  const saveDraft = () => {
    setMessage({
      variant: 'info',
      text: 'Draft storage is not connected. Your entries will remain here until you leave this screen.',
    });
  };

  const proceed = () => {
    const required: (keyof DistributorApplication)[] = [
      'firmName',
      'constitution',
      'signatory',
      'mobile',
      'email',
      'gstin',
      'pan',
      'fssai',
      'corridor',
      'carpetArea',
      'depotAddress',
      'fleetUnits',
      'dailyOutflow',
      'fieldExecutives',
      'workingCapital',
      'accountNumber',
      'ifsc',
    ];
    const incomplete = required.some((key) => {
      const value = application[key];
      return typeof value !== 'string' || !value.trim();
    });

    if (incomplete || !application.storage.length || !application.consent) {
      setMessage({
        variant: 'error',
        text: 'Complete the required fields, choose a storage capability, and confirm the declaration before continuing.',
      });
      return;
    }

    setMessage({
      variant: 'info',
      text: 'The details are complete for this step. The remaining registration steps and submission service are not connected, so nothing has been sent.',
    });
  };

  const toggleStorage = (option: string) => {
    update(
      'storage',
      application.storage.includes(option)
        ? application.storage.filter((item) => item !== option)
        : [...application.storage, option],
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable accessibilityRole="button" onPress={() => router.replace('/login')} style={styles.back}>
          <Feather name="arrow-left" size={18} color={registrationColors.primary} />
          <Text style={styles.backText}>Back to sign in</Text>
        </Pressable>

        <View style={styles.heading}>
          <Text style={styles.title}>Distributor Registration</Text>
          <Text style={styles.subtitle}>Regional stockist &amp; super-stockist institutional onboarding</Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeading}>
            <Text style={styles.progressTitle}>Step 1 of 4: Business &amp; Legal</Text>
            <Text style={styles.progressPercent}>25% done</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressValue} />
          </View>
          <View style={styles.stepLabels}>
            {['Business', 'Depot', 'Fleet', 'KYC docs'].map((step, index) => (
              <View key={step} style={styles.stepItem}>
                <View style={[styles.stepNumber, index === 0 && styles.stepNumberActive]}>
                  {index === 0
                    ? <Feather name="check" size={12} color="#FFFFFF" />
                    : <Text style={styles.stepNumberText}>{index + 1}</Text>}
                </View>
                <Text style={[styles.stepLabel, index === 0 && styles.stepLabelActive]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        {message && <FeedbackMessage variant={message.variant} message={message.text} />}

        <RegistrationSection number="1" icon="briefcase" title="Firm & ownership credentials">
          <TextInputField
            label="Enterprise / firm legal name *"
            onChangeText={(value) => update('firmName', value)}
            placeholder="Registered legal name as per PAN"
            value={application.firmName}
          />
          <Text style={styles.fieldHint}>Enter the name exactly as it appears on the PAN record.</Text>
          <Text style={styles.label}>Constitution of business *</Text>
          <ChoiceList
            options={constitutions}
            selected={application.constitution}
            onSelect={(value) => update('constitution', value)}
          />
          <TextInputField
            label="Managing director / key signatory *"
            onChangeText={(value) => update('signatory', value)}
            placeholder="Full name"
            value={application.signatory}
          />
          <TextInputField
            keyboardType="phone-pad"
            label="Direct contact mobile *"
            onChangeText={(value) => update('mobile', value)}
            placeholder="+91 00000 00000"
            value={application.mobile}
          />
          <Text style={styles.fieldHint}>Mobile verification will be available when the registration service is connected.</Text>
          <TextInputField
            keyboardType="email-address"
            label="Corporate email address *"
            onChangeText={(value) => update('email', value)}
            placeholder="name@company.com"
            value={application.email}
          />
        </RegistrationSection>

        <RegistrationSection number="2" icon="shield" title="Statutory & tax identification">
          <TextInputField
            autoCapitalize="characters"
            label="Goods & services tax ID (GSTIN) *"
            onChangeText={(value) => update('gstin', value.toUpperCase())}
            placeholder="Enter GSTIN"
            value={application.gstin}
          />
          <View style={styles.twoColumns}>
            <TextInputField
              autoCapitalize="characters"
              label="Entity PAN *"
              onChangeText={(value) => update('pan', value.toUpperCase())}
              placeholder="PAN"
              value={application.pan}
            />
            <TextInputField
              keyboardType="number-pad"
              label="FSSAI license *"
              onChangeText={(value) => update('fssai', value)}
              placeholder="License number"
              value={application.fssai}
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleCopy}>
              <Text style={styles.toggleTitle}>APMC / mandi wholesale permit</Text>
              <Text style={styles.fieldHint}>Required for applicable agricultural grain markets.</Text>
            </View>
            <Switch
              accessibilityLabel="APMC or mandi wholesale permit"
              onValueChange={(value) => update('wholesalePermit', value)}
              trackColor={{ false: '#D9E0D6', true: '#A8C69E' }}
              value={application.wholesalePermit}
            />
          </View>
        </RegistrationSection>

        <RegistrationSection number="3" icon="map-pin" title="Footprint & depot capacity">
          <Text style={styles.label}>Primary allocation corridor *</Text>
          <ChoiceList
            options={corridors}
            selected={application.corridor}
            onSelect={(value) => update('corridor', value)}
          />
          <Text style={styles.label}>Depot carpet area (sq. ft) *</Text>
          <ChoiceList
            options={['< 2,500', '2,500–5,000', '> 5,000']}
            selected={application.carpetArea}
            onSelect={(value) => update('carpetArea', value)}
          />
          <TextInputField
            label="Depot physical address *"
            multiline
            onChangeText={(value) => update('depotAddress', value)}
            placeholder="Street, city, state and postal code"
            value={application.depotAddress}
          />
          <Text style={styles.label}>Storage &amp; tech capabilities *</Text>
          <View style={styles.chips}>
            {storageOptions.map((option) => {
              const selected = application.storage.includes(option);
              return (
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  key={option}
                  onPress={() => toggleStorage(option)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Feather
                    name={selected ? 'check-circle' : 'circle'}
                    size={13}
                    color={selected ? registrationColors.primary : registrationColors.muted}
                  />
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        </RegistrationSection>

        <RegistrationSection number="4" icon="truck" title="Fleet & distribution power">
          <Text style={styles.fieldHint}>Report current capacity for the selected operating region.</Text>
          <View style={styles.twoColumns}>
            <TextInputField
              keyboardType="number-pad"
              label="LCV / EV fleet *"
              onChangeText={(value) => update('fleetUnits', value)}
              placeholder="Number of vehicles"
              value={application.fleetUnits}
            />
            <TextInputField
              keyboardType="decimal-pad"
              label="Daily outflow (MT) *"
              onChangeText={(value) => update('dailyOutflow', value)}
              placeholder="Metric tonnes"
              value={application.dailyOutflow}
            />
          </View>
          <TextInputField
            keyboardType="number-pad"
            label="Field executives *"
            onChangeText={(value) => update('fieldExecutives', value)}
            placeholder="Number of representatives"
            value={application.fieldExecutives}
          />
        </RegistrationSection>

        <RegistrationSection number="5" icon="credit-card" title="Financial capacity & settlement">
          <Text style={styles.label}>Deployed working capital / credit line *</Text>
          <ChoiceList
            options={capitalOptions}
            selected={application.workingCapital}
            onSelect={(value) => update('workingCapital', value)}
          />
          <TextInputField
            label="Primary current account number *"
            onChangeText={(value) => update('accountNumber', value)}
            placeholder="Enter account number"
            value={application.accountNumber}
          />
          <View style={styles.twoColumns}>
            <TextInputField
              autoCapitalize="characters"
              label="Bank IFSC *"
              onChangeText={(value) => update('ifsc', value.toUpperCase())}
              placeholder="e.g. HDFC0000000"
              value={application.ifsc}
            />
            <TextInputField
              label="Bank & branch"
              onChangeText={(value) => update('bankBranch', value)}
              placeholder="Branch name"
              value={application.bankBranch}
            />
          </View>
        </RegistrationSection>

        <RegistrationSection number="6" icon="file-text" title="Fast-track OCR upload">
          <RegistrationFilePicker
            description="GST, FSSAI, cancelled cheque and PAN · PDF or JPG"
            types={['application/pdf', 'image/jpeg', 'image/png']}
            title="Add statutory documents"
          />
        </RegistrationSection>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: application.consent }}
          onPress={() => update('consent', !application.consent)}
          style={styles.consentRow}
        >
          <View style={[styles.checkbox, application.consent && styles.checkboxSelected]}>
            {application.consent && <Feather name="check" size={13} color="#FFFFFF" />}
          </View>
          <Text style={styles.consentText}>
            I declare that the information provided is accurate and that I am authorized to submit it. I consent to the verification checks required to process this application.
          </Text>
        </Pressable>

        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={saveDraft} style={styles.saveButton}>
            <Text style={styles.saveLabel}>Save draft</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={proceed} style={styles.proceedButton}>
            <Text style={styles.proceedLabel}>Proceed to step 2</Text>
            <Feather name="arrow-right" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
        <Text style={styles.disclaimer}>Your information is not submitted or verified by this preview form.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function RegistrationSection({
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
          <Feather name={icon} size={15} color={registrationColors.primary} />
        </View>
        <Text style={styles.sectionTitle}>{number}. {title}</Text>
      </View>
      <View style={styles.sectionFields}>{children}</View>
    </View>
  );
}

function TextInputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  autoCapitalize = 'sentences',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad' | 'number-pad' | 'decimal-pad' | 'email-address';
  multiline?: boolean;
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
        placeholderTextColor={registrationColors.muted}
        style={[styles.input, multiline && styles.multiline]}
        value={value}
      />
    </View>
  );
}

function ChoiceList({
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
            style={[styles.choice, active && styles.choiceActive]}
          >
            <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{option}</Text>
            <Feather
              name={active ? 'check-circle' : 'circle'}
              size={14}
              color={active ? registrationColors.primary : registrationColors.muted}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: registrationColors.canvas,
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
    color: registrationColors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  heading: {
    gap: spacing.xs,
  },
  title: {
    color: registrationColors.primary,
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: registrationColors.muted,
    fontSize: 12,
    lineHeight: 17,
    textTransform: 'capitalize',
  },
  progressCard: {
    backgroundColor: registrationColors.surface,
    borderColor: registrationColors.border,
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
    color: registrationColors.primary,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
  },
  progressPercent: {
    color: registrationColors.muted,
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
    backgroundColor: registrationColors.primary,
    borderRadius: radius.pill,
    height: '100%',
    width: '25%',
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
    backgroundColor: registrationColors.primary,
  },
  stepNumberText: {
    color: registrationColors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  stepLabel: {
    color: registrationColors.muted,
    fontSize: 9,
  },
  stepLabelActive: {
    color: registrationColors.primary,
    fontWeight: '700',
  },
  section: {
    backgroundColor: registrationColors.surface,
    borderColor: registrationColors.border,
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
    backgroundColor: registrationColors.primarySoft,
    borderRadius: 8,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  sectionTitle: {
    color: registrationColors.ink,
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
    color: registrationColors.ink,
    fontSize: 11,
    fontWeight: '700',
  },
  input: {
    backgroundColor: registrationColors.canvas,
    borderColor: registrationColors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: registrationColors.ink,
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
    color: registrationColors.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: -spacing.xs,
  },
  twoColumns: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  choice: {
    alignItems: 'center',
    backgroundColor: registrationColors.canvas,
    borderColor: registrationColors.border,
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
    backgroundColor: registrationColors.primarySoft,
    borderColor: '#A8C69E',
  },
  choiceText: {
    color: registrationColors.ink,
    flex: 1,
    fontSize: 10,
    fontWeight: '600',
  },
  choiceTextActive: {
    color: registrationColors.primary,
  },
  toggleRow: {
    alignItems: 'center',
    borderTopColor: registrationColors.border,
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
    color: registrationColors.ink,
    fontSize: 11,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: registrationColors.canvas,
    borderColor: registrationColors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 32,
    paddingHorizontal: spacing.sm,
  },
  chipSelected: {
    backgroundColor: registrationColors.primarySoft,
    borderColor: '#B6CFAD',
  },
  chipText: {
    color: registrationColors.muted,
    fontSize: 10,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: registrationColors.primary,
  },
  consentRow: {
    alignItems: 'flex-start',
    backgroundColor: '#EBF2E8',
    borderColor: registrationColors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: registrationColors.surface,
    borderColor: '#B5C2B2',
    borderRadius: 4,
    borderWidth: 1,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkboxSelected: {
    backgroundColor: registrationColors.primary,
    borderColor: registrationColors.primary,
  },
  consentText: {
    color: registrationColors.ink,
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
    backgroundColor: registrationColors.surface,
    borderColor: registrationColors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  saveLabel: {
    color: registrationColors.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  proceedButton: {
    alignItems: 'center',
    backgroundColor: registrationColors.primary,
    borderColor: registrationColors.primary,
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
    color: registrationColors.muted,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
  },
});
