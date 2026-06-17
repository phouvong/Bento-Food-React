import { useEffect, useRef, useState } from 'react'

// Hide-on-scroll-down / show-on-scroll-up flag.
// rAF-throttled so the scroll handler does at most one read + compare per
// frame, instead of firing on every native scroll event (60–120/sec).
// React still bails on same-value setState, so this is the closest we can
// get to "only re-render at the boundary" without losing the up/down
// direction signal.
const useHideOnScroll = ({ threshold = 50 } = {}) => {
    const [isHidden, setIsHidden] = useState(false)
    const lastScrollYRef = useRef(0)
    const rafRef = useRef(null)

    useEffect(() => {
        const handleScroll = () => {
            if (rafRef.current !== null) return
            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = null
                const currentScrollY = window.scrollY
                const scrollingDown = currentScrollY > lastScrollYRef.current
                const shouldHide =
                    scrollingDown && currentScrollY > threshold
                lastScrollYRef.current = currentScrollY
                setIsHidden(shouldHide)
            })
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }
        }
    }, [threshold])

    return isHidden
}

export default useHideOnScroll
