import { useEffect, useRef, useState } from 'react'

const useHideOnScroll = ({ threshold = 50 } = {}) => {
    const [isHidden, setIsHidden] = useState(false)
    const lastScrollYRef = useRef(0)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            const scrollingDown = currentScrollY > lastScrollYRef.current
            const shouldHide = scrollingDown && currentScrollY > threshold

            setIsHidden(shouldHide)
            lastScrollYRef.current = currentScrollY
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [threshold])

    return isHidden
}

export default useHideOnScroll
