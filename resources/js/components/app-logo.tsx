import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const setting = usePage().props.setting as {
        nama_app?: string;
        image?: string;
    } | null;

    const defaultAppName = 'Panel Admin';

    const defaultImage = '';

    const appName = setting?.nama_app || defaultAppName;
    const image = setting?.image || defaultImage;

    return (
        <div className="flex items-center gap-2">
            {image ? (
                <img
                    src={`${image}`}
                    alt={`${appName} Logo`}
                    className="h-8 w-8 rounded-md object-contain"
                />
            ) : (
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                    <img
                        src="/storage/logo.png"
                        alt={`${appName} Logo`}
                        className="h-8 w-8 rounded-md object-contain"
                    />
                </div>
            )}
            <div className="grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">
                    {appName}
                </span>
            </div>
        </div>
    );
}
