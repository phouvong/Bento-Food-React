import React from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { getAmount } from '@/utils/customFunctions'

interface CartFooterProps {
    totalPrice: number
    // Pre-discount total; the strike-through renders only when it is
    // meaningfully higher than the payable total.
    originalPrice?: number
    currencySymbol?: string
    currencySymbolDirection?: string
    digitAfterDecimalPoint?: number
    onCheckout: () => void
    t: (key: string) => string
}

const CartFooter: React.FC<CartFooterProps> = ({
    totalPrice,
    originalPrice,
    currencySymbol,
    currencySymbolDirection,
    digitAfterDecimalPoint,
    onCheckout,
    t,
}) => {
    const theme = useTheme()
    const showOriginal =
        typeof originalPrice === 'number' && originalPrice > totalPrice + 0.01
    return (
        <Box
            sx={{
                px: 2,
                py: 1.5,
                borderTop: '1px solid',
                borderColor: 'divider',
                backgroundColor: theme.palette.background.paper,
            }}
        >
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={1.5}
            >
                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                    <Typography
                        fontSize="14px"
                        fontWeight={600}
                        color="text.primary"
                    >
                        {t('Subtotal')}
                    </Typography>
                    <Stack
                        direction="row"
                        alignItems="baseline"
                        spacing={0.75}
                    >
                        <Typography
                            fontWeight={700}
                            fontSize="20px"
                            sx={{
                                // Explicit color — dark mode body text is
                                // black in this app, inherit won't do.
                                color: (theme.palette as any).neutral?.[1000],
                            }}
                        >
                            {getAmount(
                                totalPrice,
                                currencySymbolDirection,
                                currencySymbol,
                                digitAfterDecimalPoint
                            )}
                        </Typography>
                        {showOriginal && (
                            <Typography
                                fontSize="14px"
                                color="text.disabled"
                                sx={{ textDecoration: 'line-through' }}
                            >
                                {getAmount(
                                    originalPrice as number,
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
                    onClick={onCheckout}
                    sx={{
                        flexShrink: 0,
                        borderRadius: '10px',
                        px: 3,
                        py: 1.25,
                        textTransform: 'none',
                        fontSize: '15px',
                        fontWeight: 700,
                        boxShadow: 'none',
                        '&:hover': { boxShadow: 'none' },
                    }}
                >
                    {t('Checkout')}
                </Button>
            </Stack>
        </Box>
    )
}

export default CartFooter
