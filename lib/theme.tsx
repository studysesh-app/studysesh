import { createContext, useContext } from 'react';

export type AppTheme = 'light' | 'dark';

/**
 * Single source of truth for the in-app theme. The value comes from the user's
 * profile (Settings → Theme) and is provided at the app root, so components no
 * longer have to fall back to the OS colour scheme.
 */
const ThemeContext = createContext<AppTheme>('light');

export const ThemeProvider = ThemeContext.Provider;

export function useAppTheme(): AppTheme {
    return useContext(ThemeContext);
}

/** Returns the dark-mode flag, letting an explicit `isDarkMode` prop win when provided. */
export function useIsDark(override?: boolean): boolean {
    const theme = useContext(ThemeContext);
    return override ?? theme === 'dark';
}
