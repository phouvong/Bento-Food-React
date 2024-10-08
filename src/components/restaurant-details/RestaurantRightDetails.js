import React from 'react'
import { CustomStackFullWidth } from '../../styled-components/CustomStyles.style'
import CustomImageContainer from '../CustomImageContainer'
import RestaurantCoupon from './RestaurantCoupon'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
// import 'react-multi-carousel/lib/styles.css'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Stack } from '@mui/system'
import { NoSsr } from '@mui/material'
import { RestaurantCouponStack } from './restaurant-details.style'
import { settings } from './CouponSettings'

const RestaurantRightDetails = ({
    details,
    restaurantCoverUrl,
    data,
    scrollPosition,
}) => {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    // const { userData } = useSelector((state) => state.user)

    return (
        <NoSsr>
            <CustomStackFullWidth
                sx={{
                    position: !isSmall && 'relative',
                    background: (theme) => theme.palette.neutral[100],
                }}
            >
                <CustomImageContainer
                    src={details.cover_photo_full_url}
                    height={scrollPosition === 0 ? '250px' : '180px'}
                    smHeight="120px"
                    width="100%"
                    objectFit="cover !important"
                />

                {data?.data.length > 0 && (
                    <RestaurantCouponStack isSmall={isSmall}>
                        {!isSmall && (
                            <Slider {...settings}>
                                {data?.data?.map((coupon) => {
                                    return (
                                        <Stack key={coupon?.id}>
                                            <RestaurantCoupon coupon={coupon} />
                                        </Stack>
                                    )
                                })}
                            </Slider>
                        )}
                    </RestaurantCouponStack>
                )}
            </CustomStackFullWidth>
        </NoSsr>
    )
}

export default RestaurantRightDetails
