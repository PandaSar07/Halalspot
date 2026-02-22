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
    borderLight: '#333333',
    heroBg: ['#0F2018', '#0F0F0F'] as const,
    tabBar: '#141414',
    tabBorder: '#2A2A2A',
    statusBar: 'light' as const,
};

export const LightTheme = {
    ...shared,
    isDark: false,
    bg: '#F8F9FA',
    bgCard: '#FFFFFF',
    bgElevated: '#F1F3F4',
    bgInput: '#F1F3F4',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    heroBg: ['#064E3B', '#10B981'] as const,
    tabBar: '#FFFFFF',
    tabBorder: '#F3F4F6',
    statusBar: 'dark' as const,
};

export type AppTheme = typeof DarkTheme;

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
