import React from 'react'
import { Stack, Typography } from '@mui/material'
import { getAmount, handleTotalAmountWithAddons } from '@/utils/customFunctions'
import { rawFoodDataNormalize } from '@/components/new-food-card/rawFoodDataNormalize'

const TotalAmountVisibility = (props) => {
    const {
        modalData,
        totalPrice,
        currencySymbolDirection,
        currencySymbol,
        digitAfterDecimalPoint,
        t,
        productDiscount,
        productDiscountType,
        selectedAddOns,
        quantity,
    } = props

    if (!modalData?.length) return null

    const { discountedPrice, hasDiscount } = rawFoodDataNormalize(
        {
            price: totalPrice,
            discount: productDiscount,
            discount_type: productDiscountType,
        },
        quantity
    )

    const finalAmount = getAmount(
        handleTotalAmountWithAddons(discountedPrice, selectedAddOns),
        currencySymbolDirection,
        currencySymbol,
        digitAfterDecimalPoint
    )

    return (
        <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
        >
            {/* Label — "Total (Inc. VAT/TAX)" */}
            <Stack
                direction="row"
                alignItems="baseline"
                spacing={0.5}
                flexWrap="wrap"
            >
                <Typography
                    component="span"
                    sx={{
                        fontSize: { xs: '14px', md: '15px' },
                        fontWeight: 700,
                        color: (theme) => theme.palette.text.primary,
                    }}
                >
                    {t('Total')}
                </Typography>
                <Typography
                    component="span"
                    sx={{
                        fontSize: '11px',
                        fontWeight: 400,
                        color: (theme) => theme.palette.neutral[500],
                    }}
                >
                    ({t('Inc. VAT/TAX')})
                </Typography>
            </Stack>

            {/* Amount — struck-through original, then the payable total */}
            <Stack direction="row" alignItems="center" spacing={0.75}>
                {hasDiscount ? (
                    <Typography
                        component="del"
                        sx={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: (theme) => theme.palette.neutral[500],
                        }}
                    >
                        {getAmount(
                            handleTotalAmountWithAddons(
                                totalPrice,
                                selectedAddOns
                            ),
                            currencySymbolDirection,
                            currencySymbol,
                            digitAfterDecimalPoint
                        )}
                    </Typography>
                ) : null}
                <Typography
                    component="span"
                    sx={{
                        fontSize: { xs: '16px', md: '17px' },
                        fontWeight: 700,
                        color: (theme) => theme.palette.text.primary,
                    }}
                >
                    {finalAmount}
                </Typography>
            </Stack>
        </Stack>
    )
}

TotalAmountVisibility.propTypes = {}

export default TotalAmountVisibility
