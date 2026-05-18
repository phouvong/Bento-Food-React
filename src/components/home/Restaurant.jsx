import { CustomChip } from '@/components/home/Search-filter-tag/FilterTag'
import { AllRestaurantFilterData } from '@/components/home/restaurant/AllRestaurantFilterData'
import { useRestaurantInfiniteList } from '@/hooks/react-query/restaurants/useRestaurantInfiniteList'
import { removeDuplicates } from '@/utils/customFunctions'
import { Box, Stack, Typography, alpha } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { setRestaurantIsSticky } from '@/redux/slices/scrollPosition'
import useHideOnScroll from '@/hooks/custom-hooks/useHideOnScroll'
import noData from '../../../public/static/resturants.png'
import { RTL } from '../RTL/RTL'
import CustomEmptyResult from '../empty-view/CustomEmptyResult'
import NewStoreCard from '@/components/new-store-card/NewStoreCard'
import { mockData } from './mockData'
import DotSpin from './restaurant/DotSpin'
import RestaurantTab from './restaurant/RestaurantTab'

const STICKY_THRESHOLD = 120
const PAGE_LIMIT = 6
const SEARCH_KEY = ' '
const MIN_SCROLL_BETWEEN_FETCHES = 120

const noop = () => {}

const Restaurant = () => {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const isNavHidden = useHideOnScroll({ threshold: 50 })

    const [filterType, setFilterType] = useState('all')
    const [filterByData, setFilterByData] = useState({})
    const [checkedFilterKey, setCheckedFilterKey] = useState(
        AllRestaurantFilterData
    )
    const [forFilter, setForFilter] = useState(false)

    const topSentinelRef = useRef(null)
    const gridRef = useRef(null)
    const bottomSentinelRef = useRef(null)

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useRestaurantInfiniteList({
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

    useEffect(() => {
        let isCurrentlySticky = false
        const handleScroll = () => {
            const el = topSentinelRef.current
            if (!el) return
            const top = el.getBoundingClientRect().top
            const nextSticky = top <= STICKY_THRESHOLD
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
    }, [dispatch])

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
            <Grid container rowGap="1rem">
                <Box id="all-restaurant-tabs" ref={topSentinelRef} />

                <Grid item xs={12}>
                    <Stack spacing={0.5}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                        >
                            <Typography
                                component="h2"
                                sx={{
                                    fontSize: { xs: 16, md: 22 },
                                    fontWeight: { xs: 700, md: 800 },
                                    lineHeight: 1.2,
                                    color: (th) => th.palette.text.primary,
                                    textAlign: 'left',
                                }}
                            >
                                {t('Restaurants')}
                                {totalSize ? (
                                    <Typography
                                        component="span"
                                        sx={{
                                            ml: 1,
                                            fontSize: { xs: 13, md: 15 },
                                            fontWeight: 600,
                                            color: (th) =>
                                                th.palette.text.secondary,
                                        }}
                                    >
                                        ({totalSize})
                                    </Typography>
                                ) : null}
                            </Typography>
                        </Stack>
                        <Typography
                            sx={{
                                fontSize: { xs: 12, md: 13.5 },
                                color: (th) => th.palette.text.secondary,
                            }}
                        >
                            {t(
                                'Browse and filter restaurants to match your vibe.'
                            )}
                        </Typography>
                    </Stack>
                </Grid>

                <Grid
                    item
                    xs={12}
                    sx={{
                        position: 'sticky',
                        top: {
                            xs: '57px',
                            md: isNavHidden ? '58px' : '99px',
                        },
                        transition: 'top 0.25s ease',
                        zIndex: 100,
                        backgroundColor: (th) =>
                            alpha(th.palette.background.default, 0.85),
                        backdropFilter: 'saturate(180%) blur(10px)',
                        WebkitBackdropFilter: 'saturate(180%) blur(10px)',
                        borderBottom: (th) =>
                            `1px solid ${th.palette.divider}`,
                        paddingY: '10px',
                    }}
                >
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
                </Grid>

                {activeFilters.length > 0 && (
                    <Grid item xs={12} sm={12} md={12}>
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
                    container
                    spacing={{ xs: 1.5, sm: 2, md: 2.5 }}
                    ref={gridRef}
                    sx={{
                        minHeight: { xs: '20vh', md: '20vh' },
                        width: '100%',
                        marginInline: 0,
                        '& > .MuiGrid-item': { maxWidth: '100%' },
                    }}
                >
                    {restaurants.map((restaurantData) => (
                        <Grid
                            key={restaurantData?.id}
                            item
                            lg={4}
                            md={4}
                            sm={6}
                            xs={12}
                        >
                            <NewStoreCard
                                restaurant={{
                                    ...restaurantData,
                                    opening_time:
                                        restaurantData?.current_opening_time,
                                }}
                            />
                        </Grid>
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
                            <CustomEmptyResult
                                image={noData}
                                label="No restaurant found"
                            />
                        </Grid>
                    )}
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
