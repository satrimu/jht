import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import React, { useEffect, useMemo, useState } from 'react';

interface AvatarTriggerProps {
    user: User;
    className?: string;
}

// Minimal avatar used for dropdown triggers — returns only the image/fallback
export default function AvatarTrigger({
    user,
    className = '',
}: AvatarTriggerProps) {
    const name = (user.full_name || user.name || '') as string;
    const sources = useMemo(() => {
        const alt = (user as unknown as Record<string, unknown>)[
            'image_alternative'
        ] as string | undefined;
        const raw = [user.image_url, user.avatar, user.image, alt].filter(
            Boolean,
        ) as string[];

        function normalize(src: string): string {
            if (!src) return src;
            // already absolute or root-relative
            if (/^(https?:)?\/\//.test(src) || src.startsWith('/')) return src;
            // already in storage path
            if (src.includes('/storage/') || src.startsWith('storage/'))
                return (
                    window.location.origin +
                    (src.startsWith('/') ? src : `/${src}`)
                );
            // treat as filename -> prefix storage/users
            return `${window.location.origin}/storage/users/${src}`;
        }

        return raw.map(normalize);
    }, [user]);
    const getInitials = useInitials();
    const initials = getInitials(name || '');

    const [srcIndex, setSrcIndex] = useState(0);
    const [errored, setErrored] = useState(false);

    useEffect(() => {
        setSrcIndex(0);
        setErrored(false);
    }, [user]);

    const currentSrc =
        sources.length > 0 && srcIndex < sources.length
            ? sources[srcIndex]
            : undefined;

    function handleError() {
        if (srcIndex + 1 < sources.length) {
            setSrcIndex((i) => i + 1);
        } else {
            setErrored(true);

            console.warn(
                'AvatarTrigger: all image sources failed for user',
                user,
            );
        }
    }

    // simplified style: no blur/animation to avoid perceived lag
    const imgStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    };

    if (currentSrc && !errored) {
        return (
            <img
                src={currentSrc}
                alt={name}
                loading="eager"
                decoding="async"
                onError={handleError}
                style={imgStyle}
                className={className}
            />
        );
    }

    return (
        <span
            className={
                className +
                ' inline-flex items-center justify-center bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white'
            }
            aria-hidden={false}
        >
            {initials}
        </span>
    );
}
