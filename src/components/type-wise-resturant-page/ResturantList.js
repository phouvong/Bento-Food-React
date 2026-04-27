import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import { Box, Grid } from '@mui/material'
import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { useSelector } from 'react-redux'
import CustomShimmerRestaurant from '../CustomShimmer/CustomShimmerRestaurant'
import RestaurantBoxCard from '../restaurant-details/RestaurantBoxCard'
import GroupButtons from '../restaurant-details/foodSection/GroupButtons'

const ResturantList = ({ restaurantType }) => {
    const { global } = useSelector((state) => state.globalSettings)
    const [type, setType] = useState('all')

    const { data } = useQuery(
        [`restaurant-list`, restaurantType, type],
        () => RestaurantsApi.typeWiseRestaurantList({ restaurantType, type })
    )

    return (
        <Box>
            <Grid
                container
                item
                md={12}
                lg={12}
                xs={12}
                spacing={{ xs: 2, md: 3 }}
                sx={{ padding: '20px 0px' }}
            >
                <Grid item xs={12}>
                    <GroupButtons setType={setType} type={type} />
                </Grid>
            </Grid>

            <Grid item container spacing={{ xs: 2, md: 2 }} rowGap="30px">
                {data ? (
                    <>
                        {data?.data?.map((resturant) => {
                            return (
                                <Grid item xs={4} sm={3} md={3} key={resturant?.id}>
                                    <RestaurantBoxCard
                                        slug={resturant?.slug}
                                        image={resturant?.cover_photo_full_url}
                                        name={resturant?.name}
                                        rating={resturant?.avg_rating}
                                        restaurantImageUrl={
                                            global?.base_urls
                                                ?.restaurant_cover_photo_url
                                        }
                                        id={resturant?.id}
                                        active={resturant?.active}
                                        open={resturant?.open}
                                        restaurantDiscount={
                                            resturant?.discount &&
                                            resturant?.discount
                                        }
                                        freeDelivery={resturant?.free_delivery}
                                        delivery_time={resturant?.delivery_time}
                                        cuisines={resturant?.cuisine}
                                        rating_count={resturant?.rating_count}
                                        coupons={resturant?.coupons}
                                        opening_time={
                                            resturant?.current_opening_time
                                        }
                                        characteristics={
                                            resturant?.characteristics
                                        }
                                    />
                                </Grid>
                            )
                        })}
                    </>
                ) : (
                    <CustomShimmerRestaurant />
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
