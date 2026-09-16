import { useEffect, useRef, useState } from 'react'

// Position-based scroll flag with a dead band: returns true once scrollY
// passes `hideAt`, and only returns false again after scrolling back above
// `showAt`. Between the two thresholds the state never changes, so touch
// jitter and slow scrolling can't make it flicker — unlike direction-based
// detection (useHideOnScroll), which can flip on every tiny direction change.
const useScrolledPastBand = ({ hideAt = 120, showAt = 40 } = {}) => {
    const [past, setPast] = useState(false)
    const rafRef = useRef(null)

    useEffect(() => {
        const handleScroll = () => {
            if (rafRef.current !== null) return
            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = null
                const y = window.scrollY
                setPast((prev) => (prev ? y > showAt : y > hideAt))
            })
        }

        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }
        }
    }, [hideAt, showAt])

    return past
}

export default useScrolledPastBand
