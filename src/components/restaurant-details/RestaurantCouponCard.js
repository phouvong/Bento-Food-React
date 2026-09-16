import React from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { toast } from 'react-hot-toast'
import { t } from 'i18next'
import { getAmount } from '@/utils/customFunctions'
import moment from 'moment'
import { useSelector } from 'react-redux'
import { PromoCouponCard } from './restaurant-details.style'
import CouponTicketIcon from './CouponTicketIcon'

const RestaurantCouponCard = ({ coupon }) => {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const { global } = useSelector((state) => state.globalSettings)
    const currencySymbol = global?.currency_symbol
    const currencySymbolDirection = global?.currency_symbol_direction
    const digitAfterDecimalPoint = global?.digit_after_decimal_point

    const isFreeDelivery = coupon?.coupon_type === 'free_delivery'

    const title =
        coupon?.title ||
        (isFreeDelivery ? t('Free Delivery Coupon') : t('Restaurant Coupon'))

    const discountLabel = isFreeDelivery
        ? t('Free Delivery')
        : `${
              coupon?.discount_type === 'percent'
                  ? `${coupon?.discount}%`
                  : getAmount(
                        coupon?.discount,
                        currencySymbolDirection,
                        currencySymbol,
                        digitAfterDecimalPoint
                    )
          } ${t('OFF')}`

    const bodyParts = [`${t('Code')}: ${coupon?.code}`]
    if (Number(coupon?.min_purchase) > 0) {
        bodyParts.push(
            `${t('Min purchase')} ${getAmount(
                coupon?.min_purchase,
                currencySymbolDirection,
                currencySymbol,
                digitAfterDecimalPoint
            )}`
        )
    }
    if (coupon?.start_date && coupon?.expire_date) {
        bodyParts.push(
            `${t('Valid from')} ${moment(coupon.start_date).format(
                'MMM D, YYYY'
            )} - ${moment(coupon.expire_date).format('MMM D, YYYY')}`
        )
    }
    const body = bodyParts.join(' • ')

    const handleCopy = () => {
        if (!coupon?.code) return
        navigator.clipboard.writeText(coupon.code)
        toast.success(t('Coupon code copied.'))
    }

    return (
        <PromoCouponCard onClick={handleCopy} sx={{ cursor: 'pointer' }}>
            <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{ pt: '12px', pb: '4px', px: '16px' }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ flex: 1, minWidth: 0 }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            color: 'error.main',
                            flexShrink: 0,
                        }}
                    >
                        <CouponTicketIcon size={20} />
                    </Box>
                    <Typography
                        noWrap
                        sx={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: isDark
                                ? theme.palette.text.primary
                                : '#1E1E1E',
                            lineHeight: 1.1,
                            letterSpacing: '-0.42px',
                        }}
                    >
                        {title}
                    </Typography>
                </Stack>
                <Typography
                    sx={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: isDark ? theme.palette.text.primary : '#1E1E1E',
                        lineHeight: 1.1,
                        letterSpacing: '-0.48px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                    }}
                >
                    {discountLabel}
                </Typography>
            </Stack>

            <Box sx={{ position: 'relative', width: '100%', height: '20px' }}>
                <Box
                    sx={{
                        position: 'absolute',
                        left: '10px',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        borderTop: `2px dashed ${theme.palette.background.paper}`,
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '10px',
                        height: '20px',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            left: '-10px',
                            top: 0,
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: 'background.default',
                            border: `2px solid ${theme.palette.background.paper}`,
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        width: '10px',
                        height: '20px',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            right: '-10px',
                            top: 0,
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: 'background.default',
                            border: `2px solid ${theme.palette.background.paper}`,
                        }}
                    />
                </Box>
            </Box>

            <Box sx={{ pb: '12px', px: '16px' }}>
                <Typography
                    sx={{
                        fontSize: '12px',
                        color: isDark ? theme.palette.text.secondary : '#757575',
                        lineHeight: 1.3,
                    }}
                >
                    {body}
                </Typography>
            </Box>
        </PromoCouponCard>
    )
}

export default RestaurantCouponCard
