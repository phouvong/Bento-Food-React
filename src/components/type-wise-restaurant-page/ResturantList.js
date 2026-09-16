import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import { noRestaurantsImage } from '@/utils/LocalImages'
import { Box, Grid } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { useSelector } from 'react-redux'
import NewStoreCard from '@/components/new-store-card/NewStoreCard'
import CustomEmptyResult from '../empty-view/CustomEmptyResult'
import GroupButtons from '../restaurant-details/foodSection/GroupButtons'
import CardGridShimmer from './CardGridShimmer'
import RestaurantCardSkeleton from './RestaurantCardSkeleton'

const RESTAURANT_GRID_SIZES = { xs: 12, sm: 6, md: 4 }

const ResturantList = ({
    restaurantType,
    filterData,
    enabled = true,
    onCountChange,
    onLoadingChange,
}) => {
    const { global } = useSelector((state) => state.globalSettings)
    const [type, setType] = useState('all')

    const { data, isLoading } = useQuery(
        [`restaurant-list`, restaurantType, type, filterData],
        () =>
            RestaurantsApi.typeWiseRestaurantList({
                restaurantType,
                type,
                filterData,
            }),
        { enabled }
    )

    const restaurants = Array.isArray(data?.data)
        ? data?.data
        : data?.data?.restaurants ?? []

    useEffect(() => {
        if (enabled && data) onCountChange?.(restaurants?.length ?? 0)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, enabled])

    useEffect(() => {
        onLoadingChange?.(enabled && isLoading)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading, enabled])

    return (
        <Box>
            {isLoading ? (
                <CardGridShimmer
                    CardSkeleton={RestaurantCardSkeleton}
                    gridSizes={RESTAURANT_GRID_SIZES}
                />
            ) : restaurants?.length > 0 ? (
                <Grid item container spacing={{ xs: 2.5, md: 3 }}>
                    {restaurants?.map((resturant) => (
                        <Grid item {...RESTAURANT_GRID_SIZES} key={resturant?.id}>
                            <NewStoreCard
                                restaurant={{
                                    ...resturant,
                                    opening_time:
                                        resturant?.current_opening_time,
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <CustomEmptyResult
                    label="No restaurant found"
                    image={noRestaurantsImage}
                />
            )}

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '30px 0px 70px 0px',
                }}
            ></Box>
        </Box>
    )
}

export default ResturantList
