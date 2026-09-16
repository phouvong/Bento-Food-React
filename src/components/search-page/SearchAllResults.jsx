import React, { useRef } from 'react'
import { Box, Stack } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { SliderCustom } from '@/styled-components/CustomStyles.style'
import Slider from '@/components/slider/SlickToSwiper'
import SliderSectionHeader from '@/components/slider-section-header/SliderSectionHeader'
import NewFoodCard from '@/components/new-food-card/NewFoodCard'
import NewStoreCard from '@/components/new-store-card/NewStoreCard'
import SearchResultRestaurantsCard from '@/components/search-result-restaurants-card/SearchResultRestaurantsCard'
import CustomEmptyResult from '../empty-view/CustomEmptyResult'
import CardGridShimmer from '../type-wise-restaurant-page/CardGridShimmer'
import FoodCardSkeleton from '../type-wise-restaurant-page/FoodCardSkeleton'
import RestaurantCardSkeleton from '../type-wise-restaurant-page/RestaurantCardSkeleton'
import { sectionTitleSx } from './SectionTitle'
import { FOOD_GRID_SIZES, isRenderableProduct } from './SearchFoodResults'
import { RESTAURANT_GRID_SIZES } from './SearchRestaurantResults'

// The All tab is a preview only — the Foods/Restaurants tabs are where the full
// paginated lists live, so each row is capped at the first page's worth.
const PREVIEW_LIMIT = 20

const foodSliderSettings = {
    dots: false,
    infinite: false,
    speed: 400,
    slidesToShow: 5,
    responsive: [
        { breakpoint: 1200, settings: { slidesToShow: 4.2 } },
        { breakpoint: 900, settings: { slidesToShow: 3.2 } },
        { breakpoint: 600, settings: { slidesToShow: 2.2 } },
    ],
}

const restaurantSliderSettings = {
    dots: false,
    infinite: false,
    speed: 400,
    slidesToShow: 3,
    responsive: [
        { breakpoint: 900, settings: { slidesToShow: 2.2 } },
        { breakpoint: 600, settings: { slidesToShow: 1.2 } },
    ],
}

// SearchResultRestaurantsCard is wider (carries a menu-item preview row), so
// it needs fewer slides in view than the plain NewStoreCard row above. Uses a
// 24px gap (vs. the 16px elsewhere), so slidesToShow is tuned separately to
// keep the same partial-next-card peek at each breakpoint.
const restaurantsListSliderSettings = {
    dots: false,
    infinite: false,
    speed: 400,
    slidesToShow: 3.2,
    responsive: [
        { breakpoint: 900, settings: { slidesToShow: 1.6 } },
        { breakpoint: 600, settings: { slidesToShow: 1.1 } },
    ],
}

// "All" tab (Figma node 254:81005): a preview slider of matching foods, an
// offers strip for restaurants running a discount/coupon, then matching
// restaurants. SliderSectionHeader supplies the prev/next arrows and hides
// them by itself once the row no longer overflows.
const SearchAllResults = ({
    foods = [],
    restaurants = [],
    foodLoading,
    restaurantLoading,
    exclusiveDeals = [],
    exclusiveDealsLoading,
}) => {
    const { t } = useTranslation()
    const { global } = useSelector((state) => state.globalSettings)
    const foodSliderRef = useRef(null)
    const offerSliderRef = useRef(null)
    const restaurantSliderRef = useRef(null)

    const previewFoods = foods
        .filter(isRenderableProduct)
        .slice(0, PREVIEW_LIMIT)
    const previewRestaurants = restaurants.slice(0, PREVIEW_LIMIT)

    // A section is dropped entirely once its query settles with nothing to
    // show — a bare title and arrow pair over empty space reads as broken when
    // the other section did return results.
    const showFoods = foodLoading || previewFoods.length > 0
    const showRestaurants = restaurantLoading || previewRestaurants.length > 0
    const showExclusiveDeals =
        exclusiveDealsLoading || exclusiveDeals.length > 0

    const isLoading = foodLoading || restaurantLoading || exclusiveDealsLoading
    // Exclusive deals aren't filtered by the search query, so it can still
    // have cards to show even when foods/restaurants found nothing — only
    // treat the page as empty once every section, deals included, is empty.
    const isEmpty =
        !isLoading &&
        previewFoods.length === 0 &&
        previewRestaurants.length === 0 &&
        exclusiveDeals.length === 0

    if (isEmpty) {
        return <CustomEmptyResult label="No result found" />
    }

    return (
        <Stack gap={{ xs: '20px', md: '32px' }}>
            {showFoods && (
                <Box>
                    <SliderSectionHeader
                        title={t('Foods')}
                        titleSx={sectionTitleSx}
                        sliderRef={foodSliderRef}
                        itemsCount={previewFoods.length}
                        showArrows={!foodLoading}
                        sx={{ mb: { xs: '16px', md: '24px' } }}
                    />
                    {foodLoading ? (
                        <CardGridShimmer
                            CardSkeleton={FoodCardSkeleton}
                            gridSizes={FOOD_GRID_SIZES}
                            count={5}
                        />
                    ) : (
                        <SliderCustom gap="16px">
                            <Slider
                                {...foodSliderSettings}
                                gap="16px"
                                arrows={false}
                                ref={foodSliderRef}
                                className="slick__slider"
                            >
                                {previewFoods.map((product) => (
                                    <NewFoodCard
                                        key={product?.id}
                                        product={product}
                                        productImageUrl={
                                            global?.base_urls?.product_image_url
                                        }
                                    />
                                ))}
                            </Slider>
                        </SliderCustom>
                    )}
                </Box>
            )}

            {showExclusiveDeals && (
                <Box
                    sx={{
                        backgroundColor: (theme) =>
                            theme.palette.offerSection.bg,
                        borderRadius: '16px',
                        p: { xs: '16px', md: '24px' },
                    }}
                >
                    <SliderSectionHeader
                        title={t('Exclusive Deals')}
                        titleSx={sectionTitleSx}
                        sliderRef={offerSliderRef}
                        itemsCount={exclusiveDeals.length}
                        showArrows={!exclusiveDealsLoading}
                        sx={{ mb: { xs: '16px', md: '24px' } }}
                    />
                    {exclusiveDealsLoading ? (
                        <CardGridShimmer
                            CardSkeleton={RestaurantCardSkeleton}
                            gridSizes={RESTAURANT_GRID_SIZES}
                            count={3}
                        />
                    ) : (
                        <SliderCustom gap="16px">
                            <Slider
                                {...restaurantSliderSettings}
                                gap="16px"
                                arrows={false}
                                ref={offerSliderRef}
                                className="slick__slider"
                            >
                                {exclusiveDeals.map((restaurant) => (
                                    <NewStoreCard
                                        key={restaurant?.id}
                                        restaurant={{
                                            ...restaurant,
                                            opening_time:
                                                restaurant?.current_opening_time,
                                        }}
                                    />
                                ))}
                            </Slider>
                        </SliderCustom>
                    )}
                </Box>
            )}

            {showRestaurants && (
                <Box>
                    <SliderSectionHeader
                        title={t('Restaurants')}
                        titleSx={sectionTitleSx}
                        sliderRef={restaurantSliderRef}
                        itemsCount={previewRestaurants.length}
                        showArrows={!restaurantLoading}
                        sx={{ mb: { xs: '16px', md: '24px' } }}
                    />
                    {restaurantLoading ? (
                        <CardGridShimmer
                            CardSkeleton={RestaurantCardSkeleton}
                            gridSizes={RESTAURANT_GRID_SIZES}
                            count={3}
                        />
                    ) : (
                        <SliderCustom gap="24px">
                            <Slider
                                {...restaurantsListSliderSettings}
                                gap="24px"
                                arrows={false}
                                ref={restaurantSliderRef}
                                className="slick__slider"
                            >
                                {previewRestaurants.map((restaurant) => (
                                    <SearchResultRestaurantsCard
                                        key={restaurant?.id}
                                        restaurant={{
                                            ...restaurant,
                                            opening_time:
                                                restaurant?.current_opening_time,
                                        }}
                                    />
                                ))}
                            </Slider>
                        </SliderCustom>
                    )}
                </Box>
            )}
        </Stack>
    )
}

export default SearchAllResults
