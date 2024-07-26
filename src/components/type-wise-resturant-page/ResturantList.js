import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { Box, Grid, styled } from '@mui/material'
import Button from '@mui/material/Button'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { useSelector } from 'react-redux'
import CustomShimmerRestaurant from '../CustomShimmer/CustomShimmerRestaurant'
import RestaurantBoxCard from '../restaurant-details/RestaurantBoxCard'
import GroupButtons from '../restaurant-details/foodSection/GroupButtons'

const ResturantList = ({ restaurantType }) => {
    const { t } = useTranslation()
    const { global } = useSelector((state) => state.globalSettings)
    const restaurantCoverUrl = global?.base_urls?.restaurant_cover_photo_url
    const [type, setType] = useState('all')
    const orangeColor = '#EF7822'
    const orangeColor2 = '#ff903f'
    const PrimaryButton = styled(Button)(({ theme }) => ({
        color: '#fff',
        backgroundColor: orangeColor,
        '&:hover': {
            backgroundColor: orangeColor2,
        },
    }))
    const [open, setOpen] = React.useState(false)
    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)
    const [alignment, setAlignment] = React.useState('web')

    const handleChange = (event, newAlignment) => {
        setAlignment(newAlignment)
    }

    const { isLoading, data, isError, error, refetch } = useQuery(
        [`restaurant-list`, restaurantType],
        () => RestaurantsApi.typeWiseRestaurantList({ restaurantType, type })
    )

    useEffect(async () => {
        await refetch()
    }, [type])

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
                <Grid item xs={12} sm={12} md={12} align="center">
                    <CustomStackFullWidth
                        alignItems="center"
                        justifyContent="center"
                    >
                        <GroupButtons setType={setType} type={type} />
                    </CustomStackFullWidth>
                </Grid>
            </Grid>

            <Grid item container spacing={{ xs: 2, md: 2 }} rowGap="30px">
                {data ? (
                    <>
                        {data?.data?.map((resturant) => {
                            return (
                                <Grid item xs={4} sm={3} md={3}>
                                    <RestaurantBoxCard
                                        image={resturant?.logo}
                                        name={resturant?.name}
                                        rating={resturant?.avg_rating}
                                        restaurantImageUrl={
                                            global?.base_urls
                                                ?.restaurant_image_url
                                        }
                                        id={resturant?.id}
                                        active={resturant?.active}
                                        open={resturant?.open}
                                        restaurantDiscount={resturant?.discount}
                                        freeDelivery={resturant?.free_delivery}
                                        rating_count={restaurant?.rating_count}
                                        coupons={restaurant?.coupons}
                                        cuisines={restaurant?.cuisine}
                                        opening_time={
                                            restaurant?.current_opening_time
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
