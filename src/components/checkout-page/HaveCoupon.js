import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Box, Button, IconButton, Stack, Typography, alpha } from '@mui/material'
import { useQuery } from 'react-query'
import { CouponApi } from '@/hooks/react-query/config/couponApi'
import { useTranslation } from 'react-i18next'
import { onErrorResponse } from '../ErrorResponse'
import { toast } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { setCouponInfo, setCouponType } from '@/redux/slices/global'
import { cartItemsTotalAmount, getAmount } from '@/utils/customFunctions'
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined'
import AddIcon from '@mui/icons-material/Add'
import CustomModal from '@/components/custom-modal/CustomModal'
import CheckOutPromo from '@/components/checkout-page/order-summary/CheckOutPromo'
import { CustomPaperBigCard } from '@/styled-components/CustomStyles.style'
import moment from 'moment'

const HaveCoupon = ({
    restaurant_id,
    setCouponDiscount,
    couponDiscount,
    cartList,
    couponCode,
    setCouponCode,
    data,
    handleClose,
    totalAmountForRefer,
    open,
    setOpen,
}) => {
    const router = useRouter()
    const { method } = router.query
    const [zoneId, setZoneId] = useState(0)
    const [isRefetchCall, setIsRefetchCall] = useState(false)
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const { global } = useSelector((state) => state.globalSettings)
    const currencySymbol = global?.currency_symbol
    const currencySymbolDirection = global?.currency_symbol_direction
    const digitAfterDecimalPoint = Number.parseInt(
        global?.digit_after_decimal_point,
        10
    )

    const handleSuccess = (response) => {
        const totalCartPrice = getAmount(cartItemsTotalAmount(cartList))
        const min_purchase = getAmount(
            response?.data?.min_purchase,
            currencySymbolDirection,
            currencySymbol,
            digitAfterDecimalPoint
        )
        const applyCoupon = () => {
            dispatch(setCouponInfo(response.data))
            toast.success(t('Coupon Applied'))
            dispatch(setCouponType(response.data.coupon_type))
            setCouponDiscount({ ...response.data, zoneId })
            if (typeof window !== 'undefined') {
                localStorage.setItem('coupon', response.data.code)
            }
        }
        if (
            Number.parseInt(response?.data?.min_purchase) <=
            Number.parseInt(totalCartPrice)
        ) {
            if (response?.data?.discount_type === 'percent') {
                applyCoupon()
            } else if (totalCartPrice >= response?.data?.discount) {
                applyCoupon()
            } else {
                toast.error(
                    t('Your total price must be more then coupon amount')
                )
            }
        } else {
            toast.error(`${t('Minimum purchase amount')} ${min_purchase}`)
        }
        handleClose()
    }
    const handelError = (error) => {
        setCouponDiscount(null)
        localStorage.removeItem('coupon')
        onErrorResponse(error)
        setCouponCode(null)
    }

    const { isLoading, refetch, isRefetching } = useQuery(
        'apply-coupon',
        () =>
            CouponApi.applyCoupon(
                couponCode,
                restaurant_id,
                totalAmountForRefer
            ),
        {
            retry: 0,
            onSuccess: handleSuccess,
            onError: (error) => handelError(error),
            enabled: false,
        }
    )

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const couponStorage = localStorage.getItem('coupon')
            setCouponCode(couponStorage)
            const zoneid = JSON.parse(localStorage.getItem('zoneid'))
            setZoneId(zoneid?.[0])
        }
        return () => {
            localStorage.removeItem('coupon')
        }
    }, [])
    const removeCoupon = () => {
        setCouponDiscount(null)
        localStorage.removeItem('coupon')
        setCouponCode(null)
    }
    const handleApply = (value) => {
        setIsRefetchCall(true)
        setCouponCode(value)
    }
    useEffect(() => {
        if (couponCode && isRefetchCall) {
            refetch().then()
        }
    }, [couponCode])

    if (method === 'offline') return null

    const isApplied = Boolean(couponDiscount)
    const discountLabel =
        couponDiscount?.coupon_type === 'free_delivery'
            ? t('Free Delivery')
            : couponDiscount?.discount_type === 'percent'
                ? `${couponDiscount?.discount}% ${t('OFF')}`
                : `${getAmount(
                    couponDiscount?.discount,
                    currencySymbolDirection,
                    currencySymbol,
                    digitAfterDecimalPoint
                )} ${t('OFF')}`
    const validityLabel =
        couponDiscount?.start_date && couponDiscount?.expire_date
            ? `${t('Valid from')} ${moment(couponDiscount.start_date).format(
                'MMM D, YYYY'
            )} - ${moment(couponDiscount.expire_date).format('MMM D, YYYY')}`
            : null

    return (
        <>
            <CustomPaperBigCard padding="16px" noboxshadow="true">
                <Stack sx={{ gap: '16px' }}>
                    <Stack
                        direction="row"
                        alignItems="flex-start"
                        justifyContent="space-between"
                        gap="12px"
                    >
                        <Stack sx={{ gap: '2px' }}>
                            <Typography
                                sx={{
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    letterSpacing: '-0.48px',
                                    color: 'text.primary',
                                }}
                            >
                                {t('Add Coupon')}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '13px',
                                    color: 'text.secondary',
                                }}
                            >
                                {t('To save more use available coupons')}
                            </Typography>
                        </Stack>
                        <IconButton
                            onClick={() => setOpen(true)}
                            sx={{
                                flexShrink: 0,
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                color: isApplied ? 'text.info' : 'text.primary',
                                backgroundColor: isApplied
                                    ? 'transparent'
                                    : (theme) => theme.palette.neutral[200],
                            }}
                        >
                            {isApplied ? (
                                <i
                                    className="fi fi-rr-pencil"
                                    style={{
                                        fontSize: '16px',
                                        lineHeight: 1,
                                        color: 'inherit',
                                    }}
                                />
                            ) : (
                                <AddIcon sx={{ fontSize: 18 }} />
                            )}
                        </IconButton>
                    </Stack>

                    {isApplied && (
                        <Box
                            sx={{
                                borderRadius: '12px',
                                overflow: 'hidden',
                                backgroundColor: (theme) =>
                                    alpha(theme.palette.error.main, 0.1),
                            }}
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                flexWrap="wrap"
                                gap="8px"
                                sx={{ px: '16px', pt: '12px', pb: '8px' }}
                            >
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    gap="8px"
                                    sx={{ minWidth: 0, flex: 1 }}
                                >
                                    <ConfirmationNumberOutlinedIcon
                                        sx={{
                                            fontSize: 18,
                                            color: 'error.main',
                                            flexShrink: 0,
                                        }}
                                    />
                                    <Typography
                                        noWrap
                                        sx={{
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            letterSpacing: '-0.42px',
                                            color: 'text.primary',
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {couponDiscount?.code}
                                    </Typography>
                                </Stack>
                                <Typography
                                    sx={{
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        letterSpacing: '-0.48px',
                                        color: 'text.primary',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {discountLabel}
                                </Typography>
                            </Stack>

                            <Box sx={{ position: 'relative', mx: '20px' }}>
                                <Box
                                    sx={{
                                        borderTop: '2px dashed',
                                        borderColor: (theme) =>
                                            alpha(
                                                theme.palette.error.main,
                                                0.35
                                            ),
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '-10px',
                                        left: '-30px',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: 'background.paper',
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '-10px',
                                        right: '-30px',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: 'background.paper',
                                    }}
                                />
                            </Box>

                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                flexWrap="wrap"
                                gap="8px"
                                sx={{ px: '16px', pt: '8px', pb: '12px' }}
                            >
                                {validityLabel && (
                                    <Typography
                                        sx={{
                                            fontSize: '12px',
                                            color: 'text.secondary',
                                            flex: 1,
                                            minWidth: 0,
                                        }}
                                    >
                                        {validityLabel}
                                    </Typography>
                                )}
                                <Button
                                    onClick={removeCoupon}
                                    variant="contained"
                                    color="error"
                                    sx={{
                                        flexShrink: 0,
                                        minWidth: 'auto',
                                        px: '12px',
                                        py: '6px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        borderRadius: '4px',
                                        boxShadow: 'none',
                                        '&:hover': { boxShadow: 'none' },
                                    }}
                                >
                                    {t('Cancel')}
                                </Button>
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </CustomPaperBigCard>

            <CustomModal
                openModal={open}
                handleClose={handleClose}
                maxWidth="450px"
                setModalOpen={setOpen}
            >
                <CheckOutPromo
                    loading={isLoading || isRefetching}
                    handleClose={handleClose}
                    data={data}
                    handleApply={handleApply}
                />
            </CustomModal>
        </>
    )
}
export default HaveCoupon
