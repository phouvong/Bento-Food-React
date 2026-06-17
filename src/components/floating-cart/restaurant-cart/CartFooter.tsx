import React from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { getAmount } from '@/utils/customFunctions'

interface CartFooterProps {
    totalPrice: number
    currencySymbol?: string
    currencySymbolDirection?: string
    digitAfterDecimalPoint?: number
    onCheckout: () => void
    t: (key: string) => string
}

const CartFooter: React.FC<CartFooterProps> = ({
    totalPrice,
    currencySymbol,
    currencySymbolDirection,
    digitAfterDecimalPoint,
    onCheckout,
    t,
}) => {
    const theme = useTheme()
    return (
        <Box
            sx={{
                px: 2,
                pt: 1.5,
                pb: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                backgroundColor: theme.palette.background.default,
            }}
        >
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5 }}
            >
                <Typography fontWeight={700} fontSize="16px">
                    {t('Total Price')}
                </Typography>
                <Typography fontWeight={700} fontSize="16px">
                    {getAmount(
                        totalPrice,
                        currencySymbolDirection,
                        currencySymbol,
                        digitAfterDecimalPoint
                    )}
                </Typography>
            </Stack>
            <Button
                fullWidth
                variant="contained"
                onClick={onCheckout}
                sx={{
                    borderRadius: '10px',
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '16px',
                    fontWeight: 700,
                }}
            >
                {t('Proceed To Checkout')}
            </Button>
        </Box>
    )
}

export default CartFooter
