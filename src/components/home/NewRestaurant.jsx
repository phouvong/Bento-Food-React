import { Box, Stack, Typography, alpha, styled } from '@mui/material'
import { memo, useEffect, useRef } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import Skeleton from '@mui/material/Skeleton'
import Router from 'next/router'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { setNewRestaurant } from '@/redux/slices/scrollPosition'
import { onErrorResponse } from '../ErrorResponse'
import FoodCardShimmer from '../food-card/FoodCarShimmer'
import NewStoreCard from '@/components/new-store-card/NewStoreCard'
import useScrollSticky from './Search-filter-tag/useScrollSticky'
import SliderSectionHeader from '@/components/slider-section-header/SliderSectionHeader'
import { SLIDE_GAP } from './Banner'

const ScrollRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: SLIDE_GAP,
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollSnapType: 'x mandatory',
    scrollBehavior: 'smooth',
    padding: '4px 2px 0px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
    '& > .scroll-item': {
        flex: '0 0 248px',
        scrollSnapAlign: 'start',
        minWidth: 0,
    },
    [theme.breakpoints.down('sm')]: {
        gap: 12,
        '& > .scroll-item': { flex: '0 0 72%' },
    },
}))

const NewRestaurant = () => {
    const dispatch = useDispatch()
    const { t } = useTranslation()
    const scrollRef = useRef(null)
    const { newOffsetElementRef } = useScrollSticky()

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            dispatch(setNewRestaurant(false))
        }, 1500)
        return () => clearTimeout(timeoutId)
    })

    const { global } = useSelector((state) => state.globalSettings)
    const {
        isLoading,
        data: newRestuarants,
        refetch,
    } = useQuery(
        ['latest-restaurants'],
        () => RestaurantsApi?.latestRestaurants(),
        { enabled: false, onError: onErrorResponse }
    )

    useEffect(() => {
        const apiRefetch = async () => {
            await refetch()
        }
        apiRefetch()
    }, [])

    const handleClick = () => {
        Router.push('/restaurants/latest')
    }

    const scrollByAmount = (dir) => {
        const el = scrollRef.current
        if (!el) return
        el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' })
    }

    const sliderRefShim = {
        current: {
            innerSlider: { props: { slidesToShow: 1 } },
            slickPrev: () => scrollByAmount(-1),
            slickNext: () => scrollByAmount(1),
        },
    }

    const new_on = t('New on')
    const items = newRestuarants?.data ?? []

    if (!isLoading && items.length === 0) return null

    return (
        <Box
            ref={newOffsetElementRef}
            sx={{
                position: 'relative',
            }}
        >
            <SliderSectionHeader
                titleIcon={
                    <Typography
                        sx={{
                            background:
                                'linear-gradient(90deg, #414141 0.02%, #FF8B03 40%, #414141 80%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundSize: '200% auto',
                            animation:
                                'bgPosition 2s ease-in-out infinite alternate',
                            WebkitAnimation:
                                'bgPosition 2s ease-in-out infinite alternate',
                            fontSize: { xs: '16px', md: '22px' },
                            fontWeight: { xs: 700, md: 800 },
                            letterSpacing: '-0.02em',
                            lineHeight: 1.2,
                        }}
                        component="span"
                    >
                        {t(`${new_on} ${global?.business_name}`)}
                    </Typography>
                }
                subtitle={t(
                    'Fresh arrivals — be among the first to try them.'
                )}
                sliderRef={sliderRefShim}
                itemsCount={items.length}
                viewAllText={t('View all')}
                onViewAll={handleClick}
            />

            {isLoading ? (
                <ScrollRow>
                    {[...Array(4)].map((_, i) => (
                        <Box key={i} className="scroll-item">
                            <FoodCardShimmer
                                cardWidth="100%"
                                cardHeight="230px"
                            />
                        </Box>
                    ))}
                </ScrollRow>
            ) : (
                <ScrollRow ref={scrollRef}>
                    {items.map((restaurantData) => (
                        <Box
                            key={restaurantData?.id}
                            className="scroll-item"
                        >
                            <NewStoreCard restaurant={restaurantData} />
                        </Box>
                    ))}
                </ScrollRow>
            )}
        </Box>
    )
}

export default memo(NewRestaurant)
