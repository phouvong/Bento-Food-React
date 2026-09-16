import { CustomChip } from '@/components/home/Search-filter-tag/FilterTag'
import { AllRestaurantFilterData } from '@/components/home/restaurant/AllRestaurantFilterData'
import { useRestaurantInfiniteList } from '@/hooks/react-query/restaurants/useRestaurantInfiniteList'
import { removeDuplicates } from '@/utils/customFunctions'
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { setRestaurantIsSticky } from '@/redux/slices/scrollPosition'
import {
    NAVBAR_HEIGHT,
    NAVBAR_HEIGHT_MOBILE,
} from '@/components/navbar/navbarConstants'
import {
    NAVBAR_MOBILE_TOP_VAR,
    getNavbarMobileTopOffset,
} from '@/components/navbar/navbarOffset'
import noData from '../../../public/static/resturants.png'
import { RTL } from '../RTL/RTL'
import CustomEmptyResult from '../empty-view/CustomEmptyResult'
import NewStoreCard from '@/components/new-store-card/NewStoreCard'
import { SECTION_GUTTER_PX } from '@/components/container/Section'
import { HOME_SECTION_SPACING } from './homeSectionSpacing'
import { mockData } from './mockData'
import DotSpin from './restaurant/DotSpin'
import RestaurantTab from './restaurant/RestaurantTab'

const SPACING = HOME_SECTION_SPACING.restaurant
const PAGE_LIMIT = 6
const SEARCH_KEY = ' '
const MIN_SCROLL_BETWEEN_FETCHES = 120

const noop = () => {}

const Restaurant = () => {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    const restaurantIsSticky = useSelector(
        (state) => state.scrollPosition.restaurantIsSticky
    )

    const [filterType, setFilterType] = useState('all')
    const [filterByData, setFilterByData] = useState({})
    const [checkedFilterKey, setCheckedFilterKey] = useState(
        AllRestaurantFilterData
    )
    const [forFilter, setForFilter] = useState(false)

    const stickyHeaderRef = useRef(null)
    const gridRef = useRef(null)
    const bottomSentinelRef = useRef(null)

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        useRestaurantInfiniteList({
            filterByData,
            filterType,
            searchKey: SEARCH_KEY,
            pageLimit: PAGE_LIMIT,
        })

    const fetchNextPageRef = useRef(fetchNextPage)
    fetchNextPageRef.current = fetchNextPage
    const isFetchingNextPageRef = useRef(isFetchingNextPage)
    isFetchingNextPageRef.current = isFetchingNextPage
    const hasNextPageRef = useRef(hasNextPage)
    hasNextPageRef.current = hasNextPage
    const lastFetchScrollYRef = useRef(0)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const sentinelInView = (node) => {
            const rect = node.getBoundingClientRect()
            return rect.top <= window.innerHeight && rect.bottom >= 0
        }

        const tryFetchNext = () => {
            if (!hasNextPageRef.current) return
            if (isFetchingNextPageRef.current) return
            const node = bottomSentinelRef.current
            if (!node || !sentinelInView(node)) return
            const canScroll =
                document.documentElement.scrollHeight > window.innerHeight
            if (
                canScroll &&
                window.scrollY <
                    lastFetchScrollYRef.current + MIN_SCROLL_BETWEEN_FETCHES
            ) {
                return
            }
            lastFetchScrollYRef.current = window.scrollY
            fetchNextPageRef.current()
        }

        let raf = 0
        const onScroll = () => {
            if (raf) return
            raf = window.requestAnimationFrame(() => {
                raf = 0
                tryFetchNext()
            })
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', onScroll)
            if (raf) window.cancelAnimationFrame(raf)
        }
    }, [])

    useEffect(() => {
        lastFetchScrollYRef.current = 0
    }, [filterType, filterByData])

    useEffect(() => {
        if (typeof window === 'undefined') return
        if (!hasNextPage || isFetchingNextPage) return
        const node = bottomSentinelRef.current
        if (!node) return
        if (document.documentElement.scrollHeight > window.innerHeight) return
        const rect = node.getBoundingClientRect()
        if (rect.top > window.innerHeight) return
        fetchNextPageRef.current()
    }, [data, hasNextPage, isFetchingNextPage])

    // A stuck element's rect.top equals its `top`, so this reads "is pinned".
    useEffect(() => {
        let isCurrentlySticky = false
        const handleScroll = () => {
            const el = stickyHeaderRef.current
            if (!el) return
            const stickyTopPx = isSmall
                ? getNavbarMobileTopOffset()
                : NAVBAR_HEIGHT
            const nextSticky = el.getBoundingClientRect().top <= stickyTopPx + 1
            if (nextSticky !== isCurrentlySticky) {
                isCurrentlySticky = nextSticky
                dispatch(setRestaurantIsSticky(nextSticky))
            }
        }
        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', handleScroll)
            dispatch(setRestaurantIsSticky(false))
        }
    }, [dispatch, isSmall])

    const totalSize = data?.pages?.[0]?.total_size ?? 0

    const restaurants = useMemo(() => {
        const flat = (data?.pages ?? []).flatMap(
            (page) => page?.restaurants ?? []
        )
        return removeDuplicates(flat, 'id')
    }, [data])

    const activeFilters = useMemo(
        () => checkedFilterKey?.filter((item) => item?.isActive) ?? [],
        [checkedFilterKey]
    )

    const scrollToSection5 = () => {
        if (!gridRef.current) return
        if ((data?.pages?.length ?? 0) > 1) {
            window.scrollTo({
                top: gridRef.current.offsetTop - 500,
                behavior: 'smooth',
            })
        }
    }

    const handleChange = (_event, newValue) => {
        setFilterType(newValue)
        setForFilter(true)
        scrollToSection5()
    }

    const handleDelete = (itemId) => {
        setCheckedFilterKey((prev) =>
            prev.map((item) =>
                item?.id === itemId ? { ...item, isActive: false } : item
            )
        )
    }

    const languageDirection =
        typeof window !== 'undefined'
            ? window.localStorage.getItem('direction')
            : null

    const showEmpty =
        !isLoading &&
        !isFetchingNextPage &&
        restaurants.length === 0 &&
        totalSize === 0

    return (
        <RTL direction={languageDirection}>
            <Grid
                container
                rowGap={0}
                // sx={{
                //     pb: SPACING.pb,
                //     background: {
                //         xs: theme.palette.background.paper,
                //         md: 'transparent',
                //     },
                // }}
                sx={(theme) => ({
                    pb: SPACING.pb,
                    background: {
                        xs: theme.palette.background.paper,
                        md: 'transparent',
                    },
                })}
            >
                <Box id="all-restaurant-tabs" />

                {/* Sticky sits on the Grid item, whose parent spans the whole
                    list — the inner Stack has no room to travel. */}
                <Grid
                    item
                    xs={12}
                    ref={stickyHeaderRef}
                    sx={(theme) => ({
                        position: 'sticky',
                        top: {
                            xs: `var(${NAVBAR_MOBILE_TOP_VAR}, ${NAVBAR_HEIGHT_MOBILE}px)`,
                            md: `${NAVBAR_HEIGHT}px`,
                        },
                        zIndex: 99,
                        backgroundColor: {
                            xs: theme.palette.background.paper,
                            md: theme.palette.neutral[1800],
                        },
                        pl: SECTION_GUTTER_PX,
                        pt: restaurantIsSticky && isSmall ? '10px' : SPACING.pt,
                        pb: SPACING.headerGap,
                        borderBottom: restaurantIsSticky
                            ? `1px solid ${theme.palette.divider}`
                            : 'none',

                        transition:
                            'top 0.25s ease, border-color 0.2s ease, padding-top 0.25s ease',
                    })}
                >
                    <Stack
                        sx={{
                            width: '100%',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: { xs: 'flex-start', md: 'center' },
                            justifyContent: {
                                xs: 'flex-start',
                                md: 'space-between',
                            },
                            gap: { xs: 1.5, md: 2 },
                        }}
                    >
                        <Typography
                            component="h2"
                            sx={{
                                fontSize: { xs: 20, md: 32 },
                                fontWeight: 700,
                                lineHeight: 1.1,
                                letterSpacing: '-0.64px',
                                color: (th) => th.palette.text.primary,
                                textAlign: 'left',
                                flexShrink: 0,
                                display: {
                                    xs: restaurantIsSticky ? 'none' : 'block',
                                    md: 'block',
                                },
                            }}
                        >
                            {t('Explore Restaurants')}
                        </Typography>

                        <RestaurantTab
                            filterType={filterType}
                            handleChange={handleChange}
                            mockData={mockData}
                            setFilterByData={setFilterByData}
                            setOffSet={noop}
                            setForFilter={setForFilter}
                            forFilter={forFilter}
                            scrollToSection5={scrollToSection5}
                            checkedFilterKey={checkedFilterKey}
                            setCheckedFilterKey={setCheckedFilterKey}
                        />
                    </Stack>
                </Grid>

                {activeFilters.length > 0 && (
                    <Grid
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        sx={{ px: SECTION_GUTTER_PX, mb: '16px' }}
                    >
                        {activeFilters.map((item, i) => (
                            <CustomChip
                                key={`${item?.name}-${i}`}
                                label={item?.name}
                                variant="outlined"
                                onDelete={() => handleDelete(item?.id)}
                                sx={{
                                    marginRight: '1rem',
                                    '&:hover': {
                                        color: (theme) =>
                                            theme.palette.neutral[1000],
                                    },
                                    '& .MuiChip-deleteIcon': {
                                        marginRight: '0px',
                                        marginLeft: '4px',
                                        color: '#a7a7a7 !important',
                                    },
                                }}
                            />
                        ))}
                    </Grid>
                )}

                <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    sx={{ px: SECTION_GUTTER_PX }}
                >
                    <Box
                        ref={gridRef}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, 1fr)',
                                md: 'repeat(3, 1fr)',
                            },
                            columnGap: SPACING.gridColGap,
                            rowGap: SPACING.gridRowGap,
                            minHeight: { xs: '20vh', md: '20vh' },
                            width: '100%',
                        }}
                    >
                        {restaurants.map((restaurantData) => (
                            <NewStoreCard
                                key={restaurantData?.id}
                                restaurant={{
                                    ...restaurantData,
                                    opening_time:
                                        restaurantData?.current_opening_time,
                                }}
                            />
                        ))}

                        <Box
                            ref={bottomSentinelRef}
                            aria-hidden
                            sx={{
                                gridColumn: '1 / -1',
                                width: '100%',
                                height: '1px',
                            }}
                        />

                        {showEmpty && (
                            <Box
                                sx={{
                                    gridColumn: '1 / -1',
                                    paddingBlockEnd: '30px',
                                    paddingBlockStart: '30px',
                                }}
                            >
                                <CustomEmptyResult
                                    image={noData}
                                    label="No restaurant found"
                                />
                            </Box>
                        )}
                    </Box>
                </Grid>

                {isFetchingNextPage && (
                    <Grid
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        sx={{
                            paddingBlockEnd: '30px',
                            paddingBlockStart: '30px',
                        }}
                    >
                        <Stack sx={{ minHeight: { xs: '20vh', md: '30vh' } }}>
                            <DotSpin />
                        </Stack>
                    </Grid>
                )}

                {isLoading && !isFetchingNextPage && (
                    <Grid
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        sx={{
                            paddingBlockEnd: '30px',
                            paddingBlockStart: '30px',
                        }}
                    >
                        <Stack sx={{ minHeight: { xs: '20vh', md: '30vh' } }}>
                            <DotSpin />
                        </Stack>
                    </Grid>
                )}
            </Grid>
        </RTL>
    )
}

export default Restaurant
