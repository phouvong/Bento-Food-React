import React, { useEffect, useState } from 'react'
import { Box, Divider, Grid, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import OrderCard from './OrderCard'
import { useDispatch, useSelector } from 'react-redux'
import { useQuery } from 'react-query'
import { OrderApi } from '@/hooks/react-query/config/orderApi'
import CustomShimmerCard from '../customShimmerForProfile/CustomShimmerCard'
import CustomePagination from '../pagination/Pagination'
import {
    CustomPaperBigCard,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import { useTheme } from '@mui/material/styles'
import { setOrderType } from '@/redux/slices/orderType'
import useMediaQuery from '@mui/material/useMediaQuery'
import { onSingleErrorResponse } from '../ErrorResponse'
import OutLineGroupButtons from './OutLineGroupButtons'
import CustomEmptyResult from '../empty-view/CustomEmptyResult'
import { groupOrdersByDate, formatOrderGroupLabel } from './groupOrdersByDate'

export const buttonsData = [
    { title: 'Ongoing', value: 'running-orders' },
    { title: 'Previous', value: 'list' },
    { title: 'Repeat Order', value: 'order-subscription-list' },
]
import Meta from '../Meta'
import { noOrderFound } from '@/utils/LocalImages'

const OrderHistoryPage = ({ noCard = false, limit: propLimit }) => {
    const dispatch = useDispatch()
    const theme = useTheme()
    const { t } = useTranslation()
    const { global } = useSelector((state) => state.globalSettings)
    const { orderType } = useSelector((state) => state.orderType)
    const [limit, setLimit] = useState(propLimit || 10)
    const [offset, setOffset] = useState(1)
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const { isLoading, data, isError, error, refetch } = useQuery(
        [orderType === 'orders-list', orderType, limit, offset],
        () => OrderApi.orderHistory(orderType, limit, offset),
        {
            onError: onSingleErrorResponse,
        }
    )
    const handleOrderType = (value) => {
        setOffset(1)
        dispatch(setOrderType(value))
    }
    useEffect(() => {
        dispatch(setOrderType(orderType ? orderType : 'running-orders'))
        orderType && refetch()
    }, [])

    const content = (
        <Grid container spacing={2.4}>
            <Grid item xs={12} sm={12} md={12}>
                <OutLineGroupButtons
                    handleSelection={handleOrderType}
                    buttonsData={buttonsData}
                    selected={orderType}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
                {isLoading ? (
                    <Box mb="1rem">
                        <CustomShimmerCard />
                    </Box>
                ) : data?.data?.orders?.length > 0 ? (
                    <Stack gap="32px">
                        {groupOrdersByDate(data?.data?.orders).map((group) => (
                            <Stack key={group.key} gap="16px">
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    gap="16px"
                                >
                                    <Divider
                                        sx={{
                                            flex: 1,
                                            borderColor: (theme) =>
                                                theme.palette.divider,
                                        }}
                                    />
                                    <Typography
                                        noWrap
                                        sx={{
                                            fontSize: '18px',
                                            fontWeight: 700,
                                            lineHeight: 1.1,
                                            letterSpacing: '-0.54px',
                                            color: (theme) =>
                                                theme.palette.text.secondary,
                                        }}
                                    >
                                        {formatOrderGroupLabel(group.key, t)}
                                    </Typography>
                                    <Divider
                                        sx={{
                                            flex: 1,
                                            borderColor: (theme) =>
                                                theme.palette.divider,
                                        }}
                                    />
                                </Stack>
                                <Stack gap="32px">
                                    {group.orders.map((order, index) => (
                                        <React.Fragment key={order?.id ?? index}>
                                            <OrderCard
                                                order={order}
                                                refetch={refetch}
                                            />
                                            {index < group.orders.length - 1 && (
                                                <Divider
                                                    sx={{
                                                        borderColor: (theme) =>
                                                            theme.palette
                                                                .neutral[200],
                                                    }}
                                                />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </Stack>
                            </Stack>
                        ))}
                    </Stack>
                ) : null}

                {data?.data?.orders?.length > 0 &&
                    data?.data?.total_size > 10 && (
                        <CustomStackFullWidth
                            sx={{ height: '50px', mt: '1rem' }}
                            alignItems="center"
                            justifyContent="center"
                        >
                            <CustomePagination
                                total_size={data?.data?.total_size}
                                page_limit={limit}
                                offset={offset}
                                setOffset={setOffset}
                            />
                        </CustomStackFullWidth>
                    )}
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
                {data?.data?.orders?.length === 0 && (
                    <Stack
                        minHeight="30vh"
                        pt={{ xs: '10px', md: '50px' }}
                    >
                        <CustomEmptyResult
                            label="No Order found"
                            image={noOrderFound}
                            height={80}
                            width={80}
                        />
                    </Stack>
                )}
            </Grid>
        </Grid>
    )

    return (
        <>
            <Meta
                title={` My Order-${global?.business_name}`}
                description=""
                keywords=""
            />
            {noCard ? (
                content
            ) : (
                <CustomPaperBigCard
                    padding={
                        isXSmall ? '16px' : '24px 24px 20px'
                    }
                    border={false}
                    noboxshadow="true"
                    sx={{
                        minHeight: !isXSmall && '558px',
                        borderRadius: '16px',
                    }}
                >
                    {content}
                </CustomPaperBigCard>
            )}
        </>
    )
}

export default OrderHistoryPage
