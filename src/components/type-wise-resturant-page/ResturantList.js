import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import { Box, Grid, Stack } from '@mui/material'
import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { useSelector } from 'react-redux'
import CustomShimmerRestaurant from '../CustomShimmer/CustomShimmerRestaurant'
import NewStoreCard from '@/components/new-store-card/NewStoreCard'
import GroupButtons from '../restaurant-details/foodSection/GroupButtons'

const ResturantList = ({ restaurantType }) => {
    const { global } = useSelector((state) => state.globalSettings)
    const [type, setType] = useState('all')

    const { data, isLoading } = useQuery(
        [`restaurant-list`, restaurantType, type],
        () => RestaurantsApi.typeWiseRestaurantList({ restaurantType, type })
    )

    const restaurants = Array.isArray(data?.data)
        ? data?.data
        : data?.data?.restaurants ?? []

    return (
        <Box>


            <Grid item container spacing={{ xs: 2, md: 2 }} rowGap="30px">
                {isLoading ? (
                    <Stack mt={2}>
                    <CustomShimmerRestaurant />
                    </Stack>
                ) : (
                    restaurants?.map((resturant) => {
                        return (
                            <Grid item xs={12} sm={6} md={3} key={resturant?.id}>
                                <NewStoreCard
                                    restaurant={{
                                        ...resturant,
                                        opening_time:
                                            resturant?.current_opening_time,
                                    }}
                                />
                            </Grid>
                        )
                    })
                )}
            </Grid>

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
