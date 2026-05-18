import React from 'react'
import { Box, CssBaseline } from '@mui/material'
import { useTranslation } from 'react-i18next'
import WishlistPage from './WishlistPage'
import CustomContainer from '../container'
import HomeSidebar from '@/components/home/home-sidebar/HomeSidebar'
import CustomPageTitleSubtitle from '../CustomPageTitleSubtitle'

const WishList = () => {
    const { t } = useTranslation()
    return (
        <>
            <CssBaseline />
            <CustomContainer>
                <Box
                    sx={{
                        marginTop: { xs: '5rem', md: '7rem' },
                        marginBottom: { xs: '72px', md: '2rem' },
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
                            minHeight: '70vh',
                        }}
                    >
                        <CustomPageTitleSubtitle
                            title={t('My Wishlist')}
                            subtitle={t(
                                'Foods and restaurants you saved for later — order anytime in a tap.'
                            )}
                        />
                        <WishlistPage noCard />
                    </Box>
                </Box>
            </CustomContainer>
        </>
    )
}

export default WishList
