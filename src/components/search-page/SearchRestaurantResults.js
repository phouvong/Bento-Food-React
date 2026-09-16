import React from 'react'
import { Box, Grid } from '@mui/material'
import { useTranslation } from 'react-i18next'
import NewStoreCard from '@/components/new-store-card/NewStoreCard'
import CustomEmptyResult from '../empty-view/CustomEmptyResult'
import CardGridShimmer from '../type-wise-restaurant-page/CardGridShimmer'
import RestaurantCardSkeleton from '../type-wise-restaurant-page/RestaurantCardSkeleton'
import SectionTitle from './SectionTitle'
import InfiniteScrollSentinel from './InfiniteScrollSentinel'

// 3 per row on desktop, matching Figma node 515:69006.
export const RESTAURANT_GRID_SIZES = { xs: 12, sm: 6, md: 4 }

// Data is owned by the search page so the All tab's already-fetched first page
// is reused here instead of refetched.
const SearchRestaurantResults = ({
    restaurants = [],
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    showTitle = true,
}) => {
    const { t } = useTranslation()

    if (isLoading) {
        return (
            <Box>
                {showTitle && <SectionTitle>{t('Restaurants')}</SectionTitle>}
                <CardGridShimmer
                    CardSkeleton={RestaurantCardSkeleton}
                    gridSizes={RESTAURANT_GRID_SIZES}
                />
            </Box>
        )
    }

    if (restaurants.length === 0) {
        return <CustomEmptyResult label="No restaurant found" />
    }

    return (
        <Box>
            {showTitle && <SectionTitle>{t('Restaurants')}</SectionTitle>}
            <Grid item container spacing={{ xs: 2.5, md: 3 }}>
                {restaurants.map((restaurant) => (
                    <Grid item {...RESTAURANT_GRID_SIZES} key={restaurant?.id}>
                        <NewStoreCard
                            restaurant={{
                                ...restaurant,
                                opening_time:
                                    restaurant?.current_opening_time,
                            }}
                        />
                    </Grid>
                ))}
            </Grid>
            <InfiniteScrollSentinel
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
            />
        </Box>
    )
}

export default SearchRestaurantResults
