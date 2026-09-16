import React from 'react'
import { Grid, Stack } from '@mui/material'
import { useSelector } from 'react-redux'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import Skeleton from '@mui/material/Skeleton'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import CheckoutItemRow from './CheckoutItemRow'

const RegularOrders = ({ orderType }) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const { cartList } = useSelector((state) => state.cart)
    const { global } = useSelector((state) => state.globalSettings)
    let currencySymbol
    let currencySymbolDirection
    let digitAfterDecimalPoint
    if (global) {
        currencySymbol = global.currency_symbol
        currencySymbolDirection = global.currency_symbol_direction
        digitAfterDecimalPoint = global.digit_after_decimal_point
    }
    const visibleCartItems = (cartList ?? []).filter((item) => {
        if (!item) return false
        // A bogo bundle row has no `item` spread onto it (see FloatingCart's
        // cartListSuccessHandler) — only `bogoDetails` — so it has neither
        // id nor name and would otherwise be filtered out here.
        if (item.bogoDetails) return true
        const hasId = item.id !== undefined && item.id !== null
        const hasName = typeof item.name === 'string' && item.name.length > 0
        return hasId || hasName
    })

    return (
        <>
            {visibleCartItems.length > 0 ? (
                <Stack sx={{ gap: '16px', width: '100%' }}>
                    {visibleCartItems.map((item, index) => (
                        <CheckoutItemRow
                            key={index}
                            item={item}
                            isLast={index === visibleCartItems.length - 1}
                            currencySymbolDirection={currencySymbolDirection}
                            currencySymbol={currencySymbol}
                            digitAfterDecimalPoint={digitAfterDecimalPoint}
                            t={t}
                        />
                    ))}
                </Stack>
            ) : (
                <CustomStackFullWidth
                    direction="row"
                    alignItems="flex-start"
                    spacing={2}
                >
                    <Skeleton
                        variant="rectangular"
                        height="44px"
                        width="44px"
                        sx={{ borderRadius: '8px' }}
                    />
                    <Stack sx={{ flex: 1, gap: '4px' }}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="30%" />
                    </Stack>
                </CustomStackFullWidth>
            )}
            <Grid item md={12} xs={12}>
                <Stack
                    width="100%"
                    sx={{
                        mt: '10px',
                        borderBottom: `2px solid ${theme.palette.neutral[300]}`,
                    }}
                ></Stack>
            </Grid>
        </>
    )
}

RegularOrders.propTypes = {}

export default RegularOrders
