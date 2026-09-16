import { useEffect } from 'react'
import { BOTTOM_OVERLAY_HEIGHT_CSS_VAR } from '@/components/navbar/navbarConstants'

const useBottomOverlayHeight = (ref) => {
    useEffect(() => {
        const node = ref?.current
        const root = document.documentElement
        const reset = () =>
            root.style.setProperty(BOTTOM_OVERLAY_HEIGHT_CSS_VAR, '0px')

        if (!node || typeof ResizeObserver === 'undefined') {
            reset()
            return undefined
        }

        const observer = new ResizeObserver(() => {
            root.style.setProperty(
                BOTTOM_OVERLAY_HEIGHT_CSS_VAR,
                `${node.offsetHeight}px`
            )
        })
        observer.observe(node)

        return () => {
            observer.disconnect()
            reset()
        }
    }, [ref])
}

export default useBottomOverlayHeight
