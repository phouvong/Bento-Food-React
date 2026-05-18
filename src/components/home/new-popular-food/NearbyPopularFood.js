import React, { memo, useRef } from 'react'
import { Box, Grid, Stack, styled } from '@mui/material'
import fire_image from '../../../../public/static/fire.svg'
import FoodCard from '../../food-card/FoodCard'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import CustomImageContainer from '../../CustomImageContainer'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import FoodCardHorizontalShimmer from '../../food-card/FoodCardHorizontalShimmer'
import { useRouter } from 'next/router'
import Slider from 'react-slick'
import SliderSectionHeader from '@/components/slider-section-header/SliderSectionHeader'

const SliderCustom1 = styled(Box)(({ theme, nopadding }) => ({
    position: 'relative',
    width: '100%',
    paddingY: '10px',
    '& .slick-slider': {
        '& .slick-slide': {
            padding: '8px 0',
        },
        '& .slick-list': {
            paddingY: nopadding !== 'true' && '8px',
            '& .slick-track': {
                float: theme.direction === 'ltr' ? 'left' : 'right',
                gap: '16px',
                '&::before, &::after': {
                    display: 'none',
                },
            },
        },
    },
}))

const NearbyPopularFood = ({ isLoading }) => {
    const { t } = useTranslation()
    const router = useRouter()
    const sliderRef = useRef(null)
    const { global } = useSelector((state) => state.globalSettings)
    const { popularFood } = useSelector((state) => state.storedData)
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    let languageDirection = undefined
    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }
    const handleClick = () => {
        router.push('/popular-foods')
    }
    const settings = {
        infinite: false,
        speed: 500,
        slidesPerRow: 1,
        rows: 2,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: false,
        cssEase: 'linear',
        rtl: languageDirection === 'rtl',
        responsive: [
            {
                breakpoint: 300,
                settings: {
                    slidesToShow: 0.8,
                    slidesPerRow: 1,
                    rows: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 400,
                settings: {
                    slidesToShow: 1.05,
                    slidesPerRow: 1,
                    rows: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 500,
                settings: {
                    slidesToShow: 1.2,
                    slidesPerRow: 1,
                    rows: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1.5,
                    slidesPerRow: 1,
                    rows: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 700,
                settings: {
                    slidesToShow: 1.6,
                    slidesPerRow: 1,
                    rows: 2,
                    slidesToScroll: 2,
                },
            },
            {
                breakpoint: 800,
                settings: {
                    slidesToShow: 1.8,
                    slidesPerRow: 1,
                    rows: 2,
                    slidesToScroll: 2,
                },
            },
            {
                breakpoint: 900,
                settings: {
                    slidesToShow: 2.1,
                    slidesPerRow: 1,
                    rows: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 1150,
                settings: {
                    slidesToShow: 2.4,
                    slidesPerRow: 1,
                    rows: 2,
                    slidesToScroll: 3,
                },
            },
            {
                breakpoint: 1300,
                settings: {
                    slidesToShow: 2.7,
                    slidesPerRow: 1,
                    rows: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 1500,
                settings: {
                    slidesToShow: 3.6,
                    slidesPerRow: 1,
                    rows: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 1700,
                settings: {
                    slidesToShow: 4.2,
                    slidesPerRow: 1,
                    rows: 2,
                    slidesToScroll: 1,
                },
            },
        ],
    }
    return (
        <>
            <Grid
                container
                paddingTop={
                    popularFood.length > 0 && { xs: '0.5rem', sm: '0rem' }
                }
                gap={{ xs: '.3rem', sm: '1.4rem' }}
            >
                {popularFood.length > 0 && !isLoading && (
                    <Grid item xs={12} md={12} sm={12} lg={12}>
                        <SliderSectionHeader
                            title={t('Popular  Foods Nearby')}
                            titleIcon={
                                <CustomImageContainer
                                    src={fire_image.src}
                                    width="26px"
                                    height="26px"
                                />
                            }
                            sliderRef={sliderRef}
                            itemsCount={Math.ceil(popularFood.length / 2)}
                            viewAllText={t('View all')}
                            onViewAll={handleClick}
                        />
                    </Grid>
                )}
                {!isLoading ? (
                    <SliderCustom1
                        gap="12px"
                        paddingBottom={isSmall ? '10px' : '20px'}
                    >
                      {popularFood?.length > 0 && (  <CustomStackFullWidth>
                            <Slider {...settings} ref={sliderRef}>
                                {popularFood?.map((product) => {
                                    if (
                                        product?.variations === null ||
                                        product?.variations[0]?.values ||
                                        product?.variations?.length === 0
                                    ) {
                                        return (
                                            <Stack pb="1rem" key={product?.id}>
                                                <FoodCard
                                                    product={product}
                                                    productImageUrl={
                                                        global?.base_urls
                                                            ?.product_image_url
                                                    }
                                                    horizontal="true"
                                                    hasBackGroundSection="true"
                                                />
                                            </Stack>
                                        )
                                    }
                                })}
                            </Slider>
                        </CustomStackFullWidth>
                      )}
                    </SliderCustom1>
                ) : (
                    <CustomStackFullWidth>
                        <SliderCustom1 nopadding="true">
                            <Slider {...settings}>
                                {[...Array(12)].map((item, index) => (
                                    <FoodCardHorizontalShimmer
                                        key={index}
                                        maxwidth="375px"
                                    />
                                ))}
                            </Slider>
                        </SliderCustom1>
                    </CustomStackFullWidth>
                )}
            </Grid>
        </>
    )
}

export default memo(NearbyPopularFood)
