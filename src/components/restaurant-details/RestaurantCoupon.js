import React from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded'
import LoyaltyRoundedIcon from '@mui/icons-material/LoyaltyRounded'
import { toast } from 'react-hot-toast'
import { t } from 'i18next'
import { formatedDate, getAmount } from '@/utils/customFunctions'
import { useSelector } from 'react-redux'
import { CouponCard, TicketCutOut } from './restaurant-details.style'

// 6amMart store-details style coupon card. Clicking anywhere on the card
// copies the coupon code.
const RestaurantCoupon = ({ coupon }) => {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const { global } = useSelector((state) => state.globalSettings)
    let currencySymbol
    let currencySymbolDirection
    let digitAfterDecimalPoint

    if (global) {
        currencySymbol = global.currency_symbol
        currencySymbolDirection = global.currency_symbol_direction
        digitAfterDecimalPoint = global.digit_after_decimal_point
    }

    const isFreeDelivery = coupon?.coupon_type === 'free_delivery'
    const variant = isFreeDelivery ? 'ticket' : 'discount'

    const heading = isFreeDelivery
        ? t('Free Delivery')
        : `${
              coupon?.discount_type === 'percent'
                  ? `${coupon?.discount} %`
                  : getAmount(
                        coupon?.discount,
                        currencySymbolDirection,
                        currencySymbol,
                        digitAfterDecimalPoint
                    )
          } ${t('OFF')}`

    const body =
        Number(coupon?.min_purchase) > 0
            ? `${t('Min purchase')} ${getAmount(
                  coupon?.min_purchase,
                  currencySymbolDirection,
                  currencySymbol,
                  digitAfterDecimalPoint
              )} — ${t('Code')}: ${coupon?.code}`
            : `${t('Code')}: ${coupon?.code} — ${formatedDate(
                  coupon?.start_date
              )} ${t('to')} ${formatedDate(coupon?.expire_date)}`

    const handleCopy = () => {
        if (!coupon?.code) return
        navigator.clipboard.writeText(coupon.code)
        toast.success(t('Coupon code copied.'))
    }

    return (
        <CouponCard
            variant={variant}
            onClick={handleCopy}
            sx={isFreeDelivery ? { pl: '34px' } : undefined}
        >
            <Stack direction="row" alignItems="center" spacing={1}>
                {isFreeDelivery ? (
                    <LocalOfferRoundedIcon
                        sx={{
                            fontSize: 20,
                            color: theme.palette.error.main,
                        }}
                    />
                ) : (
                    // filled circle badge, matching the reference design
                    <Stack
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            backgroundColor: theme.palette.warning.main,
                            flexShrink: 0,
                        }}
                    >
                        <LoyaltyRoundedIcon
                            sx={{
                                fontSize: 15,
                                color: theme.palette.background.paper,
                            }}
                        />
                    </Stack>
                )}
                <Typography
                    sx={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: isDark ? theme.palette.text.primary : '#1F2937',
                        lineHeight: 1.1,
                        letterSpacing: '-0.48px',
                        textTransform: 'capitalize',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {heading}
                </Typography>
            </Stack>
            <Typography
                sx={{
                    fontSize: '12px',
                    color: isDark ? theme.palette.text.secondary : '#4B5563',
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                {body}
            </Typography>
            {isFreeDelivery && (
                <>
                    <TicketCutOut side="left" />
                    <TicketCutOut side="right" />
                    {/* ticket stub separator */}
                    <Box
                        sx={{
                            position: 'absolute',
                            left: 18,
                            top: 10,
                            bottom: 10,
                            borderLeft: `2px dashed ${theme.palette.background.paper}`,
                        }}
                    />
                </>
            )}
        </CouponCard>
    )
}

export default RestaurantCoupon
