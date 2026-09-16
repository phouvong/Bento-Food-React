import { NAVBAR_HEIGHT_MOBILE } from './navbarConstants'

export const NAVBAR_TOP_ROW_COLLAPSE_PX = 48
export const NAVBAR_MOBILE_TOP_VAR = '--navbar-mobile-top'

let isCollapsed = false

export const getNavbarMobileTopOffset = () =>
    isCollapsed
        ? NAVBAR_HEIGHT_MOBILE - NAVBAR_TOP_ROW_COLLAPSE_PX
        : NAVBAR_HEIGHT_MOBILE

export const setNavbarTopRowCollapsed = (collapsed) => {
    isCollapsed = collapsed
    if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty(
            NAVBAR_MOBILE_TOP_VAR,
            `${getNavbarMobileTopOffset()}px`
        )
    }
}
