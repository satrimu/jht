import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import React, { useEffect, useMemo, useState } from 'react';

interface UserInfoProps {
    user: User;
    // optional Tailwind className to control size/appearance of the avatar container
    className?: string;
}

export function UserInfo({
    user,
    className = 'h-8 w-8 overflow-hidden rounded-full',
}: UserInfoProps) {
    const name = (user.full_name || user.name || '') as string;

    // Build ordered list of candidate image sources. If you add other fallback props
    // on the user model (eg. image_alternative), include them here.
    const sources = useMemo(() => {
        const alt = (user as unknown as Record<string, unknown>)[
            'image_alternative'
        ] as string | undefined;
        const raw = [user.image_url, user.avatar, user.image, alt].filter(
            Boolean,
        ) as string[];

        function normalize(src: string): string {
            if (!src) return src;
            if (/^(https?:)?\/\//.test(src) || src.startsWith('/')) return src;
            if (src.includes('/storage/') || src.startsWith('storage/'))
                return (
                    window.location.origin +
                    (src.startsWith('/') ? src : `/${src}`)
                );
            return `${window.location.origin}/storage/users/${src}`;
        }

        return raw.map(normalize);
    }, [user]);

    const getInitials = useInitials();
    const initials = getInitials(name || '');

    // index of current source being attempted
    const [srcIndex, setSrcIndex] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [errored, setErrored] = useState(false);

    // Reset states when user or sources change
    useEffect(() => {
        setSrcIndex(0);
        setLoaded(false);
        setErrored(false);
    }, [user]);

    const currentSrc =
        sources.length > 0 && srcIndex < sources.length
            ? sources[srcIndex]
            : undefined;

    // Inline styles for the progressive blur effect
    const imgStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition:
            'filter 300ms ease, opacity 300ms ease, transform 300ms ease',
        filter: loaded ? 'none' : 'blur(8px) scale(1.02)',
        opacity: loaded ? 1 : 0.85,
        transform: loaded ? 'none' : 'scale(1.02)',
    };

    function handleError() {
        // try next source if available
        if (srcIndex + 1 < sources.length) {
            setSrcIndex((i) => i + 1);
            setLoaded(false);
        } else {
            setErrored(true);
        }
    }

    // If no candidate sources or all errored, show initials fallback
    const showFallback = errored || !currentSrc;

    return (
        <Avatar className={className}>
            {showFallback ? (
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {initials}
                </AvatarFallback>
            ) : (
                <AvatarImage
                    src={currentSrc}
                    alt={name}
                    loading="lazy"
                    onLoad={() => setLoaded(true)}
                    onError={handleError}
                    style={imgStyle}
                />
            )}
        </Avatar>
    );
}
