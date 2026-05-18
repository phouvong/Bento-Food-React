import React, { useEffect, useRef } from 'react'
import CustomShimmerCategories from '../CustomShimmer/CustomShimmerCategories'
import { Grid } from '@mui/material'
import { SliderCustom } from '@/styled-components/CustomStyles.style'
import { t } from 'i18next'
import Slider from 'react-slick'
import { useRouter } from 'next/router'
import { useRecentlyViewRestaurants } from '@/hooks/react-query/recently-view-restaurants/useRecentlyViewRestaurants'
import RestaurantBoxCard from '../restaurant-details/RestaurantBoxCard'
import { useSelector } from 'react-redux'
import { recentlySettings } from './recentlySettings'
import SliderSectionHeader from '@/components/slider-section-header/SliderSectionHeader'

const RecentlyViewRestaurants = () => {
    const router = useRouter()
    const sliderRef = useRef(null)
    const { global } = useSelector((state) => state.globalSettings)
    const { data, isLoading, refetch, isRefetching } =
        useRecentlyViewRestaurants()
    let token = undefined
    if (typeof window != 'undefined') {
        token = localStorage.getItem('token')
    }
    useEffect(() => {
        if (token) {
            refetch()
        }
    }, [token])

    return (
        <>
            {data?.length > 0 && token && (
                <Grid container sx={{ paddingTop: '20px' }}>
                    <Grid item xs={12} md={12}>
                        <SliderSectionHeader
                            title={t('Your Restaurants')}
                            sliderRef={sliderRef}
                            itemsCount={data?.length}
                            viewAllText={t('View all')}
                            onViewAll={() =>
                                router.push('/recently-view-restaurant')
                            }
                            sx={{ px: '10px' }}
                        />
                    </Grid>
                    {data && data?.length > 0 && (
                        <Grid item xs={12} md={12}>
                            <SliderCustom gap="16px">
                                <Slider
                                    {...recentlySettings}
                                    arrows={false}
                                    ref={sliderRef}
                                    className="slick__slider"
                                >
                                    {data?.map((restaurant, index) => {
                                        return (
                                            <RestaurantBoxCard
                                                rating_count={
                                                    restaurant?.rating_count
                                                }
                                                image={restaurant?.logo}
                                                name={restaurant?.name}
                                                rating={restaurant?.avg_rating}
                                                restaurantImageUrl={
                                                    global?.base_urls
                                                        ?.restaurant_image_url
                                                }
                                                id={restaurant?.id}
                                                active={restaurant?.active}
                                                open={restaurant?.open}
                                                restaurantDiscount={
                                                    restaurant?.discount
                                                }
                                                freeDelivery={
                                                    restaurant?.free_delivery
                                                }
                                                key={index}
                                                coupons={restaurant?.coupons}
                                                cuisines={restaurant?.cuisine}
                                                opening_time={
                                                    restaurant?.current_opening_time
                                                }
                                            />
                                        )
                                    })}
                                </Slider>
                            </SliderCustom>
                        </Grid>
                    )}
                </Grid>
            )}
            {isLoading && (
                <CustomShimmerCategories
                    noSearchShimmer="true"
                    itemCount="10"
                    smItemCount="5"
                />
            )}
        </>
    )
}

export default RecentlyViewRestaurants
