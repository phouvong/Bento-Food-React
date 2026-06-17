import { useEffect, useState, useRef } from 'react'

// Returns a "scroll-past-threshold" position snapped to two values so
// consumers only re-render at the boundary crossing, not on every pixel.
//   - below or at `threshold`: returns 0
//   - above `threshold`:       returns threshold + 1
// Callers that compare with `<= threshold` / `> threshold` keep working
// unchanged. The scroll handler is throttled with requestAnimationFrame
// rather than a trailing-edge debounce, so continuous smooth-scroll
// (e.g. scrollIntoView) flips the state in lock-step with native
// `position: sticky` instead of waiting for the scroll to settle.
export function useGetScreenPosition(threshold = 0) {
    const [pastThreshold, setPastThreshold] = useState(false)
    const rafRef = useRef(null)

    useEffect(() => {
        const handleScroll = () => {
            if (rafRef.current !== null) return
            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = null
                setPastThreshold(window.pageYOffset > threshold)
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

    return pastThreshold ? threshold + 1 : 0
}
