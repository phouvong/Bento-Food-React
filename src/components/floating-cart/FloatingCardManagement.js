import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { useDispatch, useSelector } from 'react-redux'
import { Box, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import FloatingCart from './FloatingCart'
import FloatingCartButton from './FloatingCartButton'
import BottomNav from '../navbar/BottomNav'
import { showsBottomNav } from '@/components/navbar/navbarConstants'
import { setCartDrawerOpen } from '@/redux/slices/utils'
import HappyHourBanner from '../home/promotion-offer-banner/HappyHourBanner'
import CashBackPopup from '../cash-back-popup/CashBackPopup'

const AiChatBotLauncher = dynamic(
    () => import('@/components/ai-chatbot/AiChatBotLauncher'),
    { ssr: false }
)

// Floating Happy Hour banner only makes sense where the home feed (and its
// own inline banner) lives — everywhere else it stays hidden.
const HAPPY_HOUR_FLOATING_ROUTES = [
    '/home',
    '/home/[...slug]',
    '/category/[id]',
]

const HAPPY_HOUR_BANNER_BOTTOM = 55
const HAPPY_HOUR_BANNER_HEIGHT = 84
const FLOATING_STACK_BASE = 83
const FLOATING_STACK_GAP = 12
const CASH_BACK_BUTTON_HEIGHT = 50

// CashBackPopup's own desktop `bottom` (its worst-case, i.e. tallest, tier —
// see CustomPopupButtonBox's theme.breakpoints.down('lg') value) plus its
// button size and a gap — used to lift the AI launcher above it on desktop
// so the two floating buttons never overlap. The happy-hour banner doesn't
// factor in here: it only floats on mobile (see the `md: 'none'` below).
const CASH_BACK_DESKTOP_BOTTOM = 73
const CASH_BACK_DESKTOP_BUTTON_SIZE = 72
const AI_LAUNCHER_DEFAULT_DESKTOP_BOTTOM = 53
const FLOATING_STACK_DESKTOP_GAP = 6

const FloatingCardManagement = ({ zoneid }) => {
    const router = useRouter()
    const dispatch = useDispatch()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    // In redux so the navbar cart icon (a sibling tree) can open it too.
    const sideDrawerOpen = useSelector(
        (state) => state.utilsData.cartDrawerOpen
    )

    const { token } = useSelector((state) => state.userToken)
    const { cashbackList } = useSelector((state) => state.cashbackList)
    // Stable identity: FloatingCart uses this in an effect dep array.
    const setSideDrawerOpen = useCallback(
        (value) => dispatch(setCartDrawerOpen(Boolean(value))),
        [dispatch]
    )

    // utilsData is persisted, so clear a stale open flag on mount.
    useEffect(() => {
        dispatch(setCartDrawerOpen(false))
    }, [dispatch])

    const [showBottomNav, setShowBottomNav] = useState(false)
    useEffect(() => {
        zoneid && zoneid.length > 0 && setShowBottomNav(true)
    }, [zoneid])

    const [happyHourActive, setHappyHourActive] = useState(false)
    const isHappyHourRoute = HAPPY_HOUR_FLOATING_ROUTES.includes(
        router.pathname
    )
    const isHomeRoute = router.pathname === '/home'

    const bannerOccupiesStack = isMobile && isHappyHourRoute && happyHourActive
    const showCashBack =
        isHomeRoute && Boolean(token) && cashbackList?.length > 0

    const stackBase = bannerOccupiesStack
        ? HAPPY_HOUR_BANNER_BOTTOM +
          HAPPY_HOUR_BANNER_HEIGHT +
          FLOATING_STACK_GAP
        : FLOATING_STACK_BASE
    const aiLauncherBottom = showCashBack
        ? stackBase + CASH_BACK_BUTTON_HEIGHT + FLOATING_STACK_GAP
        : stackBase
    const aiLauncherDesktopBottom = showCashBack
        ? CASH_BACK_DESKTOP_BOTTOM +
          CASH_BACK_DESKTOP_BUTTON_SIZE +
          FLOATING_STACK_DESKTOP_GAP
        : AI_LAUNCHER_DEFAULT_DESKTOP_BOTTOM

    return (
        <>
            <FloatingCart
                sideDrawerOpen={sideDrawerOpen}
                setSideDrawerOpen={setSideDrawerOpen}
            />
            {isHappyHourRoute && <FloatingCartButton />}
            {isHappyHourRoute && (
                <Box
                    sx={{
                        display: happyHourActive
                            ? { xs: 'block', md: 'none' }
                            : 'none',
                        position: 'fixed',
                        bottom: `${HAPPY_HOUR_BANNER_BOTTOM}px`,
                        left: 0,
                        right: 0,
                        width: '100%',
                        zIndex: 998,
                    }}
                >
                    <HappyHourBanner
                        compact
                        onActiveChange={setHappyHourActive}
                    />
                </Box>
            )}
            {isHomeRoute && Boolean(token) && (
                <CashBackPopup mobileBottom={stackBase} />
            )}
            {isHomeRoute && (
                <AiChatBotLauncher
                    mobileBottom={aiLauncherBottom}
                    desktopBottom={aiLauncherDesktopBottom}
                />
            )}
            {showsBottomNav(router.pathname) && (
                <BottomNav setSideDrawerOpen={setSideDrawerOpen} />
            )}
        </>
    )
}

FloatingCardManagement.propTypes = {}

export default FloatingCardManagement
