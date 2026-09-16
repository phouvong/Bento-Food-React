import React from 'react'
import { Box, Typography, alpha } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { setCartDrawerOpen } from '@/redux/slices/utils'
import { getAmount } from '@/utils/customFunctions'

// Home-page only floating cart shortcut (icon + cart total), sitting flush
// against the inline-end edge. Opens the same cart sidebar/drawer
// FloatingCart already renders — no separate cart UI.
const FloatingCartButton = () => {
    const theme = useTheme()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const { cartGroups = [] } = useSelector((state) => state.cart)
    const { global } = useSelector((state) => state.globalSettings)

    const totalCartItems = cartGroups.reduce(
        (sum, g) => sum + (g?.carts?.length || 0),
        0
    )
    // Same store-wise price sum FloatingCart's drawer shows per group.
    const totalCartPrice = cartGroups.reduce(
        (sum, g) =>
            sum +
            (g?.carts?.reduce((cSum, c) => cSum + (c?.price || 0), 0) || 0),
        0
    )

    if (!totalCartItems) return null

    const priceText = getAmount(
        totalCartPrice,
        global?.currency_symbol_direction,
        global?.currency_symbol,
        global?.digit_after_decimal_point
    )

    return (
        <Box
            onClick={() => dispatch(setCartDrawerOpen(true))}
            role="button"
            aria-label={t('Shopping Cart')}
            sx={{
                position: 'fixed',
                top: '215px',
                insetInlineEnd: 0,
                zIndex: (th) => th.zIndex.appBar - 1,
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                alignItems: 'stretch',
                width: '80px',
                minWidth: '80px',
                maxWidth: '80px',
                borderStartStartRadius: '10px',
                borderEndStartRadius: '10px',
                overflow: 'hidden',
                boxShadow: '-9px 0px 20px 0px rgba(0,0,0,0.14)',
                cursor: 'pointer',
                userSelect: 'none',
            }}
        >
            <Box
                sx={{
                    backgroundColor: theme.palette.background.paper,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: '12px',
                }}
            >
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <Box
                        component="i"
                        className="fi fi-sr-shopping-cart"
                        sx={{
                            fontSize: '20px',
                            display: 'flex',
                            lineHeight: 1,
                            color: theme.palette.text.primary,
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -6,
                            insetInlineEnd: -8,
                            minWidth: 18,
                            height: 18,
                            px: '4px',
                            borderRadius: '9999px',
                            backgroundColor: theme.palette.primary.main,
                            border: `2px solid ${theme.palette.background.paper}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: '10px',
                                fontWeight: 600,
                                lineHeight: 1,
                                color: theme.palette.whiteContainer.main,
                            }}
                        >
                            {totalCartItems > 99 ? '99+' : totalCartItems}
                        </Typography>
                    </Box>
                </Box>
            </Box>
            <Box
                sx={{
                    // backgroundColor: alpha(theme.palette.info.main, 0.08),
                    backgroundColor: theme.palette.background.paper,
                    backgroundImage: `linear-gradient(${alpha(
                        theme.palette.primary.main,
                        0.1
                    )}, ${alpha(theme.palette.primary.main, 0.1)})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 0,
                    px: '6px',
                    py: '8px',
                }}
            >
                <Typography
                    noWrap
                    sx={{
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: '14px',
                        fontWeight: 700,
                        letterSpacing: '-0.3px',
                        color: theme.palette.text.primary,
                        lineHeight: 1.2,
                        textAlign: 'center',
                    }}
                >
                    {priceText}
                </Typography>
            </Box>
        </Box>
    )
}

export default FloatingCartButton
