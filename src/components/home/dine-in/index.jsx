import React, { useEffect, useRef } from 'react'
import { alpha, Box, Grid, Stack, Typography } from '@mui/material'
import { t } from 'i18next'
import { useTheme } from '@mui/styles'
import {
    CustomStackFullWidth,
    SliderCustom,
} from '@/styled-components/CustomStyles.style'
import { PrimaryButton } from '@/components/products-page/FoodOrRestaurant'
import { useQuery } from 'react-query'
import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import { onErrorResponse } from '@/components/ErrorResponse'
import Slider from 'react-slick'
import Skeleton from '@mui/material/Skeleton'
import useMediaQuery from '@mui/material/useMediaQuery'
import RestaurantBoxCard from '@/components/restaurant-details/RestaurantBoxCard'
import { useRouter } from 'next/router'
import dineInImage from '../../../../public/dinein.png'
import CustomNextImage from '@/components/CustomNextImage'
import SliderSectionHeader from '@/components/slider-section-header/SliderSectionHeader'
const DineIn = () => {
    const theme = useTheme()
    const router = useRouter()
    const sliderRef = useRef(null)
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
        arrows: false,
        infinite: false,
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

    if (!isLoading && !newRestuarants?.data?.restaurants?.length) return null

    return (
        <Grid container spacing={3}>
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
                    <CustomNextImage
                        src={dineInImage?.src}
                        width="116"
                        height="90"
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
                        sx={{
                            padding: '4px 10px',
                            fontWeight: '500',
                            '&:hover': {
                                backgroundColor: (theme) =>
                                    theme.palette.neutral[100],
                                color: (theme) => theme.palette.primary.main,
                            },
                        }}
                    >
                        {t('View Restaurants')}
                    </PrimaryButton>
                </Stack>
            </Grid>

            <Grid item xs={12} md={9}>
                <SliderSectionHeader
                    title={t('Dine-in Restaurants')}
                    sliderRef={sliderRef}
                    itemsCount={newRestuarants?.data?.restaurants?.length}
                    sx={{ mb: { xs: 1, md: 1.5 } }}
                />
                <CustomStackFullWidth>
                    <SliderCustom
                        languageDirection={languageDirection}
                        gap="16px"
                        paddingBottom={isSmall ? '10px' : '20px'}
                    >
                        <Slider
                            {...settings}
                            ref={isLoading ? null : sliderRef}
                        >
                            {isLoading
                                ? [...Array(4)].map((_, i) => (
                                      <Box key={i} sx={{ px: '4px' }}>
                                          <Skeleton
                                              variant="rectangular"
                                              animation="wave"
                                              sx={{
                                                  width: '100%',
                                                  height: '225px',
                                                  borderRadius: '5px',
                                              }}
                                          />
                                      </Box>
                                  ))
                                : newRestuarants?.data?.restaurants?.map(
                                      (restaurantData) => (
                                          <Stack key={restaurantData?.id}>
                                              <RestaurantBoxCard
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
                                  )}
                        </Slider>
                    </SliderCustom>
                </CustomStackFullWidth>
            </Grid>
        </Grid>
    )
}

export default DineIn
