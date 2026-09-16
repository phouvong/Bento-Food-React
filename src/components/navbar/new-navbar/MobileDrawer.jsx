import { useEffect } from 'react'
import {
    Box,
    Divider,
    Drawer,
    Stack,
    Typography,
    useTheme,
} from '@mui/material'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'

import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import { useGetCuisines } from '@/hooks/react-query/cuisines/useGetCuisines'
import { onErrorResponse } from '@/components/ErrorResponse'
import { setCuisines, setPopularRestaurants } from '@/redux/slices/storedData'
import { handleRestaurantRedirect } from '@/utils/customFunctions'
import { RTL } from '@/components/RTL/RTL'

const LIST_LIMIT = 5

const SectionTitle = ({ children }) => (
    <Typography
        sx={{
            fontSize: 16,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.48px',
            color: (theme) => theme.palette.text.primary,
            px: '12px',
            py: '4px',
        }}
    >
        {children}
    </Typography>
)

const ListRow = ({ children, onClick }) => (
    <Box
        onClick={onClick}
        sx={{
            px: '12px',
            py: '8px',
            cursor: 'pointer',
            borderRadius: '4px',
            '&:hover': {
                backgroundColor: (theme) => theme.palette.neutral[200],
            },
        }}
    >
        <Typography
            sx={{
                fontSize: 14,
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: '-0.42px',
                textTransform: 'capitalize',
                color: (theme) => theme.palette.text.primary,
            }}
        >
            {children}
        </Typography>
    </Box>
)

const SeeAllRow = ({ onClick, children }) => (
    <Stack
        direction="row"
        alignItems="center"
        onClick={onClick}
        sx={{
            gap: '6px',
            height: 36,
            px: '12px',
            cursor: 'pointer',
            borderRadius: '8px',
            '&:hover': {
                backgroundColor: (theme) => theme.palette.neutral[200],
            },
        }}
    >
        <Typography
            sx={{
                fontSize: 14,
                fontWeight: 600,
                lineHeight: 1.2,
                letterSpacing: '-0.42px',
                color: (theme) => theme.palette.info.main,
            }}
        >
            {children}
        </Typography>
        <Box
            component="i"
            className="fi fi-rr-angle-small-right"
            sx={{
                fontSize: 16,
                lineHeight: 1,
                display: 'flex',
                color: (theme) => theme.palette.info.main,
            }}
        />
    </Stack>
)

// Left-side drawer (Figma node 586:67309) — logo, Cuisines, Restaurants.
// These sections used to live in the desktop-only NavCuisines/NavResturant
// mega-menus, so on mobile they fetch their own data the same way those
// components do (same hooks, same redux slices).
const MobileDrawer = ({ open, onClose }) => {
    const { t } = useTranslation()
    const theme = useTheme()
    const router = useRouter()
    const dispatch = useDispatch()
    const { global } = useSelector((state) => state.globalSettings)
    const { cuisines, popularRestaurants } = useSelector(
        (state) => state.storedData
    )
    const businessLogo = global?.logo_full_url

    const { data: cuisinesData, refetch: refetchCuisines } = useGetCuisines()
    useEffect(() => {
        if (open && (!cuisines || cuisines.length === 0)) {
            refetchCuisines()
        }
    }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (cuisinesData) {
            dispatch(setCuisines(cuisinesData?.Cuisines))
        }
    }, [cuisinesData, dispatch])

    const { data: restaurantsRes, refetch: refetchRestaurants } = useQuery(
        ['restaurants/populars'],
        () => RestaurantsApi?.popularRestaurants(),
        { enabled: false, staleTime: 1000 * 60 * 8, onError: onErrorResponse }
    )
    useEffect(() => {
        if (open && (!popularRestaurants || popularRestaurants.length === 0)) {
            refetchRestaurants()
        }
    }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (restaurantsRes) {
            dispatch(setPopularRestaurants(restaurantsRes?.data))
        }
    }, [restaurantsRes, dispatch])

    const goHome = () => {
        const hasLocation =
            typeof window !== 'undefined' &&
            Boolean(localStorage.getItem('location'))
        router.push(hasLocation ? '/home' : '/')
        onClose()
    }

    const goCuisine = (item) => {
        router.push({ pathname: `/cuisines/${item?.slug || item?.id}` })
        onClose()
    }

    const goRestaurant = (item) => {
        handleRestaurantRedirect(router, item?.slug, item?.id)
        onClose()
    }

    return (
        <RTL direction={theme.direction}>
        <Drawer
            anchor="left"
            open={open}
            onClose={onClose}
            // The fixed navbar (navbar/index.js) is pinned at zIndex 1200,
            // same as MUI's default drawer z-index — tie the stacking order
            // explicitly instead of leaving it to DOM order.
            sx={{ zIndex: 1300 }}
        >
            <Box sx={{ width: '85vw', maxWidth: 340 }}>
                {/* Header */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ pl: '24px', pr: '16px', pt: '16px', pb: '4px' }}
                >
                    <Box
                        onClick={goHome}
                        sx={{
                            height: 33,
                            display: 'flex',
                            alignItems: 'center',
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
                    <Box
                        onClick={onClose}
                        sx={{
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '9999px',
                            backgroundColor: (theme) =>
                                theme.palette.neutral[200],
                            cursor: 'pointer',
                        }}
                    >
                        <Box
                            component="i"
                            className="fi fi-rr-cross"
                            sx={{
                                fontSize: 13,
                                lineHeight: 1,
                                display: 'flex',
                                color: (theme) => theme.palette.text.primary,
                            }}
                        />
                    </Box>
                </Stack>

                {/* Cuisines */}
                <Box sx={{ px: '12px', py: '16px' }}>
                    <SectionTitle>{t('Cuisines')}</SectionTitle>
                    <Stack sx={{ mt: '4px' }}>
                        {cuisines?.slice(0, LIST_LIMIT)?.map((item) => (
                            <ListRow
                                key={item?.id}
                                onClick={() => goCuisine(item)}
                            >
                                {item?.name}
                            </ListRow>
                        ))}
                    </Stack>
                    {cuisines?.length > 0 && (
                        <SeeAllRow
                            onClick={() => {
                                router.push('/cuisines')
                                onClose()
                            }}
                        >
                            {t('See All')}
                        </SeeAllRow>
                    )}
                </Box>

                <Box sx={{ px: '24px' }}>
                    <Divider
                        sx={{
                            borderColor: (theme) => theme.palette.neutral[200],
                        }}
                    />
                </Box>

                {/* Restaurants */}
                <Box sx={{ px: '12px', py: '16px' }}>
                    <SectionTitle>{t('Restaurants')}</SectionTitle>
                    <Stack sx={{ mt: '4px' }}>
                        {popularRestaurants
                            ?.slice(0, LIST_LIMIT)
                            ?.map((item) => (
                                <ListRow
                                    key={item?.id}
                                    onClick={() => goRestaurant(item)}
                                >
                                    {item?.name}
                                </ListRow>
                            ))}
                    </Stack>
                    {popularRestaurants?.length > 0 && (
                        <SeeAllRow
                            onClick={() => {
                                router.push('/restaurants')
                                onClose()
                            }}
                        >
                            {t('See All')}
                        </SeeAllRow>
                    )}
                </Box>
            </Box>
        </Drawer>
        </RTL>
    )
}

export default MobileDrawer
