import React, { useEffect } from 'react'
import { Grid, Stack, Typography } from '@mui/material'
import { useQuery } from 'react-query'
import { CouponApi } from '@/hooks/react-query/config/couponApi'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import CustomEmptyResult from '../../empty-view/CustomEmptyResult'
import { useSelector } from 'react-redux'
import { onSingleErrorResponse } from '../../ErrorResponse'
import {
    CustomPaperBigCard,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import CouponCard from './CouponCard'
import Skeleton from '@mui/material/Skeleton'
import useMediaQuery from '@mui/material/useMediaQuery'
import Meta from '../../Meta'
import { noDataFound } from '@/utils/LocalImages'

const CouponList = () => {
    const { t } = useTranslation()
    const theme = useTheme()
    const matches = useMediaQuery('(max-width:745px)')
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const { global } = useSelector((state) => state.globalSettings)
    let zoneId = undefined
    zoneId = localStorage.getItem('zoneid')
    let currencySymbol
    let currencySymbolDirection
    let digitAfterDecimalPoint

    if (global) {
    }
    const { isLoading, data, isError, error, refetch, isRefetching } = useQuery(
        ['coupon-list'],
        CouponApi.couponList,
        {
            enabled: false,
            onError: onSingleErrorResponse,
        }
    )
    useEffect(() => {
        if (zoneId) {
            refetch()
        }
    }, [zoneId, refetch])


    return (
        <>
            <Meta
                title={` My Coupons-${global?.business_name}`}
                description=""
                keywords=""
            />
            <CustomPaperBigCard
                padding={isXSmall ? '10px 10px' : '30px 40px'}
                border={false}
                sx={{
                    minHeight: !isXSmall && '558px',
                    boxShadow: isXSmall && 'unset',
                }}
            >
                <CustomStackFullWidth spacing={2}>
                    {/*{!isXSmall && (*/}
                    {/*    <Typography fontWeight="600" fontSize="16px">*/}
                    {/*        {t('My Coupons')}*/}
                    {/*    </Typography>*/}
                    {/*)}*/}
                    <Grid
                        container
                        rowSpacing={2}
                        columnSpacing={isXSmall ? 0 : 2}
                        sx={{ paddingRight: !isXSmall && '10px' }}
                    >
                       <Grid item xs={12}> <Typography fontWeight="600" fontSize="16px">{t("Available Coupon")}</Typography></Grid>
                        {data?.data?.available?.map((item) => (
                            <Grid
                                item
                                xs={12}
                                sm={matches ? 12 : 6}
                                md={6}
                                key={item.id}
                            >
                                <CouponCard coupon={item} />
                            </Grid>
                        ))}
                        {isLoading && (
                            <Grid
                                container
                                spacing={3}
                                sx={{
                                    paddingTop: '20px',
                                    paddingInlineStart: '20px',
                                }}
                            >
                                <Grid item xs={12} sm={12} md={6}>
                                    <Skeleton
                                        variant="rectangular"
                                        width="100%"
                                        height="127px"
                                        style={{ borderRadius: '5px' }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={12} md={6}>
                                    <Skeleton
                                        variant="rectangular"
                                        width="100%"
                                        height="127px"
                                        style={{ borderRadius: '5px' }}
                                    />
                                </Grid>
                            </Grid>
                        )}
                        {((data?.data?.available?.length === 0 && !isLoading) ||
                            (data === undefined && !isLoading)) && (
                            <Stack
                                justifyContent="center"
                                alignItems="center"
                                width="100%"
                                minHeight="30vh"
                                pt={{ xs: '40px', md: '110px' }}
                            >
                                <CustomEmptyResult
                                    label="No Coupon Found"
                                    image={noDataFound}
                                    height={80}
                                    width={80}
                                />
                            </Stack>
                        )}
                    </Grid>
                    {/*<Grid*/}
                    {/*    container*/}
                    {/*    rowSpacing={2}*/}
                    {/*    columnSpacing={isXSmall ? 0 : 2}*/}
                    {/*    sx={{ paddingRight: !isXSmall && '10px' }}*/}
                    {/*>*/}
                    {/*    {data?.data?.unavailable?.length > 0 && (*/}
                    {/*        <Grid item xs={12}>*/}
                    {/*            <Typography fontWeight="600" fontSize="16px">{t("Unavailable Coupon")}</Typography>*/}
                    {/*        </Grid>*/}
                    {/*    )}*/}

                    {/*    {data?.data?.unavailable?.map((item) => (*/}
                    {/*        <Grid*/}
                    {/*            item*/}
                    {/*            xs={12}*/}
                    {/*            sm={matches ? 12 : 6}*/}
                    {/*            md={6}*/}
                    {/*            key={item.id}*/}
                    {/*        >*/}
                    {/*            <CouponCard coupon={item} disabled />*/}
                    {/*        </Grid>*/}
                    {/*    ))}*/}
                    {/*    {isLoading && (*/}
                    {/*        <Grid*/}
                    {/*            container*/}
                    {/*            spacing={3}*/}
                    {/*            sx={{*/}
                    {/*                paddingTop: '20px',*/}
                    {/*                paddingInlineStart: '20px',*/}
                    {/*            }}*/}
                    {/*        >*/}
                    {/*            <Grid item xs={12} sm={12} md={6}>*/}
                    {/*                <Skeleton*/}
                    {/*                    variant="rectangular"*/}
                    {/*                    width="100%"*/}
                    {/*                    height="127px"*/}
                    {/*                    style={{ borderRadius: '5px' }}*/}
                    {/*                />*/}
                    {/*            </Grid>*/}
                    {/*            <Grid item xs={12} sm={12} md={6}>*/}
                    {/*                <Skeleton*/}
                    {/*                    variant="rectangular"*/}
                    {/*                    width="100%"*/}
                    {/*                    height="127px"*/}
                    {/*                    style={{ borderRadius: '5px' }}*/}
                    {/*                />*/}
                    {/*            </Grid>*/}
                    {/*        </Grid>*/}
                    {/*    )}*/}
                    {/*    /!*{((data?.data?.unavailable?.length === 0 && !isLoading) ||*!/*/}
                    {/*    /!*    (data === undefined && !isLoading)) && (*!/*/}
                    {/*    /!*    <Stack*!/*/}
                    {/*    /!*        justifyContent="center"*!/*/}
                    {/*    /!*        alignItems="center"*!/*/}
                    {/*    /!*        width="100%"*!/*/}
                    {/*    /!*        minHeight="30vh"*!/*/}
                    {/*    /!*        pt={{ xs: '40px', md: '110px' }}*!/*/}
                    {/*    /!*    >*!/*/}
                    {/*    /!*        <CustomEmptyResult*!/*/}
                    {/*    /!*            label="No Coupon Found"*!/*/}
                    {/*    /!*            image={noDataFound}*!/*/}
                    {/*    /!*            height={80}*!/*/}
                    {/*    /!*            width={80}*!/*/}
                    {/*    /!*        />*!/*/}
                    {/*    /!*    </Stack>*!/*/}
                    {/*    /!*)}*!/*/}
                    {/*</Grid>*/}
                </CustomStackFullWidth>
            </CustomPaperBigCard>
        </>
    )
}

export default CouponList
