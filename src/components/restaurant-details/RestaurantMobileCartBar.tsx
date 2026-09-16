import React from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { setCartDrawerOpen } from '@/redux/slices/utils'
import {
    getAmount,
    getProductDiscount,
    getSubTotalPrice,
} from '@/utils/customFunctions'
import useGetDiscountEligibility from '@/hooks/react-query/add-cart/useGetDiscountEligibility'

// Same loose cart-line shape the sidebar uses — only the fields read here.
type CartLineItem = Record<string, unknown> & {
    quantity?: number
    totalPrice?: number
    variations?: Array<Record<string, unknown>>
    bogoDetails?: Record<string, unknown>
}

interface RestaurantMobileCartBarProps {
    restaurantDetails?: Record<string, any>
}

const RestaurantMobileCartBar: React.FC<RestaurantMobileCartBarProps> = ({
    restaurantDetails,
}) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const dispatch = useDispatch()

    const { cartList = [] } = useSelector(
        (state: { cart: { cartList: CartLineItem[] } }) => state.cart
    )
    const { global } = useSelector(
        (state: { globalSettings: { global?: Record<string, any> } }) =>
            state.globalSettings
    )

    const totalCartPrice = getSubTotalPrice(cartList)
    const { data: discountEligibility } = useGetDiscountEligibility(
        restaurantDetails?.id,
        totalCartPrice
    )

    if (!cartList.length) return null

    const currencySymbol = global?.currency_symbol
    const currencySymbolDirection = global?.currency_symbol_direction
    const digitAfterDecimalPoint = global?.digit_after_decimal_point

    const eligibilityDiscountAmount = discountEligibility?.is_qualified
        ? Number(discountEligibility.discount_amount) || 0
        : 0
    const cartDiscount =
        eligibilityDiscountAmount > 0
            ? eligibilityDiscountAmount
            : getProductDiscount(cartList)
    const payableCartPrice = Math.max(0, totalCartPrice - cartDiscount)

    return (
        <Box
            sx={{
                backgroundColor: theme.palette.background.paper,
                borderTop: `1px solid ${theme.palette.divider}`,
                boxShadow: '0px -2px 12px rgba(0, 0, 0, 0.06)',
                px: 2,
                py: 1.25,
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1.5}
            >
                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                    <Typography
                        fontSize="13px"
                        sx={{ color: theme.palette.text.secondary }}
                    >
                        {t('Subtotal')}
                    </Typography>
                    <Stack direction="row" alignItems="baseline" spacing={0.75}>
                        <Typography
                            fontSize="18px"
                            fontWeight={700}
                            sx={{
                                color: (theme.palette as any).neutral?.[1000],
                            }}
                        >
                            {getAmount(
                                payableCartPrice,
                                currencySymbolDirection,
                                currencySymbol,
                                digitAfterDecimalPoint
                            )}
                        </Typography>
                        {totalCartPrice > payableCartPrice + 0.01 && (
                            <Typography
                                fontSize="13px"
                                sx={{
                                    color: theme.palette.text.disabled,
                                    textDecoration: 'line-through',
                                }}
                            >
                                {getAmount(
                                    totalCartPrice,
                                    currencySymbolDirection,
                                    currencySymbol,
                                    digitAfterDecimalPoint
                                )}
                            </Typography>
                        )}
                    </Stack>
                </Stack>
                <Button
                    variant="contained"
                    onClick={() => dispatch(setCartDrawerOpen(true))}
                    sx={{
                        flexShrink: 0,
                        borderRadius: '10px',
                        px: 2.5,
                        py: 1.25,
                        textTransform: 'none',
                        fontSize: '14px',
                        fontWeight: 700,
                        boxShadow: 'none',
                        '&:hover': { boxShadow: 'none' },
                    }}
                >
                    {t('View Cart List')} ({cartList.length})
                </Button>
            </Stack>
        </Box>
    )
}

export default RestaurantMobileCartBar
