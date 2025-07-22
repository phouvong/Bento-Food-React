import React, { useEffect, useRef, useState } from 'react'
import { Stack, Typography, Box } from '@mui/material'
import { t } from 'i18next'
import { useTheme } from '@mui/styles'
import {
    CustomStackFullWidth,
    SliderCustom,
} from '@/styled-components/CustomStyles.style'
import PaidAddsCard from '@/components/home/add-section/PaidAddsCard'
import Slider from 'react-slick'
import { HandleNext, HandlePrev } from '@/components/CustomSliderIcon'

// Import slick styles
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import Skeleton from '@mui/material/Skeleton'
import FoodCardShimmer from '@/components/food-card/FoodCarShimmer'
import { RTL } from '@/components/RTL/RTL'
import useMediaQuery from '@mui/material/useMediaQuery'

const AddsSection = ({ data, isLoading }) => {
    const [hoverOn, setHoverOn] = useState(false)
    const [renderComp, setRenderComp] = useState(1)
    const languageDirection = localStorage.getItem('direction')
    const [isAutoPlay, setIsAutoPlay] = useState(true)
    const sliderRef = useRef(null)
    const [activeSlideData, setActiveSlideData] = useState(null)

    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))

    const settings = {
        autoplay: true,
        infinite: data?.length > 3 && true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        nextArrow: hoverOn && <HandleNext overLay={true} />,
        prevArrow: hoverOn && <HandlePrev />,
        afterChange: (currentSlide) => {
            if (sliderRef.current && sliderRef.current.innerSlider) {
                const activeSlideIndex =
                    sliderRef?.current?.innerSlider?.state?.currentSlide
                const activeSlide = data[activeSlideIndex || 0]
                setActiveSlideData(activeSlide)
                if (activeSlide?.add_type === 'video_promotion') {
                    sliderRef?.current?.slickPause()
                }
            }
        },
        responsive: [
            {
                breakpoint: 2000,
                settings: {
                    autoplay: isAutoPlay,
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: data?.length > 3 && true,
                },
            },
            {
                breakpoint: 1600,
                settings: {
                    autoplay: isAutoPlay,
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: data?.length > 3 && true,
                },
            },
            {
                breakpoint: 1340,
                settings: {
                    autoplay: isAutoPlay,
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: data?.length > 3 && true,
                },
            },
            {
                breakpoint: 1075,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: data?.length > 3 && true,
                },
            },
            {
                breakpoint: 999,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 850,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 770,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 670,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 540,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: data?.length > 3 && true,
                },
            },
            {
                breakpoint: 495,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: data?.length > 3 && true,
                },
            },
            {
                breakpoint: 460,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: data?.length > 2 && true,
                },
            },
            {
                breakpoint: 400,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: data?.length > 2 && true,
                },
            },
            {
                breakpoint: 370,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
        ],
    }

    const SliderShouldPlay = () => {
        if (data && data.length > 0) {
            const firstSlide = data[0]
            const secondSlide = data[1]
            const thirdSlide = data[2]
            setActiveSlideData(firstSlide)
            if (firstSlide?.add_type === 'video_promotion') {
                sliderRef?.current?.slickPause()
            } else if (
                secondSlide?.add_type === 'video_promotion' &&
                firstSlide?.add_type !== 'video_promotion'
            ) {
                sliderRef?.current?.slickPause()
                sliderRef?.current?.slickNext()
                setActiveSlideData(secondSlide)
            } else if (
                thirdSlide?.add_type === 'video_promotion' &&
                secondSlide?.add_type !== 'video_promotion'
            ) {
                sliderRef?.current?.slickPause()
                sliderRef?.current?.slickNext()
                setTimeout(() => {
                    sliderRef?.current?.slickPause()
                    sliderRef?.current?.slickNext()
                    setActiveSlideData(thirdSlide)
                }, 500)
            }
        }
    }

    useEffect(() => {
        SliderShouldPlay()
    }, [data])

    return (
        <>
            {!isLoading ? (
                <>
                    {data?.length > 0 && (
                        <RTL languageDirection={languageDirection}>
                            <Box
                                sx={{
                                    backgroundImage:
                                        "url('/static/paidAdds.png')",
                                    marginTop: '10px',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: 'cover',
                                    borderRadius: '10px',
                                }}
                                onMouseEnter={() => setHoverOn(true)}
                                onMouseLeave={() => setHoverOn(false)}
                            >
                                <Box
                                    sx={{
                                        background: `linear-gradient(0deg, rgba(255, 255, 255, 0.00) 0%, ${theme.palette.neutral[100]} 100%)`,
                                        padding:
                                            languageDirection === 'rtl'
                                                ? '25px 25px 25px 25px'
                                                : '25px 0px 25px 25px',
                                        borderRadius: 'inherit',
                                        [theme.breakpoints.down('sm')]: {
                                            padding:
                                                languageDirection === 'rtl'
                                                    ? '25px 25px 25px 5px'
                                                    : '25px 5px 25px 5px',
                                        },
                                    }}
                                >
                                    <Typography
                                        fontSize={{ xs: '16px', md: '20px' }}
                                        fontWeight={{ xs: '500', md: '700' }}
                                        color={theme.palette.neutral[1000]}
                                        component="h2"
                                    >
                                        {t('Highlights for you')}
                                    </Typography>
                                    <Typography
                                        fontSize={{ xs: '12px', md: '12px' }}
                                        color={theme.palette.neutral[600]}
                                        component="p"
                                    >
                                        {t(
                                            'See our most popular restaurant and foods'
                                        )}
                                    </Typography>
                                    <CustomStackFullWidth
                                        sx={{ paddingTop: '30px' }}
                                    >
                                        <CustomStackFullWidth>
                                            <SliderCustom
                                                languageDirection={
                                                    languageDirection
                                                }
                                                gap={isSmall ? '5px' : '30px'}
                                                ads
                                            >
                                                <Slider
                                                    {...settings}
                                                    ref={sliderRef}
                                                >
                                                    {data?.map(
                                                        (item, index) => (
                                                            <PaidAddsCard
                                                                key={item?.id}
                                                                data={data}
                                                                setIsAutoPlay={
                                                                    setIsAutoPlay
                                                                }
                                                                activeSlideData={
                                                                    activeSlideData
                                                                }
                                                                itemLength={
                                                                    data?.length
                                                                }
                                                                item={item}
                                                                index={index}
                                                                sliderRef={
                                                                    sliderRef &&
                                                                    sliderRef
                                                                }
                                                                setRenderComp={
                                                                    setRenderComp
                                                                }
                                                                renderComp={
                                                                    renderComp
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </Slider>
                                            </SliderCustom>
                                        </CustomStackFullWidth>
                                    </CustomStackFullWidth>
                                </Box>
                            </Box>
                        </RTL>
                    )}
                </>
            ) : (
                <CustomStackFullWidth sx={{ paddingTop: '30px' }}>
                    <CustomStackFullWidth>
                        <Stack marginTop="40px" spacing={2}>
                            <Skeleton
                                variant="rectangular"
                                width="40%"
                                height="20px"
                            />
                            <Skeleton
                                variant="rectangular"
                                width="10%"
                                height="20px"
                            />
                            <SliderCustom
                                languageDirection={languageDirection}
                                gap="12px"
                            >
                                <Slider {...settings}>
                                    <FoodCardShimmer />
                                    <FoodCardShimmer />
                                    <FoodCardShimmer />
                                </Slider>
                            </SliderCustom>
                        </Stack>
                    </CustomStackFullWidth>
                </CustomStackFullWidth>
            )}
        </>
    )
}

export default AddsSection
