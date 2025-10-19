import ThemeCustomizer from '@/components/theme-customizer';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import { Moon, Palette, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceDropdown({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const isDark =
        appearance === 'dark' ||
        (typeof window !== 'undefined' &&
            appearance === 'system' &&
            window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

    const handleQuickToggle = (e?: React.MouseEvent) => {
        // Prevent the trigger from closing/opening the dropdown when toggling
        e?.stopPropagation();
        const newAppearance = isDark ? 'light' : 'dark';
        updateAppearance(newAppearance);
    };

    return (
        <div className={`flex items-center space-x-1 ${className}`} {...props}>
            {/* Quick toggle button */}
            <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-md"
                onClick={handleQuickToggle}
                aria-label={
                    isDark ? 'Switch to light theme' : 'Switch to dark theme'
                }
            >
                {isDark ? (
                    <Moon className="h-5 w-5" />
                ) : (
                    <Sun className="h-5 w-5" />
                )}
            </Button>

            {/* Separate chevron trigger to open the customizer dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-md p-1"
                        aria-label="Open theme customizer"
                    >
                        <Palette className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-80">
                    <div className="p-4">
                        <h3 className="mb-2 text-sm font-semibold">
                            Customize theme
                        </h3>
                        <ThemeCustomizer />
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
