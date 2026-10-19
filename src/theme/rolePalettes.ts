import type { UserRole } from '@/types/auth';
import { colors } from '@/theme/tokens';

export type RolePalette = { [Key in keyof typeof colors]: string } & {
  primary: string;
  primaryDark: string;
  primarySoft: string;
  primaryPale: string;
  highlight: string;
  alert: string;
};

const palettes: Record<UserRole, RolePalette> = {
  STRATICS_ADMIN: {
    ...colors,
    canvas: '#FDFBD4',
    surface: '#FFFCF4',
    ink: '#38240D',
    charcoal: '#4E3824',
    muted: '#806B56',
    subtle: '#A89179',
    border: '#E9DCCB',
    accent: '#C05800',
    accentSoft: '#F5E5D5',
    primary: '#713600',
    primaryDark: '#38240D',
    primarySoft: '#F1E3D6',
    primaryPale: '#F8EEE3',
    highlight: '#C05800',
    alert: '#F8EEE3',
  },
  PRODUCT_COMPANY_ADMIN: {
    ...colors,
    canvas: '#FDFBD4',
    surface: '#FFFDF3',
    ink: '#332D1A',
    charcoal: '#534A30',
    muted: '#81795F',
    subtle: '#A49B7C',
    border: '#E8E1C8',
    accent: '#D4AF37',
    accentSoft: '#F5EDCB',
    primary: '#817A43',
    primaryDark: '#554D2B',
    primarySoft: '#EEE8CB',
    primaryPale: '#F6F1DA',
    highlight: '#CE8946',
    alert: '#F6F1DA',
  },
  DISTRIBUTOR_ADMIN: {
    ...colors,
    canvas: '#F4F8F0',
    surface: '#FFFFFF',
    ink: '#151916',
    charcoal: '#363A40',
    muted: '#70786F',
    subtle: '#A3A9B0',
    border: '#E4EADF',
    accent: '#E1B84F',
    accentSoft: '#F8F1DE',
    primary: '#18301E',
    primaryDark: '#18301E',
    primarySoft: '#E8EFE4',
    primaryPale: '#EDF3E9',
    highlight: '#E1B84F',
    alert: '#EEF3E9',
  },
  FIELD_REPRESENTATIVE: {
    ...colors,
    canvas: '#F5F5DC',
    surface: '#FFFCF5',
    ink: '#35261E',
    charcoal: '#594236',
    muted: '#867265',
    subtle: '#AA9688',
    border: '#EAD8C9',
    accent: '#E35336',
    accentSoft: '#FBE1D9',
    primary: '#A0522D',
    primaryDark: '#78391F',
    primarySoft: '#F8E2D8',
    primaryPale: '#FBECE5',
    highlight: '#F4A460',
    alert: '#F9ECE5',
  },
};

export function getRolePalette(role: UserRole | undefined): RolePalette {
  return palettes[role ?? 'DISTRIBUTOR_ADMIN'];
}
