import React, { memo, useRef } from 'react'
import { Box, Grid, Skeleton, Stack } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import Slider from '@/components/slider/SlickToSwiper'

import FeaturedCategoryCard from '../../featured-category-item/FeaturedCategoryCard'
import Card from '@mui/material/Card'
import CustomContainer from '../../container'
import { useQuery } from 'react-query'
import { CategoryApi } from '@/hooks/react-query/config/categoryApi'
import { onErrorResponse } from '@/components/ErrorResponse'
import SliderSectionHeader from '@/components/slider-section-header/SliderSectionHeader'
import { SECTION_GUTTER_PX } from '@/components/container/Section'
import { HOME_SECTION_SPACING } from '../homeSectionSpacing'

const SPACING = HOME_SECTION_SPACING.featuredCategories

const FeaturedCategoryShimmer = () => (
    <Stack
        alignItems="center"
        spacing={{ xs: 1, md: 1.5 }}
        sx={{ width: { xs: '72px', md: '102px' } }}
    >
        <Skeleton
            variant="circular"
            sx={{
                height: { xs: '56px', md: '86px' },
                width: { xs: '56px', md: '86px' },
            }}
        />
        <Skeleton
            variant="text"
            sx={{
                width: { xs: '50px', md: '70px' },
                fontSize: { xs: '12px', md: '16px' },
            }}
        />
    </Stack>
)

const FeatureCatagories = () => {
    const { t } = useTranslation()
    const { global } = useSelector((state) => state.globalSettings)
    const sliderRef = useRef(null)

    const { data } = useQuery(
        ['categories-cuisines'],
        () => CategoryApi.categoriesCuisines(),
        {
            staleTime: 1000 * 60 * 8,
            onError: onErrorResponse,
            cacheTime: 8 * 60 * 1000,
        }
    )

    const items = data?.data?.data ?? []
    const totalItems = items.length
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
                    slidesToShow: 5.5,
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
                    slidesToShow: 5.5,
                    slidesToScroll: 1,
                    infinite: totalItems > 6,
                    autoplay: totalItems > 6,
                    speed: 450,
                    cssEase: 'ease-out',
                },
            },
            {
                breakpoint: 390,
                settings: {
                    slidesToShow: 5.5,
                    slidesToScroll: 2,
                    infinite: false,
                    autoplay: false,
                    speed: 450,
                    cssEase: 'ease-out',
                },
            },
            {
                breakpoint: 330,
                settings: {
                    // 5 fixed-width (72px) items don't fit under 330px —
                    // keep a peek-slide count so nothing clips.
                    slidesToShow: 4.5,
                    slidesToScroll: 2,
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
                pl: SECTION_GUTTER_PX,
                pt: SPACING.pt,
                pb: SPACING.pb,
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
            <Grid container gap={0}>
                <Grid item xs={12} md={12}>
                    <SliderSectionHeader
                        title={t('What You Need?')}
                        sliderRef={sliderRef}
                        itemsCount={totalItems}
                        sx={{ mb: SPACING.headerGap }}
                    />
                </Grid>
                <Grid item xs={12} md={12}>
                    {totalItems > 0 ? (
                        <Slider
                            className="slick__slider"
                            {...settings}
                            ref={sliderRef}
                        >
                            {items.map((categoryItem) => (
                                <FeaturedCategoryCard
                                    key={`${categoryItem?.type}-${categoryItem?.id}`}
                                    id={categoryItem?.id}
                                    slug={categoryItem?.slug}
                                    type={categoryItem?.type}
                                    categoryImage={categoryItem?.image_full_url}
                                    name={categoryItem?.name}
                                    categoryImageUrl={
                                        global?.base_urls?.category_image_url
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
