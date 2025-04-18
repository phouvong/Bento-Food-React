import React, { memo, useRef, useState } from 'react'
import Slider from 'react-slick'
import { Stack, Typography } from '@mui/material'
import { Grid } from '@mui/material'

import { useSelector } from 'react-redux'
import FoodCard from '../../food-card/FoodCard'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { useTranslation } from 'react-i18next'
import {
    CustomStackFullWidth,
    SliderCustom,
} from '@/styled-components/CustomStyles.style'
import CustomImageContainer from '../../CustomImageContainer'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { CustomGridWithBgColor } from './FoodCampaign.style'
import fire_image from '../../../../public/static/fire.svg'
import FoodCardShimmer from '../../food-card/FoodCarShimmer'
import { HandleNext, HandlePrev } from '../../CustomSliderIcon'
import Skeleton from '@mui/material/Skeleton'
const FoodCampaign = ({ isLoading }) => {
    const [hoverOn, setHoverOn] = useState(false)
    const { t } = useTranslation()
    const { global } = useSelector((state) => state.globalSettings)
    const theme = useTheme()
    const { campaignFoods } = useSelector((state) => state.storedData)
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    const foodCampaignSliderRef = useRef(null)
    const languageDirection = localStorage.getItem('direction')
    const settings = {
        speed: 500,
        slidesToShow: 4.1,
        slidesToScroll: 1,
        initialSlide: 0,
        nextArrow: hoverOn && <HandleNext />,
        prevArrow: hoverOn && <HandlePrev />,
        responsive: [
            {
                breakpoint: 3600,
                settings: {
                    slidesToShow: 4.5,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 3200,
                settings: {
                    slidesToShow: 4.1,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 2800,
                settings: {
                    slidesToShow: 4.5,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 2400,
                settings: {
                    slidesToShow: 4.5,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 2000,
                settings: {
                    slidesToShow: 4.5,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 1600,
                settings: {
                    slidesToShow: 4.2,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 1340,
                settings: {
                    slidesToShow: 3.9,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 1075,
                settings: {
                    slidesToShow: 3.5,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 999,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 800,
                settings: {
                    slidesToShow: 2.6,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 670,
                settings: {
                    slidesToShow: 2.2,
                    slidesToScroll: 2,
                    initialSlide: 0,
                    infinite: false,
                },
            },
            {
                breakpoint: 540,
                settings: {
                    slidesToShow: 1.8,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 450,
                settings: {
                    slidesToShow: 1.5,
                    slidesToScroll: 1,
                    initialSlide: 0,
                    infinite: false,
                },
            },
        ],
    }

    return (
        <>
            <Grid
                container
                paddingTop={
                    campaignFoods?.length > 0 && { xs: '0.5rem', sm: '1.9rem' }
                }
            >
                <CustomGridWithBgColor
                    foodsize={campaignFoods?.length}
                    padding="23px 0 0 23px"
                    item
                    container
                    xs={12}
                    md={12}
                    sm={12}
                    lg={12}
                    onMouseEnter={() => setHoverOn(true)}
                    onMouseLeave={() => setHoverOn(false)}
                >
                    {campaignFoods?.length > 0 && (
                        <Stack
                            direction="row"
                            alignItems="center"
                            paddingBottom="20px"
                            paddingInlineStart="5px"
                            spacing={1}
                        >
                            <CustomImageContainer
                                src={fire_image.src}
                                width="26px"
                                height="26px"
                            />
                            <Typography
                                fontSize={{ xs: '16px', md: '20px' }}
                                fontWeight={{ xs: '500', md: '700' }}
                                color={theme.palette.neutral[1000]}
                                component="h2"
                            >
                                {t('Todays Trends')}

                            </Typography>
                        </Stack>
                    )}

                    <CustomStackFullWidth justifyContent="right">
                        {!isLoading ? (
                            <CustomStackFullWidth>
                                <SliderCustom
                                    gap="12px"
                                    paddingBottom={isSmall ? '10px' : '20px'}
                                    languageDirection={languageDirection}
                                >
                                        {campaignFoods?.length > 0 && (
                                        <Slider
                                            ref={foodCampaignSliderRef}
                                            {...settings}
                                    >
                                        {campaignFoods?.map((product) => {
                                            if (
                                                product?.variations === null ||
                                                product?.variations[0]
                                                    ?.values ||
                                                product?.variations?.length ===
                                                    0
                                            ) {
                                                return (
                                                    <FoodCard
                                                        campaign
                                                        key={product?.id}
                                                        product={product}
                                                        productImageUrl={
                                                            global?.base_urls
                                                                ?.campaign_image_url
                                                        }
                                                        hasBackGroundSection="true"
                                                    />
                                                )
                                            }
                                        })}
                                        </Slider>
                                    )}
                                </SliderCustom>
                            </CustomStackFullWidth>
                        ) : (
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
                        )}
                    </CustomStackFullWidth>
                </CustomGridWithBgColor>
            </Grid>
        </>
    )
}

export default memo(FoodCampaign)
