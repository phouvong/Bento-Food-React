import { useEffect, useState, useRef } from "react";

export function useGetScreenPosition() {
    const [scrollPosition, setScrollPosition] = useState(0);
    const timeoutRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            // Call setScrollPosition after 100ms
            timeoutRef.current = setTimeout(() => {
                setScrollPosition(window.pageYOffset);
            }, 10);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Cleanup
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return scrollPosition;
}