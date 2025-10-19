import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import ThemeCustomizer from '@/components/theme-customizer';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit as editAppearance } from '@/routes/appearance';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: editAppearance().url,
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="space-y-3">
                        <HeadingSmall
                            title="Theme"
                            description="Select light or dark mode"
                        />
                        <AppearanceTabs />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <HeadingSmall
                            title="Customize"
                            description="Pick a style and color for your components"
                        />
                        <ThemeCustomizer />
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
