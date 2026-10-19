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
  RegistrationToggle,
  RegistrationFilePicker,
} from '@/components/RegistrationFormUi';
import { colors, spacing } from '@/theme/tokens';

const constitutions = ['Private limited', 'LLP', 'Partnership', 'Proprietorship'];
const productCategories = [
  'Packaged staples & atta / rice',
  'Beverages & cold chain dairy',
  'Spices & edible oils',
  'Confectionery & snacks',
  'Personal care & home care',
  'Other',
];
const distributionRoutes = [
  'Hyderabad & GHMC',
  'Warangal & Karimnagar',
  'Vijayawada & Guntur',
  'Rajahmundry & Vizag',
];
const skuCounts = ['1–10', '11–50', '51–200', '200+'];
const turnoverRanges = ['Under ₹25 Cr', '₹25–₹50 Cr', '₹50–₹100 Cr', 'Over ₹100 Cr'];
const retailReach = ['1–500 outlets', '501–2,500 outlets', '2,500+ outlets'];

type CompanyApplication = {
  legalName: string;
  brandName: string;
  constitution: string;
  headquarters: string;
  cin: string;
  website: string;
  signatory: string;
  designation: string;
  role: string;
  mobile: string;
  email: string;
  fssai: string;
  fssaiValidity: string;
  gstin: string;
  pan: string;
  metrology: boolean;
  categories: string[];
  skuCount: string;
  turnover: string;
  retailReach: string;
  currentOutlets: string;
  cfaAddress: string;
  routes: string[];
  coldStorage: string;
  monthlyInward: string;
  consent: boolean;
};

const initialApplication: CompanyApplication = {
  legalName: '',
  brandName: '',
  constitution: '',
  headquarters: '',
  cin: '',
  website: '',
  signatory: '',
  designation: '',
  role: '',
  mobile: '',
  email: '',
  fssai: '',
  fssaiValidity: '',
  gstin: '',
  pan: '',
  metrology: false,
  categories: [],
  skuCount: '',
  turnover: '',
  retailReach: '',
  currentOutlets: '',
  cfaAddress: '',
  routes: [],
  coldStorage: '',
  monthlyInward: '',
  consent: false,
};

export default function ProductCompanyRegistrationRoute() {
  const [application, setApplication] = useState(initialApplication);
  const [message, setMessage] = useState<{ variant: 'info' | 'error'; text: string } | null>(null);

  const update = <Key extends keyof CompanyApplication>(key: Key, value: CompanyApplication[Key]) => {
    setApplication((current) => ({ ...current, [key]: value }));
    setMessage(null);
  };

  const toggleListItem = (key: 'categories' | 'routes', item: string) => {
    const current = application[key];
    update(key, current.includes(item)
      ? current.filter((value) => value !== item)
      : [...current, item]);
  };

  const saveDraft = () => setMessage({
    variant: 'info',
    text: 'Draft storage is not connected. Your entries remain on this screen only.',
  });

  const continueRegistration = () => {
    const required: (keyof CompanyApplication)[] = [
      'legalName', 'brandName', 'constitution', 'headquarters', 'cin', 'signatory',
      'designation', 'mobile', 'email', 'fssai', 'fssaiValidity', 'gstin', 'pan',
      'skuCount', 'turnover', 'retailReach', 'currentOutlets', 'cfaAddress',
      'coldStorage', 'monthlyInward',
    ];
    const missing = required.some((key) => {
      const value = application[key];
      return typeof value !== 'string' || !value.trim();
    });

    if (missing || !application.categories.length || !application.routes.length || !application.consent) {
      setMessage({
        variant: 'error',
        text: 'Complete required company details, select product categories and distribution routes, and accept the declaration to continue.',
      });
      return;
    }
    setMessage({
      variant: 'info',
      text: 'Your first-step details are complete. Compliance checks, catalog uploads, remaining steps, and submission need the registration service and have not been performed.',
    });
  };

  return (
    <RegistrationFormFrame
      description="Manufacturer, brand and regional distribution onboarding"
      message={message}
      onBack={() => router.replace('/login')}
      onContinue={continueRegistration}
      onSaveDraft={saveDraft}
      stepLabel="Step 1 of 4: Brand & entity"
      stepLabels={['Brand & entity', 'SKU / catalog', 'CFA logistics', 'Compliance']}
      title="Product Company Registration"
    >
      <RegistrationSection icon="briefcase" number="1" title="Manufacturer & brand credentials">
        <RegistrationField label="Company / enterprise legal name *" onChangeText={(value) => update('legalName', value)} placeholder="Registered company name" value={application.legalName} />
        <RegistrationField label="Brand name / trademark *" onChangeText={(value) => update('brandName', value)} placeholder="Brand name" value={application.brandName} />
        <View style={styles.twoColumns}>
          <View style={styles.field}>
            <Text style={styles.label}>Entity constitution *</Text>
            <RegistrationChoiceGrid options={constitutions} selected={application.constitution} onSelect={(value) => update('constitution', value)} />
          </View>
          <RegistrationField label="Corporate headquarters *" onChangeText={(value) => update('headquarters', value)} placeholder="City, State" value={application.headquarters} />
        </View>
        <RegistrationField autoCapitalize="characters" label="Company CIN / incorporation number *" onChangeText={(value) => update('cin', value.toUpperCase())} placeholder="Company registration number" value={application.cin} />
        <RegistrationField autoCapitalize="none" keyboardType="default" label="Official website" onChangeText={(value) => update('website', value)} placeholder="https://company.example" value={application.website} />
      </RegistrationSection>

      <RegistrationSection icon="user-check" number="2" title="Key authorized signatory">
        <RegistrationField label="Principal representative name *" onChangeText={(value) => update('signatory', value)} placeholder="Full name" value={application.signatory} />
        <View style={styles.twoColumns}>
          <RegistrationField label="Designation / corporate role *" onChangeText={(value) => update('designation', value)} placeholder="e.g. Director" value={application.designation} />
          <RegistrationField label="Department / function" onChangeText={(value) => update('role', value)} placeholder="e.g. Sales" value={application.role} />
        </View>
        <RegistrationField keyboardType="phone-pad" label="Official mobile number *" onChangeText={(value) => update('mobile', value)} placeholder="+91 00000 00000" value={application.mobile} />
        <RegistrationHint>Mobile OTP verification will be available when connected to the onboarding service.</RegistrationHint>
        <RegistrationField autoCapitalize="none" keyboardType="email-address" label="Business email address *" onChangeText={(value) => update('email', value)} placeholder="name@company.com" value={application.email} />
        <RegistrationHint>Use a company-controlled domain. Email domain is not verified in this preview.</RegistrationHint>
      </RegistrationSection>

      <RegistrationSection icon="file-text" number="3" title="Statutory licensing">
        <RegistrationField keyboardType="number-pad" label="Central FSSAI license number *" onChangeText={(value) => update('fssai', value)} placeholder="14-digit license number" value={application.fssai} />
        <RegistrationField label="FSSAI validity date *" onChangeText={(value) => update('fssaiValidity', value)} placeholder="DD/MM/YYYY" value={application.fssaiValidity} />
        <RegistrationField autoCapitalize="characters" label="Goods & services tax ID (GSTIN) *" onChangeText={(value) => update('gstin', value.toUpperCase())} placeholder="Enter GSTIN" value={application.gstin} />
        <RegistrationField autoCapitalize="characters" label="Company PAN *" onChangeText={(value) => update('pan', value.toUpperCase())} placeholder="ABCDE1234F" value={application.pan} />
        <RegistrationToggle
          description="Indicate whether applicable legal metrology and barcode registrations are held."
          label="Legal Metrology & BIS / barcode registration"
          onValueChange={(value) => update('metrology', value)}
          value={application.metrology}
        />
      </RegistrationSection>

      <RegistrationSection icon="package" number="4" title="Portfolio & target categories">
        <Text style={styles.label}>Primary product categories *</Text>
        <RegistrationMultiSelect options={productCategories} selected={application.categories} onToggle={(value) => toggleListItem('categories', value)} />
        <View style={styles.twoColumns}>
          <View style={styles.field}>
            <Text style={styles.label}>Active SKU count *</Text>
            <RegistrationChoiceGrid options={skuCounts} selected={application.skuCount} onSelect={(value) => update('skuCount', value)} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Current annual regional turnover *</Text>
            <RegistrationChoiceGrid options={turnoverRanges} selected={application.turnover} onSelect={(value) => update('turnover', value)} />
          </View>
        </View>
        <Text style={styles.label}>Existing retail reach *</Text>
        <RegistrationChoiceGrid options={retailReach} selected={application.retailReach} onSelect={(value) => update('retailReach', value)} />
        <RegistrationField keyboardType="number-pad" label="Current active outlets *" onChangeText={(value) => update('currentOutlets', value)} placeholder="Approximate outlet count" value={application.currentOutlets} />
      </RegistrationSection>

      <RegistrationSection icon="map-pin" number="5" title="CFA hub & distribution corridors">
        <RegistrationField label="Preferred primary CFA / depot *" onChangeText={(value) => update('cfaAddress', value)} placeholder="City, location or existing CFA details" value={application.cfaAddress} />
        <Text style={styles.label}>Target retail distribution routes *</Text>
        <RegistrationMultiSelect options={distributionRoutes} selected={application.routes} onToggle={(value) => toggleListItem('routes', value)} />
        <Text style={styles.label}>Cold storage capacity *</Text>
        <RegistrationChoiceGrid options={['Available', 'Not available']} selected={application.coldStorage} onSelect={(value) => update('coldStorage', value)} />
        <RegistrationField label="Estimated monthly inward volume *" onChangeText={(value) => update('monthlyInward', value)} placeholder="Quantity and unit (e.g. MT / pallets)" value={application.monthlyInward} />
      </RegistrationSection>

      <RegistrationSection icon="folder" number="6" title="Document & catalog dossier">
        <RegistrationFilePicker
          description="Product catalog and master price list (XLS / PDF)"
          types={[
            'application/pdf',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          ]}
          title="Add product catalog"
        />
        <RegistrationFilePicker
          description="FSSAI, GST, company PAN and statutory certificates"
          types={['application/pdf', 'image/jpeg', 'image/png']}
          title="Add statutory certificates"
        />
        <RegistrationFilePicker
          description="Optional PDF of trade marketing or retail activation plan"
          types={['application/pdf']}
          title="Add proposed trade marketing plan"
        />
      </RegistrationSection>

      <RegistrationConsent checked={application.consent} onChange={(value) => update('consent', value)}>
        I affirm that I am an authorized company representative and that the details and statutory documents provided for this application are accurate.
      </RegistrationConsent>
    </RegistrationFormFrame>
  );
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
