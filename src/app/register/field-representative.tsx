import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText as Text } from '@/components/AppText';
import {
  RegistrationChoiceGrid,
  RegistrationConsent,
  RegistrationField,
  RegistrationFormFrame,
  RegistrationHint,
  RegistrationMultiSelect,
  RegistrationSection,
  RegistrationFilePicker,
} from '@/components/RegistrationFormUi';
import { colors, spacing } from '@/theme/tokens';

const corridors = [
  'Hyderabad Urban Belt',
  'Secunderabad · Uppal · Ghatkesar',
  'Warangal Commercial Hub',
  'Vijayawada · Guntur Axis',
  'Other / preferred area',
];
const categories = [
  'Packaged food & snacks',
  'Beverages & dairy',
  'Personal care & soaps',
  'Home & cleaning chemicals',
  'Spices & edible staples',
];

type FieldApplication = {
  fullName: string;
  mobile: string;
  emergencyMobile: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  aadhaar: string;
  pan: string;
  tdsStatus: string;
  drivingLicense: string;
  licenseType: string;
  licenseValidity: string;
  corridor: string;
  categories: string[];
  experience: string;
  shopsPerDay: string;
  previousPrincipal: string;
  vehicleType: string;
  vehicleRegistration: string;
  handset: string;
  androidVersion: string;
  network: string;
  payoutType: string;
  weeklyPayout: string;
  commission: string;
  bankAccount: string;
  confirmAccount: string;
  bankAccountName: string;
  ifsc: string;
  consent: boolean;
};

const initialApplication: FieldApplication = {
  fullName: '',
  mobile: '',
  emergencyMobile: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  aadhaar: '',
  pan: '',
  tdsStatus: '',
  drivingLicense: '',
  licenseType: '',
  licenseValidity: '',
  corridor: '',
  categories: [],
  experience: '',
  shopsPerDay: '',
  previousPrincipal: '',
  vehicleType: '',
  vehicleRegistration: '',
  handset: '',
  androidVersion: '',
  network: '',
  payoutType: '',
  weeklyPayout: '',
  commission: '',
  bankAccount: '',
  confirmAccount: '',
  bankAccountName: '',
  ifsc: '',
  consent: false,
};

export default function FieldRepresentativeRegistrationRoute() {
  const [application, setApplication] = useState(initialApplication);
  const [message, setMessage] = useState<{ variant: 'info' | 'error'; text: string } | null>(null);

  const update = <Key extends keyof FieldApplication>(key: Key, value: FieldApplication[Key]) => {
    setApplication((current) => ({ ...current, [key]: value }));
    setMessage(null);
  };

  const toggleCategory = (value: string) => update(
    'categories',
    application.categories.includes(value)
      ? application.categories.filter((category) => category !== value)
      : [...application.categories, value],
  );

  const saveDraft = () => setMessage({
    variant: 'info',
    text: 'Draft storage is not connected. Your entries remain on this screen only.',
  });

  const continueRegistration = () => {
    const required: (keyof FieldApplication)[] = [
      'fullName', 'mobile', 'dateOfBirth', 'gender', 'address', 'aadhaar', 'pan',
      'drivingLicense', 'licenseValidity', 'corridor', 'experience', 'shopsPerDay',
      'vehicleType', 'handset', 'payoutType', 'bankAccount', 'confirmAccount', 'bankAccountName', 'ifsc',
    ];
    const missing = required.some((key) => {
      const value = application[key];
      return typeof value !== 'string' || !value.trim();
    });

    if (missing || !application.categories.length || !application.consent) {
      setMessage({
        variant: 'error',
        text: 'Complete the required fields, select at least one product category, and accept the declaration before continuing.',
      });
      return;
    }
    if (application.bankAccount !== application.confirmAccount) {
      setMessage({ variant: 'error', text: 'Bank account numbers do not match.' });
      return;
    }
    setMessage({
      variant: 'info',
      text: 'Your first-step details are complete. Beat mapping, verification, uploads, and application submission require the registration service and have not been performed.',
    });
  };

  return (
    <RegistrationFormFrame
      description="Field Representative onboarding · Territory, KYC and field readiness"
      message={message}
      onBack={() => router.replace('/login')}
      onContinue={continueRegistration}
      onSaveDraft={saveDraft}
      stepLabel="Step 1 of 3: Profile & KYC"
      stepLabels={['Profile & KYC', 'Beat & territory', 'Vehicle & payout']}
      title="Field Representative Registration"
    >
      <RegistrationSection icon="user" number="1" title="Personal & contact credentials">
        <RegistrationField label="Full legal name *" onChangeText={(value) => update('fullName', value)} placeholder="As per Aadhaar" value={application.fullName} />
        <View style={styles.twoColumns}>
          <RegistrationField keyboardType="phone-pad" label="Mobile number *" onChangeText={(value) => update('mobile', value)} placeholder="+91 00000 00000" value={application.mobile} />
          <RegistrationField keyboardType="phone-pad" label="Emergency mobile" onChangeText={(value) => update('emergencyMobile', value)} placeholder="Alternate contact" value={application.emergencyMobile} />
        </View>
        <RegistrationHint>OTP verification is not connected; no number is verified by this form.</RegistrationHint>
        <View style={styles.twoColumns}>
          <RegistrationField label="Date of birth *" onChangeText={(value) => update('dateOfBirth', value)} placeholder="DD/MM/YYYY" value={application.dateOfBirth} />
          <View style={styles.field}>
            <TextLabel>Gender *</TextLabel>
            <RegistrationChoiceGrid options={['Male', 'Female', 'Prefer not to say']} selected={application.gender} onSelect={(value) => update('gender', value)} />
          </View>
        </View>
        <RegistrationField label="Current residential address *" multiline onChangeText={(value) => update('address', value)} placeholder="House, street, city, state and postal code" value={application.address} />
      </RegistrationSection>

      <RegistrationSection icon="shield" number="2" title="Statutory identification (KYC)">
        <RegistrationField autoCapitalize="characters" label="Aadhaar card number *" onChangeText={(value) => update('aadhaar', value)} placeholder="12-digit Aadhaar number" secure value={application.aadhaar} />
        <RegistrationHint>Do not enter real identity details in this preview. Secure verification is not connected.</RegistrationHint>
        <View style={styles.twoColumns}>
          <RegistrationField autoCapitalize="characters" label="PAN card *" onChangeText={(value) => update('pan', value.toUpperCase())} placeholder="ABCDE1234F" value={application.pan} />
          <RegistrationField label="TDS exemption status" onChangeText={(value) => update('tdsStatus', value)} placeholder="Optional" value={application.tdsStatus} />
        </View>
        <RegistrationField label="Driving license number *" onChangeText={(value) => update('drivingLicense', value.toUpperCase())} placeholder="Enter license number" value={application.drivingLicense} />
        <View style={styles.twoColumns}>
          <RegistrationField label="License class" onChangeText={(value) => update('licenseType', value)} placeholder="e.g. LMV" value={application.licenseType} />
          <RegistrationField label="Valid until *" onChangeText={(value) => update('licenseValidity', value)} placeholder="DD/MM/YYYY" value={application.licenseValidity} />
        </View>
      </RegistrationSection>

      <RegistrationSection icon="map-pin" number="3" title="Territory & FMCG beat expertise">
        <TextLabel>Target operating corridor *</TextLabel>
        <RegistrationChoiceGrid options={corridors} selected={application.corridor} onSelect={(value) => update('corridor', value)} />
        <TextLabel>FMCG categories *</TextLabel>
        <RegistrationMultiSelect options={categories} selected={application.categories} onToggle={toggleCategory} />
        <View style={styles.twoColumns}>
          <RegistrationField label="Prior field sales experience *" onChangeText={(value) => update('experience', value)} placeholder="e.g. 3–5 years" value={application.experience} />
          <RegistrationField keyboardType="number-pad" label="Daily shops visited *" onChangeText={(value) => update('shopsPerDay', value)} placeholder="Visits per day" value={application.shopsPerDay} />
        </View>
        <RegistrationField label="Previous FMCG principal" onChangeText={(value) => update('previousPrincipal', value)} placeholder="Company / brand (optional)" value={application.previousPrincipal} />
      </RegistrationSection>

      <RegistrationSection icon="smartphone" number="4" title="Mobility & handset readiness">
        <TextLabel>Primary field vehicle *</TextLabel>
        <RegistrationChoiceGrid options={['Two-wheeler', 'Three-wheeler', 'Motor car', 'Other']} selected={application.vehicleType} onSelect={(value) => update('vehicleType', value)} />
        <View style={styles.twoColumns}>
          <RegistrationField autoCapitalize="characters" label="Vehicle registration" onChangeText={(value) => update('vehicleRegistration', value.toUpperCase())} placeholder="Vehicle number" value={application.vehicleRegistration} />
          <RegistrationField label="Handset model *" onChangeText={(value) => update('handset', value)} placeholder="Device model" value={application.handset} />
        </View>
        <View style={styles.twoColumns}>
          <RegistrationField label="Android version" onChangeText={(value) => update('androidVersion', value)} placeholder="e.g. Android 14" value={application.androidVersion} />
          <RegistrationField label="Network provider" onChangeText={(value) => update('network', value)} placeholder="Optional" value={application.network} />
        </View>
      </RegistrationSection>

      <RegistrationSection icon="credit-card" number="5" title="Bank direct payout & commission">
        <TextLabel>Weekly earning formula *</TextLabel>
        <RegistrationChoiceGrid options={['Fixed payout', 'Visit-based', 'Sales commission', 'Hybrid']} selected={application.payoutType} onSelect={(value) => update('payoutType', value)} />
        <View style={styles.twoColumns}>
          <RegistrationField keyboardType="number-pad" label="Expected weekly payout" onChangeText={(value) => update('weeklyPayout', value)} placeholder="₹ amount" value={application.weeklyPayout} />
          <RegistrationField keyboardType="decimal-pad" label="Commission rate" onChangeText={(value) => update('commission', value)} placeholder="% (if applicable)" value={application.commission} />
        </View>
        <RegistrationField label="Bank account number *" onChangeText={(value) => update('bankAccount', value)} placeholder="Enter account number" secure value={application.bankAccount} />
        <RegistrationField label="Confirm account number *" onChangeText={(value) => update('confirmAccount', value)} placeholder="Re-enter account number" secure value={application.confirmAccount} />
        <View style={styles.twoColumns}>
          <RegistrationField autoCapitalize="characters" label="Bank IFSC code *" onChangeText={(value) => update('ifsc', value.toUpperCase())} placeholder="e.g. HDFC0000000" value={application.ifsc} />
          <RegistrationField label="Bank account holder name *" onChangeText={(value) => update('bankAccountName', value)} placeholder="As per bank records" value={application.bankAccountName} />
        </View>
      </RegistrationSection>

      <RegistrationSection icon="camera" number="6" title="Verification media & field selfie">
        <RegistrationFilePicker
          description="Select Aadhaar front/back and driving-license documents (PDF or image)"
          types={['application/pdf', 'image/*']}
          title="Add verification media"
        />
        <RegistrationHint>
          Existing files are selected on this device only. Live selfie capture, location tagging, identity checks and secure upload are not active in this preview.
        </RegistrationHint>
      </RegistrationSection>

      <RegistrationConsent checked={application.consent} onChange={(value) => update('consent', value)}>
        I confirm that the information I provide is accurate and authorize review of the documents for this application.
      </RegistrationConsent>
    </RegistrationFormFrame>
  );
}

function TextLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  twoColumns: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  field: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    color: colors.charcoal,
    fontSize: 11,
    fontWeight: '700',
  },
});
