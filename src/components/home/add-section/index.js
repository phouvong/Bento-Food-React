import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, IconButton, Stack, Typography, styled } from '@mui/material'
import { t } from 'i18next'
import { useTheme } from '@mui/styles'
import {
    CustomStackFullWidth,
    SliderCustom,
} from '@/styled-components/CustomStyles.style'
import PaidAddsCard from '@/components/home/add-section/PaidAddsCard'
import Slider from '@/components/slider/SlickToSwiper'

// Import slick styles
import Skeleton from '@mui/material/Skeleton'
import { RTL } from '@/components/RTL/RTL'
import useMediaQuery from '@mui/material/useMediaQuery'
import { getLanguageDirection } from '@/utils/localStorage'

const ADS_CARD_MAX_WIDTH = 300
const ADS_GAP_DESKTOP = '22px'
const ADS_GAP_MOBILE = '16px'

const LOOP_MIN_SLIDES = 8

const ADS_INLINE_PADDING = { xs: '16px', sm: '24px', md: '20px' }

const Container = styled(Box)(({ theme }) => ({
    width: '100%',
    background: `linear-gradient(180deg, ${theme.palette.neutral[1700]} 0%, ${theme.palette.background.paper} 100%)`,
    borderRadius: 0,
    paddingBlock: '24px',
    paddingInline: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    [theme.breakpoints.up('md')]: {
        borderRadius: 16,
        paddingBlock: '20px',
        gap: 16,
    },
}))

const SponsoredPill = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: 9999,
    padding: '2px 8px',
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
}))

const NavBtn = styled(IconButton)(({ theme }) => ({
    width: 28,
    height: 28,
    padding: 6,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
    transition: 'all .15s ease',
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: '#fff',
    },
    '& i': {
        fontSize: 16,
        lineHeight: 1,
        display: 'flex',
    },
}))

const AddsSection = ({ data, isLoading }) => {
    const [renderComp, setRenderComp] = useState(1)
    const languageDirection = getLanguageDirection()
    const [isAutoPlay, setIsAutoPlay] = useState(true)
    const sliderRef = useRef(null)
    const [activeSlideData, setActiveSlideData] = useState(null)

    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))

    const hasMore = data?.length > 1

    const slides = useMemo(() => {
        if (!data?.length || isSmall || data.length >= LOOP_MIN_SLIDES)
            return data ?? []
        const copies = Math.ceil(LOOP_MIN_SLIDES / data.length)
        return Array.from({ length: copies }, () => data).flat()
    }, [data, isSmall])

    const settings = {
        autoplay: !isSmall && isAutoPlay && hasMore,
        autoplaySpeed: 3000,
        infinite: !isSmall && hasMore,
        speed: 500,
        slidesToShow: 'auto',
        arrows: false,
        beforeChange: (_current, nextSlide) => {
            const activeSlide = slides[nextSlide ?? 0]
            setActiveSlideData(activeSlide)
            if (activeSlide?.add_type === 'video_promotion') {
                sliderRef?.current?.slickPause()
            }
        },
    }

    const SliderShouldPlay = () => {
        if (!data || data.length === 0) return
        if (isSmall) {
            setActiveSlideData(data[0])
            if (data[0]?.add_type === 'video_promotion') {
                sliderRef?.current?.slickPause()
            }
            return
        }
        const firstVideoSlide = data.find(
            (slide) => slide?.add_type === 'video_promotion'
        )
        setActiveSlideData(firstVideoSlide || data[0])
        if (firstVideoSlide) {
            sliderRef?.current?.slickPause()
        }
    }

    useEffect(() => {
        SliderShouldPlay()
    }, [data, isSmall])

    if (!isLoading && (!data || data.length === 0)) return null

    const isRtl = languageDirection === 'rtl'
    const showArrows = !isSmall && data?.length > 1
    const prevIconClass = isRtl
        ? 'fi fi-rr-angle-small-right'
        : 'fi fi-rr-angle-small-left'
    const nextIconClass = isRtl
        ? 'fi fi-rr-angle-small-left'
        : 'fi fi-rr-angle-small-right'

    return (
        <RTL languageDirection={languageDirection}>
            <Container>
                <Stack
                    direction="row"
                    alignItems="center"
                    gap="12px"
                    sx={{
                        width: '100%',
                        paddingInline: ADS_INLINE_PADDING,
                    }}
                >
                    <Box
                        component="img"
                        src="/static/announcementIcon.png"
                        alt=""
                        sx={{
                            width: 40,
                            height: 40,
                            flexShrink: 0,
                            display: { xs: 'none', md: 'block' },
                        }}
                    />
                    <Stack sx={{ flex: 1, minWidth: 0, gap: '4px' }}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            gap="6px"
                            flexWrap="wrap"
                        >
                            <Typography
                                sx={{
                                    fontSize: { xs: 20, md: 24 },
                                    fontWeight: 700,
                                    lineHeight: 1.1,
                                    letterSpacing: {
                                        xs: '-0.6px',
                                        md: '-1.2px',
                                    },
                                    color: (theme) =>
                                        theme.palette.text.primary,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {t('Highlights for you')}
                            </Typography>
                            <SponsoredPill>
                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        fontWeight: 400,
                                        letterSpacing: '-0.36px',
                                        color: (theme) =>
                                            theme.palette.text.secondary,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {t('Sponsored')}
                                </Typography>
                            </SponsoredPill>
                        </Stack>
                        <Typography
                            sx={{
                                fontSize: 14,
                                fontWeight: 400,
                                lineHeight: 1.3,
                                color: (theme) => theme.palette.text.secondary,
                            }}
                        >
                            {t('See our most popular restaurant and foods')}
                        </Typography>
                    </Stack>

                    {showArrows && (
                        <Stack
                            direction="row"
                            alignItems="center"
                            gap="8px"
                            sx={{ flexShrink: 0 }}
                        >
                            <NavBtn
                                aria-label="Previous"
                                onClick={() => sliderRef.current?.slickPrev()}
                            >
                                <i className={prevIconClass} />
                            </NavBtn>
                            <NavBtn
                                aria-label="Next"
                                onClick={() => sliderRef.current?.slickNext()}
                            >
                                <i className={nextIconClass} />
                            </NavBtn>
                        </Stack>
                    )}
                </Stack>

                <Box
                    sx={{
                        width: '100%',
                        paddingInlineStart: ADS_INLINE_PADDING,
                        paddingInlineEnd: 0,
                        '& .swiper-wrapper': {
                            padding: '6px 0 10px',
                        },
                        '& .swiper-slide': {
                            width: `min(${ADS_CARD_MAX_WIDTH}px, calc(100% - ${ADS_GAP_MOBILE}))`,
                        },
                    }}
                >
                    <CustomStackFullWidth>
                        <SliderCustom languageDirection={languageDirection} ads>
                            <Slider
                                {...settings}
                                gap={isSmall ? ADS_GAP_MOBILE : ADS_GAP_DESKTOP}
                                ref={isLoading ? null : sliderRef}
                            >
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
                                    : slides?.map((item, index) => (
                                          <PaidAddsCard
                                              key={`${item?.id}-${index}`}
                                              data={slides}
                                              setIsAutoPlay={setIsAutoPlay}
                                              activeSlideData={activeSlideData}
                                              itemLength={slides?.length}
                                              item={item}
                                              index={index}
                                              isDuplicate={
                                                  index >= data?.length
                                              }
                                              sliderRef={sliderRef && sliderRef}
                                              setRenderComp={setRenderComp}
                                              renderComp={renderComp}
                                          />
                                      ))}
                            </Slider>
                        </SliderCustom>
                    </CustomStackFullWidth>
                </Box>
            </Container>
        </RTL>
    )
}

export default React.memo(AddsSection)
