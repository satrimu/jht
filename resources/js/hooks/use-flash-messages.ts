import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface FlashMessages {
    success?: string;
    error?: string;
    info?: string;
    warning?: string;
    uuid?: string;
}

interface PageProps {
    flash?: FlashMessages | null;
    [key: string]: unknown;
}

export function useFlashMessages() {
    const page = usePage<PageProps>();
    const flash = page.props.flash;
    const lastUuidRef = useRef<string | null>(null);

    useEffect(() => {
        if (!flash?.uuid) {
            lastUuidRef.current = null;
            return;
        }

        if (flash.uuid === lastUuidRef.current) {
            return;
        }

        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
        if (flash.info) {
            toast.info(flash.info);
        }
        if (flash.warning) {
            toast.warning(flash.warning);
        }

        lastUuidRef.current = flash.uuid;
    }, [flash]);
}
