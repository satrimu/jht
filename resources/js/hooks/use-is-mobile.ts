import { useEffect, useState } from 'react';

export function useIsMobile(breakpoint: number = 768): boolean {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        // Check initial size
        const checkSize = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        checkSize();

        // Add listener for window resize
        window.addEventListener('resize', checkSize);

        // Clean up listener
        return () => window.removeEventListener('resize', checkSize);
    }, [breakpoint]);

    return isMobile;
}
