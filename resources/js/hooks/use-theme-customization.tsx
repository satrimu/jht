import { useCallback, useEffect, useState } from 'react';

export type ThemeRadius = 'none' | 'default' | 'full';
export type ThemeColor = 'favorite' | 'supabase' | 'neutral' | 'blue';

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyRadius = (radius: ThemeRadius) => {
    const radiusValues: Record<ThemeRadius, string> = {
        none: '0rem',
        default: '0.5rem',
        full: '1rem',
    };

    document.documentElement.style.setProperty(
        '--radius',
        radiusValues[radius],
    );
};

const applyColor = (color: ThemeColor) => {
    document.documentElement.setAttribute('data-theme-color', color);
};

export function initializeThemeCustomization() {
    const savedRadius =
        (localStorage.getItem('theme-radius') as ThemeRadius) || 'default';
    const savedColor =
        (localStorage.getItem('theme-color') as ThemeColor) || 'favorite';

    applyRadius(savedRadius);
    applyColor(savedColor);
}

export function useThemeCustomization() {
    const [radius, setRadius] = useState<ThemeRadius>('default');
    const [color, setColor] = useState<ThemeColor>('favorite');

    const updateRadius = useCallback((newRadius: ThemeRadius) => {
        setRadius(newRadius);
        localStorage.setItem('theme-radius', newRadius);
        setCookie('theme-radius', newRadius);
        applyRadius(newRadius);
    }, []);

    const updateColor = useCallback((newColor: ThemeColor) => {
        setColor(newColor);
        localStorage.setItem('theme-color', newColor);
        setCookie('theme-color', newColor);
        applyColor(newColor);
    }, []);

    useEffect(() => {
        const savedRadius =
            (localStorage.getItem('theme-radius') as ThemeRadius | null) ||
            'default';
        const savedColor =
            (localStorage.getItem('theme-color') as ThemeColor | null) ||
            'favorite';

        setRadius(savedRadius);
        setColor(savedColor);
        applyRadius(savedRadius);
        applyColor(savedColor);
    }, []);

    return { radius, color, updateRadius, updateColor } as const;
}
