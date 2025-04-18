import React, { useEffect, useState } from 'react'
import { alpha, Grid, Stack, Typography } from '@mui/material'
import CustomImageContainer from '@/components/CustomImageContainer'
import { t } from 'i18next'
import { useTheme } from '@mui/styles'
import {
    CustomButton,
    CustomStackFullWidth,
    SliderCustom,
} from '@/styled-components/CustomStyles.style'
import { PrimaryButton } from '@/components/products-page/FoodOrRestaurant'
import { useQuery } from 'react-query'
import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import { onErrorResponse } from '@/components/ErrorResponse'
import { HandleNext, HandlePrev } from '@/components/CustomSliderIcon'
import Slider from 'react-slick'
import Skeleton from '@mui/material/Skeleton'
import FoodCardShimmer from '@/components/food-card/FoodCarShimmer'
import useMediaQuery from '@mui/material/useMediaQuery'
import RestaurantBoxCard from '@/components/restaurant-details/RestaurantBoxCard'
import { useRouter } from 'next/router'
import dineInImage from '../../../../public/dinein.png'
const DineIn = () => {
    const theme = useTheme()
    const router = useRouter()
    const [hoverOn, setHoverOn] = useState(false)
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    const languageDirection = localStorage.getItem('direction')
    const {
        isLoading,
        data: newRestuarants,

        error,
        refetch,
    } = useQuery(
        ['dine_in_restaurants'],
        () => RestaurantsApi?.dine_in_restaurants(),
        { enabled: false, onError: onErrorResponse }
    )

    useEffect(() => {
        const apiRefetch = async () => {
            await refetch()
        }

        apiRefetch()
    }, [])

    const settings = {
        speed: 500,
        slidesToShow: 3.4,
        slidesToScroll: 1,
        initialSlide: 0,
        nextArrow: hoverOn && <HandleNext overLay={true} />,
        prevArrow: hoverOn && <HandlePrev />,
        responsive: [
            {
                breakpoint: 2000,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 1600,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 1340,
                settings: {
                    slidesToShow: 2.5,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 1075,
                settings: {
                    slidesToShow: 2.5,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 999,
                settings: {
                    slidesToShow: 2.5,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 850,
                settings: {
                    slidesToShow: 2.3,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 770,
                settings: {
                    slidesToShow: 1.9,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 670,
                settings: {
                    slidesToShow: 1.8,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 540,
                settings: {
                    slidesToShow: 1.6,
                    slidesToScroll: 3,
                    infinite: false,
                },
            },
            {
                breakpoint: 495,
                settings: {
                    slidesToShow: 1.3,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 460,
                settings: {
                    slidesToShow: 1.25,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 400,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            // {
            //     breakpoint: 370,
            //     settings: {
            //         slidesToShow: 1,
            //         slidesToScroll: 1,
            //         infinite: false,
            //     },
            // },
        ],
    }
    const handleClick = () => {
        window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth',
        })
        router.push(
            {
                pathname:
                    router.pathname === '/home'
                        ? window.location.pathname
                        : 'search',
                query: {
                    restaurantType: 'dine-in',
                },
            },
            undefined,
            { shallow: router.pathname === '/home' }
        )
    }

    return (
        <Grid
            container
            spacing={3}
            paddingTop={newRestuarants?.data?.restaurants?.length > 0 && '30px'}
        >
            {newRestuarants?.data?.restaurants?.length > 0 && (
                <Grid item xs={12} md={3}>
                    <Stack
                        width="100%"
                        backgroundColor={alpha(theme.palette.primary.main, 0.1)}
                        justifyContent="center"
                        alignItems="center"
                        spacing={2}
                        borderRadius="10px"
                        padding="20px"
                    >
                        <CustomImageContainer
                            src={dineInImage?.src}
                            width="116px"
                            height="90px"
                        />
                        <Typography
                            color={theme.palette.neutral[1000]}
                            fontSize="18px"
                            fontWeight="600"
                            component="h2"
                        >
                            {t('Want to Dine in?')}
                        </Typography>
                        <PrimaryButton
                            backgroundColor={theme.palette.primary.main}
                            variant="contained"
                            onClick={handleClick}
                        >
                            {t('View Restaurants')}
                        </PrimaryButton>
                    </Stack>
                </Grid>
            )}

            <Grid
                item
                xs={12}
                md={9}
                onMouseEnter={() => setHoverOn(true)}
                onMouseLeave={() => setHoverOn(false)}
            >
                {!isLoading ? (
                    <CustomStackFullWidth>
                        <SliderCustom
                            languageDirection={languageDirection}
                            gap="12px"
                            paddingBottom={isSmall ? '10px' : '20px'}
                        >
                            <Slider {...settings}>
                                {newRestuarants?.data?.restaurants?.map(
                                    (restaurantData) => {
                                        return (
                                            <Stack>
                                                <RestaurantBoxCard
                                                    key={restaurantData?.id}
                                                    id={restaurantData.id}
                                                    image={
                                                        restaurantData?.cover_photo_full_url
                                                    }
                                                    name={restaurantData?.name}
                                                    rating={
                                                        restaurantData?.avg_rating
                                                    }
                                                    restaurantImageUrl={
                                                        global?.base_urls
                                                            ?.restaurant_cover_photo_url
                                                    }
                                                    restaurantDiscount={
                                                        restaurantData.discount &&
                                                        restaurantData.discount
                                                    }
                                                    freeDelivery={
                                                        restaurantData.free_delivery
                                                    }
                                                    open={restaurantData?.open}
                                                    active={
                                                        restaurantData?.active
                                                    }
                                                    delivery_time={
                                                        restaurantData?.delivery_time
                                                    }
                                                    cuisines={
                                                        restaurantData?.cuisine
                                                    }
                                                    coupons={
                                                        restaurantData?.coupons
                                                    }
                                                    slug={restaurantData?.slug}
                                                    zone_id={
                                                        restaurantData?.zone_id
                                                    }
                                                    rating_count={
                                                        restaurantData?.rating_count
                                                    }
                                                    opening_time={
                                                        restaurantData?.current_opening_time
                                                    }
                                                    characteristics={
                                                        restaurantData?.characteristics
                                                    }
                                                    dine_in="dine_in"
                                                />
                                            </Stack>
                                        )
                                    }
                                )}
                            </Slider>
                        </SliderCustom>
                    </CustomStackFullWidth>
                ) : (
                    <Stack marginTop="40px" spacing={2}>
                        <Skeleton
                            variant="rectangular"
                            width="40%"
                            height="20px"
                        />
                        <SliderCustom
                            languageDirection={languageDirection}
                            gap="12px"
                            paddingBottom={isSmall ? '10px' : '20px'}
                        >
                            <Slider {...settings}>
                                <FoodCardShimmer />
                                <FoodCardShimmer />
                                <FoodCardShimmer />
                                <FoodCardShimmer />
                                <FoodCardShimmer />
                            </Slider>
                        </SliderCustom>
                    </Stack>
                )}
            </Grid>
        </Grid>
    )
}

export default DineIn
