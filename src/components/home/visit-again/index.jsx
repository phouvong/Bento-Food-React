import { useRecentlyViewRestaurantsOnSuccess } from '@/hooks/react-query/recently-view-restaurants/useRecentlyViewRestaurants'
import { useOrderAgainRestaurants } from '@/hooks/react-query/wanna-try-again/useOrderAgainRestaurants'
import { useRecommendedRestaurant } from '@/hooks/react-query/wanna-try-again/useRecommendedRestaurant'
import { Box, styled } from '@mui/material'
import { t } from 'i18next'
import { memo, useEffect, useRef, useState } from 'react'
import { getToken } from '../../checkout-page/functions/getGuestUserId'
import FoodCardShimmer from '../../food-card/FoodCarShimmer'
import NewStoreCard from '@/components/new-store-card/NewStoreCard'
import SliderSectionHeader from '@/components/slider-section-header/SliderSectionHeader'
import { SLIDE_GAP } from '../Banner'

export const Puller = styled('div')(({ theme }) => ({
    width: '80px',
    height: '4px',
    backgroundColor: theme.palette.neutral[400],
    borderRadius: 3,
    position: 'absolute',
    top: 20,
}))

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

const VisitAgain = () => {
    const scrollRef = useRef(null)
    const token = getToken()
    const [userData, setUserData] = useState(null)
    const [text, setText] = useState({
        title: t('Visit Again!'),
        subTitle: t('Get your desired item from your recent visit!'),
    })

    const handleSuccess1 = (response) => {
        setUserData(response)
        if (response?.length === 0) recentlyRefetch()
        setText({
            title: t('Wanna Try  Again!'),
            subTitle: t(
                'Get your recent food from the restaurant you recently visited'
            ),
        })
    }
    const handleSuccess2 = (response) => {
        setUserData(response)
        if (response?.length === 0) refetchRecommended()
        setText({
            title: t('Let’s Try Something New'),
            subTitle: t('Our Latest Recommendations Just for You!'),
        })
    }
    const handleSuccess3 = (response) => {
        setUserData(response)
        if (response?.length === 0) refetchRecommended()
        setText({
            title: t('Visit  Again!'),
            subTitle: t('Get your desired item from your recent visit!'),
        })
    }
    const { isLoading, refetch } = useOrderAgainRestaurants(handleSuccess1)
    const { isLoading: isloadingRecommended, refetch: refetchRecommended } =
        useRecommendedRestaurant(handleSuccess2)
    const { isLoading: isLoadingRecent, refetch: recentlyRefetch } =
        useRecentlyViewRestaurantsOnSuccess(handleSuccess3)

    useEffect(() => {
        if (token) refetch()
        else refetchRecommended()
    }, [token])

    const scrollByAmount = (dir) => {
        const el = scrollRef.current
        if (!el) return
        const step = el.clientWidth * 0.9
        el.scrollBy({ left: dir * step, behavior: 'smooth' })
    }

    const sliderRefShim = {
        current: {
            innerSlider: { props: { slidesToShow: 1 } },
            slickPrev: () => scrollByAmount(-1),
            slickNext: () => scrollByAmount(1),
        },
    }

    const loading = isLoading || isLoadingRecent || isloadingRecommended

    if (!userData?.length && !loading) return null

    return (
        <Box>
            <SliderSectionHeader
                title={text?.title}
                subtitle={text?.subTitle}
                sliderRef={sliderRefShim}
                itemsCount={userData?.length}
            />

            {loading ? (
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
                    {userData?.map((restaurantData) => (
                        <Box
                            key={restaurantData?.id}
                            className="scroll-item"
                        >
                            <NewStoreCard
                                restaurant={{
                                    ...restaurantData,
                                    opening_time:
                                        restaurantData?.current_opening_time,
                                }}
                            />
                        </Box>
                    ))}
                </ScrollRow>
            )}
        </Box>
    )
}

export default memo(VisitAgain)
