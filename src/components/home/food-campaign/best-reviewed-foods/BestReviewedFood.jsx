import React, { memo, useRef } from 'react'
import Slider from 'react-slick'
import { Grid, Stack } from '@mui/material'
import FoodCard from '../../../food-card/FoodCard'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import {
    CustomStackFullWidth,
    SliderCustom,
} from '@/styled-components/CustomStyles.style'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import best_foods from '../../../../../public/static/best_foods.svg'
import CustomImageContainer from '../../../CustomImageContainer'
import FoodCardShimmer from '../../../food-card/FoodCarShimmer'
import Skeleton from '@mui/material/Skeleton'
import SliderSectionHeader from '@/components/slider-section-header/SliderSectionHeader'
const BestReviewedFood = ({ isLoading }) => {
    const { t } = useTranslation()
    const { bestReviewedFoods } = useSelector((state) => state.storedData)
    const foodCampaignSliderRef = useRef(null)
    const router = useRouter()
    const theme = useTheme()
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))

    const { global } = useSelector((state) => state.globalSettings)
    const languageDirection = localStorage.getItem('direction')

    const settings = {
        speed: 500,
        slidesToShow: 5.3,
        slidesToScroll: 1,
        initialSlide: 0,
        infinite: false,
        arrows: false,
        responsive: [
            {
                breakpoint: 1600,
                settings: {
                    slidesToShow: 5.2,
                    slidesToScroll: 5,
                    initialSlide: 0,
                },
            },
            {
                breakpoint: 1340,
                settings: {
                    slidesToShow: 4.2,
                    slidesToScroll: 5,
                    initialSlide: 0,
                },
            },
            {
                breakpoint: 1075,
                settings: {
                    slidesToShow: 3.9,
                    slidesToScroll: 1,
                    initialSlide: 0,
                },
            },
            {
                breakpoint: 999,
                settings: {
                    slidesToShow: 3.3,
                    slidesToScroll: 1,
                    initialSlide: 0,
                },
            },
            {
                breakpoint: 800,
                settings: {
                    slidesToShow: 2.6,
                    slidesToScroll: 1,
                    initialSlide: 0,
                },
            },
            {
                breakpoint: 670,
                settings: {
                    slidesToShow: 2.3,
                    slidesToScroll: 1,

                    initialSlide: 0,
                },
            },
            {
                breakpoint: 500,
                settings: {
                    slidesToShow: 1.6,
                    slidesToScroll: 1,

                    initialSlide: 0,
                },
            },
            {
                breakpoint: 400,
                settings: {
                    slidesToShow: 1.4,
                    slidesToScroll: 1,
                    initialSlide: 0,
                },
            },
        ],
    }

    const handleClick = () => {
        router.push('/most-reviewed-foods')
    }
    return (
        <Grid
            container
            paddingTop={
                bestReviewedFoods?.length > 0 && { xs: '0', sm: '0rem' }
            }
            gap={{ xs: '1rem', sm: '1.4rem' }}
        >
            {bestReviewedFoods?.length > 0 && !isLoading && (
                <Grid item xs={12} md={12}>
                    <SliderSectionHeader
                        title={t('Best Reviewed Foods')}
                        titleIcon={
                            <CustomImageContainer
                                src={best_foods.src}
                                width="26px"
                                height="26px"
                            />
                        }
                        sliderRef={foodCampaignSliderRef}
                        itemsCount={bestReviewedFoods?.length}
                        viewAllText={t('View all')}
                        onViewAll={handleClick}
                    />
                </Grid>
            )}
            {!isLoading ? (
                <Grid
                    item
                    container
                    xs={12}
                    sm={12}
                    md={12}
                    spacing={2}
                    sx={{ position: 'relative' }}
                    gap={{ xs: '10px', md: '0px' }}
                >
                    <>
                        <Grid
                            item
                            lg={12}
                            md={12}
                            xs={12}
                            position="relative"
                        >
                            <CustomStackFullWidth justifyContent="right">
                                <SliderCustom
                                    gap="16px"
                                    paddingBottom={isXSmall ? '14px' : '20px'}
                                    languageDirection={languageDirection}
                                >
                                    {bestReviewedFoods?.length > 0 && (
                                        <Slider
                                            ref={foodCampaignSliderRef}
                                            {...settings}
                                        >
                                            {bestReviewedFoods.map(
                                                (product) => {
                                                    if (
                                                        product?.variations ===
                                                            null ||
                                                        product?.variations[0]
                                                            ?.values ||
                                                        product?.variations
                                                            ?.length === 0
                                                    ) {
                                                        return (
                                                            <FoodCard
                                                                key={
                                                                    product?.id
                                                                }
                                                                hasBackGroundSection="false"
                                                                product={
                                                                    product
                                                                }
                                                                global={global}
                                                                productImageUrl={
                                                                    global
                                                                        ?.base_urls
                                                                        ?.product_image_url
                                                                }
                                                            />
                                                        )
                                                    }
                                                }
                                            )}
                                        </Slider>
                                    )}
                                </SliderCustom>
                            </CustomStackFullWidth>
                        </Grid>
                    </>
                </Grid>
            ) : (
                <Grid item md={12} xs={12} sm={12}>
                    <Stack marginTop="40px" spacing={2}>
                        <Skeleton
                            variant="rectangular"
                            width="40%"
                            height="20px"
                        />
                        <SliderCustom>
                            <Slider {...settings}>
                                <FoodCardShimmer />
                                <FoodCardShimmer />
                                <FoodCardShimmer />
                                <FoodCardShimmer />
                                <FoodCardShimmer />
                            </Slider>
                        </SliderCustom>
                    </Stack>
                </Grid>
            )}
        </Grid>
    )
}

export default memo(BestReviewedFood)
