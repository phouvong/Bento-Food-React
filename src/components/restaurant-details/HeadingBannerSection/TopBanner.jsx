import React, { useRef, useLayoutEffect, memo } from 'react'
import { Box, NoSsr, Stack } from '@mui/material'
import { useSelector } from 'react-redux'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useQuery } from 'react-query'
import Slider from '@/components/slider/SlickToSwiper'
import RestaurantLeftDetails from '../RestaurantLeftDetails'
import RestaurantCouponCard from '../RestaurantCouponCard'
import RestaurantDiscountCoupon from '../RestaurantDiscountCoupon'
import ProOfferCoupon from '../ProOfferCoupon'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { CouponApi } from '@/hooks/react-query/config/couponApi'
import { restaurantDiscountTag } from '@/utils/customFunctions'
import useHappyHourBanner from '@/hooks/custom-hooks/useHappyHourBanner'
import { onErrorResponse } from '../../ErrorResponse'

const TopBanner = ({
    details,
    isHidden,
    removeStickyBanner,
    heroNameRef,
    showProOffer,
    proOfferHeading,
    proOfferMessage,
}) => {
    const theme = useTheme()
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const bannerRef = useRef(null)

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
    const coupons = data?.data ?? []
    // Same rule as RestaurantDetails.js's own restaurantDiscount tag — the
    // happy-hour banner already covers "extra discount right now", so the
    // restaurant's own discount card steps aside while happy hour is live
    // and comes back once it ends.
    const happyHour = useHappyHourBanner({ restaurantId: details?.id })
    const restaurantDiscountLabel = happyHour.show
        ? null
        : restaurantDiscountTag(
              details?.discount,
              details?.free_delivery,
              currencySymbolDirection,
              currencySymbol,
              digitAfterDecimalPoint
          )
    const hasRestaurantDiscount = Boolean(restaurantDiscountLabel)
    const slideCount =
        coupons.length +
        (showProOffer ? 1 : 0) +
        (hasRestaurantDiscount ? 1 : 0)

    const couponSliderSettings = {
        dots: false,
        arrows: false,
        infinite: slideCount > 4,
        speed: 400,
        slidesToShow: 3.1,
        slidesToScroll: 1,
        rtl: theme.direction === 'rtl',
        responsive: [
            { breakpoint: 1200, settings: { slidesToShow: 2.8 } },
            { breakpoint: 900, settings: { slidesToShow: 1.15 } },
        ],
    }

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
    }, [isXSmall, data])

    return (
        <Box
            ref={bannerRef}
            sx={{
                // The page container has no gutters below md, so the hero
                // is naturally full-bleed on mobile; BannerWrapper squares
                // its top corners below md for this.
                pt: { xs: 0, md: '24px' },
            }}
        >
            {/* No Stack spacing here on purpose: RestaurantLeftDetails renders
                its (closed) modals as extra DOM siblings, and Stack spacing
                would give each of them a phantom margin. The coupon block
                carries its own margin instead. */}
            <CustomStackFullWidth>
                <RestaurantLeftDetails
                    details={details}
                    restaurantCoverUrl={restaurantCoverUrl}
                    currencySymbol={currencySymbol}
                    currencySymbolDirection={currencySymbolDirection}
                    digitAfterDecimalPoint={digitAfterDecimalPoint}
                    nameRef={heroNameRef}
                />

                {slideCount > 0 && (
                    <NoSsr>
                        <Box
                            sx={{
                                mt: '10px',
                                pt: { xs: 1, md: 0.5 },
                                pl: { xs: 2, sm: 3, md: 0 },
                                position: 'relative',
                                '& .swiper': {
                                    paddingTop: { xs: 0, md: '4px' },
                                },
                                '& .swiper-wrapper': {
                                    alignItems: 'stretch',
                                },
                                '& .swiper-slide': {
                                    height: '100% !important',
                                },
                            }}
                        >
                            <Slider {...couponSliderSettings} gap={16}>
                                {showProOffer ? (
                                    <Stack key="pro-offer" sx={{ height: '100%' }}>
                                        <ProOfferCoupon
                                            heading={proOfferHeading}
                                            body={proOfferMessage}
                                        />
                                    </Stack>
                                ) : null}
                                {hasRestaurantDiscount ? (
                                    <Stack
                                        key="restaurant-discount"
                                        sx={{ height: '100%' }}
                                    >
                                        <RestaurantDiscountCoupon
                                            discount={details?.discount}
                                        />
                                    </Stack>
                                ) : null}
                                {coupons.map((coupon) => (
                                    <Stack key={coupon?.id} sx={{ height: '100%' }}>
                                        <RestaurantCouponCard coupon={coupon} />
                                    </Stack>
                                ))}
                            </Slider>
                        </Box>
                    </NoSsr>
                )}
            </CustomStackFullWidth>
        </Box>
    )
}

export default memo(TopBanner)
