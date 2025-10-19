import { usePage } from '@inertiajs/react';

interface PageProps extends Record<string, unknown> {
    version: string;
    updated_on: string;
}

export default function AppFooter() {
    const { version, updated_on } = usePage<PageProps>().props;

    return (
        <footer className="border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
                {/* Copyright */}
                <p className="text-center text-xs text-muted-foreground sm:text-left">
                    &copy; {new Date().getFullYear()} PonpesHub. All rights
                    reserved.
                </p>

                {/* Version Info */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="font-medium">Version:</span>
                        <span className="font-mono">{version}</span>
                    </div>
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="font-medium">Updated:</span>
                        <span className="font-mono">{updated_on}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
