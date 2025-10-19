import { Label } from '@/components/ui/label';
import { useAppearance, type Appearance } from '@/hooks/use-appearance';
import {
    ThemeColor,
    ThemeRadius,
    useThemeCustomization,
} from '@/hooks/use-theme-customization';
import { cn } from '@/lib/utils';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes, type ReactNode } from 'react';

export default function ThemeCustomizer({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { radius, color, updateRadius, updateColor } =
        useThemeCustomization();
    const { appearance, updateAppearance } = useAppearance();

    const radiusOptions: { value: ThemeRadius; label: string }[] = [
        { value: 'none', label: 'None' },
        { value: 'default', label: 'Default' },
        { value: 'full', label: 'Full' },
    ];

    const colorOptions: {
        value: ThemeColor;
        label: string;
        colors: { light: string; dark: string };
    }[] = [
        {
            value: 'favorite',
            label: 'Favorite',
            colors: {
                light: 'bg-slate-800',
                dark: 'bg-slate-700',
            },
        },
        {
            value: 'supabase',
            label: 'Supabase',
            colors: {
                light: 'bg-emerald-900',
                dark: 'bg-emerald-700',
            },
        },
        {
            value: 'neutral',
            label: 'Neutral',
            colors: {
                light: 'bg-neutral-900',
                dark: 'bg-neutral-700',
            },
        },
        {
            value: 'blue',
            label: 'Modern Blue',
            colors: {
                light: 'bg-blue-500',
                dark: 'bg-blue-600',
            },
        },
    ];

    return (
        <div className={cn('space-y-6', className)} {...props}>
            {/* Appearance Mode Selection */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">Mode</Label>
                <div className="grid grid-cols-3 gap-3">
                    {(
                        [
                            {
                                value: 'light',
                                label: 'Light',
                                icon: <Sun className="h-5 w-5" />,
                            },
                            {
                                value: 'dark',
                                label: 'Dark',
                                icon: <Moon className="h-5 w-5" />,
                            },
                            {
                                value: 'system',
                                label: 'System',
                                icon: <Monitor className="h-5 w-5" />,
                            },
                        ] as {
                            value: Appearance;
                            label: string;
                            icon: ReactNode;
                        }[]
                    ).map((option) => (
                        <button
                            key={option.value}
                            onClick={() => updateAppearance(option.value)}
                            className={cn(
                                'relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors hover:bg-muted',
                                appearance === option.value
                                    ? 'border-primary'
                                    : 'border-border',
                            )}
                        >
                            {appearance === option.value && (
                                <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                            )}
                            <div className="flex h-12 w-12 items-center justify-center">
                                {option.icon}
                            </div>
                            <span className="text-xs font-medium">
                                {option.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
            {/* Radius Selection */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">Radius</Label>
                <div className="grid grid-cols-3 gap-3">
                    {radiusOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => updateRadius(option.value)}
                            className={cn(
                                'relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors hover:bg-muted',
                                radius === option.value
                                    ? 'border-primary'
                                    : 'border-border',
                            )}
                        >
                            {radius === option.value && (
                                <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                            )}
                            <div
                                className={cn(
                                    'h-12 w-12 bg-primary',
                                    option.value === 'none' && 'rounded-none',
                                    option.value === 'default' &&
                                        'rounded-[0.5rem]',
                                    option.value === 'full' && 'rounded-[1rem]',
                                )}
                            />
                            <span className="text-xs font-medium">
                                {option.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">Color</Label>
                <div className="grid grid-cols-3 gap-3">
                    {colorOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => updateColor(option.value)}
                            className={cn(
                                'relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors hover:bg-muted',
                                color === option.value
                                    ? 'border-primary'
                                    : 'border-border',
                            )}
                        >
                            {color === option.value && (
                                <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                            )}
                            <div className="flex gap-1">
                                <div
                                    className={cn(
                                        'h-6 w-6 rounded-full',
                                        option.colors.light,
                                    )}
                                />
                                <div
                                    className={cn(
                                        'h-6 w-6 rounded-full',
                                        option.colors.dark,
                                    )}
                                />
                            </div>
                            <span className="text-xs font-medium">
                                {option.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
