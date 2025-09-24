import { Grid, NoSsr, Stack } from '@mui/material'
import { useSelector } from 'react-redux'
import { styled, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import RestaurantLeftDetails from '../RestaurantLeftDetails'
import RestaurantRightDetails from '../RestaurantRightDetails'
import { useGetScreenPosition } from '@/hooks/custom-hooks/useGetScreenPosition'
import { useQuery } from 'react-query'
import { CouponApi } from '@/hooks/react-query/config/couponApi'
import { onErrorResponse } from '../../ErrorResponse'
import Slider from 'react-slick'
import RestaurantCoupon from '../RestaurantCoupon'
import { RestaurantCouponStack } from '../restaurant-details.style'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import RestaurantAnnouncementMessege from '../RestaurantAnnouncementMessege'

const SliderCustom = styled(Stack)(({ theme }) => ({
    '& .slick-slider': {
        '& .slick-list': {
            '& .slick-track': {
                gap: '0px',
            },
        },
    },
}))

const TopBanner = ({ details }) => {
    const { global } = useSelector((state) => state.globalSettings)
    const { userData } = useSelector((state) => state.user)
    let currencySymbol
    let currencySymbolDirection
    let digitAfterDecimalPoint

    if (global) {
        currencySymbol = global.currency_symbol
        currencySymbolDirection = global.currency_symbol_direction
        digitAfterDecimalPoint = global.digit_after_decimal_point
    }
    const restaurantCoverUrl = global?.base_urls?.restaurant_cover_photo_url
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const scrollPosition = useGetScreenPosition()
    const { data } = useQuery(
        'restaurant-coupon',
        () => CouponApi.restaurantCoupon(userData?.id, details?.id),
        {
            onError: onErrorResponse,
        }
    )
    const settings = {
        dots: true,
        infinite: data?.data.length > 1 ? true : false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
    }
    return (
        <>
            <NoSsr>
                <Grid
                    container
                    sx={{
                        position: 'sticky',
                        top: '51px',
                        zIndex: 999,
                        flexDirection: isSmall && 'column-reverse',
                        [theme.breakpoints.down('sm')]: {
                            top: '10px',
                        },
                    }}
                >
                    {isXSmall && scrollPosition === 0 && (
                        <Grid item xs={12}>
                            <>
                                {data?.data.length > 0 && (
                                    <RestaurantCouponStack isSmall={isSmall}>
                                        <SliderCustom>
                                            {
                                                <Slider {...settings}>
                                                    {data?.data?.map(
                                                        (coupon) => {
                                                            return (
                                                                <Stack
                                                                    key={
                                                                        coupon?.id
                                                                    }
                                                                >
                                                                    <RestaurantCoupon
                                                                        coupon={
                                                                            coupon
                                                                        }
                                                                    />
                                                                </Stack>
                                                            )
                                                        }
                                                    )}
                                                </Slider>
                                            }
                                        </SliderCustom>
                                    </RestaurantCouponStack>
                                )}
                            </>
                        </Grid>
                    )}
                    <Grid item container xs={12} sm={12} md={4.7}>
                        <NoSsr>
                            <RestaurantLeftDetails
                                details={details}
                                restaurantCoverUrl={restaurantCoverUrl}
                                currencySymbol={currencySymbol}
                                currencySymbolDirection={
                                    currencySymbolDirection
                                }
                                digitAfterDecimalPoint={digitAfterDecimalPoint}
                                scrollPosition={scrollPosition}
                            />
                        </NoSsr>
                    </Grid>
                    {isSmall ? (
                        <>
                            {scrollPosition === 0 && (
                                <Grid item xs={12} sm={12} md={7.3}>
                                    <RestaurantRightDetails
                                        details={details}
                                        restaurantCoverUrl={restaurantCoverUrl}
                                        data={data}
                                    />
                                </Grid>
                            )}
                        </>
                    ) : (
                        <Grid item xs={12} sm={12} md={7.3}>
                            <RestaurantRightDetails
                                details={details}
                                data={data}
                                restaurantCoverUrl={restaurantCoverUrl}
                                scrollPosition={scrollPosition}
                            />
                        </Grid>
                    )}
                </Grid>
            </NoSsr>
            {details?.announcement === 1 && details?.announcement_message && (
                <RestaurantAnnouncementMessege
                    storeAnnouncement={details?.announcement_message}
                />
            )}
        </>
    )
}

export default TopBanner
