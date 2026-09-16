import React from 'react'
import { Box, CssBaseline } from '@mui/material'
import { useTranslation } from 'react-i18next'
import RestaurantList from './RestaurantList'
import CustomContainer from '../container'
import MobilePageHeader from '@/components/page-header/MobilePageHeader'

const Restaurant = () => {
    const { t } = useTranslation()
    return (
        <>
            <CssBaseline />
            <CustomContainer>
                <MobilePageHeader title={t('Restaurants')} />
                <Box
                    sx={{
                        paddingTop: { xs: '16px', md: '24px' },
                        minWidth: 0,
                    }}
                >
                    <RestaurantList />
                </Box>
            </CustomContainer>
        </>
    )
}

export default Restaurant
