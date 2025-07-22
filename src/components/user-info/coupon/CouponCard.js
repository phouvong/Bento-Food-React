import React, { useState } from 'react'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { IconButton, Stack, Typography, Card } from '@mui/material'
import CustomImageContainer from '../../CustomImageContainer'
import percentageCoupon from '../../../../public/static/profile/couponper.svg'
import CouponVector from './CouponVector'
import { useTheme } from '@mui/material/styles'
import { useSelector } from 'react-redux'
import { getAmount } from '@/utils/customFunctions'
import { t } from 'i18next'
import CustomCopyWithTooltip from './CustomCopyWithToolTip'
import amount_coupon from '../../../../public/static/profile/amountcoupon.svg'
import { CouponTypography } from '../loyality/Loyality.style'
import moment from 'moment'
import LoadingButton from '@mui/lab/LoadingButton'
import CustomNextImage from '@/components/CustomNextImage'

const CouponCard = ({
                        coupon,
                        fromCheckout,
                        getCouponCodeFromCard,
                        loading,
                        disabled
                    }) => {
    const theme = useTheme()
    const valid_until = t('Valid until')
    const min = t('*min purchase')
    const [tooltipOpen, setTooltipOpen] = useState(false)
    const { global } = useSelector((state) => state.globalSettings)
    let currencySymbol, currencySymbolDirection, digitAfterDecimalPoint

    if (global) {
        currencySymbol = global.currency_symbol
        currencySymbolDirection = global.currency_symbol_direction
        digitAfterDecimalPoint = global.digit_after_decimal_point
    }

    const imageHandler = () => {
        if (coupon?.discount_type === 'percent') {
            return (
                <CustomNextImage
                    src={percentageCoupon}
                    width="30"
                    height="30"
                />
            )
        } else {
            return (
                <Stack position="relative">
                    <CouponTypography>{currencySymbol}</CouponTypography>
                    <CustomNextImage
                        src={amount_coupon}
                        width="30"
                        height="30"
                    />
                </Stack>
            )
        }
    }

    return (
        <Card
            elevation={9}
            sx={{
                padding: '.5rem',
                opacity: disabled ? 0.5 : 1,
                pointerEvents: disabled ? 'none' : 'auto',
                boxShadow:
                    '0px 0px 2px rgba(0, 0, 0, 0.1), 0px 5px 10px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                backgroundColor: (theme) =>
                    theme.palette.mode === 'dark'
                        ? theme.palette.cardBackground1
                        : theme.palette.neutral[100],
                '&::after': {
                    position: 'absolute',
                    content: '""',
                    height: '40px',
                    right: '-20px',
                    borderRadius: '40px',
                    zIndex: '1',
                    top: '30%',
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'dark'
                            ? theme.palette.cardBackground2
                            : theme.palette.neutral[200],
                    width: '40px',
                },
                '&::before': {
                    position: 'absolute',
                    content: '""',
                    height: '40px',
                    left: '-20px',
                    borderRadius: '40px',
                    zIndex: '1',
                    top: '30%',
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'dark'
                            ? theme.palette.cardBackground2
                            : theme.palette.neutral[200],
                    width: '40px',
                    boxShadow:
                        '0px 0px 2px rgba(0, 0, 0, 0.1), 0px 5px 10px rgba(0, 0, 0, 0.05)',
                },
            }}
        >
            <CustomStackFullWidth
                alignItems="center"
                justifyContent="center"
                direction="row"
                spacing={2}
            >
                <Stack
                    sx={{ paddingInlineStart: '15px' }}
                    alignItems="center"
                    justifyContent="center"
                    width="100%"
                    maxWidth="100px"
                >
                    {imageHandler()}
                    <Typography
                        fontSize={{ xs: '13px', sm: '15px', md: '16px' }}
                        fontWeight="600"
                        textAlign="center"
                    >
                        {coupon?.coupon_type === 'free_delivery'
                            ? 'Free Delivery'
                            : coupon?.discount_type === 'percent'
                                ? `${coupon?.discount} %`
                                : getAmount(
                                    coupon.discount,
                                    currencySymbolDirection,
                                    currencySymbol,
                                    digitAfterDecimalPoint
                                )}{' '}
                        {coupon?.coupon_type === 'free_delivery'
                            ? ''
                            : t('OFF')}
                    </Typography>
                </Stack>
                <CouponVector />
                <CustomStackFullWidth
                    spacing={0.5}
                    padding="8px"
                    justifyContent="center"
                    alignItems="center"
                >
                   
                    <Typography
                        fontSize="12px"
                        fontWeight="500"
                        textAlign="center"
                        color={theme.palette.neutral[1000]}
                    >
                        {`${moment(coupon?.start_date).format(
                            'DD MMM, YYYY'
                        )} to ${moment(coupon?.expire_date).format(
                            'DD MMM, YYYY'
                        )}`}
                    </Typography>
                    <Typography
                        fontSize="10px"
                        fontWeight="500"
                        color={theme.palette.neutral[500]}
                    >
                        {`${min} ${getAmount(
                            coupon?.min_purchase,
                            currencySymbolDirection,
                            currencySymbol,
                            digitAfterDecimalPoint
                        )}`}
                    </Typography>
                    {fromCheckout && (
                        <LoadingButton
                            variant="contained"
                            disabled={disabled}
                            onClick={() => getCouponCodeFromCard(coupon?.code)}
                            sx={{
                                padding: '4px 4px',
                                width: '80px',
                                fontSize: '12px',
                            }}
                        >
                            {t('Apply')}
                        </LoadingButton>
                    )}
                </CustomStackFullWidth>

                <Stack alignSelf="start">
                    {!fromCheckout && (
                        <IconButton disabled={disabled}>
                            <CustomCopyWithTooltip t={t} value={coupon?.code} />
                        </IconButton>
                    )}
                </Stack>
            </CustomStackFullWidth>
        </Card>
    )
}

export default CouponCard
