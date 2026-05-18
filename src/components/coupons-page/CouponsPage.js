import React from 'react'
import { Box, CssBaseline, Grid, Skeleton, Stack } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { CouponApi } from '@/hooks/react-query/config/couponApi'
import { onErrorResponse } from '../ErrorResponse'
import CustomContainer from '../container'
import HomeSidebar from '@/components/home/home-sidebar/HomeSidebar'
import CustomPageTitleSubtitle from '../CustomPageTitleSubtitle'
import CouponCard from '../user-info/coupon/CouponCard'
import CustomEmptyResult from '../empty-view/CustomEmptyResult'
import { noDataFound } from '@/utils/LocalImages'

const CouponsPage = () => {
    const { t } = useTranslation()
    const { data, isLoading } = useQuery(
        ['public-coupons'],
        () => CouponApi.couponList(),
        {
            staleTime: 1000 * 60 * 5,
            onError: onErrorResponse,
        }
    )

    const coupons = Array.isArray(data?.data)
        ? data.data
        : data?.data?.available ?? []

    return (
        <>
            <CssBaseline />
            <CustomContainer>
                <Box
                    sx={{
                        marginTop: { xs: '5rem', md: '7rem' },
                        marginBottom: '2rem',
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
                            title={t('Available Coupons')}
                            subtitle={t(
                                'Browse active offers — copy a code and use it at checkout to save on your next order.'
                            )}
                        />

                        {isLoading ? (
                            <Grid container spacing={2}>
                                {[...Array(6)].map((_, i) => (
                                    <Grid item xs={12} sm={6} md={6} key={i}>
                                        <Skeleton
                                            variant="rounded"
                                            width="100%"
                                            height={120}
                                            animation="wave"
                                            sx={{ borderRadius: '12px' }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : coupons.length === 0 ? (
                            <Stack
                                alignItems="center"
                                justifyContent="center"
                                sx={{ minHeight: '40vh' }}
                            >
                                <CustomEmptyResult
                                    image={noDataFound}
                                    label={t('No coupons available')}
                                />
                            </Stack>
                        ) : (
                            <Grid container spacing={2}>
                                {coupons.map((coupon) => (
                                    <Grid
                                        item
                                        xs={12}
                                        sm={6}
                                        md={6}
                                        key={coupon?.id}
                                    >
                                        <CouponCard coupon={coupon} />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                </Box>
            </CustomContainer>
        </>
    )
}

export default CouponsPage
