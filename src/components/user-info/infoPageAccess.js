export const GUEST_ACCESSIBLE_PAGES = ['settings']

export const isGuestAccessiblePage = (page) =>
    GUEST_ACCESSIBLE_PAGES.includes(String(page ?? '').split('?')[0])
