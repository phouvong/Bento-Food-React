import { useEffect, useRef, useState } from 'react'

// Grows the sheet toward full-height (and squares its top corners) as the
// caller's content scrolls, then snaps back once `open` goes false — pass
// the same open/visible flag you give the Drawer/Dialog so it resets
// between opens instead of carrying over the last scroll position.
const useScrollToFitScreenDrawer = (open) => {
    // mobile drawer expanded logic here
    const GROW_DISTANCE = 120
    const [growProgress, setGrowProgress] = useState(0)
    const rafId = useRef(null)

    useEffect(() => {
        if (!open) setGrowProgress(0)
    }, [open])

    useEffect(() => {
        return () => {
            if (rafId.current !== null) cancelAnimationFrame(rafId.current)
        }
    }, [])

    const handleContentScroll = (e) => {
        const { scrollTop } = e.currentTarget
        if (rafId.current !== null) return
        rafId.current = requestAnimationFrame(() => {
            rafId.current = null
            setGrowProgress(Math.min(1, Math.max(0, scrollTop / GROW_DISTANCE)))
        })
    }

    const sheetHeight = `${90 + growProgress * 10}dvh`
    const sheetRadius = `${20 * (1 - growProgress)}px`

    return {
        sheetHeight,
        sheetRadius,
        handleContentScroll,
    }
}

export default useScrollToFitScreenDrawer
