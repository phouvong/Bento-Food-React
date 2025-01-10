import React from 'react'
import CustomContainer from '../container'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { Stack } from '@mui/material'
import { DiscountBannerBox } from './landingPageStyle'
import Card from '@mui/material/Card'
import Skeleton from '@mui/material/Skeleton'

const DiscountBanner = ({ discount_banner }) => {
    return (
        <CustomContainer>
            <CustomStackFullWidth
                sx={{ mt: { xs: '10px', sm: '20px', md: '25px' } }}
            >
                {discount_banner ? (
                    discount_banner && (
                        <DiscountBannerBox
                            sx={{
                                backgroundImage: `url(${discount_banner})`,
                            }}
                        ></DiscountBannerBox>
                    )
                ) : (
                    <Stack width="100%" className="banner-item lg">
                        <Card elevation={0}>
                            <Skeleton
                                variant="rectangular"
                                width="100%"
                                height="180px"
                            />
                        </Card>
                    </Stack>
                )}
            </CustomStackFullWidth>
        </CustomContainer>
    )
}

export default DiscountBanner
