import React from 'react'
import { Box, CssBaseline } from '@mui/material'
import { useTranslation } from 'react-i18next'
import RestaurantList from './RestaurantList'
import CustomContainer from '../container'
import HomeSidebar from '@/components/home/home-sidebar/HomeSidebar'
import CustomPageTitleSubtitle from '../CustomPageTitleSubtitle'

const Restaurant = () => {
    const { t } = useTranslation()
    return (
        <>
            <CssBaseline />
            <CustomContainer>
                <Box
                    sx={{
                        marginTop: {xs: '5rem', md: '7rem' },
                        display: { xs: 'block', md: 'grid' },
                        gridTemplateColumns: { md: '260px 1fr' },
                        columnGap: { md: '28px' },
                    }}
                >
                    <Box
                        sx={{
                            display: { xs: 'none', md: 'block' },
                            position: 'relative',
                        }}
                    >
                        <HomeSidebar />
                    </Box>
                    <Box
                        sx={{
                            minWidth: 0,
                            marginTop: { xs: '1.5rem', md: '1.5rem' },
                        }}
                    >
                        <CustomPageTitleSubtitle
                            title={t('Restaurants')}
                            subtitle={t(
                                'Browse and discover restaurants — filter, explore, and order your favorites.'
                            )}
                        />
                        <RestaurantList />
                    </Box>
                </Box>
            </CustomContainer>
        </>
    )
}

export default Restaurant
