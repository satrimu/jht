import '../../css/app.css';

import { Toaster } from '@/components/ui/sonner';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from '../hooks/use-appearance';
import { initializeThemeCustomization } from '../hooks/use-theme-customization';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) =>
        title ? `${title} - Admin - ${appName}` : `Admin - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `../pages/${name}.tsx`,
            import.meta.glob('../pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // root.render(<App {...props} />
        root.render(
            <>
                <App {...props} />
                <Toaster richColors position="bottom-center" />
            </>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// Initialize theme on load
initializeTheme();
initializeThemeCustomization();
