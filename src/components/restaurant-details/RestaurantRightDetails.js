import React from 'react'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CustomImageContainer from '../CustomImageContainer'
import RestaurantCoupon from './RestaurantCoupon'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { NoSsr, Stack } from '@mui/material'
import { RestaurantCouponStack } from './restaurant-details.style'
import { settings } from './CouponSettings'
import CustomImage from '@/components/CustomNextImage'

const RestaurantRightDetails = ({ details, data, scrollPosition, threshold }) => {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))

    const imageHeight = isSmall ? 150 : scrollPosition <= threshold ? 250 : 180

    return (
        <NoSsr>
            <CustomStackFullWidth
                sx={{
                    position: !isSmall && 'relative',
                    background: (theme) => theme.palette.neutral[100],
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: imageHeight,
                    overflow: 'hidden',
                }}
            >

                <CustomImage
                    src={details?.cover_photo_full_url}
                    height={imageHeight}
                    width={700}
                    objectFit="cover"
                    errorWidth={80}
                    errorHeight={80}
                    alt="Restaurant Cover Photo"
                    style={{ width: details?.cover_photo_full_url ? '100%' : undefined }}
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
