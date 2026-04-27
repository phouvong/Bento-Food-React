import React, { useRef, useEffect, memo } from 'react'
import { Grid, NoSsr, Stack, Box, Container } from '@mui/material'
import { useSelector } from 'react-redux'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useQuery } from 'react-query'
import Slider from 'react-slick'
import RestaurantLeftDetails from '../RestaurantLeftDetails'
import RestaurantRightDetails from '../RestaurantRightDetails'
import RestaurantCoupon from '../RestaurantCoupon'
import RestaurantAnnouncementMessege from '../RestaurantAnnouncementMessege'
import { RestaurantCouponStack } from '../restaurant-details.style'
import { useGetScreenPosition } from '@/hooks/custom-hooks/useGetScreenPosition'
import { CouponApi } from '@/hooks/react-query/config/couponApi'
import { onErrorResponse } from '../../ErrorResponse'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

const TopBanner = ({ details, isHidden, removeStickyBanner }) => {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const bannerRef = useRef(null)

    const threshold =  100
    const scrollPosition = useGetScreenPosition(threshold)

    const { global } = useSelector((state) => state.globalSettings)
    const { userData } = useSelector((state) => state.user)

    // Get currency settings
    const currencySymbol = global?.currency_symbol
    const currencySymbolDirection = global?.currency_symbol_direction
    const digitAfterDecimalPoint = global?.digit_after_decimal_point
    const restaurantCoverUrl = global?.base_urls?.restaurant_cover_photo_url

    // Fetch coupon data
    const { data } = useQuery(
        'restaurants-coupon',
        () => CouponApi.restaurantCoupon(userData?.id, details?.id),
        {
            onError: onErrorResponse,
        }
    )

    // Slider settings
    const settings = {
        dots: true,
        infinite: data?.data?.length > 1,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
    }

    const hasCoupon = data?.data?.length > 0
    const showRightSection = hasCoupon ? scrollPosition <= threshold : true

    // Update CSS custom property for banner height
    useEffect(() => {
        if (bannerRef.current) {
            const height = bannerRef.current.offsetHeight
            const navbarHeight = isXSmall ? 60 : 70
            const totalHeight = navbarHeight + height
            document.documentElement.style.setProperty(
                '--top-banner-total-height',
                `${totalHeight}px`
            )
        }
    }, [showRightSection, isXSmall, data])

    return (
        <>
            <Box minHeight={{ xs: data?.data?.length > 1?400:350, sm: 450, md: 250 }}>
                <Box
                    ref={bannerRef}
                    className={!showRightSection && 'fadeInTop'}
                    sx={{
                        transition: 'all 0.25s ease',
                        position: showRightSection ? 'static' : 'fixed',
                        top: isXSmall
                            ? removeStickyBanner
                                ? 'calc(-163px)'
                                : '10px'
                            : isHidden
                            ? removeStickyBanner
                                ? 'calc(-163px)'
                                : isSmall
                                ? '48px'
                                : '63px'
                            : removeStickyBanner
                            ? 'calc(163px + 58px * -1)'
                            : isSmall
                            ? 'calc(48px)'
                            : 'calc(63px + 58px)',
                        insetInlineStart: 0,
                        zIndex: 100,
                        width: '100%',
                    }}
                >
                    <Container
                        maxWidth="lg"
                        sx={{
                            paddingLeft: showRightSection && '0 !important',
                            paddingRight: showRightSection && '0 !important',
                        }}
                    >
                        <Grid
                            container
                            sx={{
                                flexDirection: isSmall
                                    ? 'column-reverse'
                                    : 'row',
                            }}
                        >
                            {/* Mobile Coupon Section */}
                            {isXSmall &&
                                showRightSection &&
                                data?.data?.length > 0 && (
                                    <Grid item xs={12}>
                                        <RestaurantCouponStack
                                            isSmall={isSmall}
                                        >
                                            <Stack
                                                sx={{
                                                    '& .slick-slider .slick-list .slick-track':
                                                        {
                                                            gap: '0px',
                                                        },
                                                }}
                                            >
                                                <Slider {...settings}>
                                                    {data.data.map((coupon) => (
                                                        <Stack key={coupon?.id}>
                                                            <RestaurantCoupon
                                                                coupon={coupon}
                                                            />
                                                        </Stack>
                                                    ))}
                                                </Slider>
                                            </Stack>
                                        </RestaurantCouponStack>
                                    </Grid>
                                )}

                            {/* Left Section */}
                            <Grid
                                item
                                xs={12}
                                sm={12}
                                md={showRightSection ? 5 : 12}
                            >
                                <RestaurantLeftDetails
                                    details={details}
                                    restaurantCoverUrl={restaurantCoverUrl}
                                    currencySymbol={currencySymbol}
                                    currencySymbolDirection={
                                        currencySymbolDirection
                                    }
                                    digitAfterDecimalPoint={
                                        digitAfterDecimalPoint
                                    }
                                    scrollPosition={scrollPosition}
                                    threshold={threshold}
                                />
                            </Grid>

                            {/* Right Section - Simple hide/show */}
                            {showRightSection && (
                                <Grid item xs={12} sm={12} md={7}>
                                    <RestaurantRightDetails
                                        details={details}
                                        data={data}
                                        restaurantCoverUrl={restaurantCoverUrl}
                                        scrollPosition={scrollPosition}
                                        threshold={threshold}
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </Container>
                </Box>
            </Box>

            {/* Announcement */}
            {details?.announcement === 1 && details?.announcement_message && (
                <RestaurantAnnouncementMessege
                    storeAnnouncement={details?.announcement_message}
                />
            )}
        </>
    )
}

export default memo(TopBanner)
