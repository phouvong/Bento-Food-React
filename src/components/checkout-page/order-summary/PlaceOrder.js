import React, { useState } from 'react'
import { Box, IconButton, Stack, Typography, alpha } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { CustomTypography } from '../../custom-tables/Tables.style'
import LoadingButton from '@mui/lab/LoadingButton'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import {
    setOfflineInfoStep,
    setOfflineWithPartials,
} from '@/redux/slices/OfflinePayment'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { getAmount } from '@/utils/customFunctions'

const PlaceOrder = (props) => {
    const {
        distanceLoading,
        placeOrder,
        orderLoading,
        offlinePaymentLoading,
        checkoutApisFetching,
        offlineFormRef,
        usePartialPayment,
        page,
        paymentMethodDetails,
        payableAmount,
        originalAmount,
        currencySymbol,
        currencySymbolDirection,
        digitAfterDecimalPoint,
        restaurantReady,
    } = props
    const router = useRouter()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const theme = useTheme()
    const [checked] = useState(true)
    const { token } = useSelector((state) => state.userToken)
    const { offlineInfoStep } = useSelector((state) => state.offlinePayment)
    const { guestUserInfo } = useSelector((state) => state.guestUserInfo)
    const handleOfflineOrder = () => {
        if (!token && guestUserInfo === null) {
            toast.error(t('The Contact Person Info Is Required.'), {
                position: 'bottom-right',
            })
        } else {
            if (usePartialPayment) {
                dispatch(setOfflineInfoStep(2))
                dispatch(setOfflineWithPartials(true))
                router.push(
                    {
                        pathname: '/checkout',
                        query: { ...router.query, page: page, method: 'offline' },
                    },
                    undefined,
                    { shallow: true }
                )
            } else {
                dispatch(setOfflineInfoStep(2))
                dispatch(setOfflineWithPartials(false))
                router.push(
                    {
                        pathname: '/checkout',
                        query: { ...router.query, page: page, method: 'offline' },
                    },
                    undefined,
                    { shallow: true }
                )
            }
        }
    }
    const offlinePlaceOrder = () => {
        if (offlineFormRef.current) {
            offlineFormRef.current.handleSubmit() // Trigger form submission from Child2
        }
    }

    const mobileFullWidthButtonSx = {
        width: { xs: '100%', sm: '100%' },
        alignSelf: { xs: 'stretch', sm: 'auto' },
        display: { xs: 'none', sm: 'inline-flex' },
    }

    const isOfflinePayment = paymentMethodDetails?.method === 'offline_payment'
    const isOfflineStepTwo = isOfflinePayment && offlineInfoStep === 2
    const isOfflineStepZeroOrOne =
        isOfflinePayment && (offlineInfoStep === 0 || offlineInfoStep === 1)

    const stickyBarButton = isOfflineStepZeroOrOne
        ? {
              label: t('Confirm Order'),
              onClick: handleOfflineOrder,
              loading: checkoutApisFetching,
              disabled: !restaurantReady,
          }
        : isOfflineStepTwo
          ? {
                label: t('Place Order'),
                onClick: offlinePlaceOrder,
                loading:
                    orderLoading ||
                    offlinePaymentLoading ||
                    distanceLoading ||
                    checkoutApisFetching,
                disabled: !checked || !restaurantReady || checkoutApisFetching,
            }
          : {
                label: t('Confirm Order'),
                onClick: placeOrder,
                loading: orderLoading || distanceLoading || checkoutApisFetching,
                disabled: !checked || !restaurantReady || checkoutApisFetching,
            }

    const showStickyPrice = payableAmount !== null && payableAmount !== undefined

    const scrollToBreakdown = () => {
        if (typeof window === 'undefined') return
        const el = document.getElementById('order-calculation-card')
        if (!el) return
        const headerOffset = 72
        const stickyBarOffset = 100
        const rect = el.getBoundingClientRect()
        const absoluteTop = rect.top + window.pageYOffset
        const absoluteBottom = rect.bottom + window.pageYOffset
        const bottomAligned =
            absoluteBottom - (window.innerHeight - stickyBarOffset)
        const top = Math.min(bottomAligned, absoluteTop - headerOffset)
        window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
    }

    return (
        <>
        <Box
            sx={{
                display: { xs: 'flex', sm: 'none' },
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1100,
                alignItems: 'center',
                gap: '12px',
                px: '16px',
                pt: '16px',
                pb: '20px',
                backgroundColor: 'background.paper',
                boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.08)',
            }}
        >
            <Stack sx={{ flex: 1, minWidth: 0, gap: '4px' }}>
                <Stack direction="row" alignItems="center" gap="8px">
                    <Typography
                        sx={{ fontSize: '14px', color: 'text.secondary' }}
                    >
                        {t('Subtotal')}
                    </Typography>
                    <IconButton
                        onClick={scrollToBreakdown}
                        sx={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: (theme) =>
                                theme.palette.neutral[200],
                        }}
                    >
                        <i
                            className="fi fi-rr-angle-small-up"
                            style={{ fontSize: '13px' }}
                        />
                    </IconButton>
                </Stack>
                <Stack direction="row" alignItems="baseline" gap="6px" flexWrap="wrap">
                    <Typography
                        sx={{ fontSize: '18px', fontWeight: 700, color: 'text.primary' }}
                    >
                        {showStickyPrice
                            ? getAmount(
                                  payableAmount,
                                  currencySymbolDirection,
                                  currencySymbol,
                                  digitAfterDecimalPoint
                              )
                            : ''}
                    </Typography>
                    {originalAmount ? (
                        <Typography
                            sx={{
                                fontSize: '14px',
                                color: 'text.secondary',
                                textDecoration: 'line-through',
                            }}
                        >
                            {getAmount(
                                originalAmount,
                                currencySymbolDirection,
                                currencySymbol,
                                digitAfterDecimalPoint
                            )}
                        </Typography>
                    ) : null}
                </Stack>
            </Stack>
            <LoadingButton
                variant="contained"
                onClick={stickyBarButton.onClick}
                loading={stickyBarButton.loading}
                disabled={stickyBarButton.disabled}
                sx={{ height: '40px', px: '20px', flexShrink: 0 }}
            >
                {stickyBarButton.label}
            </LoadingButton>
        </Box>
        <CustomStackFullWidth
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={2}
            marginTop="1rem"
            sx={{ pb: { xs: '90px', sm: 0 } }}
        >
            {paymentMethodDetails?.method !== 'offline_payment' ? (
                <>
                    <Box
                        sx={{
                            width: '100%',
                            borderRadius: '12px',
                            px: '16px',
                            py: '12px',
                            backgroundColor: (theme) =>
                                alpha(theme.palette.warning.main, 0.12),
                        }}
                    >
                        <CustomTypography sx={{ fontSize: '13px' }}>
                            {t(
                                `I agree that placing the order places me under`
                            )}{' '}
                            <Link
                                href="/terms-and-conditions"
                                style={{
                                    textDecoration: 'underline',
                                    color: theme.palette.primary.main,
                                }}
                            >
                                {t('Terms and Conditions')}
                            </Link>{' '}
                            {t('&')}{' '}
                            <Link
                                href="/privacy-policy"
                                style={{
                                    textDecoration: 'underline',
                                    color: theme.palette.primary.main,
                                }}
                            >
                                {t('Privacy Policy')}
                            </Link>
                        </CustomTypography>
                    </Box>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        gap="12px"
                        sx={{ display: { xs: 'none', sm: 'flex' }, width: '100%' }}
                    >
                        <Stack sx={{ gap: '4px' }}>
                            <Typography
                                sx={{ fontSize: '14px', color: 'text.secondary' }}
                            >
                                {t('Total')}
                            </Typography>
                            <Stack direction="row" alignItems="center" gap="4px">
                                <Typography
                                    sx={{
                                        fontSize: '18px',
                                        fontWeight: 700,
                                        letterSpacing: '-0.54px',
                                        color: 'text.primary',
                                    }}
                                >
                                    {showStickyPrice
                                        ? getAmount(
                                              payableAmount,
                                              currencySymbolDirection,
                                              currencySymbol,
                                              digitAfterDecimalPoint
                                          )
                                        : ''}
                                </Typography>
                                {originalAmount ? (
                                    <Typography
                                        sx={{
                                            fontSize: '14px',
                                            color: 'text.secondary',
                                            textDecoration: 'line-through',
                                        }}
                                    >
                                        {getAmount(
                                            originalAmount,
                                            currencySymbolDirection,
                                            currencySymbol,
                                            digitAfterDecimalPoint
                                        )}
                                    </Typography>
                                ) : null}
                            </Stack>
                        </Stack>
                        <LoadingButton
                            type="submit"
                            variant="contained"
                            onClick={placeOrder}
                            sx={{ height: '40px', px: '20px', flexShrink: 0 }}
                            loading={
                                orderLoading || distanceLoading || checkoutApisFetching
                            }
                            disabled={
                                !checked || !restaurantReady || checkoutApisFetching
                            }
                        >
                            {t('Confirm Order')}
                        </LoadingButton>
                    </Stack>
                </>
            ) : (
                <>
                    {offlineInfoStep === 2 ? (
                        <>
                            <Box
                                sx={{
                                    width: '100%',
                                    borderRadius: '12px',
                                    px: '16px',
                                    py: '12px',
                                    backgroundColor: (theme) =>
                                        alpha(theme.palette.warning.main, 0.12),
                                }}
                            >
                                <CustomTypography sx={{ fontSize: '13px' }}>
                                    {t(
                                        `I agree that placing the order places me under`
                                    )}{' '}
                                    <Link
                                        href="/terms-and-conditions"
                                        style={{
                                            textDecoration: 'underline',
                                            color: theme.palette.primary.main,
                                        }}
                                    >
                                        {t('Terms and Conditions')}
                                    </Link>{' '}
                                    {t('&')}{' '}
                                    <Link
                                        href="/privacy-policy"
                                        style={{
                                            textDecoration: 'underline',
                                            color: theme.palette.primary.main,
                                        }}
                                    >
                                        {t('Privacy Policy')}
                                    </Link>
                                </CustomTypography>
                            </Box>
                            <LoadingButton
                                type="submit"
                                fullWidth
                                variant="contained"
                                onClick={offlinePlaceOrder}
                                sx={mobileFullWidthButtonSx}
                                loading={
                                    orderLoading ||
                                    offlinePaymentLoading ||
                                    distanceLoading ||
                                    checkoutApisFetching
                                }
                                disabled={
                                    !checked ||
                                    !restaurantReady ||
                                    checkoutApisFetching
                                }
                            >
                                {t('Place Order')}
                            </LoadingButton>
                        </>
                    ) : (
                        <>
                            {(offlineInfoStep === 1 ||
                                offlineInfoStep === 0) && (
                                <LoadingButton
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    onClick={handleOfflineOrder}
                                    sx={mobileFullWidthButtonSx}
                                    disabled={!restaurantReady}
                                >
                                    {t('Confirm Order')}
                                </LoadingButton>
                            )}
                        </>
                    )}
                </>
            )}
        </CustomStackFullWidth>
        </>
    )
}

PlaceOrder.propTypes = {}

export default PlaceOrder
