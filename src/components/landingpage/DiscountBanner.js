import React from 'react'
import CustomContainer from '../container'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { Stack } from '@mui/material'
import { DiscountBannerBox } from './landingPageStyle'
import Card from '@mui/material/Card'
import Skeleton from '@mui/material/Skeleton'
import CustomNextImage from '@/components/CustomNextImage'

const DiscountBanner = ({ discount_banner }) => {
    return (
        <CustomContainer>
            <CustomStackFullWidth
                sx={{ mt: '60px' }}
            >
                <DiscountBannerBox>
                    <CustomNextImage src={discount_banner} width={1152} height={250} objectFit='cover' />
                </DiscountBannerBox>
            </CustomStackFullWidth>
        </CustomContainer>
    )
}

export default DiscountBanner
