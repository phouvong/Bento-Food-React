import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { Avatar, Box, Stack, Typography, alpha, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import AuthModal from '@/components/auth'
import { getToken } from '@/components/checkout-page/functions/getGuestUserId'
import { AccountPopover } from '@/components/navbar/AccountPopover'
import { BOTTOM_NAV_HEIGHT_VAR } from '@/components/navbar/navbarConstants'
import useBottomOverlayHeight from '@/hooks/custom-hooks/useBottomOverlayHeight'

const TABS = [
    {
        key: 'home',
        label: 'Home',
        href: '/home',
        icon: 'fi-rr-home',
        activeIcon: 'fi-sr-home',
        matches: ['/home', '/'],
        requireAuth: false,
    },
    {
        key: 'orders',
        label: 'Orders',
        href: { pathname: '/info', query: { page: 'order' } },
        icon: 'fi-rr-receipt',
        activeIcon: 'fi-sr-receipt',
        matches: [],
        requireAuth: true,
    },
    {
        key: 'favourite',
        label: 'Favourite',
        href: { pathname: '/info', query: { page: 'wishlist' } },
        icon: 'fi-rr-heart',
        activeIcon: 'fi-sr-heart',
        matches: [],
        requireAuth: true,
    },
]

const ICON_SIZE = 22
const AVATAR_SIZE = 22
const SLOT_SIZE = 26

const BottomNav = ({ cartListRefetch }: { cartListRefetch?: () => void }) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const router = useRouter()
    const { userData } = useSelector((state: any) => state.user)

    const token = getToken()
    const profileRef = useRef<HTMLDivElement | null>(null)
    const navRef = useRef<HTMLDivElement | null>(null)
    useBottomOverlayHeight(navRef)
    const [openPopover, setOpenPopover] = useState(false)
    const [authModalOpen, setAuthModalOpen] = useState(false)
    const [modalFor, setModalFor] = useState('sign-in')

    const activeKey = useMemo(() => {
        if (router.pathname === '/info') {
            if (router.query?.page === 'wishlist') return 'favourite'
            if (router.query?.page === 'order') return 'orders'
            return 'profile'
        }
        const found = TABS.find((tab) =>
            tab.matches.some(
                (path) =>
                    router.pathname === path ||
                    router.pathname?.startsWith(`${path}/`)
            )
        )
        return found?.key
    }, [router.pathname, router.query?.page])

    const firstName =
        userData?.f_name || userData?.name?.split(' ')?.[0] || t('User')

    const openAuthModal = () => {
        setModalFor('sign-in')
        setAuthModalOpen(true)
    }

    const handleTabClick = (tab: typeof TABS[number]) => {
        if (tab.requireAuth && !token) {
            openAuthModal()
            return
        }
        router.push(tab.href)
    }

    const handleProfileClick = () => {
        if (!token) {
            openAuthModal()
            return
        }
        setOpenPopover(true)
    }

    const activeColor = theme.palette.primary.main
    const idleColor = theme.palette.text.secondary

    const renderIndicator = (isActive: boolean) =>
        isActive ? (
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 30,
                    height: 4,
                    borderRadius: '0 0 5px 5px',
                    backgroundColor: 'primary.main',
                }}
            />
        ) : null

    const renderLabel = (label: string, isActive: boolean) => (
        <Typography
            component="span"
            sx={{
                fontSize: { xs: '12px', sm: '13px' },
                fontWeight: isActive ? 700 : 500,
                lineHeight: 1.2,
                letterSpacing: '-0.2px',
                color: isActive ? activeColor : idleColor,
                whiteSpace: 'nowrap',
                transition: 'color .2s ease',
            }}
        >
            {t(label)}
        </Typography>
    )

    const iconSlotSx = {
        height: SLOT_SIZE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    } as const

    const itemSx = {
        flex: 1,
        minWidth: 0,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        py: 1,
        cursor: 'pointer',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        '&:active': { opacity: 0.7 },
    } as const

    return (
        <>
            <Box
                ref={navRef}
                className="bottom-navigation-wrap"
                sx={{
                    display: { xs: 'block', md: 'none' },
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 999,
                    backgroundColor: 'background.paper',
                    borderRadius: '20px 20px 0 0',
                    overflow: 'hidden',
                    borderTop: `1px solid ${alpha(
                        theme.palette.text.primary,
                        0.06
                    )}`,
                    boxShadow: `0px -6px 24px ${alpha(
                        theme.palette.text.primary,
                        0.1
                    )}`,
                    px: 0.5,
                    height: BOTTOM_NAV_HEIGHT_VAR,
                    boxSizing: 'border-box',
                }}
            >
                <Stack direction="row" alignItems="stretch" height="100%">
                    {TABS.map((tab) => {
                        const isActive = activeKey === tab.key
                        return (
                            <Box
                                key={tab.key}
                                role="button"
                                tabIndex={0}
                                aria-current={isActive ? 'page' : undefined}
                                onClick={() => handleTabClick(tab)}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === 'Enter' ||
                                        event.key === ' '
                                    ) {
                                        event.preventDefault()
                                        handleTabClick(tab)
                                    }
                                }}
                                sx={itemSx}
                            >
                                {renderIndicator(isActive)}
                                <Box sx={iconSlotSx}>
                                    <Box
                                        component="i"
                                        className={`fi ${
                                            isActive ? tab.activeIcon : tab.icon
                                        }`}
                                        sx={{
                                            fontSize: `${ICON_SIZE}px`,
                                            display: 'flex',
                                            lineHeight: 1,
                                            color: isActive
                                                ? activeColor
                                                : idleColor,
                                            transition: 'color .2s ease',
                                        }}
                                    />
                                </Box>
                                {renderLabel(tab.label, isActive)}
                            </Box>
                        )
                    })}

                    <Box
                        ref={profileRef}
                        role="button"
                        tabIndex={0}
                        aria-current={
                            activeKey === 'profile' ? 'page' : undefined
                        }
                        onClick={handleProfileClick}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                handleProfileClick()
                            }
                        }}
                        sx={itemSx}
                    >
                        {renderIndicator(activeKey === 'profile')}
                        <Box
                            sx={{
                                ...iconSlotSx,
                                width: SLOT_SIZE,
                                borderRadius: '50%',
                                border:
                                    activeKey === 'profile'
                                        ? `2px solid ${activeColor}`
                                        : '2px solid transparent',
                                transition: 'border-color .2s ease',
                            }}
                        >
                            {token && userData?.image_full_url ? (
                                <Avatar
                                    alt={firstName}
                                    src={userData.image_full_url}
                                    sx={{
                                        width: AVATAR_SIZE,
                                        height: AVATAR_SIZE,
                                    }}
                                />
                            ) : (
                                <Box
                                    component="i"
                                    className={`fi ${
                                        activeKey === 'profile'
                                            ? 'fi-sr-circle-user'
                                            : 'fi-rr-circle-user'
                                    }`}
                                    sx={{
                                        fontSize: `${ICON_SIZE}px`,
                                        display: 'flex',
                                        lineHeight: 1,
                                        color:
                                            activeKey === 'profile'
                                                ? activeColor
                                                : idleColor,
                                    }}
                                />
                            )}
                        </Box>
                        {renderLabel('Profile', activeKey === 'profile')}
                    </Box>
                </Stack>
            </Box>

            <AccountPopover
                anchorEl={profileRef.current}
                open={openPopover}
                onClose={() => setOpenPopover(false)}
                cartListRefetch={cartListRefetch}
                token={token}
                onSignInClick={openAuthModal}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                slotProps={{
                    paper: {
                        sx: {
                            width: 300,
                            maxWidth: 'calc(100vw - 24px)',
                            mt: '-10px',
                            p: '12px',
                            borderRadius: '12px',
                            boxShadow: `0px 16px 32px ${alpha(
                                theme.palette.text.primary,
                                0.15
                            )}`,
                        },
                    },
                }}
            />
            <AuthModal
                cartListRefetch={cartListRefetch}
                open={authModalOpen}
                modalFor={modalFor}
                setModalFor={setModalFor}
                signInSuccess={() => setAuthModalOpen(false)}
                handleClose={() => {
                    setAuthModalOpen(false)
                    setModalFor('sign-in')
                }}
            />
        </>
    )
}

export default BottomNav
