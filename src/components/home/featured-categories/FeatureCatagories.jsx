import React, { memo, useRef } from 'react'
import { Box, Grid, Skeleton, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import Slider from 'react-slick'

import FeaturedCategoryCard from '../../featured-category-item/FeaturedCategoryCard'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { useRouter } from 'next/router'
import Card from '@mui/material/Card'
import CustomContainer from '../../container'
import { useQuery } from 'react-query'
import { CategoryApi } from '@/hooks/react-query/config/categoryApi'
import { onErrorResponse } from '@/components/ErrorResponse'
import SliderSectionHeader from '@/components/slider-section-header/SliderSectionHeader'

const FeaturedCategoryShimmer = () => (
    <Stack
        alignItems="center"
        spacing={{ xs: 0.75, md: 1 }}
        sx={{ width: { xs: '60px', md: '86px' } }}
    >
        <Skeleton
            variant="circular"
            sx={{
                height: { xs: '60px', md: '86px' },
                width: { xs: '60px', md: '86px' },
            }}
        />
        <Skeleton
            variant="text"
            sx={{
                width: { xs: '50px', md: '70px' },
                fontSize: { xs: '12px', md: '12.5px' },
            }}
        />
    </Stack>
)

const FeatureCatagories = () => {
    const { t } = useTranslation()
    const router = useRouter()
    const { global } = useSelector((state) => state.globalSettings)
    const sliderRef = useRef(null)

    const searchKey = ''

    const { data } = useQuery(
        ['category', searchKey],
        () => CategoryApi.categories(searchKey),
        {
            staleTime: 1000 * 60 * 8,
            onError: onErrorResponse,
            cacheTime: 8 * 60 * 1000,
        }
    )

    const totalItems = data?.data?.length ?? 0
    const shouldAutoplay = totalItems > 9
    const settings = {
        dots: false,
        infinite: totalItems > 9,
        speed: 600,
        slidesToShow: 9,
        slidesToScroll: 2,
        autoplay: shouldAutoplay,
        autoplaySpeed: 3500,
        pauseOnHover: true,
        pauseOnFocus: true,
        arrows: false,
        swipeToSlide: true,
        useCSS: true,
        useTransform: true,
        touchThreshold: 10,
        waitForAnimate: false,
        cssEase: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        responsive: [
            {
                breakpoint: 1450,
                settings: {
                    slidesToShow: 8,
                    slidesToScroll: 2,
                    infinite: totalItems > 8,
                    autoplay: totalItems > 8,
                },
            },
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 7,
                    slidesToScroll: 2,
                    infinite: totalItems > 7,
                    autoplay: totalItems > 7,
                },
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 6,
                    slidesToScroll: 2,
                    infinite: totalItems > 6,
                    autoplay: totalItems > 6,
                },
            },
            {
                breakpoint: 850,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 1,
                    infinite: totalItems > 5,
                    autoplay: totalItems > 5,
                    speed: 500,
                    cssEase: 'ease-out',
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 4.5,
                    slidesToScroll: 1,
                    infinite: false,
                    autoplay: false,
                    speed: 450,
                    cssEase: 'ease-out',
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    infinite: totalItems > 4,
                    autoplay: totalItems > 4,
                    speed: 450,
                    cssEase: 'ease-out',
                },
            },
            {
                breakpoint: 380,
                settings: {
                    slidesToShow: 3.5,
                    slidesToScroll: 1,
                    infinite: false,
                    autoplay: false,
                    speed: 450,
                    cssEase: 'ease-out',
                },
            },
        ],
    }

    return (
        <Stack
            sx={{
                background: (theme) => theme.palette.neutral[1800],
                boxShadow: 'none',
                WebkitTapHighlightColor: 'transparent',
                '& *': {
                    WebkitTapHighlightColor: 'transparent',
                },
                '& .slick-slide, & .slick-list, & .slick-track': {
                    outline: 'none',
                    WebkitTapHighlightColor: 'transparent',
                },
                '& .slick-slide > div': {
                    outline: 'none',
                },
            }}
        >
            
                <Grid container gap={{ xs: '.3rem', md: '0rem' }}>
                    <Grid item xs={12} md={12}>
                        <SliderSectionHeader
                            title={t('Whats on Your Mind?')}
                            subtitle={t(
                                "Pick a cuisine — we'll bring the feast."
                            )}
                            titleIcon={
                                <Typography
                                    fontSize={{ xs: '18px', md: '22px' }}
                                    sx={{ lineHeight: 1 }}
                                    component="span"
                                >
                                    🍽️
                                </Typography>
                            }
                            sliderRef={sliderRef}
                            itemsCount={totalItems}
                            viewAllText={t('Explore More')}
                            onViewAll={() => router.push('/categories')}
                        />
                    </Grid>
                    <Grid item xs={12} md={12}>
                        {totalItems > 0 ? (
                            <Slider
                                className="slick__slider"
                                {...settings}
                                ref={sliderRef}
                            >
                                {data?.data?.map((categoryItem) => (
                                    <FeaturedCategoryCard
                                        key={categoryItem?.id}
                                        id={categoryItem?.id}
                                        slug={categoryItem?.slug}
                                        categoryImage={
                                            categoryItem?.image_full_url
                                        }
                                        name={categoryItem?.name}
                                        categoryImageUrl={
                                            global?.base_urls
                                                ?.category_image_url
                                        }
                                        height="40px"
                                    />
                                ))}
                            </Slider>
                        ) : (
                            <Stack
                                direction="row"
                                spacing={{ xs: 1, md: 1.5 }}
                                sx={{
                                    overflow: 'hidden',
                                    width: '100%',
                                    py: { xs: '4px', md: '8px' },
                                }}
                            >
                                {[...Array(9)].map((_, i) => (
                                    <Box key={i} sx={{ flexShrink: 0 }}>
                                        <FeaturedCategoryShimmer />
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Grid>
                </Grid>
            
        </Stack>
    )
}

export default memo(FeatureCatagories)
