import React from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { t } from 'i18next'
import { getAmount } from '@/utils/customFunctions'
import { useSelector } from 'react-redux'
import { CouponCard } from './restaurant-details.style'
import RestaurantDiscountIcon from './RestaurantDiscountIcon'
import CustomFormatedDateTime from '@/components/date/CustomFormatedDateTime'

const RestaurantDiscountCoupon = ({ discount }) => {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const { global } = useSelector((state) => state.globalSettings)
    const currencySymbol = global?.currency_symbol
    const currencySymbolDirection = global?.currency_symbol_direction
    const digitAfterDecimalPoint = global?.digit_after_decimal_point

    const isPercent = discount?.discount_type === 'percent'
    const heading = `${
        isPercent
            ? `${discount?.discount}%`
            : getAmount(
                  discount?.discount,
                  currencySymbolDirection,
                  currencySymbol,
                  digitAfterDecimalPoint
              )
    } ${t('OFF')}`

    const bodyParts = []
    if (Number(discount?.min_purchase) > 0) {
        bodyParts.push(
            `${t('Min purchase')} ${getAmount(
                discount?.min_purchase,
                currencySymbolDirection,
                currencySymbol,
                digitAfterDecimalPoint
            )}`
        )
    }
    if (isPercent && Number(discount?.max_discount) > 0) {
        bodyParts.push(
            `${t('Up to')} ${getAmount(
                discount?.max_discount,
                currencySymbolDirection,
                currencySymbol,
                digitAfterDecimalPoint
            )}`
        )
    }
    if (discount?.start_date && discount?.end_date) {
        const startDateTime = CustomFormatedDateTime({
            date: `${discount.start_date} ${discount.start_time ?? ''}`.trim(),
        })
        const endDateTime = CustomFormatedDateTime({
            date: `${discount.end_date} ${discount.end_time ?? ''}`.trim(),
        })
        bodyParts.push(`${t('Valid from')} ${startDateTime} - ${endDateTime}`)
    }
    const body = bodyParts.join(' • ') || t('Discount on all items')

    return (
        <CouponCard variant="discount" sx={{ cursor: 'default' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: theme.palette.warning.main,
                        flexShrink: 0,
                    }}
                >
                    <RestaurantDiscountIcon size={20} />
                </Box>
                <Typography
                    sx={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: isDark ? theme.palette.text.primary : '#303030',
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
                    color: isDark ? theme.palette.text.secondary : '#757575',
                    lineHeight: 1.3,
                }}
            >
                {body}
            </Typography>
        </CouponCard>
    )
}

export default RestaurantDiscountCoupon
