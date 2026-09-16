import { Box, styled } from '@mui/material'
import { memo, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import QuickDeliveryBoltIcon from './QuickDeliveryBoltIcon'
import useDragScroll from '@/hooks/useDragScroll'
import { useQuickDeliveryRestaurants } from '@/hooks/react-query/restaurants/useQuickDeliveryRestaurants'
import FoodCardShimmer from '@/components/food-card/FoodCarShimmer'
import NewStoreCard from '@/components/new-store-card/NewStoreCard'
import SliderSectionHeader from '@/components/slider-section-header/SliderSectionHeader'
import { SECTION_GUTTER_PX } from '@/components/container/Section'
import { SLIDE_GAP } from '../Banner'
import { HOME_SECTION_SPACING } from '../homeSectionSpacing'

const SPACING = HOME_SECTION_SPACING.quickDelivery

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

const QuickDelivery = () => {
    const { t } = useTranslation()
    const dragScroll = useDragScroll()
    const scrollRef = dragScroll.ref

    const { isLoading, data, refetch } = useQuickDeliveryRestaurants()

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

    const items = useMemo(
        () =>
            (data?.restaurants ?? []).map((restaurant) => ({
                ...restaurant,
                is_express: true,
            })),
        [data]
    )

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
                title={t('Quick Delivery')}
                titleIcon={
                    <QuickDeliveryBoltIcon
                        sx={{
                            color: (theme) => theme.palette.info.main,
                        }}
                        size={{ xs: 18, md: 22 }}
                    />
                }
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
                            <NewStoreCard restaurant={restaurantData} />
                        </Box>
                    ))}
                </ScrollRow>
            )}
        </Box>
    )
}

export default memo(QuickDelivery)
