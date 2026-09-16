// Navbar height — imported by anything that pins below it.
export const NAVBAR_HEIGHT = 64
export const NAVBAR_HEIGHT_MOBILE = 103

export const BOTTOM_NAV_CONTENT_HEIGHT = 64
export const BOTTOM_NAV_HEIGHT_CSS_VAR = '--bottom-nav-height'
export const BOTTOM_NAV_HEIGHT_VAR = `var(${BOTTOM_NAV_HEIGHT_CSS_VAR})`

export const BOTTOM_OVERLAY_HEIGHT_CSS_VAR = '--bottom-overlay-height'
export const BOTTOM_OVERLAY_HEIGHT_VAR = `var(${BOTTOM_OVERLAY_HEIGHT_CSS_VAR}, 0px)`

const NO_BOTTOM_NAV_ROUTES = ['/', '/checkout', '/chat', '/restaurants/[id]']

export const showsBottomNav = (pathname) =>
    !NO_BOTTOM_NAV_ROUTES.includes(pathname)

const MOBILE_PAGE_HEADER_ROUTES = [
    '/home/filter',
    '/home/[...slug]',
    '/category/[id]',
    '/search',
    '/info',
    '/checkout',
    '/restaurants',
    '/restaurants/[id]',
    '/cuisines',
    '/cuisines/[id]',
    '/bogo-list',
    '/tracking',
    '/restaurant-registration-landing',
]

export const usesMobilePageHeader = (pathname) =>
    MOBILE_PAGE_HEADER_ROUTES.includes(pathname)
