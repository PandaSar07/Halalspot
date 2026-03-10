// HalalSpot Design System — Dual Theme

const shared = {
    primary: '#00C96B',
    primaryDim: 'rgba(0, 201, 107, 0.15)',
    gold: '#F5C842',
    goldDim: 'rgba(245, 200, 66, 0.15)',
    certHalal: '#00C96B',
    certMuslim: '#818CF8',
    certOptions: '#F59E0B',
};

export const DarkTheme = {
    ...shared,
    isDark: true,
    bg: '#0F0F0F',
    bgCard: '#1A1A1A',
    bgElevated: '#222222',
    bgInput: '#1E1E1E',
    textPrimary: '#F5F5F5',
    textSecondary: '#9A9A9A',
    textMuted: '#555555',
    border: '#2A2A2A',
    heroBg: ['#0F2018', '#0F0F0F'] as const,
    tabBar: '#141414',
    tabBorder: '#2A2A2A',
    statusBar: 'light' as const,
};

export const LightTheme = {
    ...shared,
    isDark: false,
    bg: '#FCF9F2', // Soft light gold/cream
    bgCard: '#FFFFFF',
    bgElevated: '#F5EEDC',
    bgInput: '#F9F5EA',
    textPrimary: '#1A1814',
    textSecondary: '#5C5549',
    textMuted: '#968E7D',
    border: '#EBE3D1',
    borderLight: '#F2ECDD',
    heroBg: ['#002D18', '#004D28', '#007840', '#FCF9F2'] as const,
    tabBar: '#FFFFFF',
    tabBorder: '#EBE3D1',
    statusBar: 'dark' as const,
};

export type AppTheme = typeof DarkTheme | typeof LightTheme;

// Legacy export for backwards compat
export const Colors = DarkTheme;

export const Radius = {
    sm: 10,
    md: 16,
    lg: 20,
    xl: 28,
    pill: 100,
};

export const Shadow = {
    glow: {
        shadowColor: '#00C96B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
    },
};
