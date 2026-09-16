import { useEffect, useState } from 'react'
import { Box, Stack, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import CustomContainer from '@/components/container'
import CustomLanguage from '@/components/CustomLanguage'
import SearchBox from '@/components/home/hero-section-with-search/SearchBox'
import { searchBoxSx } from '@/components/home/hero-section-with-search/searchBoxSx'
import useScrolledPastBand from '@/hooks/custom-hooks/useScrolledPastBand'
import { setNavbarTopRowCollapsed } from '@/components/navbar/navbarOffset'
import NavCuisines from '@/components/navbar/NavCuisines'
import NavResturant from '@/components/navbar/NavResturant'
import AddressReselect from '@/components/navbar/top-navbar/address-reselect/AddressReselect'
import { NAVBAR_HEIGHT, NAVBAR_HEIGHT_MOBILE } from '../navbarConstants'
import NavbarCart from './NavbarCart'
import NavbarProfile from './NavbarProfile'
import MobileDrawer from './MobileDrawer'
import useGetGuest from '@/hooks/react-query/profile/useGetGuest'
import { useWishListGet } from '@/hooks/react-query/config/wish-list/useWishListGet'
import { setWishList } from '@/redux/slices/wishList'
import { getToken } from '@/components/checkout-page/functions/getGuestUserId'

const HIDE_SEARCH_ROUTES = ['/home/[...slug]', '/home/filter', '/category']

const shouldHideSearch = (pathname = '') =>
    HIDE_SEARCH_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    )

// Single-row navbar (Figma node 343:59642).
// Order: logo · Cuisines · Restaurants · location · search · cart · language · profile
const NewNavbar = ({ cartListRefetch }) => {
    const { t } = useTranslation()
    const router = useRouter()
    const theme = useTheme()
    const dispatch = useDispatch()
    const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
    const { global, userLocationUpdate } = useSelector(
        (state) => state.globalSettings
    )
    const { countryCode, language } = useSelector(
        (state) => state.languageChange
    )
    const businessLogo = global?.logo_full_url
    const hideSearch = shouldHideSearch(router.pathname)

    const hideCart = router.pathname === '/checkout'

    // NavCuisines calls setRestaurantModal() on hover.
    const [openRestaurantModal, setOpenRestaurantModal] = useState(false)

    const [userLocation, setUserLocation] = useState(null)

    let zoneid
    let languageDirection
    let guestId
    if (typeof window !== 'undefined') {
        zoneid = localStorage.getItem('zoneid')
        languageDirection = localStorage.getItem('direction')
        guestId = localStorage.getItem('guest_id')
    }

    // Re-read after the map drawer writes a new address.
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setUserLocation(localStorage.getItem('location'))
        }
    }, [userLocationUpdate])

    const {
        data: guestData,
        refetch: guestRefetch,
        isLoading: guestIsLoading,
    } = useGetGuest()

    useEffect(() => {
        if ((!guestId || guestId === 'undefined') && !guestIsLoading) {
            guestRefetch()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (guestData?.guest_id) {
            localStorage.setItem('guest_id', guestData.guest_id)
        }
    }, [guestData])

    const { refetch: wishListRefetch } = useWishListGet((response) =>
        dispatch(setWishList(response))
    )
    useEffect(() => {
        if (getToken()) wishListRefetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const goHome = () => {
        const hasLocation =
            typeof window !== 'undefined' &&
            Boolean(localStorage.getItem('location'))
        router.push(hasLocation ? '/home' : '/')
    }

    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
    const [searchFocused, setSearchFocused] = useState(false)
    const hideTopRow =
        useScrolledPastBand({ hideAt: 120, showAt: 40 }) &&
        router.pathname === '/home'

    useEffect(() => {
        setNavbarTopRowCollapsed(hideTopRow)
    }, [hideTopRow])

    return (
        <Box
            component="header"
            sx={(th) => ({
                background: `linear-gradient(180deg, ${th.palette.background.paper} 0%, ${th.palette.background.paper} 100%)`,
                boxShadow: 'none',
                [th.breakpoints.up('md')]: {
                    background: th.palette.background.paper,
                    boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
                },
            })}
        >
            <CustomContainer>
                {/* Desktop — single row (Figma node 343:59642):
                    logo · Cuisines · Restaurants · location · search · cart · language · profile */}
                <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                        display: { xs: 'none', md: 'flex' },
                        height: `${NAVBAR_HEIGHT}px`,
                        gap: { md: '20px', lg: '32px' },
                    }}
                >
                    {/* 1 — Logo */}
                    <Box
                        onClick={goHome}
                        sx={{
                            height: 33,
                            display: 'flex',
                            alignItems: 'center',
                            flexShrink: 0,
                            cursor: 'pointer',
                        }}
                    >
                        {businessLogo ? (
                            <Box
                                component="img"
                                src={businessLogo}
                                alt="logo"
                                sx={{
                                    height: '100%',
                                    width: 'auto',
                                    maxWidth: 152,
                                    objectFit: 'contain',
                                }}
                            />
                        ) : null}
                    </Box>

                    {/* 2 — Cuisines / Restaurants */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        sx={{ gap: '12px', flexShrink: 0 }}
                    >
                        <NavCuisines
                            languageDirection={languageDirection}
                            setRestaurantModal={setOpenRestaurantModal}
                        />
                        <NavResturant
                            zoneid={zoneid}
                            openModal={openRestaurantModal}
                            setModal={setOpenRestaurantModal}
                            languageDirection={languageDirection}
                        />
                    </Stack>

                    {/* 3 — Location (opens the existing map drawer / modal).
                        Collapses away while the search input is focused so
                        the search box can expand into its space. */}
                    {isMdUp && (
                        <Box
                            sx={{
                                flexShrink: 0,
                                maxWidth: searchFocused ? 0 : 220,
                                minWidth: 0,
                                opacity: searchFocused ? 0 : 1,
                                overflow: 'hidden',
                                transition: (th) =>
                                    th.transitions.create(
                                        ['max-width', 'opacity'],
                                        {
                                            duration: 280,
                                            easing: th.transitions.easing
                                                .easeInOut,
                                        }
                                    ),
                            }}
                        >
                            <AddressReselect location={userLocation} />
                        </Box>
                    )}

                    <Box
                        sx={{
                            width: '100%',
                            display: 'flex',
                            gap: '20px',
                            transition: (th) =>
                                th.transitions.create('gap', {
                                    duration: 280,
                                    easing: th.transitions.easing.easeInOut,
                                }),
                        }}
                    >
                        {/* 4 — Search: fills the remaining space. When hidden
                            the Box stays as a spacer so the cart/language/
                            profile cluster keeps its right alignment. */}
                        <Box
                            sx={{ flex: 1, ...(hideSearch ? {} : searchBoxSx) }}
                        >
                            {!hideSearch && isMdUp && (
                                <SearchBox
                                    query={router.query?.query}
                                    onFocusChange={setSearchFocused}
                                />
                            )}
                        </Box>

                        {/* 5/6/7 — Cart · Language · Profile */}
                        <Stack
                            direction="row"
                            alignItems="center"
                            sx={{ gap: '16px', flexShrink: 0 }}
                        >
                            {!hideCart && <NavbarCart />}

                            <Box
                                sx={{
                                    '& .MuiButton-root': {
                                        height: '36px',
                                        minWidth: 'unset',
                                        padding: '8px 6px 8px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: (th) =>
                                            th.palette.neutral[200],
                                        color: (th) => th.palette.text.primary,
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        letterSpacing: '-0.42px',
                                        '&:hover': {
                                            backgroundColor: (th) =>
                                                th.palette.action.selected,
                                        },
                                    },
                                }}
                            >
                                <CustomLanguage
                                    countryCode={countryCode}
                                    language={language}
                                    noLocation
                                />
                            </Box>

                            <NavbarProfile cartListRefetch={cartListRefetch} />
                        </Stack>
                    </Box>
                </Stack>

                {/* Mobile — two rows (Figma node 586:62105):
                    row 1: hamburger (opens MobileDrawer) · location · cart
                    row 2: search */}
                <Stack
                    sx={{
                        display: { xs: 'flex', md: 'none' },
                        py: '8px',
                        gap: hideTopRow ? 0 : '8px',
                        transition: (th) =>
                            th.transitions.create('gap', {
                                duration: 280,
                                easing: th.transitions.easing.easeInOut,
                            }),
                    }}
                >
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr auto',
                            alignItems: 'center',
                            height: hideTopRow ? 0 : '40px',
                            gap: '8px',
                            opacity: hideTopRow ? 0 : 1,
                            overflow: 'hidden',
                            transition: (th) =>
                                th.transitions.create(['height', 'opacity'], {
                                    duration: 280,
                                    easing: th.transitions.easing.easeInOut,
                                }),
                        }}
                    >
                        <Box
                            onClick={() => setMobileDrawerOpen(true)}
                            aria-label={t('Menu')}
                            sx={{
                                width: 36,
                                height: 36,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                cursor: 'pointer',
                                color: (th) => th.palette.text.primary,
                            }}
                        >
                            <Box
                                component="i"
                                className="fi fi-rr-menu-burger"
                                sx={{
                                    fontSize: 20,
                                    lineHeight: 1,
                                    display: 'flex',
                                }}
                            />
                        </Box>

                        {!isMdUp && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    minWidth: 0,
                                }}
                            >
                                <AddressReselect location={userLocation} />
                            </Box>
                        )}

                        {!hideCart && <NavbarCart />}
                    </Box>

                    {!hideSearch && !isMdUp && (
                        <Box sx={searchBoxSx}>
                            <SearchBox query={router.query?.query} />
                        </Box>
                    )}
                </Stack>
            </CustomContainer>

            <MobileDrawer
                open={mobileDrawerOpen}
                onClose={() => setMobileDrawerOpen(false)}
            />
        </Box>
    )
}

export default NewNavbar
