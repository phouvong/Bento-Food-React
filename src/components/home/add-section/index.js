import React, { useEffect, useRef, useState } from 'react'
import { Stack, Box } from '@mui/material'
import { t } from 'i18next'
import { useTheme } from '@mui/styles'
import {
    CustomStackFullWidth,
    SliderCustom,
} from '@/styled-components/CustomStyles.style'
import PaidAddsCard from '@/components/home/add-section/PaidAddsCard'
import Slider from 'react-slick'

// Import slick styles
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import Skeleton from '@mui/material/Skeleton'
import { RTL } from '@/components/RTL/RTL'
import useMediaQuery from '@mui/material/useMediaQuery'
import SliderSectionHeader from '@/components/slider-section-header/SliderSectionHeader'
import { SLIDE_GAP } from '../Banner'

const AddsSection = ({ data, isLoading }) => {
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
        arrows: false,
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

    if (!isLoading && (!data || data.length === 0)) return null

    return (
        <RTL languageDirection={languageDirection}>
            <Stack>
                <Box>
                    <SliderSectionHeader
                        title={t('Highlights for you')}
                        subtitle={t(
                            'See our most popular restaurant and foods'
                        )}
                        sliderRef={sliderRef}
                        itemsCount={data?.length}
                    />
                </Box>
                <Box
                    sx={{
                        '& .slick-track': {
                            display: 'flex !important',
                            alignItems: 'stretch',
                        },
                        '& .slick-slide': {
                            height: 'auto',
                            '& > div': { height: '100%' },
                        },
                    }}
                >
                    <CustomStackFullWidth>
                        <SliderCustom
                            languageDirection={languageDirection}
                            gap={isSmall ? '5px' : SLIDE_GAP}
                            ads
                        >
                            <Slider {...settings} ref={isLoading ? null : sliderRef}>
                                {isLoading
                                    ? [...Array(3)].map((_, i) => (
                                          <Box key={i} sx={{ px: '4px' }}>
                                              <Skeleton
                                                  variant="rectangular"
                                                  animation="wave"
                                                  sx={{
                                                      width: '100%',
                                                      aspectRatio: '16 / 10',
                                                      borderRadius: '14px',
                                                  }}
                                              />
                                          </Box>
                                      ))
                                    : data?.map((item, index) => (
                                          <PaidAddsCard
                                              key={item?.id}
                                              data={data}
                                              setIsAutoPlay={setIsAutoPlay}
                                              activeSlideData={activeSlideData}
                                              itemLength={data?.length}
                                              item={item}
                                              index={index}
                                              sliderRef={sliderRef && sliderRef}
                                              setRenderComp={setRenderComp}
                                              renderComp={renderComp}
                                          />
                                      ))}
                            </Slider>
                        </SliderCustom>
                    </CustomStackFullWidth>
                </Box>
            </Stack>
        </RTL>
    )
}

export default AddsSection
