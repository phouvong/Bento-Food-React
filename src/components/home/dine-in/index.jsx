import { Box, styled } from '@mui/material'
import { memo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import useDragScroll from '@/hooks/useDragScroll'
import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import { onErrorResponse } from '@/components/ErrorResponse'
import FoodCardShimmer from '@/components/food-card/FoodCarShimmer'
import NewStoreCard from '@/components/new-store-card/NewStoreCard'
import SliderSectionHeader from '@/components/slider-section-header/SliderSectionHeader'
import { SECTION_GUTTER_PX } from '@/components/container/Section'
import { SLIDE_GAP } from '../Banner'
import { HOME_SECTION_SPACING } from '../homeSectionSpacing'

const SPACING = HOME_SECTION_SPACING.dineIn

const ScrollRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: SLIDE_GAP,
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollSnapType: 'x mandatory',
    scrollBehavior: 'smooth',
    padding: '0px 2px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
    '& > .scroll-item': {
        flex: '0 0 300px',
        scrollSnapAlign: 'start',
        minWidth: 0,
    },
    [theme.breakpoints.down('sm')]: {
        gap: 12,
        '& > .scroll-item': { flex: '0 0 300px' },
    },
}))

const DineIn = () => {
    const { t } = useTranslation()
    const dragScroll = useDragScroll()
    const scrollRef = dragScroll.ref

    const {
        isLoading,
        data: newRestuarants,
        refetch,
    } = useQuery(
        ['dine_in_restaurants'],
        () => RestaurantsApi?.dine_in_restaurants(),
        { enabled: false, onError: onErrorResponse }
    )

    useEffect(() => {
        refetch()
    }, [])

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

    const items = newRestuarants?.data?.restaurants ?? []

    if (!isLoading && items.length === 0) return null

    return (
        <Box
            sx={{
                position: 'relative',
                pl: SECTION_GUTTER_PX,
                pt: SPACING.pt,
                pb: SPACING.pb,
            }}
        >
            <SliderSectionHeader
                title={t('Dine-in Restaurants')}
                sliderRef={sliderRefShim}
                scrollElRef={scrollRef}
                itemsCount={items.length}
                sx={{ mb: SPACING.headerGap }}
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
                <ScrollRow {...dragScroll} sx={{ cursor: 'grab' }}>
                    {items.map((restaurantData) => (
                        <Box key={restaurantData?.id} className="scroll-item">
                            <NewStoreCard
                                restaurant={restaurantData}
                                isNewStore
                            />
                        </Box>
                    ))}
                </ScrollRow>
            )}
        </Box>
    )
}

export default memo(DineIn)
