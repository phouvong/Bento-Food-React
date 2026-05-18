import React, { useRef } from 'react'
import {
    CustomStackFullWidth,
    SliderCustom,
} from '@/styled-components/CustomStyles.style'
import CustomShimmerCategories from '../../CustomShimmer/CustomShimmerCategories'
import { Grid } from '@mui/material'
import { t } from 'i18next'
import { useRouter } from 'next/router'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import CuisinesCard from './CuisinesCard'
import cuisine_image from '../../../../public/static/cuisine_image.svg'
import Skeleton from '@mui/material/Skeleton'
import { useSelector } from 'react-redux'
import CustomNextImage from '@/components/CustomNextImage'
import SliderSectionHeader from '@/components/slider-section-header/SliderSectionHeader'
import { SLIDE_GAP } from '../Banner'

const Cuisines = () => {
    const router = useRouter()
    const sliderRef = useRef(null)
    const { cuisines } = useSelector((state) => state.storedData)

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 6,
        slidesToScroll: 1,
        arrows: false,
        swipeToSlide: true,
        useCSS: true,
        useTransform: true,
        cssEase: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        touchThreshold: 8,
        waitForAnimate: false,
        draggable: true,
        responsive: [
            {
                breakpoint: 1450,
                settings: {
                    slidesToShow: 6,
                    slidesToScroll: 1,
                    infinite: true,
                },
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 1,
                    infinite: true,
                },
            },
            {
                breakpoint: 850,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    infinite: true,
                },
            },
            {
                breakpoint: 790,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: true,
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: true,
                    speed: 300,
                    touchThreshold: 5,
                },
            },
            {
                breakpoint: 500,
                settings: {
                    slidesToShow: 2.5,
                    slidesToScroll: 1,
                    infinite: false,
                    speed: 300,
                    touchThreshold: 5,
                    cssEase: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
                },
            },
            {
                breakpoint: 400,
                settings: {
                    slidesToShow: 2.2,
                    slidesToScroll: 1,
                    infinite: false,
                    speed: 300,
                    touchThreshold: 5,
                    cssEase: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
                },
            },
            {
                breakpoint: 350,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: false,
                    speed: 300,
                    touchThreshold: 5,
                    cssEase: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
                },
            },
        ],
    }

    return (
        <>
            {cuisines?.length > 0 && (
                <>
                    {!cuisines ? (
                        <CustomStackFullWidth spacing={1}>
                            <Skeleton
                                width={120}
                                height="30px"
                                variant="rectangular"
                            />
                            <CustomShimmerCategories
                                noSearchShimmer="true"
                                itemCount="7"
                                smItemCount="5"
                            />
                        </CustomStackFullWidth>
                    ) : (
                        cuisines?.length > 0 && (
                            <Grid container>
                                <Grid item xs={12} md={12} sx={{
                                    marginBottom: { xs: .5, md: .5 }
                                }}>
                                    <SliderSectionHeader
                                        title={t('Cuisines')}
                                        subtitle={t(
                                            'From local favorites to global flavors — pick a cuisine to explore.'
                                        )}
                                        titleIcon={
                                            <CustomNextImage
                                                src={cuisine_image}
                                                width="26px"
                                                height="26px"
                                            />
                                        }
                                        sliderRef={sliderRef}
                                        itemsCount={cuisines?.length}
                                        viewAllText={t('Explore More')}
                                        onViewAll={() =>
                                            router.push('/cuisines')
                                        }
                                    />
                                </Grid>
                                <Grid
                                    item
                                    container
                                    xs={12}
                                    sm={12}
                                    md={12}
                                    sx={{
                                        position: 'relative',
                                    }}
                                >
                                    {cuisines && cuisines?.length > 0 && (
                                        <Grid item xs={12} md={12}>
                                            <SliderCustom
                                                gap={SLIDE_GAP}
                                                sx={{
                                                    '& .slick-list': {
                                                        ml: {
                                                            xs: '-4px',
                                                            md: '-6px',
                                                        },
                                                        WebkitOverflowScrolling:
                                                            'touch',
                                                    },
                                                    '& .slick-track': {
                                                        willChange: 'transform',
                                                        backfaceVisibility:
                                                            'hidden',
                                                        transform:
                                                            'translateZ(0)',
                                                    },
                                                    '& .slick-slide': {
                                                        transform:
                                                            'translateZ(0)',
                                                    },
                                                }}
                                            >
                                                <Slider
                                                    {...settings}
                                                    ref={sliderRef}
                                                >
                                                    {cuisines?.map(
                                                        (item, index) => {
                                                            return (
                                                                <CuisinesCard
                                                                    item={item}
                                                                    key={index}
                                                                />
                                                            )
                                                        }
                                                    )}
                                                </Slider>
                                            </SliderCustom>
                                        </Grid>
                                    )}
                                </Grid>
                            </Grid>
                        )
                    )}
                </>
            )}
        </>
    )
}

export default Cuisines
