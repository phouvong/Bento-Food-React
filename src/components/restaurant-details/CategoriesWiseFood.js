import React, { useEffect, useRef, useState } from 'react'
import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import NewFoodCard from '@/components/new-food-card/NewFoodCard'
import BogoProductCard from '@/components/new-food-card/BogoProductCard'
import Slider from '@/components/slider/SlickToSwiper'
import { useSelector } from 'react-redux'
import { useTheme } from '@emotion/react'
import { RTL } from '../RTL/RTL'
import discountBanner from '../../../public/static/discount.svg'
import ImageNotFound from '../../../public/static/no-image-found.png'
import { DiscountImageGrid } from './restaurant-details.style'
import { getAmount } from '@/utils/customFunctions'
import { formatBogoValidUntil } from '@/utils/formatBogoValidUntil'
import { t } from 'i18next'

const popularSliderSettings = {
    dots: false,
    arrows: false,
    infinite: false,
    speed: 400,
    slidesToShow: 4.5,
    slidesToScroll: 4,
    responsive: [
        { breakpoint: 1200, settings: { slidesToShow: 3.2 } },
        { breakpoint: 900, settings: { slidesToShow: 2.5 } },
        { breakpoint: 600, settings: { slidesToShow: 2.3 } },
    ],
}

const CategoriesWiseFood = ({
    data,
    handleFocusedSection,
    indexNumber,
    hasFreeDelivery,
    onBogoCardClick,
    restaurantId,
}) => {
    const theme = useTheme()
    const ref2 = useRef(null)
    const { global } = useSelector((state) => state.globalSettings)
    const [isInPosition, setIsInPosition] = useState(false)
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const sliderGap = isMobile ? 12 : 16

    const scrollHandler = () => {
        const element = ref2.current
        const rect = element?.getBoundingClientRect()
        const targetPosition = 250

        if (rect?.top <= targetPosition && rect?.bottom >= targetPosition) {
            setIsInPosition(true)
        } else {
            setIsInPosition(false)
        }
    }
    useEffect(() => {
        if (isInPosition) {
            const a = {
                id: data?.id,
            }
            handleFocusedSection?.(a)
        }
    }, [isInPosition])

    useEffect(() => {
        window.addEventListener('scroll', scrollHandler, true)
        return () => {
            window.removeEventListener('scroll', scrollHandler, true)
        }
    }, [])

    let languageDirection = undefined
    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }

    const visibleProducts =
        data?.products?.filter(
            (food) =>
                food?.variations === null ||
                food?.variations[0]?.values ||
                food?.variations?.length === 0
        ) ?? []

    const sectionTitle = (
        <Typography
            sx={{
                fontSize: { xs: '16px', md: '18px' },
                fontWeight: 700,
                lineHeight: 1.2,
                color: theme.palette.text.primary,
            }}
        >
            {data?.name}
        </Typography>
    )

    return (
        <RTL direction={languageDirection}>
            <Grid container ref={ref2} gap="1rem">
                {data?.isBogo ? (
                    <>
                        <Grid
                            item
                            xs={12}
                            align={
                                languageDirection === 'rtl' ? 'right' : 'left'
                            }
                            paddingTop="5px"
                        >
                            {sectionTitle}
                        </Grid>
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gap: 2,
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: 'repeat(2, 1fr)',
                                    },
                                }}
                            >
                                {data?.offers?.map((offer) => (
                                    <BogoProductCard
                                        key={offer?.id}
                                        product={{
                                            name: offer?.title,
                                            price: getAmount(
                                                offer?.final_price,
                                                global?.currency_symbol_direction,
                                                global?.currency_symbol,
                                                global?.digit_after_decimal_point
                                            ),
                                        }}
                                        buyItems={offer?.buy_items ?? []}
                                        getItems={offer?.free_items ?? []}
                                        validUntil={formatBogoValidUntil(offer)}
                                        offer={offer}
                                        restaurantId={restaurantId}
                                        onCardClick={() =>
                                            onBogoCardClick?.(offer)
                                        }
                                        onAddClick={() =>
                                            onBogoCardClick?.(offer)
                                        }
                                    />
                                ))}
                            </Box>
                        </Grid>
                    </>
                ) : data?.isBgColor ? (
                    <>
                        <Grid item xs={12} align="left" paddingTop="5px">
                            {sectionTitle}
                        </Grid>
                        {visibleProducts.length > 0 && (
                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        '& .swiper': { py: 0.5 },
                                    }}
                                >
                                    <Slider
                                        {...popularSliderSettings}
                                        gap={sliderGap}
                                    >
                                        {visibleProducts.map((food) => (
                                            <NewFoodCard
                                                key={food?.id}
                                                product={food}
                                                variant="vertical"
                                                productImageUrl={
                                                    global?.base_urls
                                                        ?.product_image_url
                                                }
                                            />
                                        ))}
                                    </Slider>
                                </Box>
                            </Grid>
                        )}
                    </>
                ) : (
                    <>
                        <Grid
                            item
                            xs={12}
                            align={
                                languageDirection === 'rtl' ? 'right' : 'left'
                            }
                            paddingTop="5px"
                        >
                            {sectionTitle}
                        </Grid>
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: { xs: '12px', md: '24px' },
                                }}
                            >
                                {visibleProducts.map((food) => (
                                    <Box
                                        key={food?.id}
                                        sx={{
                                            width: {
                                                xs: '100%',
                                                md: '445px',
                                            },
                                        }}
                                    >
                                        <NewFoodCard
                                            product={food}
                                            variant="horizontal"
                                            mediaSize={{ xs: 116, md: 126 }}
                                            productImageUrl={
                                                global?.base_urls
                                                    ?.product_image_url
                                            }
                                        />
                                    </Box>
                                ))}
                            </Box>
                        </Grid>
                    </>
                )}
                {indexNumber === 1 && hasFreeDelivery && (
                    <DiscountImageGrid
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        discountBanner={discountBanner}
                        ImageNotFound={ImageNotFound}
                    >
                        <Typography
                            color={theme.palette.primary.main}
                            textAlign="center"
                            fontSize="27px"
                            fontWeigth="600"
                        >
                            {t('Free Delivery')}
                        </Typography>
                    </DiscountImageGrid>
                )}
            </Grid>
        </RTL>
    )
}

export default CategoriesWiseFood
