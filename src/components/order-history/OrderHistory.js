import React from 'react'
import { Box, CssBaseline } from '@mui/material'
import { useTranslation } from 'react-i18next'
import OrderHistoryPage from './OrderHistoryPage'
import CustomContainer from '../container'
import HomeSidebar from '@/components/home/home-sidebar/HomeSidebar'
import CustomPageTitleSubtitle from '../CustomPageTitleSubtitle'

const OrderHistory = () => {
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
                        }}
                    >
                        <CustomPageTitleSubtitle
                            title={t('Recently Ordered')}
                            subtitle={t(
                                'Re-order your favorites in seconds — view past orders and track active ones.'
                            )}
                        />
                        <OrderHistoryPage noCard limit={12} />
                    </Box>
                </Box>
            </CustomContainer>
        </>
    )
}

export default OrderHistory
