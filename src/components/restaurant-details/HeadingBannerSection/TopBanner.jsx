import React, { useRef, useLayoutEffect, memo } from 'react'
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

    // Fetch coupon data — key scoped per (user, restaurant) so switching
    // restaurants doesn't briefly show the previous restaurant's coupons.
    const { data } = useQuery(
        ['restaurants-coupon', userData?.id, details?.id],
        () => CouponApi.restaurantCoupon(userData?.id, details?.id),
        {
            enabled: !!details?.id,
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

    // On mobile, never collapse the banner — let it scroll naturally with the page.
    // Sticky/fixed banner behavior is desktop-only.
    const showRightSection = isXSmall ? true : scrollPosition <= threshold
    const isFixedBanner = !isXSmall && !showRightSection

    // Measure banner height and expose as a CSS variable consumed by sticky
    // offsets elsewhere. Uses useLayoutEffect to avoid a paint with the stale
    // value, ResizeObserver to react to width changes within a breakpoint,
    // and cleans the variable up on unmount so it doesn't leak to other pages.
    useLayoutEffect(() => {
        const node = bannerRef.current
        if (!node) return

        const writeHeight = () => {
            const navbarHeight = isXSmall ? 60 : 70
            const totalHeight = navbarHeight + node.offsetHeight
            document.documentElement.style.setProperty(
                '--top-banner-total-height',
                `${totalHeight}px`
            )
        }

        writeHeight()

        const observer = new ResizeObserver(writeHeight)
        observer.observe(node)

        return () => {
            observer.disconnect()
            document.documentElement.style.removeProperty(
                '--top-banner-total-height'
            )
        }
    }, [showRightSection, isXSmall, data])

    return (
        <>
            <Box
                minHeight={
                    isXSmall
                        ? 'auto'
                        : showRightSection
                        ? { sm: 450, md: 250 }
                        : { sm: 110, md: 110 }
                }
                sx={{
                    // easeOutQuint — strong acceleration into a gentle
                    // landing. Feels much smoother than the default `ease`.
                    transition:
                        'min-height 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
            >
                <Box
                    ref={bannerRef}
                    className={isFixedBanner ? 'fadeInTop' : undefined}
                    sx={{
                        // Tween only animatable properties — `all` was also
                        // trying to tween `position` and `top: auto`, both
                        // of which snap and were adding micro-jitter.
                        transition:
                            'top 0.35s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                        position: isFixedBanner ? 'fixed' : 'static',
                        top: isFixedBanner
                            ? isHidden
                                ? removeStickyBanner
                                    ? 'calc(-163px)'
                                    : isSmall
                                    ? '48px'
                                    : '60px'
                                : removeStickyBanner
                                ? 'calc(163px + 58px * -1)'
                                : isSmall
                                ? 'calc(48px)'
                                : 'calc(45px + 58px)'
                            : 'auto',
                        insetInlineStart: 0,
                        zIndex: 100,
                        width: '100%',
                    }}
                >
                    <Container
                        maxWidth="lg"
                        sx={{
                            paddingLeft: showRightSection ? '0 !important' : undefined,
                            paddingRight: showRightSection ? '0 !important' : undefined,
                            transition:
                                'padding 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
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
                            {/* Mobile Coupon Section — `showRightSection` is
                                always true on mobile, so it's redundant here */}
                            {isXSmall && data?.data?.length > 0 && (
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

                            {/* Left Section — md prop still flips 5↔12, but
                                the transition makes the width change tween
                                instead of snap. */}
                            <Grid
                                item
                                xs={12}
                                sm={12}
                                md={showRightSection ? 5 : 12}
                                sx={{
                                    transition:
                                        'flex-basis 0.35s cubic-bezier(0.22, 1, 0.36, 1), max-width 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                                }}
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

                            {/* Right Section — always mounted now so the
                                collapse can be CSS-driven. On md+, flex-basis
                                + max-width tween down to 0 and opacity fades
                                when scrolled past threshold; on xs/sm it's
                                always full width (matches original
                                showRightSection=true on mobile). */}
                            <Grid
                                item
                                xs={12}
                                sm={12}
                                sx={{
                                    overflow: 'hidden',
                                    flexBasis: {
                                        xs: '100%',
                                        md: showRightSection
                                            ? '58.333333%'
                                            : '0%',
                                    },
                                    maxWidth: {
                                        xs: '100%',
                                        md: showRightSection
                                            ? '58.333333%'
                                            : '0%',
                                    },
                                    opacity: {
                                        xs: 1,
                                        md: showRightSection ? 1 : 0,
                                    },
                                    pointerEvents: {
                                        xs: 'auto',
                                        md: showRightSection
                                            ? 'auto'
                                            : 'none',
                                    },
                                    transition:
                                        'flex-basis 0.35s cubic-bezier(0.22, 1, 0.36, 1), max-width 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                                }}
                            >
                                <RestaurantRightDetails
                                    details={details}
                                    data={data}
                                    restaurantCoverUrl={restaurantCoverUrl}
                                    scrollPosition={scrollPosition}
                                    threshold={threshold}
                                />
                            </Grid>
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
