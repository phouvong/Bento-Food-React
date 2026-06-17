// Cancel handle so callers can abort an in-flight animation
// (e.g. if the user starts a new scroll while the previous one is running).
type Cancel = () => void

// easeInOutCubic — symmetric S-curve. Slow start + slow end feels more
// organic than the browser-default smooth-scroll curve, which varies across
// browsers and tends to feel either too snappy (Safari) or too linear.
const easeInOutCubic = (t: number): number =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

export function smoothScrollTo(targetY: number, duration: number = 500): Cancel {
    if (typeof window === 'undefined') return () => {}

    const startY = window.pageYOffset
    const deltaY = targetY - startY
    if (deltaY === 0 || duration <= 0) {
        window.scrollTo(0, targetY)
        return () => {}
    }

    const startTime = performance.now()
    let frame: number | null = null
    let cancelled = false

    const step = (now: number): void => {
        if (cancelled) return
        const t = Math.min((now - startTime) / duration, 1)
        window.scrollTo(0, startY + deltaY * easeInOutCubic(t))
        if (t < 1) {
            frame = requestAnimationFrame(step)
        } else {
            frame = null
        }
    }

    frame = requestAnimationFrame(step)

    return () => {
        cancelled = true
        if (frame !== null) {
            cancelAnimationFrame(frame)
            frame = null
        }
    }
}
