import { useState, useEffect, useMemo } from 'react';
import { PaletteMode } from '@mui/material';
import { createAppTheme, tints } from '../theme';

const STORAGE_KEY = 'claritypro-theme-mode';

export function useThemeMode() {
    const [mode, setMode] = useState<PaletteMode>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, mode);
    }, [mode]);

    const toggleMode = () => setMode(prev => prev === 'light' ? 'dark' : 'light');

    const theme = useMemo(() => createAppTheme(mode), [mode]);

    const currentTints = mode === 'light' ? tints.light : tints.dark;

    return { mode, toggleMode, theme, tints: currentTints };
}
