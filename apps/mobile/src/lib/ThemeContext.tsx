import React, { createContext, useContext, useState } from 'react';
import { LightTheme, DarkTheme, AppTheme } from './theme';

type ThemeContextType = {
    theme: AppTheme;
    isDark: boolean;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
    theme: LightTheme,
    isDark: false,
    toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [isDark, setIsDark] = useState(false); // Default: LIGHT

    const toggleTheme = () => setIsDark(prev => !prev);
    const theme = isDark ? DarkTheme : LightTheme;

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
